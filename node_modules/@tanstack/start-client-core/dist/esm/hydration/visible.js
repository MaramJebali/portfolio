//#region src/hydration/visible.ts
var visibleType = "visible";
var observerRegistry = /* @__PURE__ */ new Map();
function cleanupVisibleObserverEntry(key, observer, elements) {
	if (elements.size > 0) return;
	observer.disconnect();
	observerRegistry.delete(key);
}
/* @__NO_SIDE_EFFECTS__ */
function visible(options = {}) {
	const rootMargin = options.rootMargin ?? "600px";
	const threshold = options.threshold ?? 0;
	return {
		_t: visibleType,
		_s: ({ element, gate, prefetch }) => {
			const callback = prefetch ?? gate.resolve;
			if (!element) {
				callback();
				return;
			}
			const key = `${rootMargin}|${Array.isArray(threshold) ? threshold.join(",") : String(threshold)}`;
			let observerEntry = observerRegistry.get(key);
			if (!observerEntry) {
				const elements = /* @__PURE__ */ new Map();
				const observer = new IntersectionObserver((entries) => {
					for (const intersectingEntry of entries) {
						if (!intersectingEntry.isIntersecting) continue;
						const callbacks = elements.get(intersectingEntry.target);
						if (!callbacks) continue;
						callbacks.forEach((callback) => callback());
						elements.delete(intersectingEntry.target);
						observer.unobserve(intersectingEntry.target);
						cleanupVisibleObserverEntry(key, observer, elements);
					}
				}, {
					rootMargin,
					threshold
				});
				observerEntry = [observer, elements];
				observerRegistry.set(key, observerEntry);
			}
			const [observer, elements] = observerEntry;
			let callbacks = elements.get(element);
			if (!callbacks) {
				callbacks = /* @__PURE__ */ new Set();
				elements.set(element, callbacks);
				observer.observe(element);
			}
			callbacks.add(callback);
			return () => {
				const currentCallbacks = elements.get(element);
				currentCallbacks?.delete(callback);
				if (currentCallbacks?.size === 0) {
					elements.delete(element);
					observer.unobserve(element);
				}
				cleanupVisibleObserverEntry(key, observer, elements);
			};
		}
	};
}
//#endregion
export { visible };

//# sourceMappingURL=visible.js.map