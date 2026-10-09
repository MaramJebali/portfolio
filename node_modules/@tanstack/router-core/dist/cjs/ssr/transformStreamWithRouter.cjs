const require_htmlBoundaryScanner = require("./htmlBoundaryScanner.cjs");
const require_hydrationScripts = require("./hydrationScripts.cjs");
let node_stream = require("node:stream");
//#region src/ssr/transformStreamWithRouter.ts
function transformPipeableStreamWithRouter(router, routerStream, opts) {
	return node_stream.Readable.fromWeb(transformReadableStreamWithRouter(router, node_stream.Readable.toWeb(routerStream), opts));
}
async function transformHtmlStringWithRouter(router, html, opts) {
	const serverSsr = router.serverSsr;
	if (!serverSsr) throw new Error("Invariant failed: router.serverSsr is required");
	if (serverSsr.hydrationScripts.reserveFastPath()) try {
		opts?.signal?.throwIfAborted();
		serverSsr.setRenderFinished();
		return "<!DOCTYPE html>" + html;
	} catch (error) {
		try {
			opts?.onAbort?.(error);
		} catch {}
		throw error;
	} finally {
		serverSsr.cleanup();
	}
	return readUtf8Stream(transformReadableStreamWithRouter(router, new ReadableStream({ start(controller) {
		controller.enqueue("<!DOCTYPE html>");
		controller.enqueue(html);
		controller.close();
	} }), opts));
}
async function readUtf8Stream(stream) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let text = "";
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			text += decoder.decode(value, { stream: true });
		}
		return text + decoder.decode();
	} finally {
		reader.releaseLock();
	}
}
const DEFAULT_SERIALIZATION_TIMEOUT_MS = 6e4;
const MIN_APPLICATION_STRING_CHUNK_BYTES = 256;
const MAX_APPLICATION_STRING_CHUNK_BYTES = 64 * 1024;
const ApplicationPhase = {
	BeforeBoundary: 0,
	Merge: 1,
	HeldClose: 2,
	PassThrough: 3
};
function releaseReader(reader) {
	try {
		reader.releaseLock();
	} catch {}
}
function cancelReader(reader, reason) {
	const cancelled = reader.cancel(reason).catch(() => {});
	releaseReader(reader);
	return cancelled;
}
function finalizeSsrStream(kind, reason, controller, reader, serverSsr, onAbort) {
	try {
		if (kind === "complete") controller.close();
		else if (kind === "failure") controller.error(reason);
	} catch {}
	const aborted = kind !== "complete";
	if (aborted) try {
		onAbort?.(reason);
	} catch {}
	const readerDone = aborted ? cancelReader(reader, reason) : releaseReader(reader);
	serverSsr.cleanup();
	return readerDone;
}
function getLifetimeMs(opts) {
	return opts?.lifetimeMs ?? (opts?.timeoutMs ?? DEFAULT_SERIALIZATION_TIMEOUT_MS) * 2;
}
function createCleanupAbortError() {
	const error = /* @__PURE__ */ new Error("SSR stream transform aborted by router SSR cleanup");
	error.name = "AbortError";
	return error;
}
function listenForAbort(signal, onAbort) {
	if (!signal) return;
	const listener = () => onAbort(signal.reason);
	signal.addEventListener("abort", listener, { once: true });
	return () => signal.removeEventListener("abort", listener);
}
/**
* Create a timer that does not keep the Node.js process alive when this
* last-resort stream backstop is the only remaining work.
*
* Node's global `setTimeout()` returns a `Timeout` object with `unref()`.
* Web-standard runtimes return a numeric timer ID instead. Cloudflare Workers
* retain that Web behavior for global timers even when `nodejs_compat` is
* enabled. Accessing an optional property on a numeric ID is safe, so timer
* creation can normalize the Node-only capability without allocating a
* wrapper object. The native handle is returned unchanged for `clearTimeout`.
*/
function setUnrefTimeout(callback, timeoutMs) {
	const handle = setTimeout(callback, timeoutMs);
	handle.unref?.();
	return handle;
}
/**
* Arm the shared teardown triggers of a transform stream: the lifetime
* backstop timer, the request-abort listener, and the external-cleanup
* listener. Returns a disarm function that `terminate()` calls exactly once;
* teardown ordering must stay identical between the fast and merge paths.
*/
function armStreamLifecycle(serverSsr, opts, isTerminal, terminate) {
	const signal = opts?.signal;
	let lifetimeTimeoutHandle;
	let stopAbortListener;
	const disarm = () => {
		stopAbortListener?.();
		stopAbortListener = void 0;
		if (signal && serverSsr.hydrationScripts.requestSignal === signal) serverSsr.hydrationScripts.requestSignal = void 0;
		if (lifetimeTimeoutHandle !== void 0) {
			clearTimeout(lifetimeTimeoutHandle);
			lifetimeTimeoutHandle = void 0;
		}
	};
	const lifetimeMs = getLifetimeMs(opts);
	lifetimeTimeoutHandle = setUnrefTimeout(() => {
		if (isTerminal()) return;
		const error = /* @__PURE__ */ new Error("Stream lifetime exceeded");
		console.warn(`SSR stream transform exceeded maximum lifetime (${lifetimeMs}ms), forcing cleanup`);
		terminate("failure", error);
	}, lifetimeMs);
	stopAbortListener = listenForAbort(signal, (reason) => {
		terminate("failure", reason);
	});
	if (signal) serverSsr.hydrationScripts.requestSignal = signal;
	serverSsr.onCleanup(() => {
		if (!isTerminal()) terminate("failure", createCleanupAbortError());
	});
	return disarm;
}
function cleanupFailedStreamCreation(serverSsr, onAbort, error) {
	try {
		onAbort?.(error);
	} catch {}
	serverSsr.cleanup();
}
function encodeStringSource(value, offset) {
	const remaining = value.length - offset;
	const capacity = Math.min(MAX_APPLICATION_STRING_CHUNK_BYTES, Math.max(MIN_APPLICATION_STRING_CHUNK_BYTES, Math.min(value.length, remaining * 3)));
	const output = new Uint8Array(capacity);
	const { read, written } = require_htmlBoundaryScanner.encodeIntoBoundedChunk(value, offset, output);
	return {
		bytes: written === output.length ? output : output.subarray(0, written),
		read
	};
}
function transformReadableStreamWithRouter(router, appStream, opts) {
	const serverSsr = router.serverSsr;
	if (!serverSsr) throw new Error("Invariant failed: router.serverSsr is required");
	const hydrationScripts = serverSsr.hydrationScripts;
	let reader;
	try {
		reader = appStream.getReader();
	} catch (error) {
		cleanupFailedStreamCreation(serverSsr, opts?.onAbort, error);
		throw error;
	}
	try {
		opts?.signal?.throwIfAborted();
		if (hydrationScripts.reserveFastPath()) return makeMergeStream(serverSsr, reader, void 0, opts);
		const hydrationOutput = hydrationScripts.claimOutput();
		if (hydrationOutput.state === require_hydrationScripts.HydrationScriptOutputState.Failed) throw hydrationOutput.error;
		return makeMergeStream(serverSsr, reader, hydrationOutput, opts);
	} catch (error) {
		cancelReader(reader, error);
		cleanupFailedStreamCreation(serverSsr, opts?.onAbort, error);
		throw error;
	}
}
function makeMergeStream(serverSsr, reader, hydrationOutput, opts) {
	const hydrationScripts = serverSsr.hydrationScripts;
	let controller;
	let terminal = false;
	let appDone = false;
	let applicationPhase = hydrationOutput ? ApplicationPhase.BeforeBoundary : ApplicationPhase.PassThrough;
	let insertionBoundary = false;
	let stopHydrationOutputListener;
	let appReadPending = false;
	let settledAppRead;
	let appBytes;
	let appOffset = 0;
	let documentCloseIndex;
	let appString;
	let appStringOffset = 0;
	const useScriptCloseSafePoints = opts?.rendererSafePoint === "script-close";
	const useRecordEndSafePoints = opts?.rendererSafePoint === "record-end";
	let barrierMatcher;
	let safePointMatcher;
	let closeCarry;
	let wakeResolve;
	let disarmLifecycle = () => {};
	function waitForWake() {
		return new Promise((resolve) => {
			wakeResolve = resolve;
		});
	}
	function wakePump() {
		const resolve = wakeResolve;
		wakeResolve = void 0;
		resolve?.();
	}
	function enqueueAppBytes(value) {
		if (value.length === 0) return false;
		controller.enqueue(value);
		return true;
	}
	function finishAppChunk() {
		appBytes = void 0;
		documentCloseIndex = void 0;
		if (appString === void 0 && useRecordEndSafePoints && closeCarry === void 0) insertionBoundary = true;
	}
	function emitAppRange(end, safePoint, finishCurrentChunk = end === appBytes.length) {
		const value = appBytes;
		const output = appOffset === 0 && end === value.length ? value : value.subarray(appOffset, end);
		appOffset = end;
		if (safePoint) insertionBoundary = true;
		if (finishCurrentChunk) finishAppChunk();
		return enqueueAppBytes(output);
	}
	function loadNextAppStringChunk() {
		const value = appString;
		const encoded = encodeStringSource(value, appStringOffset);
		appStringOffset += encoded.read;
		appBytes = encoded.bytes;
		appOffset = 0;
		if (appStringOffset === value.length) appString = void 0;
	}
	function processUntilBarrier() {
		const value = appBytes;
		if (!hydrationScripts.isInitialTaken()) return emitAppRange(value.length, false);
		const matchEnd = require_htmlBoundaryScanner.advanceByteMatcher(barrierMatcher ??= {
			pattern: require_hydrationScripts.HYDRATION_SCRIPT_BOUNDARY_BYTES,
			anchorIndex: require_hydrationScripts.HYDRATION_SCRIPT_BOUNDARY_ANCHOR_INDEX,
			matched: 0
		}, value, appOffset);
		if (matchEnd === void 0) return emitAppRange(value.length, false);
		applicationPhase = ApplicationPhase.Merge;
		hydrationScripts.liftBarrier();
		return emitAppRange(matchEnd, true);
	}
	function enterHeldClose(consumed, prefix) {
		appOffset = consumed;
		applicationPhase = ApplicationPhase.HeldClose;
		if (safePointMatcher) safePointMatcher.matched = 0;
		insertionBoundary = true;
		if (appOffset === appBytes.length) finishAppChunk();
		return prefix ? enqueueAppBytes(prefix) : false;
	}
	function holdDocumentClose(matchStart) {
		const value = appBytes;
		return enterHeldClose(matchStart + require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES.length, matchStart === appOffset ? void 0 : value.subarray(appOffset, matchStart));
	}
	function processUntilSafePoint(endIndex) {
		const matchEnd = findSafePointEnd(appBytes, appOffset, endIndex);
		if (matchEnd === void 0) return false;
		return emitAppRange(matchEnd, true);
	}
	function findSafePointEnd(value, startIndex, endIndex) {
		const hydrationState = hydrationOutput.state;
		if (endIndex === startIndex || hydrationState === require_hydrationScripts.HydrationScriptOutputState.Done) return;
		const scanValue = endIndex === value.length ? value : value.subarray(0, endIndex);
		const matcher = safePointMatcher ??= {
			pattern: require_htmlBoundaryScanner.SCRIPT_CLOSE_BYTES,
			anchorIndex: require_htmlBoundaryScanner.SCRIPT_CLOSE_ANCHOR_INDEX,
			matched: 0
		};
		const waiting = hydrationState === require_hydrationScripts.HydrationScriptOutputState.Waiting;
		const matchEnd = require_htmlBoundaryScanner.advanceByteMatcher(matcher, scanValue, startIndex, waiting);
		if (matchEnd === void 0) return;
		if (waiting) matcher.matched = 0;
		return matchEnd;
	}
	function processCloseCarry() {
		const value = appBytes;
		const carry = closeCarry;
		const headLength = Math.min(value.length - appOffset, require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES.length);
		const combined = new Uint8Array(carry.length + headLength);
		combined.set(carry);
		combined.set(value.subarray(appOffset, appOffset + headLength), carry.length);
		const matchStart = require_htmlBoundaryScanner.findExactBytes(combined, require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES, 0, require_htmlBoundaryScanner.DOCUMENT_CLOSE_ANCHOR_INDEX);
		const partial = matchStart < 0 ? require_htmlBoundaryScanner.getExactBytesPrefixAtEnd(combined, require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES) : void 0;
		const safeEnd = matchStart >= 0 ? matchStart : partial ?? combined.length;
		if (useScriptCloseSafePoints) {
			const safePointEnd = findSafePointEnd(combined, 0, safeEnd);
			if (safePointEnd !== void 0) {
				appOffset += safePointEnd - carry.length;
				closeCarry = void 0;
				insertionBoundary = true;
				if (appOffset === value.length) finishAppChunk();
				return enqueueAppBytes(combined.subarray(0, safePointEnd));
			}
		}
		if (matchStart >= 0) {
			closeCarry = void 0;
			return enterHeldClose(appOffset + matchStart + require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES.length - carry.length, matchStart === 0 ? void 0 : combined.subarray(0, matchStart));
		}
		closeCarry = partial === void 0 ? void 0 : combined.slice(partial);
		appOffset += headLength;
		return enqueueAppBytes(safeEnd === combined.length ? combined : combined.subarray(0, safeEnd));
	}
	function processUntilDocumentClose() {
		const value = appBytes;
		if (closeCarry) {
			if (processCloseCarry()) return true;
			if (applicationPhase === ApplicationPhase.HeldClose) return false;
			if (appOffset >= value.length) {
				finishAppChunk();
				return false;
			}
		}
		const matchStart = documentCloseIndex ??= require_htmlBoundaryScanner.findExactBytes(value, require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES, appOffset, require_htmlBoundaryScanner.DOCUMENT_CLOSE_ANCHOR_INDEX);
		if (matchStart >= 0) {
			if (useScriptCloseSafePoints && processUntilSafePoint(matchStart)) return true;
			return holdDocumentClose(matchStart);
		}
		const partial = require_htmlBoundaryScanner.getExactBytesPrefixAtEnd(value, require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES, appOffset);
		const safeEnd = partial ?? value.length;
		if (useScriptCloseSafePoints && processUntilSafePoint(safeEnd)) return true;
		closeCarry = partial === void 0 ? void 0 : value.slice(partial);
		return emitAppRange(safeEnd, false, true);
	}
	function processAppChunk() {
		if (appOffset >= appBytes.length) {
			finishAppChunk();
			return false;
		}
		insertionBoundary = false;
		if (applicationPhase === ApplicationPhase.BeforeBoundary) return processUntilBarrier();
		if (applicationPhase === ApplicationPhase.Merge) return processUntilDocumentClose();
		const value = appBytes;
		if (useScriptCloseSafePoints && processUntilSafePoint(value.length)) return true;
		return emitAppRange(value.length, false);
	}
	function terminate(kind, reason) {
		if (terminal) return;
		terminal = true;
		stopHydrationOutputListener?.();
		stopHydrationOutputListener = void 0;
		disarmLifecycle();
		settledAppRead = void 0;
		appBytes = void 0;
		documentCloseIndex = void 0;
		appString = void 0;
		closeCarry = void 0;
		wakePump();
		return finalizeSsrStream(kind, reason, controller, reader, serverSsr, opts?.onAbort);
	}
	function startAppRead() {
		if (appReadPending || settledAppRead || terminal) return;
		appReadPending = true;
		reader.read().then((result) => {
			appReadPending = false;
			if (!terminal) {
				if (result.done) acceptAppRead(result);
				else settledAppRead = result;
				wakePump();
			}
		}, (error) => {
			appReadPending = false;
			if (!terminal) handlePumpError(error);
		});
	}
	function acceptAppRead(result) {
		if (result.done) {
			appDone = true;
			insertionBoundary = closeCarry === void 0;
			hydrationScripts.startSerializationTimeout(opts?.timeoutMs ?? DEFAULT_SERIALIZATION_TIMEOUT_MS);
			serverSsr.setRenderFinished();
			return;
		}
		const value = result.value;
		if (typeof value === "string") {
			if (value.length === 0) return;
			appString = value;
			appStringOffset = 0;
			insertionBoundary = false;
			loadNextAppStringChunk();
			return;
		}
		if (value.byteLength === 0) return;
		appBytes = value;
		appOffset = 0;
		insertionBoundary = false;
	}
	async function loadNextAppChunk() {
		if (appString !== void 0) {
			loadNextAppStringChunk();
			return;
		}
		if (settledAppRead) {
			const settled = settledAppRead;
			settledAppRead = void 0;
			acceptAppRead(settled);
			return;
		}
		if (!(applicationPhase !== ApplicationPhase.BeforeBoundary && insertionBoundary && hydrationOutput.state !== require_hydrationScripts.HydrationScriptOutputState.Done) && !appReadPending) {
			const result = await reader.read();
			if (terminal) return;
			acceptAppRead(result);
			return;
		}
		const wake = waitForWake();
		startAppRead();
		await wake;
	}
	async function pumpPassThrough() {
		try {
			for (;;) {
				if (appBytes) {
					const remainder = appOffset === 0 ? appBytes : appBytes.subarray(appOffset);
					appBytes = void 0;
					if (enqueueAppBytes(remainder)) return;
					continue;
				}
				if (appString !== void 0) {
					loadNextAppStringChunk();
					continue;
				}
				if (appDone) {
					terminate("complete");
					return;
				}
				if (appReadPending) {
					await waitForWake();
					continue;
				}
				let result = settledAppRead;
				if (result) settledAppRead = void 0;
				else {
					result = await reader.read();
					if (terminal) return;
				}
				if (result.done || typeof result.value === "string") {
					acceptAppRead(result);
					continue;
				}
				if (result.value.byteLength > 0) {
					controller.enqueue(result.value);
					return;
				}
			}
		} catch (error) {
			handlePumpError(error);
		}
	}
	async function pump() {
		const output = hydrationOutput;
		while (!terminal) {
			const hydrationState = output.state;
			if (hydrationState === require_hydrationScripts.HydrationScriptOutputState.Active) {
				controller.enqueue(output.pullChunk());
				return;
			}
			if (applicationPhase !== ApplicationPhase.BeforeBoundary && insertionBoundary && hydrationState === require_hydrationScripts.HydrationScriptOutputState.Ready) {
				if (!appDone && !appBytes && appString === void 0) startAppRead();
				controller.enqueue(output.pullChunk());
				return;
			}
			if (applicationPhase === ApplicationPhase.Merge && hydrationState === require_hydrationScripts.HydrationScriptOutputState.Done && closeCarry === void 0 && hydrationScripts.reserveFastPath(output)) {
				applicationPhase = ApplicationPhase.PassThrough;
				stopHydrationOutputListener?.();
				stopHydrationOutputListener = void 0;
				return pumpPassThrough();
			}
			if (appBytes) {
				if (processAppChunk()) return;
				continue;
			}
			if (appDone) {
				if (applicationPhase === ApplicationPhase.BeforeBoundary) {
					hydrationScripts.skipInitialTake();
					applicationPhase = ApplicationPhase.Merge;
					insertionBoundary = true;
					continue;
				}
				if (closeCarry) {
					const carry = closeCarry;
					closeCarry = void 0;
					insertionBoundary = true;
					if (enqueueAppBytes(carry)) return;
					continue;
				}
				if (hydrationState === require_hydrationScripts.HydrationScriptOutputState.Waiting) {
					await waitForWake();
					continue;
				}
				if (applicationPhase === ApplicationPhase.HeldClose) {
					controller.enqueue(require_htmlBoundaryScanner.DOCUMENT_CLOSE_BYTES.slice());
					terminate("complete");
					return;
				}
				terminate("complete");
				return;
			}
			await loadNextAppChunk();
		}
	}
	function handlePumpError(error) {
		if (terminal) return;
		console.error("Error processing appStream:", error);
		terminate("failure", error);
	}
	const stream = new ReadableStream({
		start(c) {
			controller = c;
		},
		pull() {
			return applicationPhase === ApplicationPhase.PassThrough ? pumpPassThrough() : pump().catch(handlePumpError);
		},
		cancel(reason) {
			return terminate("cancel", reason);
		}
	});
	if (hydrationOutput) stopHydrationOutputListener = hydrationOutput.subscribe(() => {
		if (hydrationOutput.state === require_hydrationScripts.HydrationScriptOutputState.Failed) {
			terminate("failure", hydrationOutput.error);
			return;
		}
		wakePump();
	});
	disarmLifecycle = armStreamLifecycle(serverSsr, opts, () => terminal, terminate);
	return stream;
}
//#endregion
exports.transformHtmlStringWithRouter = transformHtmlStringWithRouter;
exports.transformPipeableStreamWithRouter = transformPipeableStreamWithRouter;
exports.transformReadableStreamWithRouter = transformReadableStreamWithRouter;

//# sourceMappingURL=transformStreamWithRouter.cjs.map