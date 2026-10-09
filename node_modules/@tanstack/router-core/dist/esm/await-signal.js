//#region src/await-signal.ts
function observeLate(callback, value) {
	if (!callback) return;
	try {
		const result = callback(value);
		if (result !== void 0) Promise.resolve(result).catch(() => {});
	} catch {}
}
/**
* Await `value` unless `signal` aborts first. A result that settles after the
* abort is passed to `onLate` / `onLateError` instead.
*
* One abort listener per wait: SSR requests nest at most a few waits on one
* signal, so pooling them was measurably slower than this.
*/
function waitForReason(value, signal, onLate, onLateError) {
	const promise = Promise.resolve(value);
	if (signal.aborted) {
		promise.then((result) => observeLate(onLate, result), (error) => observeLate(onLateError, error));
		return Promise.reject(signal.reason);
	}
	return new Promise((resolve, reject) => {
		const abort = () => reject(signal.reason);
		signal.addEventListener("abort", abort, { once: true });
		promise.then((result) => {
			signal.removeEventListener("abort", abort);
			if (signal.aborted) observeLate(onLate, result);
			else resolve(result);
		}, (error) => {
			signal.removeEventListener("abort", abort);
			if (signal.aborted) observeLate(onLateError, error);
			else reject(error);
		});
	});
}
//#endregion
export { waitForReason };

//# sourceMappingURL=await-signal.js.map