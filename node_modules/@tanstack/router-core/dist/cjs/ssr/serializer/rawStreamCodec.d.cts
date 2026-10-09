import { createStream } from 'seroval';
export declare function toBase64(bytes: Uint8Array): string;
export declare function fromBase64(value: string): Uint8Array<ArrayBuffer>;
/** `'t' + utf8` for a valid UTF-8 chunk, otherwise `'b' + base64`. */
export declare function encodeText(value: Uint8Array): string;
export declare function decodeText(value: string): Uint8Array<ArrayBuffer>;
/**
 * Pump a byte stream into a Seroval stream, one encoded chunk per read.
 * Returns the Seroval stream and a `stop` function that cancels the reader
 * without signalling the Seroval stream; the abort signal and read failures
 * stop the pump and throw through the Seroval stream.
 */
export declare function pumpEncodedStream(readable: ReadableStream<Uint8Array>, encode: (value: Uint8Array) => string, signal?: AbortSignal): readonly [import('seroval').Stream<string | undefined>, (reason?: unknown) => boolean];
/** Rebuild a byte stream from encoded Seroval stream chunks. */
export declare function fromEncodedStream(source: ReturnType<typeof createStream<string | undefined>>, decode: (value: string) => Uint8Array): ReadableStream<Uint8Array<ArrayBufferLike>>;
