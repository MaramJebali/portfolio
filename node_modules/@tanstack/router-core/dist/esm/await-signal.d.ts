/**
 * Await `value` unless `signal` aborts first. A result that settles after the
 * abort is passed to `onLate` / `onLateError` instead.
 *
 * One abort listener per wait: SSR requests nest at most a few waits on one
 * signal, so pooling them was measurably slower than this.
 */
export declare function waitForReason<T>(value: T | PromiseLike<T>, signal: AbortSignal, onLate?: (value: T) => unknown, onLateError?: (reason: unknown) => unknown): Promise<T>;
