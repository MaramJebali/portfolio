import { AnyRouter } from '../router.js';
export type SsrResponse = {
    response: Response;
    serverSsrCleanup: 'none';
} | {
    response: Response;
    serverSsrCleanup: 'stream';
    dispose: (reason?: unknown) => undefined;
};
export type HandlerCallbackResult = Response | SsrResponse;
export declare function isSsrResponse(value: unknown): value is SsrResponse;
export declare function normalizeSsrResponse(result: HandlerCallbackResult): SsrResponse;
export declare function disposeSsrResponse(result: HandlerCallbackResult, reason?: unknown): undefined;
/** The HTTP status that Router's server load selected for this render. */
export declare function getSsrStatus(router: AnyRouter): 500 | 200 | 404;
export declare function createSsrStreamResponse(router: AnyRouter, response: Response): Extract<SsrResponse, {
    serverSsrCleanup: 'stream';
}>;
export declare function bindSsrResponseToRequest(router: AnyRouter | undefined, result: HandlerCallbackResult, signal: AbortSignal): SsrResponse;
export declare function replaceSsrResponse(result: HandlerCallbackResult, response: Response, reason?: unknown): Extract<SsrResponse, {
    serverSsrCleanup: 'none';
}>;
export declare function stripSsrResponseBody(result: HandlerCallbackResult, reason?: unknown): Extract<SsrResponse, {
    serverSsrCleanup: 'none';
}>;
export interface HandlerCallback<TRouter extends AnyRouter> {
    (ctx: {
        request: Request;
        router: TRouter;
        responseHeaders: Headers;
    }): HandlerCallbackResult | Promise<HandlerCallbackResult>;
}
export declare function defineHandlerCallback<TRouter extends AnyRouter>(handler: HandlerCallback<TRouter>): HandlerCallback<TRouter>;
