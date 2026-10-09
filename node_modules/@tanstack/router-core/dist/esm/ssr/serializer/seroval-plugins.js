import { ShallowErrorPlugin } from "./ShallowErrorPlugin.js";
import { RawStreamJSONDeserializePlugin, RawStreamJSONPlugin, createRawStreamJSONPlugin } from "./RawStreamJSONPlugin.js";
import { ReadableStreamPlugin } from "seroval-plugins/web";
//#region src/ssr/serializer/seroval-plugins.ts
/**
* Plugins for JSON transport from a client: serializes RawStream arguments
* and reads plain JSON responses, which never carry RawStream nodes.
*/
/* @__NO_SIDE_EFFECTS__ */
function createDefaultSerovalPlugins(signal) {
	return [
		ShallowErrorPlugin,
		signal ? /* @__PURE__ */ createRawStreamJSONPlugin(signal) : RawStreamJSONPlugin,
		ReadableStreamPlugin
	];
}
const defaultSerovalPlugins = /* @__PURE__ */ createDefaultSerovalPlugins();
/**
* `defaultSerovalPlugins` plus RawStream deserialization, for JSON that may
* carry RawStream nodes: server-function request bodies and cached static
* responses. Seroval deserializes by first tag match, so the deserialize half
* precedes the serialize half; it never matches during serialization.
*/
const defaultSerovalDeserializerPlugins = [RawStreamJSONDeserializePlugin, ...defaultSerovalPlugins];
//#endregion
export { createDefaultSerovalPlugins, defaultSerovalDeserializerPlugins, defaultSerovalPlugins };

//# sourceMappingURL=seroval-plugins.js.map