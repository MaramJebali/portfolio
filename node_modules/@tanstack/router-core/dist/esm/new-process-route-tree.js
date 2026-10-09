import { last } from "./utils.js";
import { invariant } from "./invariant.js";
import { trimPathRight } from "./path.js";
import { createSieveCache } from "./sieve-cache.js";
const SEGMENT_TYPE_INDEX = 4;
const SEGMENT_TYPE_PATHLESS = 5;
function getParamNames(data) {
	const cached = data.names;
	if (cached) return cached;
	const keys = [];
	for (const segment of data) if (typeof segment !== "string") keys.push(segment[1]);
	return data.names = keys;
}
/** Parse one segment for matching and retain the same record for interpolation. */
function parseSegment(path, start, end) {
	const part = path.substring(start, end);
	if (part.charCodeAt(0) === 36) return part.length === 1 ? [
		2,
		"_splat",
		"",
		void 0
	] : [
		1,
		part.substring(1),
		"",
		""
	];
	const open = part.indexOf("{");
	if (open >= 0) {
		const close = part.indexOf("}", open);
		const optional = part.charCodeAt(open + 1) === 45;
		const nameStart = open + (optional ? 3 : 2);
		if (close >= 0 && part.charCodeAt(nameStart - 1) === 36 && (!optional || nameStart < close)) {
			const key = part.substring(nameStart, close);
			return [
				optional ? 3 : key ? 1 : 2,
				key || "_splat",
				part.substring(0, open),
				path.substring(start + close + 1, key ? end : path.length)
			];
		}
	}
	return part;
}
function parseSegments(defaultCaseSensitive, route, start, node, dynamicListsToSort, parentInterpolation) {
	let cursor = start;
	const path = route.fullPath ?? route.from;
	const options = route.options;
	const length = path.length;
	const literalEnd = path.endsWith("/") ? length - 1 : length;
	const caseSensitive = options?.caseSensitive ?? defaultCaseSensitive;
	const parseParams = options?.params?.parse ?? options?.parseParams;
	let interpolation;
	let literalStart = parentInterpolation ? start - 1 : 0;
	if (!node || path.includes("$")) {
		interpolation = parentInterpolation?.slice() ?? [];
		const tail = last(interpolation);
		if (tail && typeof tail !== "string" && tail[0] === 2) {
			interpolation[interpolation.length - 1] = [
				tail[0],
				tail[1],
				tail[2],
				tail[3] === void 0 ? void 0 : tail[3] + path.substring(start - (path[start - 2] === "/" ? 2 : 1), literalEnd)
			];
			literalStart = length;
		}
	}
	while (cursor < length) {
		const start = cursor;
		const next = path.indexOf("/", start);
		let end = next === -1 ? length : next;
		const segment = parseSegment(path, start, end);
		cursor = end + 1;
		let nextNode;
		if (typeof segment === "string") {
			if (!node) continue;
			let name = segment;
			let staticChildren;
			if (caseSensitive) staticChildren = node.static ??= /* @__PURE__ */ new Map();
			else {
				name = segment.toLowerCase();
				staticChildren = node.staticInsensitive ??= /* @__PURE__ */ new Map();
			}
			const existingNode = staticChildren.get(name);
			if (existingNode) nextNode = existingNode;
			else {
				const next = createSegmentNode(node);
				nextNode = next;
				staticChildren.set(name, next);
			}
		} else {
			const kind = segment[0];
			let prefix = segment[2];
			let suffix = segment[3] ?? "";
			if (kind === 2) {
				end = length;
				cursor = end + 1;
			}
			if (interpolation && literalStart < end) {
				if (literalStart < start - 1) interpolation.push(path.substring(literalStart, start - 1));
				segment[2] = "/" + prefix;
				if (kind === 2 && segment[3] !== void 0 && literalEnd < length) segment[3] = suffix.slice(0, -1);
				interpolation.push(segment);
				literalStart = end;
			}
			if (!node) continue;
			const actuallyCaseSensitive = caseSensitive && !!(prefix || suffix);
			if (!caseSensitive) {
				prefix = prefix.toLowerCase();
				suffix = suffix.toLowerCase();
			}
			const siblings = kind === 1 ? node.dynamic ??= [] : kind === 3 ? node.optional ??= [] : node.wildcard ??= [];
			const existingNode = kind !== 2 && !parseParams && siblings.find((s) => !s.parse && s.caseSensitive === actuallyCaseSensitive && s.prefix === prefix && s.suffix === suffix);
			if (existingNode) nextNode = existingNode;
			else {
				const next = createSegmentNode(node, kind, actuallyCaseSensitive, prefix, suffix);
				nextNode = next;
				siblings.push(next);
				if (siblings.length === 2) dynamicListsToSort?.push(siblings);
			}
		}
		node = nextNode;
	}
	if (interpolation && literalStart < literalEnd) interpolation.push(path.substring(literalStart, literalEnd));
	const segmentData = interpolation?.slice();
	if (!node) return segmentData;
	if (parseParams && route.children && !route.isRoot && route.id && route.id.charCodeAt(route.id.lastIndexOf("/") + 1) === 95) {
		const pathlessNode = createSegmentNode(node, SEGMENT_TYPE_PATHLESS);
		(node.pathless ??= []).push(pathlessNode);
		node = pathlessNode;
	}
	const isLeaf = (route.path || !route.children) && !route.isRoot;
	if (isLeaf && literalEnd < length) {
		const indexNode = createSegmentNode(node, SEGMENT_TYPE_INDEX);
		node.index = indexNode;
		node = indexNode;
	}
	node.parse = parseParams ?? null;
	node.priority = options?.params?.priority ?? 0;
	if (!node.route) {
		node.data = segmentData;
		if (isLeaf) node.route = route;
	}
	return [
		node,
		cursor,
		segmentData
	];
}
function sortDynamic(a, b) {
	if (a.parse && !b.parse) return -1;
	if (!a.parse && b.parse) return 1;
	if (a.parse && b.parse && (a.priority || b.priority)) return b.priority - a.priority;
	if (a.prefix && b.prefix && a.prefix !== b.prefix) {
		if (a.prefix.startsWith(b.prefix)) return -1;
		if (b.prefix.startsWith(a.prefix)) return 1;
	}
	if (a.suffix && b.suffix && a.suffix !== b.suffix) {
		if (a.suffix.endsWith(b.suffix)) return -1;
		if (b.suffix.endsWith(a.suffix)) return 1;
	}
	if (a.prefix && !b.prefix) return -1;
	if (!a.prefix && b.prefix) return 1;
	if (a.suffix && !b.suffix) return -1;
	if (!a.suffix && b.suffix) return 1;
	if (a.caseSensitive && !b.caseSensitive) return -1;
	if (!a.caseSensitive && b.caseSensitive) return 1;
	return 0;
}
function createSegmentNode(parent, kind = 0, caseSensitive, prefix, suffix) {
	return {
		kind,
		depth: parent ? parent.depth + 1 : 0,
		pathless: null,
		index: null,
		static: null,
		staticInsensitive: null,
		dynamic: null,
		optional: null,
		wildcard: null,
		route: null,
		data: void 0,
		parent,
		parse: null,
		priority: 0,
		caseSensitive,
		prefix,
		suffix
	};
}
function processRouteMasks(routeList, processedTree) {
	const segmentTree = createSegmentNode();
	const dynamicListsToSort = [];
	function visit(route, start, parentNode, parentInterpolation) {
		const [node, cursor, segments] = parseSegments(false, route, start, parentNode, dynamicListsToSort, parentInterpolation);
		if (route.children) for (const child of route.children) visit(child, cursor, node, segments);
	}
	for (const route of routeList) visit(route, 1, segmentTree);
	for (const nodes of dynamicListsToSort) nodes.sort(sortDynamic);
	processedTree.masksTree = segmentTree;
	processedTree.flatCache = createSieveCache(1e3);
}
/**
* Take an arbitrary list of routes, create a tree from them (if it hasn't been created already), and match a path against it.
*/
function findFlatMatch(path, processedTree) {
	path ||= "/";
	const cached = processedTree.flatCache.get(path);
	if (cached !== void 0) return cached;
	const result = findMatch(path, processedTree.masksTree);
	processedTree.flatCache.set(path, result);
	return result;
}
/**
* @deprecated keep until v2 so that `router.matchRoute` can keep not caring about the actual route tree
*/
function findSingleMatch(from, caseSensitive, fuzzy, path, processedTree) {
	from ||= "/";
	path ||= "/";
	const key = caseSensitive ? `case\0${from}` : from;
	let tree = processedTree.singleCache.get(key);
	if (!tree) {
		tree = createSegmentNode();
		parseSegments(caseSensitive, { from }, 1, tree);
		processedTree.singleCache.set(key, tree);
	}
	return findMatch(path, tree, fuzzy);
}
function findRouteMatch(path, processedTree, fuzzy = false) {
	const key = fuzzy ? path : `nofuzz\0${path}`;
	const cached = processedTree.matchCache.get(key);
	if (cached !== void 0) return cached;
	path ||= "/";
	let result;
	try {
		result = findMatch(path, processedTree.segmentTree, fuzzy);
	} catch (err) {
		if (err instanceof URIError) result = null;
		else throw err;
	}
	if (result) result.branch = buildRouteBranch(result.route);
	processedTree.matchCache.set(key, result);
	return result;
}
/**
* Processes a route tree into a segment trie for efficient path matching.
* Also builds lookup maps for routes by ID and by trimmed full path.
*/
function processRouteTree(routeTree, caseSensitive = false) {
	const segmentTree = createSegmentNode();
	const dynamicListsToSort = [];
	const routesById = {};
	const routesByPath = {};
	let index = 0;
	function visit(route, start, parentNode, parentInterpolation) {
		route.init(index);
		if (route.id in routesById) {
			if (process.env.NODE_ENV !== "production") throw new Error(`Invariant failed: Duplicate routes found with id: ${String(route.id)}`);
			invariant();
		}
		routesById[route.id] = route;
		if (index !== 0 && route.path) {
			const trimmedFullPath = trimPathRight(route.fullPath);
			if (!routesByPath[trimmedFullPath] || route.fullPath.endsWith("/")) routesByPath[trimmedFullPath] = route;
		}
		index++;
		const [node, cursor, segments] = parseSegments(caseSensitive, route, start, parentNode, dynamicListsToSort, parentInterpolation);
		route._interpolation = segments;
		if (route.children) for (const child of route.children) visit(child, cursor, node, segments);
	}
	visit(routeTree, 1, segmentTree);
	for (const nodes of dynamicListsToSort) nodes.sort(sortDynamic);
	return {
		processedTree: {
			segmentTree,
			singleCache: createSieveCache(1e3),
			matchCache: createSieveCache(1e3),
			flatCache: null,
			masksTree: null
		},
		routesById,
		routesByPath
	};
}
function findMatch(path, segmentTree, fuzzy = false) {
	const parts = path.split("/");
	const leaf = getNodeMatch(path, parts, segmentTree, fuzzy);
	if (!leaf) return null;
	const [rawParams] = extractParams(path, parts, leaf);
	return {
		route: leaf.node.route,
		rawParams
	};
}
/**
* This function is "resumable":
* - the `leaf` input can contain `extract` and `rawParams` properties from a previous `extractParams` call
* - the returned `state` can be passed back as `extract` in a future call to continue extracting params from where we left off
*
* Inputs are *not* mutated.
*/
function extractParams(path, parts, leaf) {
	const list = buildBranch(leaf.node);
	const names = leaf.node.data && getParamNames(leaf.node.data);
	const rawParams = Object.create(null);
	/** which segment of the path we're currently processing */
	let partIndex = leaf.extract?.part ?? 0;
	/** which node of the route tree branch we're currently processing */
	let nodeIndex = leaf.extract?.node ?? 0;
	/** index of the 1st character of the segment we're processing in the path string */
	let pathIndex = leaf.extract?.path ?? 0;
	/** Next original parameter name, independent of pathless/static nodes. */
	let paramIndex = leaf.extract?.param ?? 0;
	for (; nodeIndex < list.length; partIndex++, nodeIndex++, pathIndex++) {
		const node = list[nodeIndex];
		if (node.kind === SEGMENT_TYPE_INDEX) break;
		if (node.kind === SEGMENT_TYPE_PATHLESS) {
			partIndex--;
			pathIndex--;
			continue;
		}
		const part = parts[partIndex];
		const currentPathIndex = pathIndex;
		if (part) pathIndex += part.length;
		if (node.kind === 1 || node.kind === 3) {
			const name = names[paramIndex++];
			if (node.kind === 3 && leaf.skipped & 1 << nodeIndex) {
				partIndex--;
				pathIndex = currentPathIndex - 1;
				continue;
			}
			const value = node.suffix || node.prefix ? part.substring(node.prefix.length, part.length - node.suffix.length) : part;
			if (value || node.kind === 1) rawParams[name] = decodeURIComponent(value);
		} else if (node.kind === 2) {
			const n = node;
			const value = path.substring(currentPathIndex + n.prefix.length, path.length - n.suffix.length);
			const splat = decodeURIComponent(value);
			rawParams["*"] = splat;
			rawParams._splat = splat;
			break;
		}
	}
	if (leaf.rawParams) Object.assign(rawParams, leaf.rawParams);
	return [rawParams, {
		part: partIndex,
		node: nodeIndex,
		path: pathIndex,
		param: paramIndex
	}];
}
function buildRouteBranch(route) {
	const list = [route];
	while (route.parentRoute) {
		route = route.parentRoute;
		list.push(route);
	}
	list.reverse();
	return list;
}
function buildBranch(node) {
	const list = Array(node.depth + 1);
	do {
		list[node.depth] = node;
		node = node.parent;
	} while (node);
	return list;
}
function getNodeMatch(path, parts, segmentTree, fuzzy) {
	if (path === "/" && segmentTree.index) return {
		node: segmentTree.index,
		skipped: 0
	};
	const trailingSlash = !last(parts);
	const pathIsIndex = trailingSlash && path !== "/";
	const partsLength = parts.length - (trailingSlash ? 1 : 0);
	const stack = [{
		node: segmentTree,
		index: 1,
		skipped: 0,
		statics: 0,
		dynamics: 0,
		optionals: 0
	}];
	let bestFuzzy = null;
	let bestMatch = null;
	while (stack.length) {
		const frame = stack.pop();
		const { node, index, skipped, statics, dynamics, optionals } = frame;
		let { extract, rawParams } = frame;
		if (node.kind === 2 && node.route && !isFrameMoreSpecific(bestMatch, frame)) continue;
		if (node.parse) {
			if (!validateParseParams(path, parts, frame)) continue;
			rawParams = frame.rawParams;
			extract = frame.extract;
		}
		if (fuzzy && node.route && node.kind !== SEGMENT_TYPE_INDEX && isFrameMoreSpecific(bestFuzzy, frame)) bestFuzzy = frame;
		const isBeyondPath = index === partsLength;
		if (isBeyondPath) {
			if (node.route && (!pathIsIndex || node.kind === SEGMENT_TYPE_INDEX || node.kind === 2) && isFrameMoreSpecific(bestMatch, frame)) bestMatch = frame;
			if (!node.optional && !node.wildcard && !node.index && !node.pathless) continue;
		}
		const part = isBeyondPath ? void 0 : parts[index];
		let lowerPart;
		if (isBeyondPath && node.index) {
			const indexFrame = {
				node: node.index,
				index,
				skipped,
				statics,
				dynamics,
				optionals,
				extract,
				rawParams
			};
			let indexValid = true;
			if (node.index.parse) {
				if (!validateParseParams(path, parts, indexFrame)) indexValid = false;
			}
			if (indexValid) {
				if (!dynamics && !optionals && !skipped && isPerfectStaticMatch(statics, partsLength)) return indexFrame;
				if (isFrameMoreSpecific(bestMatch, indexFrame)) bestMatch = indexFrame;
			}
		}
		if (node.wildcard) for (let i = node.wildcard.length - 1; i >= 0; i--) {
			const segment = node.wildcard[i];
			const { prefix, suffix } = segment;
			if (prefix) {
				if (isBeyondPath) continue;
				if (!(segment.caseSensitive ? part : lowerPart ??= part.toLowerCase()).startsWith(prefix)) continue;
			}
			if (suffix) {
				if (isBeyondPath) continue;
				const end = parts.slice(index).join("/");
				const suffixPart = end.slice(-suffix.length);
				if ((segment.caseSensitive ? suffixPart : suffixPart.toLowerCase()) !== suffix || end.length - suffix.length < prefix.length) continue;
			}
			stack.push({
				node: segment,
				index: partsLength,
				skipped,
				statics,
				dynamics,
				optionals,
				extract,
				rawParams
			});
		}
		if (node.optional) {
			const nextSkipped = skipped | 1 << node.depth + 1;
			for (let i = node.optional.length - 1; i >= 0; i--) {
				const segment = node.optional[i];
				stack.push({
					node: segment,
					index,
					skipped: nextSkipped,
					statics,
					dynamics,
					optionals,
					extract,
					rawParams
				});
			}
			if (!isBeyondPath) for (let i = node.optional.length - 1; i >= 0; i--) {
				const segment = node.optional[i];
				const { prefix, suffix } = segment;
				if (prefix || suffix) {
					const casePart = segment.caseSensitive ? part : lowerPart ??= part.toLowerCase();
					if (prefix && !casePart.startsWith(prefix)) continue;
					if (suffix && casePart.indexOf(suffix, casePart.length - suffix.length) < prefix.length) continue;
				}
				stack.push({
					node: segment,
					index: index + 1,
					skipped,
					statics,
					dynamics,
					optionals: optionals + segmentScore(partsLength, index),
					extract,
					rawParams
				});
			}
		}
		if (!isBeyondPath && node.dynamic && part) for (let i = node.dynamic.length - 1; i >= 0; i--) {
			const segment = node.dynamic[i];
			const { prefix, suffix } = segment;
			if (prefix || suffix) {
				const casePart = segment.caseSensitive ? part : lowerPart ??= part.toLowerCase();
				if (prefix && !casePart.startsWith(prefix)) continue;
				if (suffix && casePart.indexOf(suffix, casePart.length - suffix.length) < prefix.length) continue;
			}
			stack.push({
				node: segment,
				index: index + 1,
				skipped,
				statics,
				dynamics: dynamics + segmentScore(partsLength, index),
				optionals,
				extract,
				rawParams
			});
		}
		if (!isBeyondPath && node.staticInsensitive) {
			const match = node.staticInsensitive.get(lowerPart ??= part.toLowerCase());
			if (match) stack.push({
				node: match,
				index: index + 1,
				skipped,
				statics: statics + segmentScore(partsLength, index),
				dynamics,
				optionals,
				extract,
				rawParams
			});
		}
		if (!isBeyondPath && node.static) {
			const match = node.static.get(part);
			if (match) stack.push({
				node: match,
				index: index + 1,
				skipped,
				statics: statics + segmentScore(partsLength, index),
				dynamics,
				optionals,
				extract,
				rawParams
			});
		}
		if (node.pathless) for (let i = node.pathless.length - 1; i >= 0; i--) {
			const segment = node.pathless[i];
			stack.push({
				node: segment,
				index,
				skipped,
				statics,
				dynamics,
				optionals,
				extract,
				rawParams
			});
		}
	}
	if (bestMatch) return bestMatch;
	if (fuzzy && bestFuzzy) {
		let sliceIndex = bestFuzzy.index;
		for (let i = 0; i < bestFuzzy.index; i++) sliceIndex += parts[i].length;
		const splat = sliceIndex === path.length ? "/" : path.slice(sliceIndex);
		bestFuzzy.rawParams ??= Object.create(null);
		bestFuzzy.rawParams["**"] = decodeURIComponent(splat);
		return bestFuzzy;
	}
	return null;
}
function segmentScore(partsLength, index) {
	return 2 ** (partsLength - index - 1);
}
function isPerfectStaticMatch(statics, partsLength) {
	return statics === 2 ** (partsLength - 1) - 1;
}
function validateParseParams(path, parts, frame) {
	let rawParams;
	let state;
	try {
		[rawParams, state] = extractParams(path, parts, frame);
	} catch {
		return null;
	}
	frame.rawParams = rawParams;
	frame.extract = state;
	if (!frame.node.parse) return true;
	try {
		if (frame.node.parse(rawParams) === false) return null;
	} catch {}
	return true;
}
function isFrameMoreSpecific(prev, next) {
	if (!prev) return true;
	return next.statics > prev.statics || next.statics === prev.statics && (next.dynamics > prev.dynamics || next.dynamics === prev.dynamics && (next.optionals > prev.optionals || next.optionals === prev.optionals && ((next.node.kind === SEGMENT_TYPE_INDEX) > (prev.node.kind === SEGMENT_TYPE_INDEX) || next.node.kind === SEGMENT_TYPE_INDEX === (prev.node.kind === SEGMENT_TYPE_INDEX) && next.node.depth > prev.node.depth)));
}
//#endregion
export { buildRouteBranch, findFlatMatch, findRouteMatch, findSingleMatch, parseSegments, processRouteMasks, processRouteTree };

//# sourceMappingURL=new-process-route-tree.js.map