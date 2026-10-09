import { getSsrStatus } from "./handlerCallback.js";
import { transformHtmlStringWithRouter } from "./transformStreamWithRouter.js";
//#region src/ssr/renderSsrHtmlResponse.ts
async function renderSsrHtmlResponse({ router, responseHeaders, render }) {
	try {
		const html = await transformHtmlStringWithRouter(router, await render());
		return new Response(html, {
			status: getSsrStatus(router),
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
export { renderSsrHtmlResponse };

//# sourceMappingURL=renderSsrHtmlResponse.js.map