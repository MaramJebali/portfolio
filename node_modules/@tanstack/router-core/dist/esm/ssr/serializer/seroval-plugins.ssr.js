import { ShallowErrorPlugin } from "./ShallowErrorPlugin.js";
import { RawStreamSSRPlugin } from "./RawStreamSSRPlugin.js";
import { ReadableStreamPlugin } from "seroval-plugins/web";
//#region src/ssr/serializer/seroval-plugins.ssr.ts
/** Server-only plugins for streaming hydration data into HTML. */
const ssrSerovalPlugins = [
	ShallowErrorPlugin,
	RawStreamSSRPlugin,
	ReadableStreamPlugin
];
//#endregion
export { ssrSerovalPlugins };

//# sourceMappingURL=seroval-plugins.ssr.js.map