//#region src/sieve-cache.ts
/**
* A fixed-capacity cache using the SIEVE eviction algorithm
* (https://cachemon.github.io/SIEVE-website/).
*
* Entries live in the Map's FIFO insertion order; a hit only flips a `visited`
* bit instead of relinking the entry, which makes `get` (by far the hottest
* operation here) one `Map.get` plus a boolean store. Eviction sweeps a `hand`
* from the oldest entry towards the newest, clearing `visited` bits until it
* finds an unvisited entry to drop, so entries touched since the last sweep
* survive one more round. This keeps LRU-like hit ratios while being
* scan-resistant.
*/
function createSieveCache(max) {
	const cache = /* @__PURE__ */ new Map();
	let hand;
	let newest;
	return {
		get(key) {
			const entry = cache.get(key);
			if (!entry) return;
			entry.visited = true;
			return entry.value;
		},
		set(key, value) {
			const existing = cache.get(key);
			if (existing) {
				existing.value = value;
				return;
			}
			if (cache.size >= max) {
				let node = hand?.next().value;
				while (!node || node.visited) {
					if (node) node.visited = false;
					else hand = cache.values();
					node = hand.next().value;
				}
				if (node === newest) hand = void 0;
				cache.delete(node.key);
			}
			const entry = {
				key,
				value,
				visited: false
			};
			newest = entry;
			cache.set(key, entry);
		},
		clear() {
			cache.clear();
			hand = void 0;
			newest = void 0;
		}
	};
}
//#endregion
export { createSieveCache };

//# sourceMappingURL=sieve-cache.js.map