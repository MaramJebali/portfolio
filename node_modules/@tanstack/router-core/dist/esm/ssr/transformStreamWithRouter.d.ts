import { Readable } from 'node:stream';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { AnyRouter } from '../router.js';
export type TransformStreamWithRouterOptions = {
    /** Timeout for serialization to complete after app render finishes (default: 60000ms) */
    timeoutMs?: number;
    /** Maximum lifetime of the stream transform. Defaults to twice timeoutMs. */
    lifetimeMs?: number;
    /** Cancels the transform and releases SSR state when the request ends. */
    signal?: AbortSignal;
    /**
     * Additional point after which the renderer guarantees that a router script
     * can be inserted. This is an adapter contract, not a user streaming policy.
     * The router boundary, canonical document close, and EOF are always safe.
     */
    rendererSafePoint?: 'script-close' | 'record-end';
    /**
     * Called exactly once when the stream is torn down due to abort/error/
     * cancel/timeout — NOT on natural successful completion. Use this to
     * abort a hidden producer upstream of any stream passed to this transform.
     * Errors thrown from this callback are swallowed.
     */
    onAbort?: (reason?: unknown) => void;
};
type AppStreamValue = Uint8Array | string;
/** Renderer output: UTF-8 bytes, or string records from a Node pipeable. */
type AppStream = ReadableStream<Uint8Array> | ReadableStream<string> | ReadableStream<AppStreamValue> | NodeReadableStream<AppStreamValue>;
export declare function transformPipeableStreamWithRouter(router: AnyRouter, routerStream: Readable, opts?: TransformStreamWithRouterOptions): Readable;
export declare function transformHtmlStringWithRouter(router: AnyRouter, html: string, opts?: TransformStreamWithRouterOptions): Promise<string>;
export declare function transformReadableStreamWithRouter(router: AnyRouter, appStream: AppStream, opts?: TransformStreamWithRouterOptions): ReadableStream<Uint8Array<ArrayBufferLike>>;
export {};
