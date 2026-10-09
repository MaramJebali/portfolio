const require_handlerCallback = require("./handlerCallback.cjs");
const require_transformStreamWithRouter = require("./transformStreamWithRouter.cjs");
//#region src/ssr/renderSsrHtmlResponse.ts
async function renderSsrHtmlResponse({ router, responseHeaders, render }) {
	try {
		const html = await require_transformStreamWithRouter.transformHtmlStringWithRouter(router, await render());
		return new Response(html, {
			status: require_handlerCallback.getSsrStatus(router),
			headers: responseHeaders
		});
	} catch (error) {
		console.error("Render to string error:", error);
		return new Response("Internal Server Error", {
			status: 500,
			headers: responseHeaders
		});
	} finally {
		router.serverSsr?.cleanup();
	}
}
//#endregion
exports.renderSsrHtmlResponse = renderSsrHtmlResponse;

//# sourceMappingURL=renderSsrHtmlResponse.cjs.map