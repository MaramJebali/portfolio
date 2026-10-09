import { _getAssetMatches } from "../load-client.js";
//#region src/ssr/bodyScripts.ts
function getSsrBodyScriptParts(matches, manifest, nonce, routeScriptAttrs) {
	const assetMatches = _getAssetMatches(matches);
	const routeScripts = [];
	const manifestScripts = [];
	for (const match of assetMatches) for (const script of Array.isArray(match.scripts) ? match.scripts : []) {
		if (!script) continue;
		const { children, ...attrs } = script;
		routeScripts.push({
			tag: "script",
			attrs: {
				...attrs,
				...routeScriptAttrs,
				nonce
			},
			children
		});
	}
	if (manifest) for (const match of assetMatches) for (const asset of manifest.routes[match.routeId]?.scripts ?? []) manifestScripts.push({
		tag: "script",
		attrs: {
			...asset.attrs,
			nonce
		},
		children: asset.children
	});
	return [routeScripts, manifestScripts];
}
function composeSsrBodyScripts([routeScripts, manifestScripts], initialHydrationScripts) {
	if (!initialHydrationScripts) return [...routeScripts, ...manifestScripts];
	return [
		...initialHydrationScripts.before,
		...routeScripts,
		...manifestScripts,
		initialHydrationScripts.boundary
	];
}
//#endregion
export { composeSsrBodyScripts, getSsrBodyScriptParts };

//# sourceMappingURL=bodyScripts.js.map