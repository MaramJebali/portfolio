//#region src/constants.ts
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var X_TSS_CONTEXT = "x-tss-context";
/** Content-Type for multiplexed framed responses (RawStream support) */
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
/**
* Frame types for binary multiplexing protocol.
*/
var FRAME_TYPE_JSON = 0;
var FRAME_TYPE_CHUNK = 1;
var FRAME_TYPE_END = 2;
var FRAME_TYPE_ERROR = 3;
/** Header size in bytes: type(1) + streamId(4) + length(4) */
var FRAME_HEADER_SIZE = 9;
/** Largest payload accepted by one framed-protocol record. */
var MAX_FRAME_PAYLOAD_SIZE = 16 * 1024 * 1024;
/** Largest number of raw streams accepted in one framed response. */
var MAX_FRAMED_STREAMS = 1024;
/**
* Largest number of bytes one raw stream may hold unread. Raw streams share
* one ordered response, so an unread stream would otherwise buffer without
* bound while later frames arrive.
*/
var MAX_UNREAD_RAW_STREAM_BYTES = 128 * 1024 * 1024;
/** Current protocol version for framed responses */
var TSS_FRAMED_PROTOCOL_VERSION = 1;
/** Full Content-Type header value with version parameter */
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
//#endregion
export { FRAME_HEADER_SIZE, FRAME_TYPE_CHUNK, FRAME_TYPE_END, FRAME_TYPE_ERROR, FRAME_TYPE_JSON, MAX_FRAMED_STREAMS, MAX_FRAME_PAYLOAD_SIZE, MAX_UNREAD_RAW_STREAM_BYTES, TSS_CONTENT_TYPE_FRAMED, TSS_CONTENT_TYPE_FRAMED_VERSIONED, TSS_FORMDATA_CONTEXT, TSS_FRAMED_PROTOCOL_VERSION, TSS_SERVER_FUNCTION, TSS_SERVER_FUNCTION_FACTORY, X_TSS_CONTEXT, X_TSS_RAW_RESPONSE, X_TSS_SERIALIZED };

//# sourceMappingURL=constants.js.map