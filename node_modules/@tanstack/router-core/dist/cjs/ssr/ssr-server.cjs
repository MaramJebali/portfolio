const require_utils = require("../utils.cjs");
const require_invariant = require("../invariant.cjs");
const require_sieve_cache = require("../sieve-cache.cjs");
const require_root = require("../root.cjs");
const require_ssr_match_id = require("./ssr-match-id.cjs");
const require_load_client = require("../load-client.cjs");
const require_manifest = require("../manifest.cjs");
const require_await_signal = require("../await-signal.cjs");
const require_hydrationScripts = require("./hydrationScripts.cjs");
const require_seroval_plugins_ssr = require("./serializer/seroval-plugins.ssr.cjs");
const require_makeSsrSerovalPlugin = require("./serializer/makeSsrSerovalPlugin.cjs");
let seroval = require("seroval");
//#region src/ssr/ssr-server.ts
function dehydrateMatch(match) {
	const dehydratedMatch = {
		i: require_ssr_match_id.dehydrateSsrMatchId(match.id),
		u: match.updatedAt,
		s: match.status
	};
	for (const [key, shorthand] of [
		["__beforeLoadContext", "b"],
		["loaderData", "l"],
		["error", "e"],
		["ssr", "ssr"]
	]) if (match[key] !== void 0) dehydratedMatch[shorthand] = match[key];
	if (match._notFound) dehydratedMatch.g = true;
	return dehydratedMatch;
}
function disposeSerializationSafely(dispose) {
	try {
		dispose?.();
	} catch (err) {
		console.error("Error disposing SSR serialization:", err);
	}
}
function notifyAndClearListeners(listeners, errorMessage, arg) {
	const pending = listeners.slice();
	listeners.length = 0;
	for (const listener of pending) try {
		listener(arg);
	} catch (error) {
		console.error(errorMessage, error);
	}
}
const isProd = process.env.NODE_ENV === "production";
const MANIFEST_CACHE_SIZE = 100;
const manifestCaches = /* @__PURE__ */ new WeakMap();
function getManifestCache(manifest) {
	const cache = manifestCaches.get(manifest);
	if (cache) return cache;
	const newCache = require_sieve_cache.createSieveCache(MANIFEST_CACHE_SIZE);
	manifestCaches.set(manifest, newCache);
	return newCache;
}
function getInlineCssForPreparedRoutes(manifest, preparedRoutes) {
	const styles = manifest.inlineCss?.styles;
	const hrefs = preparedRoutes.inlineCssHrefs;
	if (!styles || !hrefs?.length) return;
	let css = "";
	for (const href of hrefs) css += styles[href];
	return css;
}
function getInlineCssAssetForPreparedRoutes(manifest, preparedRoutes) {
	const css = getInlineCssForPreparedRoutes(manifest, preparedRoutes);
	return css === void 0 ? void 0 : require_manifest.createInlineCssStyleAsset(css);
}
function getMatchedRoutesCacheKey(matches) {
	let cacheKey = "";
	for (let i = 0; i < matches.length; i++) cacheKey += (i === 0 ? "" : "\0") + matches[i].routeId;
	return cacheKey;
}
function getPreparedMatchedManifestRoutes(manifest, matches, cacheKey) {
	if (isProd) {
		const cached = getManifestCache(manifest).get(cacheKey);
		if (cached) return cached;
	}
	const preparedRoutes = prepareMatchedManifestRoutes(manifest, matches);
	if (isProd) getManifestCache(manifest).set(cacheKey, preparedRoutes);
	return preparedRoutes;
}
function prepareMatchedManifestRoutes(manifest, matches) {
	const inlineStyles = manifest.inlineCss?.styles;
	const routes = {};
	if (!inlineStyles) {
		for (const match of matches) {
			const route = manifest.routes[match.routeId];
			if (route) routes[match.routeId] = route;
		}
		return {
			routes,
			hasStrippedRoutes: false
		};
	}
	const inlineCssHrefs = [];
	const seenInlineCssHrefs = /* @__PURE__ */ new Set();
	let hasStrippedRoutes = false;
	for (const match of matches) {
		const routeId = match.routeId;
		const route = manifest.routes[routeId];
		if (!route) continue;
		const nextRoute = stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs);
		if (nextRoute !== route) hasStrippedRoutes = true;
		routes[routeId] = nextRoute;
	}
	return {
		routes,
		hasStrippedRoutes,
		...inlineCssHrefs.length ? { inlineCssHrefs } : {}
	};
}
function stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs) {
	const css = route.css;
	if (!css) return route;
	if (css.length === 0) {
		const nextRoute = { ...route };
		delete nextRoute.css;
		return nextRoute;
	}
	let cssLinks;
	for (let i = 0; i < css.length; i++) {
		const link = css[i];
		const href = require_manifest.getStylesheetHref(link);
		if (inlineStyles[href] === void 0) {
			if (cssLinks) cssLinks.push(link);
			continue;
		}
		if (!seenInlineCssHrefs.has(href)) {
			seenInlineCssHrefs.add(href);
			inlineCssHrefs.push(href);
		}
		if (!cssLinks) cssLinks = css.slice(0, i);
	}
	if (!cssLinks) return route;
	if (cssLinks.length > 0) return {
		...route,
		css: cssLinks
	};
	const nextRoute = { ...route };
	delete nextRoute.css;
	return nextRoute;
}
function hasRouteAssets(route) {
	return !!route.scripts?.length || !!route.css?.length;
}
function hasRequestAssets(assets) {
	return !!assets && (!!assets.preloads?.length || hasRouteAssets(assets));
}
function mergeRequestAssetsIntoRootRoute(rootRoute, requestAssets) {
	const preloads = requestAssets?.preloads?.length ? [...requestAssets.preloads, ...rootRoute?.preloads ?? []] : rootRoute?.preloads;
	const scripts = requestAssets?.scripts?.length ? [...requestAssets.scripts, ...rootRoute?.scripts ?? []] : rootRoute?.scripts;
	const cssLinks = requestAssets?.css?.length ? [...requestAssets.css, ...rootRoute?.css ?? []] : rootRoute?.css;
	return {
		...rootRoute ?? {},
		...preloads?.length ? { preloads } : {},
		...scripts?.length ? { scripts } : {},
		...cssLinks?.length ? { css: cssLinks } : {}
	};
}
/**
* Compose a client-facing manifest from prepared routes, an optional inline
* style, and optional request-scoped assets merged into the root route.
* Shared by the `router.ssr.manifest` getter and `dehydrate()` so the two
* compositions cannot drift.
*/
function composeManifest(scriptFormat, inlineStyle, routes, requestAssets) {
	const base = {
		...scriptFormat ? { scriptFormat } : {},
		...inlineStyle ? { inlineStyle } : {},
		routes
	};
	if (!hasRequestAssets(requestAssets)) return base;
	return {
		...base,
		routes: {
			...routes,
			[require_root.rootRouteId]: mergeRequestAssetsIntoRootRoute(routes[require_root.rootRouteId], requestAssets)
		}
	};
}
function attachRouterServerSsrUtils({ router, manifest, getRequestAssets }) {
	let memoizedPreparedManifest;
	router.ssr = { get manifest() {
		if (!manifest) return manifest;
		const requestAssets = getRequestAssets?.();
		const hasAssets = hasRequestAssets(requestAssets);
		if (!hasAssets && !manifest.inlineCss) return manifest;
		let inlineCssAsset;
		let routes = manifest.routes;
		if (manifest.inlineCss) {
			const matches = require_load_client._getRenderedMatches(router.stores.matches.get());
			const cacheKey = getMatchedRoutesCacheKey(matches);
			if (memoizedPreparedManifest?.cacheKey === cacheKey) {
				inlineCssAsset = memoizedPreparedManifest.inlineCssAsset;
				routes = memoizedPreparedManifest.routes;
			} else {
				const preparedManifest = getPreparedMatchedManifestRoutes(manifest, matches, cacheKey);
				inlineCssAsset = getInlineCssAssetForPreparedRoutes(manifest, preparedManifest);
				if (preparedManifest.hasStrippedRoutes) routes = {
					...manifest.routes,
					...preparedManifest.routes
				};
				memoizedPreparedManifest = {
					cacheKey,
					inlineCssAsset,
					routes
				};
			}
		}
		return composeManifest(manifest.scriptFormat, inlineCssAsset, routes, hasAssets ? requestAssets : void 0);
	} };
	let dehydrationPhase = "idle";
	let renderFinished = false;
	const renderFinishedListeners = [];
	const cleanupListeners = [];
	let cleanupStarted = false;
	let settled = false;
	let disposeSerialization;
	const hydrationScripts = require_hydrationScripts.createHydrationScripts(router.options.ssr?.nonce);
	const serverSsr = {
		hydrationScripts,
		dehydrate: async (opts) => {
			if (dehydrationPhase !== "idle") {
				if (process.env.NODE_ENV !== "production") throw new Error(dehydrationPhase === "disabled" ? "Invariant failed: hydration is disabled for this request!" : "Invariant failed: router is already dehydrated!");
				require_invariant.invariant();
			}
			opts?.signal?.throwIfAborted();
			dehydrationPhase = "started";
			let matchesToDehydrate = require_load_client._getRenderedMatches(router.stores.matches.get());
			if (router.isShell()) matchesToDehydrate = matchesToDehydrate.slice(0, 1);
			const matches = matchesToDehydrate.map(dehydrateMatch);
			let manifestToDehydrate = void 0;
			if (manifest) {
				const cacheKey = getMatchedRoutesCacheKey(matchesToDehydrate);
				const preparedManifest = getPreparedMatchedManifestRoutes(manifest, matchesToDehydrate, cacheKey);
				manifestToDehydrate = composeManifest(manifest.scriptFormat, preparedManifest.inlineCssHrefs ? require_manifest.createInlineCssPlaceholderAsset() : void 0, preparedManifest.routes, opts?.requestAssets);
			}
			const dehydratedRouter = {
				manifest: manifestToDehydrate,
				matches
			};
			const dehydrate = router.options.dehydrate;
			const dehydratedData = dehydrate ? opts?.signal ? await require_await_signal.waitForReason(dehydrate.call(router.options), opts.signal) : await dehydrate.call(router.options) : void 0;
			opts?.signal?.throwIfAborted();
			if (cleanupStarted) return;
			if (dehydratedData !== void 0) dehydratedRouter.dehydratedData = dehydratedData;
			const trackPlugins = { didRun: false };
			const serializationAdapters = router.options.serializationAdapters;
			const plugins = serializationAdapters ? [...serializationAdapters.map((adapter) => /* @__PURE__ */ require_makeSsrSerovalPlugin.makeSsrSerovalPlugin(adapter, trackPlugins)), ...require_seroval_plugins_ssr.ssrSerovalPlugins] : require_seroval_plugins_ssr.ssrSerovalPlugins;
			let serializationCompleteSignaled = false;
			let initialSerialized = false;
			const completeScriptSerialization = (result) => {
				if (serializationCompleteSignaled || cleanupStarted) return;
				serializationCompleteSignaled = true;
				const dispose = disposeSerialization;
				disposeSerialization = void 0;
				if (result === true) {
					settled = true;
					hydrationScripts.finish();
				} else if (result) hydrationScripts.fail(result.error);
				if (dispose) queueMicrotask(() => disposeSerializationSafely(dispose));
			};
			let synchronousFailure;
			const dispose = (0, seroval.crossSerializeStream)(dehydratedRouter, {
				refs: /* @__PURE__ */ new Map(),
				plugins,
				onSerialize: (data, initial) => {
					if (serializationCompleteSignaled || cleanupStarted) return;
					initialSerialized ||= initial;
					if (!hydrationScripts.pushSerializedSource(data, initial, trackPlugins.didRun)) completeScriptSerialization(false);
				},
				onError: (err) => {
					if (serializationCompleteSignaled || cleanupStarted) return;
					console.error("Serialization error:", err);
					synchronousFailure = { error: err };
					completeScriptSerialization({ error: err });
				},
				scopeId: "tsr",
				onDone: () => {
					if (initialSerialized) completeScriptSerialization(true);
				}
			});
			if (cleanupStarted || serializationCompleteSignaled) disposeSerializationSafely(dispose);
			else disposeSerialization = dispose;
			if (synchronousFailure) throw synchronousFailure.error;
		},
		onRenderFinished: (listener) => {
			if (cleanupStarted) return;
			if (renderFinished) {
				try {
					listener();
				} catch (error) {
					console.error("Error in render finished listener:", error);
				}
				return;
			}
			renderFinishedListeners.push(listener);
		},
		onCleanup: (listener) => {
			if (cleanupStarted) {
				try {
					listener(settled);
				} catch (error) {
					console.error("Error in SSR cleanup listener:", error);
				}
				return;
			}
			cleanupListeners.push(listener);
		},
		setRenderFinished: () => {
			if (cleanupStarted || renderFinished) return;
			renderFinished = true;
			hydrationScripts.liftBarrier();
			notifyAndClearListeners(renderFinishedListeners, "Error in render finished listener:", void 0);
		},
		disableHydration: () => {
			if (cleanupStarted || dehydrationPhase === "disabled") return;
			if (dehydrationPhase !== "idle") {
				if (process.env.NODE_ENV !== "production") throw new Error("Invariant failed: cannot disable hydration after dehydrate()!");
				require_invariant.invariant();
			}
			hydrationScripts.disableHydration();
			dehydrationPhase = "disabled";
		},
		takeInitialHydrationScriptTags: hydrationScripts.takeInitialHydrationScriptTags,
		cleanup() {
			if (cleanupStarted) return;
			cleanupStarted = true;
			hydrationScripts.cleanup();
			const dispose = disposeSerialization;
			disposeSerialization = void 0;
			disposeSerializationSafely(dispose);
			notifyAndClearListeners(cleanupListeners, "Error in SSR cleanup listener:", settled);
			renderFinishedListeners.length = 0;
			router.ssr = void 0;
			router.serverSsr = void 0;
		}
	};
	router.serverSsr = serverSsr;
	for (const listener of router.serverSsrLifecycle?.onServerSsrAttach ?? []) try {
		listener(serverSsr);
	} catch (err) {
		console.error("SSR attach listener error:", err);
	}
}
/**
* Get the origin for the request.
*
* SECURITY: We intentionally do NOT trust the Origin header for determining
* the router's origin. The Origin header can be spoofed by attackers, which
* could lead to SSRF-like vulnerabilities where redirects are constructed
* using a malicious origin (CVE-2024-34351).
*
* Instead, we derive the origin from request.url, which is typically set by
* the server infrastructure (not client-controlled headers).
*
* For applications behind proxies that need to trust forwarded headers,
* use the router's `origin` option to explicitly configure a trusted origin.
*/
function getOrigin(request) {
	try {
		return new URL(request.url).origin;
	} catch {}
	return "http://localhost";
}
function getNormalizedURL(url, base) {
	if (typeof url === "string") url = url.replace("\\", "%5C");
	const rawUrl = new URL(url, base);
	const handledProtocolRelativeURL = rawUrl.pathname.startsWith("//");
	const decodedPathname = require_utils.decodePath(handledProtocolRelativeURL ? rawUrl.pathname.replace(/^\/+/, "/") : rawUrl.pathname);
	const searchParams = new URLSearchParams(rawUrl.search);
	const normalizedHref = decodedPathname + (searchParams.size > 0 ? "?" : "") + searchParams.toString() + rawUrl.hash;
	return {
		url: new URL(normalizedHref, rawUrl.origin),
		handledProtocolRelativeURL
	};
}
//#endregion
exports.attachRouterServerSsrUtils = attachRouterServerSsrUtils;
exports.getNormalizedURL = getNormalizedURL;
exports.getOrigin = getOrigin;

//# sourceMappingURL=ssr-server.cjs.map