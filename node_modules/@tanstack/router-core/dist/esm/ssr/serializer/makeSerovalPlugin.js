import { createPlugin } from "seroval";
//#region src/ssr/serializer/makeSerovalPlugin.ts
/** Create a Seroval plugin for client/server symmetric (de)serialization. */
/* @__NO_SIDE_EFFECTS__ */
function makeSerovalPlugin(serializationAdapter) {
	return /* @__PURE__ */ createPlugin({
		tag: "$TSR/t/" + serializationAdapter.key,
		test: serializationAdapter.test,
		parse: {
			sync(value, ctx) {
				return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
			},
			async async(value, ctx) {
				return { v: await ctx.parse(serializationAdapter.toSerializable(value)) };
			},
			stream(value, ctx) {
				return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
			}
		},
		serialize: void 0,
		deserialize(node, ctx) {
			return serializationAdapter.fromSerializable(ctx.deserialize(node.v));
		}
	});
}
//#endregion
export { makeSerovalPlugin };

//# sourceMappingURL=makeSerovalPlugin.js.map