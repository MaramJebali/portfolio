import { hydrateStart } from "@tanstack/start-client-core/client";
//#region src/hydrateStart.ts
/**
* React-specific wrapper for hydrateStart that signals hydration completion
*/
function hydrateStart$1() {
	return hydrateStart().finally(() => window.$_TSR?.h());
}
//#endregion
export { hydrateStart$1 as hydrateStart };

//# sourceMappingURL=hydrateStart.js.map