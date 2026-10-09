export type SieveCache<TKey, TValue> = {
    get: (key: TKey) => TValue | undefined;
    set: (key: TKey, value: TValue) => void;
    clear: () => void;
};
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
export declare function createSieveCache<TKey, TValue>(max: number): SieveCache<TKey, TValue>;
