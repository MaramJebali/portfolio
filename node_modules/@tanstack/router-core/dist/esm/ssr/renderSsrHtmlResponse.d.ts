import { AnyRouter } from '../router.js';
export declare function renderSsrHtmlResponse({ router, responseHeaders, render, }: {
    router: AnyRouter;
    responseHeaders: Headers;
    render: () => string | Promise<string>;
}): Promise<Response>;
