//#region src/core/hmr/handle-route-update.ts
function handleRouteUpdate(routeId, newRoute) {
	const router = window.__TSR_ROUTER__;
	const oldRoute = router.routesById[routeId];
	if (!oldRoute) return;
	const generatedRouteOptionKeys = new Set([
		"id",
		"path",
		"getParentRoute"
	]);
	const generatedRouteOptions = {};
	generatedRouteOptionKeys.forEach((key) => {
		if (key in oldRoute.options) generatedRouteOptions[key] = oldRoute.options[key];
	});
	const preserveComponentIdentity = "shellComponent" in oldRoute.options === "shellComponent" in newRoute.options;
	const componentKeys = "__TSR_COMPONENT_TYPES__";
	if (preserveComponentIdentity) componentKeys.forEach((key) => {
		if (key in oldRoute.options && key in newRoute.options) newRoute.options[key] = oldRoute.options[key];
	});
	const nextOptions = {
		...newRoute.options,
		...generatedRouteOptions
	};
	oldRoute.options = nextOptions;
	oldRoute.update(nextOptions);
	router._replaceRouteChunk(oldRoute, newRoute.lazyFn);
	router.setRoutes(router.buildRouteTree());
	syncHotRouteExport(oldRoute);
	router.resolvePathCache.clear();
	router._refreshRoute?.();
	function syncHotRouteExport(liveRoute) {
		newRoute.options = liveRoute.options;
		newRoute.parentRoute = liveRoute.parentRoute;
		newRoute._path = liveRoute._path;
		newRoute._id = liveRoute._id;
		newRoute._fullPath = liveRoute._fullPath;
		newRoute._to = liveRoute._to;
	}
}
var handleRouteUpdateStr = handleRouteUpdate.toString();
function getHandleRouteUpdateCode(stableRouteOptionKeys) {
	return handleRouteUpdateStr.replace(/['"]__TSR_COMPONENT_TYPES__['"]/, JSON.stringify(stableRouteOptionKeys));
}
//#endregion
export { getHandleRouteUpdateCode };

//# sourceMappingURL=handle-route-update.js.map