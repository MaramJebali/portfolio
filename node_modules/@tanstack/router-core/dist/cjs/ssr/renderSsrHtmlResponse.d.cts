import { AnyRouter } from '../router.cjs';
export declare function renderSsrHtmlResponse({ router, responseHeaders, render, }: {
    router: AnyRouter;
    responseHeaders: Headers;
    render: () => string | Promise<string>;
}): Promise<Response>;
