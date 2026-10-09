const require_ShallowErrorPlugin = require("./ShallowErrorPlugin.cjs");
const require_RawStreamJSONPlugin = require("./RawStreamJSONPlugin.cjs");
let seroval_plugins_web = require("seroval-plugins/web");
//#region src/ssr/serializer/seroval-plugins.ts
/**
* Plugins for JSON transport from a client: serializes RawStream arguments
* and reads plain JSON responses, which never carry RawStream nodes.
*/
/* @__NO_SIDE_EFFECTS__ */
function createDefaultSerovalPlugins(signal) {
	return [
		require_ShallowErrorPlugin.ShallowErrorPlugin,
		signal ? /* @__PURE__ */ require_RawStreamJSONPlugin.createRawStreamJSONPlugin(signal) : require_RawStreamJSONPlugin.RawStreamJSONPlugin,
		seroval_plugins_web.ReadableStreamPlugin
	];
}
const defaultSerovalPlugins = /* @__PURE__ */ createDefaultSerovalPlugins();
/**
* `defaultSerovalPlugins` plus RawStream deserialization, for JSON that may
* carry RawStream nodes: server-function request bodies and cached static
* responses. Seroval deserializes by first tag match, so the deserialize half
* precedes the serialize half; it never matches during serialization.
*/
const defaultSerovalDeserializerPlugins = [require_RawStreamJSONPlugin.RawStreamJSONDeserializePlugin, ...defaultSerovalPlugins];
//#endregion
exports.createDefaultSerovalPlugins = createDefaultSerovalPlugins;
exports.defaultSerovalDeserializerPlugins = defaultSerovalDeserializerPlugins;
exports.defaultSerovalPlugins = defaultSerovalPlugins;

//# sourceMappingURL=seroval-plugins.cjs.map