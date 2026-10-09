const require_RawStream = require("./RawStream.cjs");
const require_rawStreamCodec = require("./rawStreamCodec.cjs");
let seroval = require("seroval");
//#region src/ssr/serializer/RawStreamJSONPlugin.ts
/**
* Serializes a RawStream into JSON requests and static-cache responses.
* The optional signal stops the source pump when the request is aborted.
*/
/* @__NO_SIDE_EFFECTS__ */
function createRawStreamJSONPlugin(signal) {
	return /* @__PURE__ */ (0, seroval.createPlugin)({
		tag: "tss/RawStream",
		test: (value) => value instanceof require_RawStream.RawStream,
		parse: { async: async (value, ctx) => {
			const text = await ctx.parse(value.hint === "text");
			const [stream] = require_rawStreamCodec.pumpEncodedStream(value.stream, value.hint === "text" ? require_rawStreamCodec.encodeText : require_rawStreamCodec.toBase64, signal);
			return {
				text,
				stream: await ctx.parse(stream)
			};
		} },
		serialize: void 0,
		deserialize: void 0
	});
}
const RawStreamJSONPlugin = /* @__PURE__ */ createRawStreamJSONPlugin();
/**
* Deserializes the JSON shape above back into a `ReadableStream<Uint8Array>`.
* `test` never matches, so this plugin is inert during serialization and can
* share a plugin list with `RawStreamJSONPlugin`.
*/
const RawStreamJSONDeserializePlugin = /* @__PURE__ */ (0, seroval.createPlugin)({
	tag: "tss/RawStream",
	test: () => false,
	parse: {},
	serialize: void 0,
	deserialize(node, ctx) {
		return require_rawStreamCodec.fromEncodedStream(ctx.deserialize(node.stream), ctx.deserialize(node.text) ? require_rawStreamCodec.decodeText : require_rawStreamCodec.fromBase64);
	}
});
//#endregion
exports.RawStreamJSONDeserializePlugin = RawStreamJSONDeserializePlugin;
exports.RawStreamJSONPlugin = RawStreamJSONPlugin;
exports.createRawStreamJSONPlugin = createRawStreamJSONPlugin;

//# sourceMappingURL=RawStreamJSONPlugin.cjs.map