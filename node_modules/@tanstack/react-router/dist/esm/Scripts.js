import { useRouter } from "./useRouter.js";
import { Asset } from "./Asset.js";
import { composeSsrBodyScripts, deepEqual, getSsrBodyScriptParts } from "@tanstack/router-core";
import { createElement } from "react";
import { isServer } from "@tanstack/router-core/isServer";
import { Fragment, jsx } from "react/jsx-runtime";
import { useSelector } from "@tanstack/react-store";
//#region src/Scripts.tsx
var routeScriptAttrs = { suppressHydrationWarning: true };
/**
* Render body script tags collected from route matches and SSR manifests.
* During streaming SSR, `<Scripts>` marks where late hydration scripts may
* begin to be inserted.
*/
var Scripts = () => {
	const router = useRouter();
	const nonce = router.options.ssr?.nonce;
	const getParts = (matches) => {
		const parts = getSsrBodyScriptParts(matches, router.ssr?.manifest, nonce, routeScriptAttrs);
		for (const script of parts[1]) if (typeof script.attrs?.src === "string") {
			const scriptWithHoist = script;
			scriptWithHoist.preventScriptHoist = true;
		}
		return parts;
	};
	const getScripts = (matches) => {
		return composeSsrBodyScripts(getParts(matches));
	};
	if (isServer ?? router.isServer) return renderScripts(composeSsrBodyScripts(getParts(router.stores.matches.get()), router.serverSsr?.takeInitialHydrationScriptTags()));
	return renderScripts(useSelector(router.stores.matches, getScripts, { compare: deepEqual }));
};
function renderScripts(scripts) {
	return /* @__PURE__ */ jsx(Fragment, { children: scripts.map((asset, i) => /* @__PURE__ */ createElement(Asset, {
		...asset,
		key: `tsr-scripts-${asset.tag}-${i}`
	})) });
}
//#endregion
export { Scripts };

//# sourceMappingURL=Scripts.js.map