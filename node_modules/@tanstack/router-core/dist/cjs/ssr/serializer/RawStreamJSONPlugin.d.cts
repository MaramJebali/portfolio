import { RawStream, RawStreamJSONNode } from './RawStream.cjs';
/**
 * Serializes a RawStream into JSON requests and static-cache responses.
 * The optional signal stops the source pump when the request is aborted.
 */
export declare function createRawStreamJSONPlugin(signal?: AbortSignal): import('seroval').Plugin<RawStream, RawStreamJSONNode>;
export declare const RawStreamJSONPlugin: import('seroval').Plugin<RawStream, RawStreamJSONNode>;
/**
 * Deserializes the JSON shape above back into a `ReadableStream<Uint8Array>`.
 * `test` never matches, so this plugin is inert during serialization and can
 * share a plugin list with `RawStreamJSONPlugin`.
 */
export declare const RawStreamJSONDeserializePlugin: import('seroval').Plugin<ReadableStream<Uint8Array<ArrayBufferLike>>, RawStreamJSONNode>;
