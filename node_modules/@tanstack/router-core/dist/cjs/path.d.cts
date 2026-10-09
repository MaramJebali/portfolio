import { SieveCache } from './sieve-cache.cjs';
import { DynamicPathSegment } from './new-process-route-tree.cjs';
import { AnyRoute } from './route.cjs';
/** Join path segments, cleaning duplicate slashes between parts. */
export declare function joinPaths(paths: Array<string | undefined>): string;
/** Remove repeated slashes from a path string. */
export declare function cleanPath(path: string): string;
/** Trim leading slashes (except preserving root '/'). */
export declare function trimPathLeft(path: string): string;
/** Trim trailing slashes (except preserving root '/'). */
export declare function trimPathRight(path: string): string;
/** Trim both leading and trailing slashes. */
export declare function trimPath(path: string): string;
/** Remove a trailing slash from value when appropriate for comparisons. */
export declare function removeTrailingSlash(value: string, basepath: string): string;
/**
 * Compare two pathnames for exact equality after normalizing trailing slashes
 * relative to the provided `basepath`.
 */
export declare function exactPathTest(pathName1: string, pathName2: string, basepath: string): boolean;
/**
 * Resolve a destination path against a base, honoring trailing-slash policy
 * and supporting relative segments (`.`/`..`) and absolute `to` values.
 *
 * Internal: parameters are positional so the router's hot callers pass no
 * options object.
 */
export declare function resolvePath(base: string, to: string, trailingSlash?: 'always' | 'never' | 'preserve', cache?: SieveCache<string, string>): string;
/**
 * Create a pre-compiled decode config from allowed characters.
 * Created once for the router's fixed encoding configuration.
 */
export declare function compileDecodeCharMap(pathParamsAllowedCharacters: ReadonlyArray<string>): (encoded: string) => string;
export type InterpolationSegment = string | DynamicPathSegment;
export type RouteInterpolation = Array<InterpolationSegment> & {
    names?: Array<string>;
};
export declare function getRouteSegments(route: AnyRoute): RouteInterpolation | undefined;
/** Devtools checks navigation availability separately from the hot formatter. */
export declare function hasMissingPathParams(segments: RouteInterpolation, params: Record<string, unknown>): boolean;
/** Substitute current values into parsed segments, optionally collecting raw params. */
export declare function interpolatePath(path: string, segments: RouteInterpolation, params: Record<string, unknown>, decoder?: (encoded: string) => string, usedParams?: Record<string, unknown>): string;
