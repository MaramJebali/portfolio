import { renderSsrHtmlResponse } from "@tanstack/router-core/ssr/server";
import ReactDOMServer from "react-dom/server";
//#region src/ssr/renderRouterToString.tsx
var renderRouterToString = async ({ router, responseHeaders, children }) => {
	return renderSsrHtmlResponse({
		router,
		responseHeaders,
		render: () => ReactDOMServer.renderToString(children)
	});
};
//#endregion
export { renderRouterToString };

//# sourceMappingURL=renderRouterToString.js.map