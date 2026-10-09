import { TSS_CONTENT_TYPE_FRAMED, TSS_FORMDATA_CONTEXT } from "../constants.js";
import { getDefaultSerovalPlugins } from "../getDefaultSerovalPlugins.js";
import { createFrameDecoder } from "./frame-decoder.js";
import { createRawStreamDeserializePlugin } from "@tanstack/router-core/ssr/client";
import { encode, invariant, isNotFound, parseRedirect } from "@tanstack/router-core";
import { fromCrossJSON, toJSONAsync } from "seroval";
//#region src/client-rpc/serverFnFetcher.ts
var serovalPlugins;
/**
* Current async post-processing context for deserialization.
*
* Some deserializers need to perform async work after synchronous deserialization
* (e.g., decoding RSC payloads, fetching remote data). This context allows them
* to register promises that must complete before the deserialized value is used.
*
* This uses a synchronous execution context pattern:
* - Each call to `fromCrossJSON` is synchronous
* - Within that synchronous execution, all `fromSerializable` calls happen
* - We set the context before `fromCrossJSON`, then clear it afterward
*
* Even with concurrent server function calls, each individual deserialization
* is atomic (synchronous), so promises are correctly scoped to their call.
*/
var currentPostProcessContext = null;
/**
* Track an async post-processing promise in the current deserialization context.
* Called by deserializers that need to perform async work after sync deserialization.
*
* If no context is active (e.g., on server), this is a no-op.
*
* @param promise - The async work promise to track
*/
function trackPostProcessPromise(promise) {
	if (currentPostProcessContext) currentPostProcessContext.push(promise);
}
function deserialize(value, options, promises) {
	currentPostProcessContext = promises;
	try {
		return fromCrossJSON(value, options);
	} catch (error) {
		observePostProcessPromises(promises);
		throw error;
	} finally {
		currentPostProcessContext = null;
	}
}
/**
* Helper to await all post-processing promises.
* Uses Promise.allSettled to ensure all promises complete even if some reject.
*/
async function awaitPostProcessPromises(promises) {
	if (promises.length > 0) {
		await Promise.allSettled(promises);
		promises.length = 0;
	}
}
function observePostProcessPromises(promises) {
	for (const promise of promises) promise.catch(() => {});
	promises.length = 0;
}
/**
* Checks if an object has at least one own enumerable property.
* More efficient than Object.keys(obj).length > 0 as it short-circuits on first property.
*/
var hop = Object.prototype.hasOwnProperty;
function hasOwnProperties(obj) {
	for (const _ in obj) if (hop.call(obj, _)) return true;
	return false;
}
async function serverFnFetcher(url, args, handler) {
	if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
	const first = args[0];
	const fetchImpl = first.fetch ?? handler;
	const isFormData = first.data instanceof FormData;
	const headers = new Headers(first.headers);
	headers.set("x-tsr-serverFn", "true");
	if (!isFormData) headers.set("accept", `${TSS_CONTENT_TYPE_FRAMED}, application/x-ndjson, application/json`);
	if (first.method === "GET") {
		if (isFormData) throw new Error("FormData is not supported with GET requests");
		const serializedPayload = await serializePayload(first);
		if (serializedPayload !== void 0) {
			const encodedPayload = encode({ payload: serializedPayload });
			if (url.includes("?")) url += `&${encodedPayload}`;
			else url += `?${encodedPayload}`;
		}
	}
	let body = void 0;
	if (first.method === "POST") {
		body = await getFetchBody(first);
		if (typeof body === "string") headers.set("content-type", "application/json");
	}
	return getResponse(() => fetchImpl(url, {
		method: first.method,
		headers,
		signal: first.signal,
		body
	}));
}
async function serializePayload(opts) {
	let payload;
	if (opts.data !== void 0) payload = { data: opts.data };
	if (opts.context && hasOwnProperties(opts.context)) (payload ??= {}).context = opts.context;
	return payload ? serialize(payload, opts.signal) : void 0;
}
async function serialize(data, signal) {
	signal?.throwIfAborted();
	let value;
	try {
		value = await toJSONAsync(data, { plugins: signal ? getDefaultSerovalPlugins(signal) : serovalPlugins });
	} finally {
		signal?.throwIfAborted();
	}
	return JSON.stringify(value);
}
async function getFetchBody(opts) {
	if (opts.data instanceof FormData) {
		let serializedContext = void 0;
		if (opts.context && hasOwnProperties(opts.context)) serializedContext = await serialize(opts.context, opts.signal);
		if (serializedContext !== void 0) opts.data.set(TSS_FORMDATA_CONTEXT, serializedContext);
		return opts.data;
	}
	return serializePayload(opts);
}
/**
* Retrieves a response from a given function and manages potential errors
* and special response types including redirects and not found errors.
*
* @param fn - The function to execute for obtaining the response.
* @returns The processed response from the function.
* @throws If the response is invalid or an error occurs during processing.
*/
async function getResponse(fn) {
	let response;
	try {
		response = await fn();
	} catch (error) {
		if (error instanceof Response) response = error;
		else throw error;
	}
	if (response.headers.get("x-tss-raw") === "true") return response;
	const contentType = response.headers.get("content-type");
	if (!contentType) {
		if (process.env.NODE_ENV !== "production") throw new Error("Invariant failed: expected content-type header to be set");
		invariant();
	}
	if (!!response.headers.get("x-tss-serialized")) {
		let result;
		if (contentType.includes("application/x-tss-framed")) {
			const version = /;\s*v=(\d+)/.exec(contentType)?.[1];
			if (version && +version !== 1) throw new Error(`Unsupported framed protocol version ${version}`);
			if (!response.body) throw new Error("No response body for framed response");
			const [chunks, getStream] = createFrameDecoder(response.body);
			result = await processFramedResponse(chunks, [createRawStreamDeserializePlugin(getStream), ...serovalPlugins]);
		} else if (contentType.includes("application/json")) {
			const jsonPayload = await response.json();
			const postProcessPromises = [];
			result = deserialize(jsonPayload, { plugins: serovalPlugins }, postProcessPromises);
			await awaitPostProcessPromises(postProcessPromises);
		}
		if (!result) {
			if (process.env.NODE_ENV !== "production") throw new Error("Invariant failed: expected result to be resolved");
			invariant();
		}
		if (result instanceof Error) throw result;
		return result;
	}
	if (contentType.includes("application/json")) {
		const jsonPayload = await response.json();
		const redirect = parseRedirect(jsonPayload);
		if (redirect) throw redirect;
		if (isNotFound(jsonPayload)) throw jsonPayload;
		return jsonPayload;
	}
	if (!response.ok) throw new Error(await response.text());
	return response;
}
/** Processes the complete JSON values emitted by the frame decoder. */
async function processFramedResponse(jsonStream, plugins) {
	const reader = jsonStream.getReader();
	const options = {
		refs: /* @__PURE__ */ new Map(),
		plugins
	};
	const fail = (error) => {
		reader.cancel(error).catch(() => {});
	};
	let result;
	const initialPostProcessPromises = [];
	try {
		const first = await reader.read();
		if (first.done) throw new Error("Stream ended before first object");
		result = deserialize(JSON.parse(first.value), options, initialPostProcessPromises);
	} catch (error) {
		fail(error);
		reader.releaseLock();
		throw error;
	}
	(async () => {
		const postProcessPromises = [];
		try {
			for (;;) {
				const next = await reader.read();
				if (next.done) return;
				deserialize(JSON.parse(next.value), options, postProcessPromises);
				observePostProcessPromises(postProcessPromises);
			}
		} catch (error) {
			fail(error);
			console.error("Stream processing error:", error);
		} finally {
			reader.releaseLock();
		}
	})();
	await awaitPostProcessPromises(initialPostProcessPromises);
	return result;
}
//#endregion
export { serverFnFetcher, trackPostProcessPromise };

//# sourceMappingURL=serverFnFetcher.js.map