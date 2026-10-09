import { RawStream } from "./RawStream.js";
import { createPlugin } from "seroval";
//#region src/ssr/serializer/RawStreamRPCPlugin.ts
/**
* Server-side RawStream plugin for multiplexed server-function responses.
* The `hint` is ignored: framed responses always carry raw bytes.
*/
/* @__NO_SIDE_EFFECTS__ */
function createRawStreamRPCPlugin(onRawStream) {
	let nextStreamId = 1;
	return /* @__PURE__ */ createPlugin({
		tag: "tss/RawStream",
		test(value) {
			return value instanceof RawStream;
		},
		parse: { stream(value, ctx) {
			const streamId = nextStreamId++;
			onRawStream(streamId, value.stream);
			return { streamId: ctx.parse(streamId) };
		} },
		serialize: void 0,
		deserialize: void 0
	});
}
/** Client-side RawStream plugin for multiplexed server-function responses. */
/* @__NO_SIDE_EFFECTS__ */
function createRawStreamDeserializePlugin(getStream) {
	return /* @__PURE__ */ createPlugin({
		tag: "tss/RawStream",
		test: () => false,
		parse: {},
		serialize: void 0,
		deserialize(node, ctx) {
			return getStream(ctx.deserialize(node.streamId));
		}
	});
}
//#endregion
export { createRawStreamDeserializePlugin, createRawStreamRPCPlugin };

//# sourceMappingURL=RawStreamRPCPlugin.js.map