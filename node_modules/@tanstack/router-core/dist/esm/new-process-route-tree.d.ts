import { SieveCache } from './sieve-cache.js';
import { InterpolationSegment, RouteInterpolation } from './path.js';
export declare const SEGMENT_TYPE_PATHNAME = 0;
export declare const SEGMENT_TYPE_PARAM = 1;
export declare const SEGMENT_TYPE_WILDCARD = 2;
export declare const SEGMENT_TYPE_OPTIONAL_PARAM = 3;
declare const SEGMENT_TYPE_INDEX = 4;
declare const SEGMENT_TYPE_PATHLESS = 5;
/**
 * All the kinds of segments that can be present in a route path.
 */
export type SegmentKind = typeof SEGMENT_TYPE_PATHNAME | typeof SEGMENT_TYPE_PARAM | typeof SEGMENT_TYPE_WILDCARD | typeof SEGMENT_TYPE_OPTIONAL_PARAM;
/**
 * All the kinds of segments that can be present in the segment tree.
 */
type ExtendedSegmentKind = SegmentKind | typeof SEGMENT_TYPE_INDEX | typeof SEGMENT_TYPE_PATHLESS;
export type DynamicPathSegment = [
    kind: Exclude<SegmentKind, typeof SEGMENT_TYPE_PATHNAME>,
    key: string,
    prefix: string,
    /** Undefined marks a bare splat, which discards the remaining template. */
    suffix: string | undefined
];
export declare function getParamNames(data: RouteInterpolation): Array<string>;
/** Parse one segment for matching and retain the same record for interpolation. */
export declare function parseSegment(
/** The full path string containing the segment. */
path: string, 
/** The starting index of the segment within the path. */
start: number, 
/** The next slash, or the length of the path. */
end: number): InterpolationSegment;
type ParsedRoute<T extends RouteLike> = [
    node: AnySegmentNode<T>,
    cursor: number,
    segments: RouteInterpolation | undefined
];
/** Compile a template, optionally attaching its new segments to the matching trie. */
export declare function parseSegments<TRouteLike extends RouteLike>(defaultCaseSensitive: boolean, route: TRouteLike, start: number): RouteInterpolation;
export declare function parseSegments<TRouteLike extends RouteLike>(defaultCaseSensitive: boolean, route: TRouteLike, start: number, node: AnySegmentNode<TRouteLike>, dynamicListsToSort?: Array<Array<DynamicSegmentNode<TRouteLike>>>, parentInterpolation?: RouteInterpolation): ParsedRoute<TRouteLike>;
type StaticSegmentNode<T extends RouteLike> = SegmentNode<T> & {
    kind: typeof SEGMENT_TYPE_PATHNAME | typeof SEGMENT_TYPE_PATHLESS | typeof SEGMENT_TYPE_INDEX;
};
type DynamicSegmentNode<T extends RouteLike> = SegmentNode<T> & {
    kind: typeof SEGMENT_TYPE_PARAM | typeof SEGMENT_TYPE_WILDCARD | typeof SEGMENT_TYPE_OPTIONAL_PARAM;
    prefix: string;
    suffix: string;
    caseSensitive: boolean;
};
type AnySegmentNode<T extends RouteLike> = StaticSegmentNode<T> | DynamicSegmentNode<T>;
type SegmentNode<T extends RouteLike> = {
    kind: ExtendedSegmentKind;
    prefix?: string;
    suffix?: string;
    caseSensitive?: boolean;
    pathless: Array<StaticSegmentNode<T>> | null;
    /** Exact index segment (highest priority) */
    index: StaticSegmentNode<T> | null;
    /** Static segments (2nd priority) */
    static: Map<string, StaticSegmentNode<T>> | null;
    /** Case insensitive static segments (3rd highest priority) */
    staticInsensitive: Map<string, StaticSegmentNode<T>> | null;
    /** Dynamic segments ($param) */
    dynamic: Array<DynamicSegmentNode<T>> | null;
    /** Optional dynamic segments ({-$param}) */
    optional: Array<DynamicSegmentNode<T>> | null;
    /** Wildcard segments ($ - lowest priority) */
    wildcard: Array<DynamicSegmentNode<T>> | null;
    /** Terminal route (if this path can end here) */
    route: T | null;
    /** Original template data for this candidate or parse gate. */
    data: RouteInterpolation | undefined;
    parent: AnySegmentNode<T> | undefined;
    depth: number;
    /** route.options.params.parse function, set on the last node of the route */
    parse: null | ((params: Record<string, string>) => unknown);
    /** route.options.params.priority ?? 0 */
    priority: number;
};
type RouteLike = {
    _interpolation?: RouteInterpolation;
    id?: string;
    path?: string;
    children?: Array<RouteLike>;
    parentRoute?: RouteLike;
    isRoot?: boolean;
    options?: {
        caseSensitive?: boolean;
        parseParams?: (params: Record<string, string>) => unknown;
        params?: {
            parse?: (params: Record<string, string>) => unknown;
            priority?: number;
        };
    };
} & ({
    fullPath: string;
    from?: never;
} | {
    fullPath?: never;
    from: string;
});
export type ProcessedTree<TTree extends Extract<RouteLike, {
    fullPath: string;
}>, TFlat extends Extract<RouteLike, {
    from: string;
}>, TSingle extends Extract<RouteLike, {
    from: string;
}>> = {
    /** a representation of the `routeTree` as a segment tree */
    segmentTree: AnySegmentNode<TTree>;
    /** a mini route tree generated from the flat `routeMasks` list */
    masksTree: AnySegmentNode<TFlat> | null;
    /** @deprecated keep until v2 so that `router.matchRoute` can keep not caring about the actual route tree */
    singleCache: SieveCache<string, AnySegmentNode<TSingle>>;
    /** a cache of route matches from the `segmentTree` */
    matchCache: SieveCache<string, RouteMatch<TTree> | null>;
    /** a cache of route matches from the `masksTree` */
    flatCache: SieveCache<string, ReturnType<typeof findMatch<TFlat>>> | null;
};
export declare function processRouteMasks<TRouteLike extends Extract<RouteLike, {
    from: string;
}>>(routeList: Array<TRouteLike>, processedTree: ProcessedTree<any, TRouteLike, any>): void;
/**
 * Take an arbitrary list of routes, create a tree from them (if it hasn't been created already), and match a path against it.
 */
export declare function findFlatMatch<T extends Extract<RouteLike, {
    from: string;
}>>(
/** The path to match. */
path: string, 
/** The `processedTree` returned by the initial `processRouteTree` call. */
processedTree: ProcessedTree<any, T, any>): {
    route: T;
    /**
     * The raw (unparsed) params extracted from the path.
     * This will be the exhaustive list of all params defined in the route's path.
     */
    rawParams: Record<string, string>;
} | null;
/**
 * @deprecated keep until v2 so that `router.matchRoute` can keep not caring about the actual route tree
 */
export declare function findSingleMatch(from: string, caseSensitive: boolean, fuzzy: boolean, path: string, processedTree: ProcessedTree<any, any, {
    from: string;
}>): {
    route: {
        from: string;
    };
    /**
     * The raw (unparsed) params extracted from the path.
     * This will be the exhaustive list of all params defined in the route's path.
     */
    rawParams: Record<string, string>;
} | null;
type RouteMatch<T extends Extract<RouteLike, {
    fullPath: string;
}>> = {
    route: T;
    rawParams: Record<string, string>;
    branch: ReadonlyArray<T>;
};
export declare function findRouteMatch<T extends Extract<RouteLike, {
    fullPath: string;
}>>(
/** The path to match against the route tree. */
path: string, 
/** The `processedTree` returned by the initial `processRouteTree` call. */
processedTree: ProcessedTree<T, any, any>, 
/** If `true`, allows fuzzy matching (partial matches), i.e. which node in the tree would have been an exact match if the `path` had been shorter? */
fuzzy?: boolean): RouteMatch<T> | null;
export interface ProcessRouteTreeResult<TRouteLike extends Extract<RouteLike, {
    fullPath: string;
}> & {
    id: string;
}> {
    /** Should be considered a black box, needs to be provided to all matching functions in this module. */
    processedTree: ProcessedTree<TRouteLike, any, any>;
    /** A lookup map of routes by their unique IDs. */
    routesById: Record<string, TRouteLike>;
    /** A lookup map of routes by their trimmed full paths. */
    routesByPath: Record<string, TRouteLike>;
}
/**
 * Processes a route tree into a segment trie for efficient path matching.
 * Also builds lookup maps for routes by ID and by trimmed full path.
 */
export declare function processRouteTree<TRouteLike extends Extract<RouteLike, {
    fullPath: string;
}> & {
    id: string;
    init: (originalIndex: number) => void;
}>(
/** The root of the route tree to process. */
routeTree: TRouteLike, 
/** Whether matching should be case sensitive by default (overridden by individual route options). */
caseSensitive?: boolean): ProcessRouteTreeResult<TRouteLike>;
declare function findMatch<T extends RouteLike>(path: string, segmentTree: AnySegmentNode<T>, fuzzy?: boolean): {
    route: T;
    /**
     * The raw (unparsed) params extracted from the path.
     * This will be the exhaustive list of all params defined in the route's path.
     */
    rawParams: Record<string, string>;
} | null;
export declare function buildRouteBranch<T extends RouteLike>(route: T): T[];
export {};
