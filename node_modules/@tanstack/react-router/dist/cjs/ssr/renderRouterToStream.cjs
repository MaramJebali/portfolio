const require_runtime = require("../_virtual/_rolldown/runtime.cjs");
let _tanstack_router_core_ssr_server = require("@tanstack/router-core/ssr/server");
let react_dom_server = require("react-dom/server");
react_dom_server = require_runtime.__toESM(react_dom_server, 1);
let node_stream = require("node:stream");
let isbot = require("isbot");
//#region src/ssr/renderRouterToStream.tsx
var renderRouterToStream = async ({ request, router, responseHeaders, children }) => {
	const signal = request.signal;
	if (signal.aborted) {
		router.serverSsr?.cleanup();
		throw signal.reason;
	}
	let rendererTeardown = false;
	const bot = (0, isbot.isbot)(request.headers.get("User-Agent"));
	const onError = (renderer) => (error, info) => {
		if (!rendererTeardown && !signal.aborted) console.error(`Error in ${renderer}:`, error, info);
	};
	try {
		if (typeof react_dom_server.default.renderToReadableStream === "function") {
			const stream = await react_dom_server.default.renderToReadableStream(children, {
				signal,
				nonce: router.options.ssr?.nonce,
				progressiveChunkSize: Number.POSITIVE_INFINITY,
				onError: onError("renderToReadableStream")
			});
			const rendererAbort = bot ? new AbortController() : void 0;
			const responseStream = (0, _tanstack_router_core_ssr_server.transformReadableStreamWithRouter)(router, stream, {
				rendererSafePoint: "script-close",
				signal,
				onAbort: (reason) => {
					rendererTeardown = true;
					rendererAbort?.abort(reason);
				}
			});
			if (rendererAbort) await (0, _tanstack_router_core_ssr_server.waitForRequest)(stream.allReady, rendererAbort.signal);
			return (0, _tanstack_router_core_ssr_server.createSsrStreamResponse)(router, new Response(responseStream, {
				status: (0, _tanstack_router_core_ssr_server.getSsrStatus)(router),
				headers: responseHeaders
			}));
		}
		if (typeof react_dom_server.default.renderToPipeableStream === "function") {
			const reactAppPassthrough = new node_stream.PassThrough();
			let pipeable;
			let resolveReady;
			const ready = new Promise((resolve) => {
				resolveReady = resolve;
			});
			const rendererAbort = new AbortController();
			const abortPipeable = (reason) => {
				if (rendererTeardown) return;
				rendererTeardown = true;
				rendererAbort.abort(reason);
				try {
					pipeable?.abort(reason);
				} catch {}
			};
			try {
				pipeable = react_dom_server.default.renderToPipeableStream(children, {
					nonce: router.options.ssr?.nonce,
					progressiveChunkSize: Number.POSITIVE_INFINITY,
					...bot ? { onAllReady: resolveReady } : { onShellReady: resolveReady },
					onError: onError("renderToPipeableStream"),
					onShellError: (error) => rendererAbort.abort(error)
				});
				const responseStream = (0, _tanstack_router_core_ssr_server.transformReadableStreamWithRouter)(router, node_stream.Readable.toWeb(reactAppPassthrough), {
					rendererSafePoint: "script-close",
					signal,
					onAbort: abortPipeable
				});
				await (0, _tanstack_router_core_ssr_server.waitForRequest)(ready, rendererAbort.signal);
				pipeable.pipe(reactAppPassthrough);
				return (0, _tanstack_router_core_ssr_server.createSsrStreamResponse)(router, new Response(responseStream, {
					status: (0, _tanstack_router_core_ssr_server.getSsrStatus)(router),
					headers: responseHeaders
				}));
			} catch (error) {
				abortPipeable(error);
				throw error;
			}
		}
		throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
	} catch (error) {
		router.serverSsr?.cleanup();
		throw error;
	}
};
//#endregion
exports.renderRouterToStream = renderRouterToStream;

//# sourceMappingURL=renderRouterToStream.cjs.map