import "../constants.js";
//#region src/client-rpc/frame-decoder.ts
var decoder = new TextDecoder();
var empty = new Uint8Array();
var rawStreamQueue = new ByteLengthQueuingStrategy({ highWaterMark: 0 });
function createFrameDecoder(input) {
	const reader = input.getReader();
	const rawStreams = /* @__PURE__ */ new Map();
	let state = 0;
	let resume;
	let jsonController;
	const wake = () => {
		resume?.();
		resume = void 0;
	};
	const settleRaw = (entry, terminal) => {
		const controller = entry[1];
		entry[1] = false;
		if (controller) if (terminal === 1) controller.close();
		else controller.error(terminal[0]);
	};
	const chunks = new ReadableStream({
		start(controller) {
			jsonController = controller;
		},
		pull: wake,
		cancel(reason) {
			const failed = [reason === void 0 ? /* @__PURE__ */ new Error("Framed response cancelled") : reason];
			state = failed;
			wake();
			reader.cancel(reason).catch(() => {});
			for (const entry of rawStreams.values()) settleRaw(entry, failed);
		}
	});
	function getRaw(id) {
		const existing = rawStreams.get(id);
		if (existing) return existing;
		if (rawStreams.size >= 1024) throw new Error("Too many raw streams");
		let controller;
		const entry = [new ReadableStream({
			start(value) {
				controller = value;
			},
			cancel() {
				if (entry[1] !== false) entry[1] = null;
			}
		}, rawStreamQueue), controller];
		rawStreams.set(id, entry);
		if (state !== 0) settleRaw(entry, state);
		return entry;
	}
	function getStream(id) {
		if (id === 0 || id >>> 0 !== id) throw new RangeError("Invalid raw stream ID");
		return getRaw(id)[0];
	}
	(async () => {
		let inputChunk = empty;
		let inputOffset = 0;
		async function more() {
			while (inputOffset === inputChunk.byteLength) {
				inputChunk = empty;
				inputOffset = 0;
				const next = await reader.read();
				if (state !== 0 || next.done) return false;
				inputChunk = next.value;
			}
			return true;
		}
		async function read(length, cleanEof) {
			if (length === 0) return empty;
			if (!await more()) {
				if (cleanEof) return;
				throw new Error("Incomplete frame");
			}
			if (inputChunk.byteLength - inputOffset >= length) {
				const result = inputChunk.subarray(inputOffset, inputOffset + length);
				inputOffset += length;
				if (inputOffset === inputChunk.byteLength) {
					inputChunk = empty;
					inputOffset = 0;
				}
				return result;
			}
			const result = new Uint8Array(length);
			let offset = 0;
			while (offset < length) {
				if (!await more()) throw new Error("Incomplete frame");
				const size = Math.min(length - offset, inputChunk.byteLength - inputOffset);
				result.set(inputChunk.subarray(inputOffset, inputOffset + size), offset);
				inputOffset += size;
				offset += size;
			}
			if (inputOffset === inputChunk.byteLength) {
				inputChunk = empty;
				inputOffset = 0;
			}
			return result;
		}
		try {
			while (state === 0) {
				let header = await read(9, true);
				if (state !== 0) return;
				if (!header) {
					for (const entry of rawStreams.values()) if (entry[1]) throw new Error("Incomplete raw stream");
					state = 1;
					jsonController.close();
					return;
				}
				const type = header[0];
				const streamId = (header[1] << 24 | header[2] << 16 | header[3] << 8 | header[4]) >>> 0;
				const length = (header[5] << 24 | header[6] << 16 | header[7] << 8 | header[8]) >>> 0;
				header = empty;
				if (type > 3 || type === 0 !== (streamId === 0) || length > 16777216 || type === 2 && length !== 0) throw new Error("Invalid frame");
				const entry = type === 0 ? void 0 : getRaw(streamId);
				if (entry?.[1] === false) throw new Error("Raw stream already ended");
				let payload = await read(length);
				if (state !== 0) return;
				if (!entry) {
					const value = decoder.decode(payload);
					payload = empty;
					jsonController.enqueue(value);
					while (state === 0 && jsonController.desiredSize <= 0) await new Promise((resolve) => {
						resume = resolve;
					});
					continue;
				}
				if (type === 1) {
					const controller = entry[1];
					if (controller) {
						if (-controller.desiredSize > 134217728) {
							controller.error(/* @__PURE__ */ new Error(`Raw stream ${streamId} has too many unread bytes`));
							entry[1] = null;
							payload = empty;
							continue;
						}
						const chunk = payload.byteLength * 4 < payload.buffer.byteLength ? payload.slice() : payload;
						payload = empty;
						controller.enqueue(chunk);
					}
				} else settleRaw(entry, type === 2 ? 1 : [new Error(decoder.decode(payload))]);
			}
		} catch (error) {
			if (state === 0) {
				const failed = [error];
				state = failed;
				reader.cancel(error).catch(() => {});
				jsonController.error(error);
				for (const entry of rawStreams.values()) settleRaw(entry, failed);
			}
		} finally {
			inputChunk = empty;
			reader.releaseLock();
		}
	})();
	return [chunks, getStream];
}
//#endregion
export { createFrameDecoder };

//# sourceMappingURL=frame-decoder.js.map