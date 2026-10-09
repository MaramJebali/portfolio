import { AnyRouter } from '@tanstack/router-core';
import { ReactNode } from 'react';
export declare const renderRouterToStream: ({ request, router, responseHeaders, children, }: {
    request: Request;
    router: AnyRouter;
    responseHeaders: Headers;
    children: ReactNode;
}) => Promise<{
    response: Response;
    serverSsrCleanup: "stream";
    dispose: (reason?: unknown) => undefined;
}>;
