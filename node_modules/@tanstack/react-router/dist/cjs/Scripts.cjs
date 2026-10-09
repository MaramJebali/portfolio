const require_useRouter = require("./useRouter.cjs");
const require_Asset = require("./Asset.cjs");
let _tanstack_router_core = require("@tanstack/router-core");
let react = require("react");
let _tanstack_router_core_isServer = require("@tanstack/router-core/isServer");
let react_jsx_runtime = require("react/jsx-runtime");
let _tanstack_react_store = require("@tanstack/react-store");
//#region src/Scripts.tsx
var routeScriptAttrs = { suppressHydrationWarning: true };
/**
* Render body script tags collected from route matches and SSR manifests.
* During streaming SSR, `<Scripts>` marks where late hydration scripts may
* begin to be inserted.
*/
var Scripts = () => {
	const router = require_useRouter.useRouter();
	const nonce = router.options.ssr?.nonce;
	const getParts = (matches) => {
		const parts = (0, _tanstack_router_core.getSsrBodyScriptParts)(matches, router.ssr?.manifest, nonce, routeScriptAttrs);
		for (const script of parts[1]) if (typeof script.attrs?.src === "string") {
			const scriptWithHoist = script;
			scriptWithHoist.preventScriptHoist = true;
		}
		return parts;
	};
	const getScripts = (matches) => {
		return (0, _tanstack_router_core.composeSsrBodyScripts)(getParts(matches));
	};
	if (_tanstack_router_core_isServer.isServer ?? router.isServer) return renderScripts((0, _tanstack_router_core.composeSsrBodyScripts)(getParts(router.stores.matches.get()), router.serverSsr?.takeInitialHydrationScriptTags()));
	return renderScripts((0, _tanstack_react_store.useSelector)(router.stores.matches, getScripts, { compare: _tanstack_router_core.deepEqual }));
};
function renderScripts(scripts) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: scripts.map((asset, i) => /* @__PURE__ */ (0, react.createElement)(require_Asset.Asset, {
		...asset,
		key: `tsr-scripts-${asset.tag}-${i}`
	})) });
}
//#endregion
exports.Scripts = Scripts;

//# sourceMappingURL=Scripts.cjs.map