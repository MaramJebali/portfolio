export declare const TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
export declare const TSS_SERVER_FUNCTION: unique symbol;
export declare const TSS_SERVER_FUNCTION_FACTORY: unique symbol;
export declare const X_TSS_SERIALIZED = "x-tss-serialized";
export declare const X_TSS_RAW_RESPONSE = "x-tss-raw";
export declare const X_TSS_CONTEXT = "x-tss-context";
/** Content-Type for multiplexed framed responses (RawStream support) */
export declare const TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
/**
 * Frame types for binary multiplexing protocol.
 */
export declare const FRAME_TYPE_JSON = 0;
export declare const FRAME_TYPE_CHUNK = 1;
export declare const FRAME_TYPE_END = 2;
export declare const FRAME_TYPE_ERROR = 3;
/** Header size in bytes: type(1) + streamId(4) + length(4) */
export declare const FRAME_HEADER_SIZE = 9;
/** Largest payload accepted by one framed-protocol record. */
export declare const MAX_FRAME_PAYLOAD_SIZE: number;
/** Largest number of raw streams accepted in one framed response. */
export declare const MAX_FRAMED_STREAMS = 1024;
/**
 * Largest number of bytes one raw stream may hold unread. Raw streams share
 * one ordered response, so an unread stream would otherwise buffer without
 * bound while later frames arrive.
 */
export declare const MAX_UNREAD_RAW_STREAM_BYTES: number;
/** Current protocol version for framed responses */
export declare const TSS_FRAMED_PROTOCOL_VERSION = 1;
/** Full Content-Type header value with version parameter */
export declare const TSS_CONTENT_TYPE_FRAMED_VERSIONED = "application/x-tss-framed; v=1";
/**
 * Minimal metadata about a server function, available to client middleware.
 * Only contains the function ID since name/filename may expose server internals.
 */
export interface ClientFnMeta {
    /** The unique identifier for this server function */
    id: string;
}
/**
 * Full metadata about a server function, available to server middleware and server functions.
 * This information is embedded at compile time by the TanStack Start compiler.
 */
export interface ServerFnMeta extends ClientFnMeta {
    /** The original variable name of the server function (e.g., "myServerFn") */
    name: string;
    /** The source file path relative to the project root (e.g., "src/routes/api.ts") */
    filename: string;
}
export {};
