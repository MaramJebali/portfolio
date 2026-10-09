import { createSsrStreamResponse, getSsrStatus, transformReadableStreamWithRouter, waitForRequest } from "@tanstack/router-core/ssr/server";
import ReactDOMServer from "react-dom/server";
import { PassThrough, Readable } from "node:stream";
import { isbot } from "isbot";
//#region src/ssr/renderRouterToStream.tsx
var renderRouterToStream = async ({ request, router, responseHeaders, children }) => {
	const signal = request.signal;
	if (signal.aborted) {
		router.serverSsr?.cleanup();
		throw signal.reason;
	}
	let rendererTeardown = false;
	const bot = isbot(request.headers.get("User-Agent"));
	const onError = (renderer) => (error, info) => {
		if (!rendererTeardown && !signal.aborted) console.error(`Error in ${renderer}:`, error, info);
	};
	try {
		if (typeof ReactDOMServer.renderToReadableStream === "function") {
			const stream = await ReactDOMServer.renderToReadableStream(children, {
				signal,
				nonce: router.options.ssr?.nonce,
				progressiveChunkSize: Number.POSITIVE_INFINITY,
				onError: onError("renderToReadableStream")
			});
			const rendererAbort = bot ? new AbortController() : void 0;
			const responseStream = transformReadableStreamWithRouter(router, stream, {
				rendererSafePoint: "script-close",
				signal,
				onAbort: (reason) => {
					rendererTeardown = true;
					rendererAbort?.abort(reason);
				}
			});
			if (rendererAbort) await waitForRequest(stream.allReady, rendererAbort.signal);
			return createSsrStreamResponse(router, new Response(responseStream, {
				status: getSsrStatus(router),
				headers: responseHeaders
			}));
		}
		if (typeof ReactDOMServer.renderToPipeableStream === "function") {
			const reactAppPassthrough = new PassThrough();
			let pipeable;
			let resolveReady;
			const ready = new Promise((resolve) => {
				resolveReady = resolve;
			});
			const rendererAbort = new AbortController();
			const abortPipeable = (reason) => {
				if (rendererTeardown) return;
				rendererTeardown = true;
				rendererAbort.abort(reason);
				try {
					pipeable?.abort(reason);
				} catch {}
			};
			try {
				pipeable = ReactDOMServer.renderToPipeableStream(children, {
					nonce: router.options.ssr?.nonce,
					progressiveChunkSize: Number.POSITIVE_INFINITY,
					...bot ? { onAllReady: resolveReady } : { onShellReady: resolveReady },
					onError: onError("renderToPipeableStream"),
					onShellError: (error) => rendererAbort.abort(error)
				});
				const responseStream = transformReadableStreamWithRouter(router, Readable.toWeb(reactAppPassthrough), {
					rendererSafePoint: "script-close",
					signal,
					onAbort: abortPipeable
				});
				await waitForRequest(ready, rendererAbort.signal);
				pipeable.pipe(reactAppPassthrough);
				return createSsrStreamResponse(router, new Response(responseStream, {
					status: getSsrStatus(router),
					headers: responseHeaders
				}));
			} catch (error) {
				abortPipeable(error);
				throw error;
			}
		}
		throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
	} catch (error) {
		router.serverSsr?.cleanup();
		throw error;
	}
};
//#endregion
export { renderRouterToStream };

//# sourceMappingURL=renderRouterToStream.js.map