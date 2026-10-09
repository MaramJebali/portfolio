/**
 * Binary frame protocol for multiplexing JSON and raw streams over HTTP.
 *
 * Frame format: [type:1][streamId:4][length:4][payload:length]
 * - type: 1 byte - frame type (JSON, CHUNK, END, ERROR)
 * - streamId: 4 bytes big-endian uint32 - stream identifier
 * - length: 4 bytes big-endian uint32 - payload length
 * - payload: variable length bytes
 */
/**
 * Late stream registration for RawStreams discovered after serialization starts.
 * Used when Promise<RawStream> resolves after the initial synchronous pass.
 */
export interface LateStreamRegistration {
    id: number;
    stream: ReadableStream<Uint8Array>;
}
/** One serialized JSON patch and the raw streams referenced by that patch. */
export interface MultiplexedStreamRecord {
    json: Uint8Array;
    rawStreams: Array<LateStreamRegistration>;
}
export interface MultiplexedStreamOptions {
    onCancel?: (reason?: unknown) => void;
    signal?: AbortSignal;
}
/**
 * Creates a multiplexed ReadableStream from serialized response records.
 *
 * A record's JSON frame is admitted before any raw stream referenced by that
 * record starts. Raw streams from admitted records are pumped concurrently.
 * The caller bounds the stream count before records reach this function.
 */
export declare function createMultiplexedStream(recordStream: ReadableStream<MultiplexedStreamRecord>, options?: MultiplexedStreamOptions): ReadableStream<Uint8Array>;
