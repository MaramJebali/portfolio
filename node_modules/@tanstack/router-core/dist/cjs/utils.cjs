let _tanstack_router_core_isServer = require("@tanstack/router-core/isServer");
//#region src/utils.ts
/**
* Return the last element of an array.
* Intended for non-empty arrays used within router internals.
*/
function last(arr) {
	return arr[arr.length - 1];
}
/**
* Apply a value-or-updater to a previous value.
* Accepts either a literal value or a function of the previous value.
*/
function functionalUpdate(updater, previous) {
	if (typeof updater === "function") return updater(previous);
	return updater;
}
const hasOwn = Object.prototype.hasOwnProperty;
function hasKeys(obj) {
	for (const key in obj) if (hasOwn.call(obj, key)) return true;
	return false;
}
const createNull = () => Object.create(null);
const nullReplaceEqualDeep = (prev, next) => replaceEqualDeep(prev, next, true);
function replaceEqualDeep(prev, next, _nullProto, _depth = 0) {
	if (_tanstack_router_core_isServer.isServer) return next;
	if (prev === next) return prev;
	if (_depth++ > 500) return next;
	const array = Array.isArray(prev) && Array.isArray(next);
	if (!array && !(isPlainObject(prev) && isPlainObject(next))) return next;
	const prevKeys = Object.keys(prev);
	const previousCount = prevKeys.length;
	const nextKeys = Object.keys(next);
	const length = nextKeys.length;
	if (array ? previousCount !== prev.length || length !== next.length || previousCount && last(prevKeys) !== `${previousCount - 1}` || length && last(nextKeys) !== `${length - 1}` : previousCount !== Object.getOwnPropertyNames(prev).length || length !== Object.getOwnPropertyNames(next).length || Object.getOwnPropertySymbols(next).length) return next;
	let i = 0;
	let child;
	let previous;
	let key;
	if (array) {
		for (; i < length; i++) {
			key = i;
			previous = prev[key];
			child = next[key];
			child = previous === child ? previous : typeof previous === "object" ? replaceEqualDeep(previous, child, _nullProto, _depth) : child;
			if (child !== previous) break;
		}
		if (i === length && previousCount === length) return prev;
	} else {
		let equal = previousCount === length;
		let unchanged = true;
		for (; i < length; i++) {
			key = nextKeys[i];
			previous = prev[key];
			const incoming = next[key];
			child = previous === incoming ? previous : typeof previous === "object" ? replaceEqualDeep(previous, incoming, _nullProto, _depth) : incoming;
			equal &&= child === previous && (prevKeys[i] === key || hasOwn.call(prev, key));
			unchanged &&= Object.is(child, incoming);
			prevKeys[i] = child;
		}
		if (equal) return Object.getOwnPropertySymbols(prev).length ? next : prev;
		if (unchanged) return next;
	}
	const copy = array ? nextKeys.fill(0) : _nullProto ? createNull() : {};
	for (let j = 0; j < length; j++) {
		key = array ? j : nextKeys[j];
		if (array) {
			previous = prev[key];
			if (j > i) {
				child = next[key];
				child = previous === child ? previous : typeof previous === "object" ? replaceEqualDeep(previous, child, _nullProto, _depth) : child;
			}
			copy[key] = j < i ? previous : child;
		} else copy[key] = prevKeys[j];
	}
	return copy;
}
function isPlainObject(o) {
	if (!o || typeof o !== "object") return false;
	return (Object.getPrototypeOf(o)?.constructor ?? Object) === Object;
}
/**
* Perform a deep equality check optimized for router state comparisons.
*
* - `partial`: `b` may omit keys that `a` has (arrays stay length-exact).
* - `explicitUndefined`: keys holding `undefined` take part in the comparison
*   instead of being ignored.
*
* Internal: the flags are positional so hot callers pass no options object.
*/
function deepEqual(a, b, partial, explicitUndefined) {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0, l = a.length; i < l; i++) {
			const av = a[i];
			const bv = b[i];
			if (av !== bv && !deepEqual(av, bv, partial, explicitUndefined)) return false;
		}
		return true;
	}
	if (isPlainObject(a) && isPlainObject(b)) {
		if (partial) {
			for (const k in b) if (explicitUndefined || b[k] !== void 0) {
				if (!deepEqual(a[k], b[k], partial, explicitUndefined)) return false;
			}
			return true;
		}
		let aCount = 0;
		if (explicitUndefined) aCount = Object.keys(a).length;
		else for (const k in a) if (a[k] !== void 0) aCount++;
		for (const k in b) if (explicitUndefined || b[k] !== void 0) {
			if (aCount-- === 0 || !deepEqual(a[k], b[k], partial, explicitUndefined)) return false;
		}
		return aCount === 0;
	}
	return false;
}
/**
* Create a promise with exposed resolve/reject and status fields.
* Useful for coordinating async router lifecycle operations.
*/
function createControlledPromise(onResolve) {
	let resolveLoadPromise;
	let rejectLoadPromise;
	const controlledPromise = new Promise((resolve, reject) => {
		resolveLoadPromise = resolve;
		rejectLoadPromise = reject;
	});
	controlledPromise.status = "pending";
	controlledPromise.resolve = (value) => {
		controlledPromise.status = "resolved";
		controlledPromise.value = value;
		resolveLoadPromise(value);
		onResolve?.(value);
	};
	controlledPromise.reject = (e) => {
		controlledPromise.status = "rejected";
		rejectLoadPromise(e);
	};
	return controlledPromise;
}
/**
* Heuristically detect dynamic import "module not found" errors
* across major browsers for lazy route component handling.
*/
function isModuleNotFoundError(error) {
	if (typeof error?.message !== "string") return false;
	return error.message.startsWith("Failed to fetch dynamically imported module") || error.message.startsWith("error loading dynamically imported module") || error.message.startsWith("Importing a module script failed");
}
function isPromise(value) {
	return Boolean(value && typeof value === "object" && typeof value.then === "function");
}
function findLast(array, predicate) {
	for (let i = array.length - 1; i >= 0; i--) {
		const item = array[i];
		if (predicate(item)) return item;
	}
}
/**
* Re-encode characters that are unsafe in URL paths.
* Includes ASCII control characters (0x00-0x1F, 0x7F) and a subset of the
* WHATWG URL "path percent-encode set" (", <, >, `, {, }).
*
* Space (0x20) is intentionally excluded — decodeURI decodes %20 to space
* and the router stores decoded spaces in location.pathname. The existing
* encodePathLikeUrl already handles re-encoding spaces for outgoing URLs.
*
* These characters are decoded by decodeURI but must remain percent-encoded
* in paths to match how upstream layers (CDNs, edge middleware, browsers)
* interpret the URL, preventing infinite redirect loops and path mismatches.
*/
const PATH_UNSAFE_RE = /[\x00-\x1f\x7f"<>`{}]/g;
function sanitizePathSegment(segment) {
	return segment.replace(PATH_UNSAFE_RE, (ch) => "%" + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
}
function decodeSegment(segment) {
	let decoded;
	try {
		decoded = decodeURI(segment);
	} catch {
		decoded = segment.replaceAll(/%[0-9A-F]{2}/gi, (match) => {
			try {
				return decodeURI(match);
			} catch {
				return match;
			}
		});
	}
	return sanitizePathSegment(decoded);
}
/**
* Default list of URL protocols to allow in links, redirects, and navigation.
* Any absolute URL protocol not in this list is treated as dangerous by default.
*/
const DEFAULT_PROTOCOL_ALLOWLIST = [
	"http:",
	"https:",
	"mailto:",
	"tel:"
];
/**
* Extract the explicit URL scheme, including its colon, using WHATWG
* normalization rules. This does not validate the rest of the URL.
*
* Returning `undefined` means "no explicit scheme", not "safe URL";
* protocol-relative URLs such as "//evil.example" require a separate check.
*/
function getUrlScheme(url) {
	if (url[0] === "/") return;
	if (!url.includes(":")) return;
	return /^[\x00-\x20]*([a-z][a-z\d+.\t\n\r-]*:)/i.exec(url)?.[1]?.replace(/[\t\n\r]/g, "").toLowerCase();
}
const protocolRelativePrefixRegex = /^[\x00-\x20]*[\\/][\t\n\r]*[\\/]/;
/**
* Check if a URL string uses a protocol that is not in the allowlist or is
* protocol-relative (e.g. "//evil.example"), which can navigate to another host.
* Returns true for blocked protocols like javascript:, blob:, and data:, as
* well as slash/backslash variants of protocol-relative URLs.
*
* Scheme parsing normalizes:
* - Mixed case (JavaScript: → javascript:)
* - Whitespace/control characters (java\nscript: → javascript:)
* - Leading whitespace
*
* For relative URLs without a protocol-relative prefix, returns false.
*
* @param url - The URL string to check
* @param allowlist - Set of protocols to allow
* @returns true if the URL uses a protocol that is not allowed or can escape
* the current origin through a protocol-relative URL
*/
function isDangerousProtocol(url, allowlist) {
	if (!url) return false;
	if (protocolRelativePrefixRegex.test(url)) return true;
	const scheme = getUrlScheme(url);
	return scheme ? !allowlist.has(scheme) : false;
}
const HTML_ESCAPE_LOOKUP = {
	"&": "\\u0026",
	">": "\\u003e",
	"<": "\\u003c",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
const HTML_ESCAPE_REGEX = /[&><\u2028\u2029]/g;
/**
* Escape HTML special characters in a string to prevent XSS attacks
* when embedding strings in script tags during SSR.
*
* This is essential for preventing XSS vulnerabilities when user-controlled
* content is embedded in inline scripts.
*/
function escapeHtml(str) {
	return str.replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPE_LOOKUP[match]);
}
function decodePath(path) {
	if (!path) return path;
	let result = path;
	if (/[%\\\x00-\x1f\x7f]/.test(path)) {
		const re = /%25|%5C/gi;
		let cursor = 0;
		let match;
		result = "";
		while (null !== (match = re.exec(path))) {
			result += decodeSegment(path.slice(cursor, match.index)) + match[0];
			cursor = re.lastIndex;
		}
		result += decodeSegment(cursor ? path.slice(cursor) : path);
	}
	return result;
}
/**
* Encodes a path the same way `new URL()` would, but without the overhead of full URL parsing.
*
* This function encodes:
* - Whitespace characters (spaces → %20, tabs → %09, etc.)
* - Non-ASCII/Unicode characters (emojis, accented characters, etc.)
*
* It preserves:
* - Already percent-encoded sequences (won't double-encode %2F, %25, etc.)
* - ASCII special characters valid in URL paths (@, $, &, +, etc.)
* - Forward slashes as path separators
*
* Used to generate proper href values for SSR without constructing URL objects.
*
* @example
* encodePathLikeUrl('/path/file name.pdf') // '/path/file%20name.pdf'
* encodePathLikeUrl('/path/日本語') // '/path/%E6%97%A5%E6%9C%AC%E8%AA%9E'
* encodePathLikeUrl('/path/already%20encoded') // '/path/already%20encoded' (preserved)
*/
function encodePathLikeUrl(path) {
	if (!/[\s\u0080-\uFFFF]/.test(path)) return path;
	return path.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent);
}
/**
* Builds the dev-mode CSS styles URL for route-scoped CSS collection.
* Used by HeadContent components in all framework implementations to construct
* the URL for the `/@tanstack-start/styles.css` endpoint.
*
* @param basepath - The router's basepath (may or may not have leading slash)
* @param routeIds - Array of matched route IDs to include in the CSS collection
* @returns The full URL path for the dev styles CSS endpoint
*/
function buildDevStylesUrl(basepath, routeIds) {
	const trimmedBasepath = basepath.replace(/^\/+|\/+$/g, "");
	return `${trimmedBasepath === "" ? "" : `/${trimmedBasepath}`}/@tanstack-start/styles.css?routes=${encodeURIComponent(routeIds.join(","))}`;
}
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}
//#endregion
exports.DEFAULT_PROTOCOL_ALLOWLIST = DEFAULT_PROTOCOL_ALLOWLIST;
exports.arraysEqual = arraysEqual;
exports.buildDevStylesUrl = buildDevStylesUrl;
exports.createControlledPromise = createControlledPromise;
exports.createNull = createNull;
exports.decodePath = decodePath;
exports.deepEqual = deepEqual;
exports.encodePathLikeUrl = encodePathLikeUrl;
exports.escapeHtml = escapeHtml;
exports.findLast = findLast;
exports.functionalUpdate = functionalUpdate;
exports.getUrlScheme = getUrlScheme;
exports.hasKeys = hasKeys;
exports.hasOwn = hasOwn;
exports.isDangerousProtocol = isDangerousProtocol;
exports.isModuleNotFoundError = isModuleNotFoundError;
exports.isPromise = isPromise;
exports.last = last;
exports.nullReplaceEqualDeep = nullReplaceEqualDeep;
exports.protocolRelativePrefixRegex = protocolRelativePrefixRegex;
exports.replaceEqualDeep = replaceEqualDeep;

//# sourceMappingURL=utils.cjs.map