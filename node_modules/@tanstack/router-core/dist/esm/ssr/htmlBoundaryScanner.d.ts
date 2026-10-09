export declare const SCRIPT_CLOSE = "</script>";
export declare const DOCUMENT_CLOSE_ANCHOR_INDEX: number;
export declare const SCRIPT_CLOSE_ANCHOR_INDEX: number;
export declare const DOCUMENT_CLOSE_BYTES: Uint8Array<ArrayBuffer>;
export declare const SCRIPT_CLOSE_BYTES: Uint8Array<ArrayBuffer>;
export declare function encodeIntoBoundedChunk(source: string, sourceOffset: number, output: Uint8Array, outputOffset?: number): TextEncoderEncodeIntoResult;
/**
 * State for matching a fixed ASCII sequence across input chunks.
 *
 * The pattern must be non-empty, its first byte must be unique, and the anchor
 * index must point inside the pattern.
 */
export type ByteMatcherState = {
    readonly pattern: Uint8Array;
    readonly anchorIndex: number;
    matched: number;
};
/** Advance matcher state and return the local offset after a complete match. */
export declare function advanceByteMatcher(matcher: ByteMatcherState, value: Uint8Array, startIndex?: number, findLast?: boolean): number | undefined;
/** Find a complete fixed sequence that is contained in one byte chunk. */
export declare function findExactBytes(value: Uint8Array, pattern: Uint8Array, startIndex?: number, anchorIndex?: number): number;
/**
 * Find the longest suffix that can become the fixed sequence in the next
 * chunk. The returned index starts that suffix.
 */
export declare function getExactBytesPrefixAtEnd(value: Uint8Array, pattern: Uint8Array, startIndex?: number): number | undefined;
