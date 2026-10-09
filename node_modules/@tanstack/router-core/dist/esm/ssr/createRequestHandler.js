import { _getRenderedMatches } from "../load-client.js";
import { mergeHeaders } from "./headers.js";
import { waitForReason } from "../await-signal.js";
import { attachRouterServerSsrUtils, getNormalizedURL, getOrigin } from "./ssr-server.js";
import { bindSsrResponseToRequest, disposeSsrResponse, isSsrResponse } from "./handlerCallback.js";
import { createServerHistory } from "@tanstack/history";
//#region src/ssr/createRequestHandler.ts
function createLateResponseDisposer(signal) {
	return (result) => {
		if (result instanceof Response || isSsrResponse(result)) disposeSsrResponse(result, signal.reason);
	};
}
function createRequestHandler({ createRouter, request, getRouterManifest }) {
	return async (cb) => {
		const signal = request.signal;
		signal.throwIfAborted();
		const manifest = getRouterManifest ? await waitForReason(getRouterManifest(), signal) : void 0;
		signal.throwIfAborted();
		const router = createRouter();
		let responseOwnsCleanup = false;
		try {
			attachRouterServerSsrUtils({
				router,
				manifest
			});
			const { url } = getNormalizedURL(request.url, "http://localhost");
			const origin = getOrigin(request);
			const history = createServerHistory(url.href.replace(url.origin, ""));
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
			const ssrResponse = bindSsrResponseToRequest(router, await waitForReason(cb({
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
	for (const match of _getRenderedMatches(opts.router.stores.matches.get())) matchHeaders.push(match.headers);
	return mergeHeaders({ "Content-Type": "text/html; charset=UTF-8" }, ...matchHeaders);
}
//#endregion
export { createRequestHandler };

//# sourceMappingURL=createRequestHandler.js.map