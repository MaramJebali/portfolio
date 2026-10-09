//#region src/ssr/handlerCallback.ts
function isSsrResponse(value) {
	if (typeof value !== "object" || value === null || !("response" in value) || !(value.response instanceof Response) || !("serverSsrCleanup" in value)) return false;
	if (value.serverSsrCleanup === "none") return true;
	return value.serverSsrCleanup === "stream" && "dispose" in value && typeof value.dispose === "function";
}
function normalizeSsrResponse(result) {
	if (result instanceof Response) return {
		response: result,
		serverSsrCleanup: "none"
	};
	if (isSsrResponse(result)) return result;
	throw new TypeError("Expected a Response from the SSR handler");
}
function cancelResponseBody(response, reason) {
	const body = response.body;
	if (!body) return;
	body.cancel(reason).catch(console.error);
}
function disposeSsrResponse(result, reason) {
	const response = normalizeSsrResponse(result);
	if (response.serverSsrCleanup === "stream") response.dispose(reason);
	else cancelResponseBody(response.response, reason);
}
/** The HTTP status that Router's server load selected for this render. */
function getSsrStatus(router) {
	return router._serverResult?.type === "render" ? router._serverResult.status : 200;
}
function createSsrStreamResponse(router, response) {
	const body = response.body;
	if (!body) throw new Error("Invariant failed: SSR stream response requires a body");
	return {
		response,
		serverSsrCleanup: "stream",
		dispose(reason) {
			router.serverSsr?.cleanup();
			body.cancel(reason).catch(() => {});
		}
	};
}
function bindSsrResponseToRequest(router, result, signal) {
	const ssrResponse = normalizeSsrResponse(result);
	if (ssrResponse.serverSsrCleanup !== "stream") {
		if (signal.aborted) disposeSsrResponse(result, signal.reason);
		return ssrResponse;
	}
	const abort = () => {
		disposeSsrResponse(ssrResponse, signal.reason);
	};
	if (signal.aborted) {
		abort();
		return ssrResponse;
	}
	const serverSsr = router?.serverSsr;
	if (serverSsr?.hydrationScripts.requestSignal === signal) {
		serverSsr.onCleanup(() => {
			if (signal.aborted) abort();
		});
		return ssrResponse;
	}
	signal.addEventListener("abort", abort, { once: true });
	if (!serverSsr) return ssrResponse;
	serverSsr.onCleanup(() => {
		signal.removeEventListener("abort", abort);
	});
	return ssrResponse;
}
function replaceSsrResponse(result, response, reason) {
	disposeSsrResponse(result, reason);
	return {
		response,
		serverSsrCleanup: "none"
	};
}
function stripSsrResponseBody(result, reason) {
	const ssrResponse = normalizeSsrResponse(result);
	disposeSsrResponse(ssrResponse, reason);
	return {
		response: new Response(null, ssrResponse.response),
		serverSsrCleanup: "none"
	};
}
function defineHandlerCallback(handler) {
	return handler;
}
//#endregion
exports.bindSsrResponseToRequest = bindSsrResponseToRequest;
exports.createSsrStreamResponse = createSsrStreamResponse;
exports.defineHandlerCallback = defineHandlerCallback;
exports.disposeSsrResponse = disposeSsrResponse;
exports.getSsrStatus = getSsrStatus;
exports.isSsrResponse = isSsrResponse;
exports.normalizeSsrResponse = normalizeSsrResponse;
exports.replaceSsrResponse = replaceSsrResponse;
exports.stripSsrResponseBody = stripSsrResponseBody;

//# sourceMappingURL=handlerCallback.cjs.map