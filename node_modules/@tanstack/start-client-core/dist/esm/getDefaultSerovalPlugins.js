import { getStartOptions } from "./getStartOptions.js";
import { createDefaultSerovalPlugins, makeSerovalPlugin } from "@tanstack/router-core/ssr/client";
//#region src/getDefaultSerovalPlugins.ts
/** Start's serialization adapters followed by `routerPlugins`. */
function getSerovalPlugins(routerPlugins) {
	return [...(getStartOptions()?.serializationAdapters)?.map(makeSerovalPlugin) ?? [], ...routerPlugins];
}
/**
* Plugins for client JSON transport. The optional signal stops RawStream
* pumps when the request is aborted.
*/
function getDefaultSerovalPlugins(signal) {
	return getSerovalPlugins(createDefaultSerovalPlugins(signal));
}
//#endregion
export { getDefaultSerovalPlugins, getSerovalPlugins };

//# sourceMappingURL=getDefaultSerovalPlugins.js.map