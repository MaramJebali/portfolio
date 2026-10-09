const require_RawStream = require("./RawStream.cjs");
const require_rawStreamCodec = require("./rawStreamCodec.cjs");
let seroval = require("seroval");
//#region src/ssr/serializer/RawStreamSSRPlugin.ts
const nodeBuffer = globalThis.Buffer;
const toBase64Fast = nodeBuffer ? (bytes) => nodeBuffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64") : require_rawStreamCodec.toBase64;
const BINARY_FACTORY = () => {};
const TEXT_FACTORY = () => {};
const FACTORY_BINARY = `((s,u=1)=>new ReadableStream({start(c,f){f=s.on({next(b){const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)},throw(e){s=u=0;c.error(e)},return(){s=u=0;c.close()}});u=u&&f},cancel(){u&&u()}}))`;
const FACTORY_TEXT = `((s,u=1,e=new TextEncoder)=>new ReadableStream({start(c,f){f=s.on({next(v){const x=v.slice(1);if(v[0]==='t')c.enqueue(e.encode(x));else{const d=atob(x),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}},throw(x){s=u=0;c.error(x)},return(){s=u=0;c.close()}});u=u&&f},cancel(){u&&u()}}))`;
function makeFactoryPlugin(tag, sentinel, source) {
	return (0, seroval.createPlugin)({
		tag,
		test(value) {
			return value === sentinel;
		},
		parse: { stream() {
			return {};
		} },
		serialize() {
			return source;
		},
		deserialize: void 0
	});
}
const RawStreamFactoryBinaryPlugin = /* @__PURE__ */ makeFactoryPlugin("tss/RawStreamFactory", BINARY_FACTORY, FACTORY_BINARY);
const RawStreamFactoryTextPlugin = /* @__PURE__ */ makeFactoryPlugin("tss/RawStreamFactoryText", TEXT_FACTORY, FACTORY_TEXT);
/** SSR-only RawStream plugin for streaming JavaScript into HTML. */
const RawStreamSSRPlugin = /* @__PURE__ */ (0, seroval.createPlugin)({
	tag: "tss/RawStream",
	extends: [RawStreamFactoryBinaryPlugin, RawStreamFactoryTextPlugin],
	test(value) {
		return value instanceof require_RawStream.RawStream;
	},
	parse: { stream(value, ctx) {
		const text = value.hint === "text";
		const factory = ctx.parse(text ? TEXT_FACTORY : BINARY_FACTORY);
		const [stream, stop] = require_rawStreamCodec.pumpEncodedStream(value.stream, text ? require_rawStreamCodec.encodeText : toBase64Fast);
		ctx.addCleanup(stop);
		return {
			factory,
			stream: ctx.parse(stream)
		};
	} },
	serialize(node, ctx) {
		return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
	},
	deserialize: void 0
});
//#endregion
exports.RawStreamSSRPlugin = RawStreamSSRPlugin;

//# sourceMappingURL=RawStreamSSRPlugin.cjs.map