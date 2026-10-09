const require_ShallowErrorPlugin = require("./ShallowErrorPlugin.cjs");
const require_RawStreamSSRPlugin = require("./RawStreamSSRPlugin.cjs");
let seroval_plugins_web = require("seroval-plugins/web");
//#region src/ssr/serializer/seroval-plugins.ssr.ts
/** Server-only plugins for streaming hydration data into HTML. */
const ssrSerovalPlugins = [
	require_ShallowErrorPlugin.ShallowErrorPlugin,
	require_RawStreamSSRPlugin.RawStreamSSRPlugin,
	seroval_plugins_web.ReadableStreamPlugin
];
//#endregion
exports.ssrSerovalPlugins = ssrSerovalPlugins;

//# sourceMappingURL=seroval-plugins.ssr.cjs.map