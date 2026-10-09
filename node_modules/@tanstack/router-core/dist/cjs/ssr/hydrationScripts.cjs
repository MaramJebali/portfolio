const require_invariant = require("../invariant.cjs");
const require_tsrScript = require("./tsrScript.cjs");
const require_constants = require("./constants.cjs");
const require_htmlBoundaryScanner = require("./htmlBoundaryScanner.cjs");
let seroval = require("seroval");
const encoder = new TextEncoder();
const SOURCE_SEPARATOR = ";";
const MAX_INITIAL_SOURCE_CODE_UNITS = 16 * 1024;
const MAX_BACKLOG_CODE_UNITS = 16 * 1024 * 1024;
const MAX_BACKLOG_SOURCES = 4096;
const MIN_OUTPUT_BYTES = 256;
const MAX_DIRECT_CODE_UNITS = 16 * 1024;
const MAX_HYDRATION_OUTPUT_CHUNK_BYTES = 64 * 1024;
const MAX_DYNAMIC_RECORD_CODE_UNITS = MAX_HYDRATION_OUTPUT_CHUNK_BYTES;
const STREAM_PART_ATTRIBUTE = "data-tsr-stream-part";
const INITIAL_CLEANUP_SOURCE = `{let s=document.currentScript,p;while((p=s.previousElementSibling)&&p.hasAttribute('${STREAM_PART_ATTRIBUTE}'))p.remove();s.remove()}`;
const INITIAL_CLEANUP_SUFFIX = SOURCE_SEPARATOR + INITIAL_CLEANUP_SOURCE;
const DYNAMIC_CLOSE_SOURCE = "document.currentScript.remove()<\/script>";
const HYDRATION_SCRIPT_BOUNDARY_SOURCE = "document.currentScript.remove();/*$tsr-stream-boundary*/";
const HYDRATION_SCRIPT_BOUNDARY_SUFFIX = ";/*$tsr-stream-boundary*/<\/script>";
const HYDRATION_SCRIPT_BOUNDARY_ANCHOR_INDEX = HYDRATION_SCRIPT_BOUNDARY_SUFFIX.lastIndexOf("*");
const HYDRATION_SCRIPT_BOUNDARY_BYTES = encoder.encode(HYDRATION_SCRIPT_BOUNDARY_SUFFIX);
const ROUTER_PREFIX = require_constants.GLOBAL_TSR + ".router=";
const PROMISE_PREFIX = require_constants.GLOBAL_TSR + ".p(()=>";
const DEFAULT_INITIAL_SOURCES = [(0, seroval.getCrossReferenceHeader)("tsr"), require_tsrScript.default];
const HydrationScriptOutputState = {
	Waiting: 0,
	Ready: 1,
	Active: 2,
	Done: 3,
	Failed: 4
};
function escapeAttribute(value) {
	return value.replace(/[&"'<>]/g, (char) => `&#${char.charCodeAt(0)};`);
}
function createInitialTags(sources, nonce) {
	const before = [];
	for (const source of sources) {
		if (!source) continue;
		const previous = before[before.length - 1];
		if (previous?.children && previous.children.length + 1 + source.length <= MAX_INITIAL_SOURCE_CODE_UNITS) previous.children += SOURCE_SEPARATOR + source;
		else before.push({
			tag: "script",
			attrs: {
				nonce,
				[STREAM_PART_ATTRIBUTE]: ""
			},
			children: source
		});
	}
	const lastHydrationTag = before[before.length - 1];
	if (lastHydrationTag) {
		const lastSource = lastHydrationTag.children;
		if (lastSource.length + INITIAL_CLEANUP_SUFFIX.length <= MAX_INITIAL_SOURCE_CODE_UNITS) lastHydrationTag.children = lastSource + INITIAL_CLEANUP_SUFFIX;
		else before.push({
			tag: "script",
			attrs: {
				nonce,
				[STREAM_PART_ATTRIBUTE]: ""
			},
			children: INITIAL_CLEANUP_SOURCE
		});
	}
	return {
		before,
		boundary: {
			tag: "script",
			attrs: { nonce },
			children: HYDRATION_SCRIPT_BOUNDARY_SOURCE
		}
	};
}
var HydrationScriptsOwner = class {
	constructor(nonce, initialSources) {
		this.nonce = nonce;
		this.queuedSources = [];
		this.queuedSourceHead = 0;
		this.initialTaken = false;
		this.barrierLifted = false;
		this.producerDone = false;
		this.retainedSources = 0;
		this.regularCodeUnits = 0;
		this.hasOversizedSource = false;
		this.segmentIndex = 0;
		this.closingSegmentIndex = 0;
		this.source = "";
		this.sourceOffset = 0;
		this.outputCapacity = MIN_OUTPUT_BYTES;
		this.outputState = HydrationScriptOutputState.Waiting;
		this.takeInitialHydrationScriptTags = this.takeInitialHydrationScriptTags.bind(this);
		const seedSources = initialSources ?? DEFAULT_INITIAL_SOURCES;
		for (const seedSource of seedSources) {
			if (!this.account(seedSource)) break;
			this.queuedSources.push(seedSource);
		}
	}
	get state() {
		return this.outputState;
	}
	get error() {
		return this.outputError;
	}
	notify() {
		try {
			this.listener?.();
		} catch (listenerError) {
			console.error("Hydration script output listener error:", listenerError);
		}
	}
	refresh(notifyChange = true) {
		const next = this.outputState === HydrationScriptOutputState.Failed ? HydrationScriptOutputState.Failed : this.active ? HydrationScriptOutputState.Active : typeof this.consumer === "object" && this.initialTaken && this.barrierLifted && !this.queueIsEmpty() ? HydrationScriptOutputState.Ready : this.producerDone && this.initialTaken && this.queueIsEmpty() ? HydrationScriptOutputState.Done : HydrationScriptOutputState.Waiting;
		if (this.outputState !== next) {
			this.outputState = next;
			if (notifyChange) this.notify();
		}
	}
	clearTimeoutIfSet() {
		if (this.timeout !== void 0) {
			clearTimeout(this.timeout);
			this.timeout = void 0;
		}
	}
	queueIsEmpty() {
		return this.queuedSourceHead === this.queuedSources.length;
	}
	clearQueue() {
		this.queuedSources = [];
		this.queuedSourceHead = 0;
	}
	dropBufferedOutput() {
		this.clearQueue();
		this.active = void 0;
		this.retainedSources = 0;
		this.regularCodeUnits = 0;
		this.hasOversizedSource = false;
		this.segmentIndex = 0;
		this.closingSegmentIndex = 0;
		this.source = "";
		this.sourceOffset = 0;
		this.outputCapacity = MIN_OUTPUT_BYTES;
		this.opening = void 0;
	}
	fail(reason) {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed) return;
		this.outputError = reason;
		this.clearTimeoutIfSet();
		this.dropBufferedOutput();
		this.outputState = HydrationScriptOutputState.Failed;
		this.notify();
	}
	rejectBacklog(kind) {
		this.fail(/* @__PURE__ */ new Error(`SSR hydration backlog exceeded maximum ${kind} count`));
		return false;
	}
	account(nextSource) {
		if (this.retainedSources === MAX_BACKLOG_SOURCES) return this.rejectBacklog("source-part");
		if (nextSource.length > MAX_BACKLOG_CODE_UNITS) {
			if (this.hasOversizedSource) return this.rejectBacklog("code-unit");
			this.hasOversizedSource = true;
		} else if (this.regularCodeUnits + nextSource.length > MAX_BACKLOG_CODE_UNITS) return this.rejectBacklog("code-unit");
		else this.regularCodeUnits += nextSource.length;
		this.retainedSources++;
		return true;
	}
	releaseSource(part) {
		this.retainedSources--;
		if (part.length > MAX_BACKLOG_CODE_UNITS) this.hasOversizedSource = false;
		else this.regularCodeUnits -= part.length;
	}
	releaseAccounting(batch) {
		for (const part of batch) if (part !== void 0) this.releaseSource(part);
	}
	liftBarrier() {
		if (this.consumer !== "cleaned" && !this.barrierLifted) {
			this.barrierLifted = true;
			this.refresh();
		}
	}
	producerCanWrite() {
		return this.consumer !== "cleaned" && this.outputState !== HydrationScriptOutputState.Failed && !this.producerDone;
	}
	pushSource(nextSource) {
		if (!this.producerCanWrite()) return false;
		if (this.account(nextSource)) {
			this.queuedSources.push(nextSource);
			if (this.initialTaken) this.refresh();
		} else return false;
		return this.producerCanWrite();
	}
	takeQueuedBatch(batchLength) {
		if (this.queuedSourceHead === 0 && batchLength === this.queuedSources.length) {
			const batch = this.queuedSources;
			this.clearQueue();
			return batch;
		}
		const end = this.queuedSourceHead + batchLength;
		const batch = this.queuedSources.slice(this.queuedSourceHead, end);
		for (let index = this.queuedSourceHead; index < end; index++) this.queuedSources[index] = void 0;
		this.queuedSourceHead = end;
		if (this.queueIsEmpty()) this.clearQueue();
		else if (this.queuedSourceHead >= 1024 && this.queuedSourceHead >= this.queuedSources.length - this.queuedSourceHead) {
			this.queuedSources = this.queuedSources.slice(this.queuedSourceHead);
			this.queuedSourceHead = 0;
		}
		return batch;
	}
	release(batch) {
		this.releaseAccounting(batch);
		this.active = void 0;
		this.source = "";
		this.sourceOffset = 0;
		this.refresh(false);
	}
	advanceSource() {
		const batch = this.active;
		if (this.segmentIndex > 0 && this.segmentIndex < this.closingSegmentIndex) {
			const partIndex = this.segmentIndex - 1 >> 1;
			if (this.segmentIndex % 2 === 1) {
				const part = batch[partIndex];
				if (part !== void 0) {
					this.releaseSource(part);
					batch[partIndex] = void 0;
				}
			}
		}
		this.segmentIndex++;
		if (this.segmentIndex < this.closingSegmentIndex) {
			const partIndex = this.segmentIndex - 1 >> 1;
			this.source = this.segmentIndex % 2 === 1 ? batch[partIndex] : SOURCE_SEPARATOR;
		} else if (this.segmentIndex === this.closingSegmentIndex) this.source = DYNAMIC_CLOSE_SOURCE;
		else this.release(batch);
		this.sourceOffset = 0;
	}
	pullActive() {
		const bytes = new Uint8Array(this.outputCapacity);
		let offset = 0;
		while (this.active) if (this.sourceOffset === this.source.length) this.advanceSource();
		else if (offset === bytes.length) break;
		else {
			const result = require_htmlBoundaryScanner.encodeIntoBoundedChunk(this.source, this.sourceOffset, bytes, offset);
			if (result.read === 0) break;
			this.sourceOffset += result.read;
			offset += result.written;
		}
		if (offset === 0) throw new Error("SSR router script record produced no output");
		if (offset === bytes.length) return bytes;
		return offset * 2 < bytes.length ? bytes.slice(0, offset) : bytes.subarray(0, offset);
	}
	pullReady() {
		const scriptOpening = this.opening ??= this.nonce ? `<script nonce="${escapeAttribute(this.nonce)}">` : "<script>";
		let codeUnits = scriptOpening.length + 40;
		let batchLength = 0;
		for (let index = this.queuedSourceHead; index < this.queuedSources.length; index++) {
			const part = this.queuedSources[index];
			const nextCodeUnits = codeUnits + 1 + part.length;
			if (batchLength > 0 && nextCodeUnits > MAX_DYNAMIC_RECORD_CODE_UNITS) break;
			codeUnits = nextCodeUnits;
			batchLength++;
			if (codeUnits > MAX_DYNAMIC_RECORD_CODE_UNITS) break;
		}
		const batch = this.takeQueuedBatch(batchLength);
		if (codeUnits <= MAX_DIRECT_CODE_UNITS) {
			const joined = batch.length === 1 ? batch[0] : batch.join(SOURCE_SEPARATOR);
			const bytes = encoder.encode(scriptOpening + joined + ";document.currentScript.remove()<\/script>");
			this.release(batch);
			return bytes;
		}
		this.active = batch;
		this.segmentIndex = 0;
		this.closingSegmentIndex = (batch.length << 1) + 1;
		this.source = scriptOpening;
		this.sourceOffset = 0;
		this.outputCapacity = Math.max(MIN_OUTPUT_BYTES, Math.min(MAX_HYDRATION_OUTPUT_CHUNK_BYTES, codeUnits));
		this.outputState = HydrationScriptOutputState.Active;
		return this.pullActive();
	}
	pullChunk() {
		if (this.outputState !== HydrationScriptOutputState.Ready && this.outputState !== HydrationScriptOutputState.Active) throw new Error("Hydration script output is not ready");
		try {
			return this.outputState === HydrationScriptOutputState.Ready ? this.pullReady() : this.pullActive();
		} catch (cause) {
			this.fail(cause);
			throw cause;
		}
	}
	subscribe(onChange) {
		if (this.consumer === "cleaned") return () => {};
		if (this.listener) throw new Error("SSR hydration output already has a subscriber");
		this.listener = onChange;
		return () => {
			if (this.listener === onChange) this.listener = void 0;
		};
	}
	pushSerializedSource(data, initial, wrap) {
		let serialized = initial ? ROUTER_PREFIX + data : data;
		if (wrap) serialized = PROMISE_PREFIX + serialized + ")";
		return this.pushSource(serialized);
	}
	finish() {
		if (!this.pushSource("$_TSR.e()")) return;
		this.producerDone = true;
		this.clearTimeoutIfSet();
		this.refresh();
	}
	takeInitialHydrationScriptTags() {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed || this.initialTaken) return;
		const sources = this.queuedSources;
		const tags = createInitialTags(sources, this.nonce);
		this.initialTaken = true;
		this.releaseAccounting(sources);
		sources.length = 0;
		this.queuedSourceHead = 0;
		this.refresh();
		return tags;
	}
	/**
	* Opt this request out of hydration output entirely (for example a
	* `hydrate: false` page). Drops the queued bootstrap sources, marks the
	* producer done, and makes the fast pass-through path reservable without
	* a rendered `<Scripts>` boundary. Must run before the initial take and
	* before serialization produces output.
	*/
	disableHydration() {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed) return;
		if (this.initialTaken || this.consumer !== void 0 || this.producerDone) {
			if (process.env.NODE_ENV !== "production") throw new Error("Invariant failed: hydration output is already committed; disableHydration() must run before <Scripts> renders and before serialization starts.");
			require_invariant.invariant();
		}
		this.releaseAccounting(this.queuedSources);
		this.clearQueue();
		this.initialTaken = true;
		this.barrierLifted = true;
		this.producerDone = true;
		this.refresh();
	}
	isInitialTaken() {
		return this.initialTaken;
	}
	skipInitialTake() {
		if (this.consumer !== "cleaned" && !this.initialTaken) {
			this.initialTaken = true;
			this.refresh();
		}
	}
	claimOutput() {
		if (this.consumer === "cleaned") throw new Error("SSR hydration script output is already cleaned up");
		if (this.consumer !== void 0) throw new Error("SSR hydration script output already has a consumer");
		this.consumer = this;
		this.refresh(false);
		return this;
	}
	reserveFastPath(output) {
		const ownsConsumer = this.consumer === output;
		if (this.outputState === HydrationScriptOutputState.Failed || !this.producerDone || !this.initialTaken || !this.queueIsEmpty() || this.active || !ownsConsumer) return false;
		this.consumer = "fast-path";
		return true;
	}
	startSerializationTimeout(timeoutMs) {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed || this.producerDone || this.timeout !== void 0) return;
		this.timeout = setTimeout(() => {
			this.timeout = void 0;
			if (this.consumer !== "cleaned" && this.outputState !== HydrationScriptOutputState.Failed && !this.producerDone) {
				console.error("Serialization timeout after app render finished");
				this.fail(/* @__PURE__ */ new Error("Serialization timeout after app render finished"));
			}
		}, timeoutMs);
	}
	cleanup() {
		if (this.consumer === "cleaned") return;
		this.consumer = "cleaned";
		this.clearTimeoutIfSet();
		this.dropBufferedOutput();
		this.listener = void 0;
		this.outputError = void 0;
		this.producerDone = true;
		this.outputState = HydrationScriptOutputState.Done;
	}
};
/** Create the hydration-script owner for one server request. */
function createHydrationScripts(nonce, initialSources) {
	return new HydrationScriptsOwner(nonce, initialSources);
}
//#endregion
exports.HYDRATION_SCRIPT_BOUNDARY_ANCHOR_INDEX = HYDRATION_SCRIPT_BOUNDARY_ANCHOR_INDEX;
exports.HYDRATION_SCRIPT_BOUNDARY_BYTES = HYDRATION_SCRIPT_BOUNDARY_BYTES;
exports.HydrationScriptOutputState = HydrationScriptOutputState;
exports.createHydrationScripts = createHydrationScripts;

//# sourceMappingURL=hydrationScripts.cjs.map