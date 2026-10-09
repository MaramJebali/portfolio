const require_load_client = require("../load-client.cjs");
const require_headers = require("./headers.cjs");
const require_await_signal = require("../await-signal.cjs");
const require_ssr_server = require("./ssr-server.cjs");
const require_handlerCallback = require("./handlerCallback.cjs");
let _tanstack_history = require("@tanstack/history");
//#region src/ssr/createRequestHandler.ts
function createLateResponseDisposer(signal) {
	return (result) => {
		if (result instanceof Response || require_handlerCallback.isSsrResponse(result)) require_handlerCallback.disposeSsrResponse(result, signal.reason);
	};
}
function createRequestHandler({ createRouter, request, getRouterManifest }) {
	return async (cb) => {
		const signal = request.signal;
		signal.throwIfAborted();
		const manifest = getRouterManifest ? await require_await_signal.waitForReason(getRouterManifest(), signal) : void 0;
		signal.throwIfAborted();
		const router = createRouter();
		let responseOwnsCleanup = false;
		try {
			require_ssr_server.attachRouterServerSsrUtils({
				router,
				manifest
			});
			const { url } = require_ssr_server.getNormalizedURL(request.url, "http://localhost");
			const origin = require_ssr_server.getOrigin(request);
			const history = (0, _tanstack_history.createServerHistory)(url.href.replace(url.origin, ""));
			router.update({
				history,
				origin: router.options.origin ?? origin
			});
			await router.load({ _signal: signal });
			signal.throwIfAborted();
			const result = router._serverResult;
			if (result?.type === "redirect") return result.redirect;
			await router.serverSsr?.dehydrate({ signal });
			signal.throwIfAborted();
			const responseHeaders = getRequestHeaders({ router });
			signal.throwIfAborted();
			const disposeLate = createLateResponseDisposer(signal);
			const ssrResponse = require_handlerCallback.bindSsrResponseToRequest(router, await require_await_signal.waitForReason(cb({
				request,
				router,
				responseHeaders
			}), signal, disposeLate, disposeLate), signal);
			signal.throwIfAborted();
			responseOwnsCleanup = ssrResponse.serverSsrCleanup === "stream";
			return ssrResponse.response;
		} finally {
			if (!responseOwnsCleanup) router.serverSsr?.cleanup();
		}
	};
}
function getRequestHeaders(opts) {
	const matchHeaders = [];
	for (const match of require_load_client._getRenderedMatches(opts.router.stores.matches.get())) matchHeaders.push(match.headers);
	return require_headers.mergeHeaders({ "Content-Type": "text/html; charset=UTF-8" }, ...matchHeaders);
}
//#endregion
exports.createRequestHandler = createRequestHandler;

//# sourceMappingURL=createRequestHandler.cjs.map