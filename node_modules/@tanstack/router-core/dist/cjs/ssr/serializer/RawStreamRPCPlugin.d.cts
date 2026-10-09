import { RawStream, OnRawStreamCallback, RawStreamRPCNode } from './RawStream.cjs';
/**
 * Server-side RawStream plugin for multiplexed server-function responses.
 * The `hint` is ignored: framed responses always carry raw bytes.
 */
export declare function createRawStreamRPCPlugin(onRawStream: OnRawStreamCallback): import('seroval').Plugin<RawStream, RawStreamRPCNode>;
/** Client-side RawStream plugin for multiplexed server-function responses. */
export declare function createRawStreamDeserializePlugin(getStream: (id: number) => ReadableStream<Uint8Array>): import('seroval').Plugin<ReadableStream<Uint8Array<ArrayBufferLike>>, RawStreamRPCNode>;
