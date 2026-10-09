import * as React from 'react';
/**
 * React.use if available (React 19+), undefined otherwise.
 * Use dynamic lookup to avoid Webpack compilation errors with React 18.
 */
export declare const reactUse: (<T>(usable: Promise<T> | React.Context<T>) => T) | undefined;
export declare function useStableCallback<T extends (...args: Array<any>) => any>(fn: T): T;
export declare const useLayoutEffect: typeof React.useEffect;
/**
 * Taken from https://www.developerway.com/posts/implementing-advanced-use-previous-hook#part3
 */
export declare function usePrevious<T>(value: T): T | null;
