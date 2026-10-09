//#region src/ssr/serializer/RawStream.ts
/**
* Marker class for ReadableStream<Uint8Array> that should be serialized
* with base64/text encoding (JSON and SSR) or binary framing
* (server-function responses).
*
* Wrap your binary streams with this to get efficient serialization:
* ```ts
* // For binary data (files, images, etc.)
* return { data: new RawStream(file.stream()) }
*
* // For text-heavy data (RSC payloads, etc.)
* return { data: new RawStream(rscStream, { hint: 'text' }) }
* ```
*
* RawStreams returned from one server function share one ordered response.
* Arbitrary or sequential consumption can require potentially unbounded client
* buffering for unread data. Cancelling one RawStream discards it locally;
* abort the whole server-function call to cancel the response and server work.
* Consume streams concurrently, cancel unused streams promptly, or use separate
* calls when independent backpressure is required.
*/
var RawStream = class {
	constructor(stream, options) {
		this.stream = stream;
		this.hint = options?.hint ?? "binary";
	}
};
//#endregion
exports.RawStream = RawStream;

//# sourceMappingURL=RawStream.cjs.map