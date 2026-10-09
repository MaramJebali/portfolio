const require_runtime = require("../_virtual/_rolldown/runtime.cjs");
let _tanstack_router_core_ssr_server = require("@tanstack/router-core/ssr/server");
let react_dom_server = require("react-dom/server");
react_dom_server = require_runtime.__toESM(react_dom_server, 1);
//#region src/ssr/renderRouterToString.tsx
var renderRouterToString = async ({ router, responseHeaders, children }) => {
	return (0, _tanstack_router_core_ssr_server.renderSsrHtmlResponse)({
		router,
		responseHeaders,
		render: () => react_dom_server.default.renderToString(children)
	});
};
//#endregion
exports.renderRouterToString = renderRouterToString;

//# sourceMappingURL=renderRouterToString.cjs.map