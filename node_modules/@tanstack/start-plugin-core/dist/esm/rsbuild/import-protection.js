import { normalizePath } from "../utils.js";
import { buildSourceCandidates, clearNormalizeFilePathCache, dedupePatterns, dedupeViolationKey, isFileExcluded, normalizeFilePath } from "../import-protection/utils.js";
import { ImportGraph, buildTrace, formatViolation } from "../import-protection/trace.js";
import { getDefaultImportProtectionRules, getMarkerSpecifiers } from "../import-protection/defaults.js";
import { compileMatchers } from "../import-protection/matchers.js";
import { getImportProtectionEnvType, getImportProtectionRelativePath, getImportProtectionRulesForEnvironment, shouldCheckImportProtectionImporter } from "../import-protection/adapterUtils.js";
import { ImportLocCache, buildCodeSnippet, createImportSpecifierLocationIndex, findImportStatementLocationFromTransformed, findOriginalUsageLocation, findPostCompileUsageLocation, normalizeSourceMap, pickOriginalCodeFromSourcesContent } from "../import-protection/sourceLocation.js";
import { ExtensionlessAbsoluteIdResolver } from "../import-protection/extensionlessAbsoluteIdResolver.js";
import { loadMockEdgeModule, loadMockRuntimeModule, loadSilentMockModule } from "../import-protection/virtualModules.js";
import { dirname, extname, resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
//#region src/rsbuild/import-protection.ts
var IMPORT_PROTECTION_BUILD_INFO_FIELD = "tanstack.start.importProtection";
function isPerfEnabled() {
	return process.env.TSR_IMPORT_PROTECTION_PERF === "1" || process.env.TSR_IMPORT_PROTECTION_PERF === "true";
}
function createPerfCollector() {
	const counters = /* @__PURE__ */ new Map();
	const timings = /* @__PURE__ */ new Map();
	const flushEnvironments = /* @__PURE__ */ new Set();
	let flushCount = 0;
	return {
		count(name, value = 1) {
			counters.set(name, (counters.get(name) ?? 0) + value);
		},
		time(name, startedAt) {
			const duration = performance.now() - startedAt;
			const timing = timings.get(name);
			if (timing) {
				timing.count++;
				timing.totalMs += duration;
				timing.maxMs = Math.max(timing.maxMs, duration);
			} else timings.set(name, {
				count: 1,
				totalMs: duration,
				maxMs: duration
			});
		},
		flush(root, envName, phase) {
			flushCount++;
			flushEnvironments.add(envName);
			const payload = {
				adapter: "rsbuild",
				root,
				phase,
				flushCount,
				flushEnvironments: Array.from(flushEnvironments).sort(),
				counters: Object.fromEntries(counters),
				timings: Object.fromEntries(Array.from(timings, ([name, timing]) => [name, {
					count: timing.count,
					totalMs: Number(timing.totalMs.toFixed(3)),
					avgMs: Number((timing.totalMs / timing.count).toFixed(3)),
					maxMs: Number(timing.maxMs.toFixed(3))
				}]))
			};
			const file = process.env.TSR_IMPORT_PROTECTION_PERF_FILE;
			if (file) writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
			else console.warn(`[import-protection:perf] ${JSON.stringify(payload, null, 2)}`);
		}
	};
}
var IMPORT_PROTECTION_VIRTUAL_DIR = "node_modules/.virtual/import-protection";
var MOCK_EDGE_FILE_PREFIX = "mock-edge-";
var MOCK_RUNTIME_FILE_PREFIX = "mock-runtime-";
var MOCK_SILENT_FILE = "mock-silent.mjs";
var importProtectionLoader = resolve(dirname(fileURLToPath(import.meta.url)), "import-protection-loader.js");
function toBase64Url(input) {
	return Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
}
function fromBase64Url(input) {
	return JSON.parse(Buffer.from(input, "base64url").toString("utf8"));
}
function getRulesForEnvironment(config, envName) {
	return getImportProtectionRulesForEnvironment(config, envName);
}
function serializePattern(pattern) {
	return typeof pattern === "string" ? pattern : pattern.toString();
}
function dedupeKey(info) {
	return dedupeViolationKey(info);
}
function getRsbuildResolvedImportProtectionCheck(relativeResolved, matchers) {
	if (isFileExcluded(relativeResolved, matchers)) return;
	const fileMatch = matchers.files.find((matcher) => matcher.test(relativeResolved));
	if (fileMatch) return {
		type: "file",
		fileMatch
	};
	return { type: "marker" };
}
function getOrCreateEnvState(envStates, envName) {
	let env = envStates.get(envName);
	if (!env) {
		env = {
			resolveCache: /* @__PURE__ */ new Map(),
			seenViolations: /* @__PURE__ */ new Set()
		};
		envStates.set(envName, env);
	}
	return env;
}
function shouldCheckImporterWithCache(opts) {
	const normalizedFile = normalizeFilePath(opts.file);
	const cached = opts.cache.get(normalizedFile);
	if (cached !== void 0) {
		opts.perf?.count("shouldCheckImporter.cached");
		return cached;
	}
	const result = shouldCheckImportProtectionImporter(opts.config, normalizedFile);
	opts.cache.set(normalizedFile, result);
	return result;
}
function getVirtualModulePath(root, envName, filename) {
	return normalizePath(resolve(root, IMPORT_PROTECTION_VIRTUAL_DIR, envName, filename));
}
function queuePendingWrite(shared, envName, filePath, code) {
	let writes = shared.pendingWrites.get(envName);
	if (!writes) {
		writes = /* @__PURE__ */ new Map();
		shared.pendingWrites.set(envName, writes);
	}
	writes.set(filePath, code);
}
function tryWriteVirtualModule(shared, envName, filePath, code) {
	if (shared.virtualModules.get(filePath) === code) return filePath;
	shared.virtualModules.set(filePath, code);
	const vmPlugin = shared.vmPlugins[envName];
	if (!vmPlugin || !shared.readyVmPlugins[envName]) {
		queuePendingWrite(shared, envName, filePath, code);
		return filePath;
	}
	vmPlugin.writeModule(filePath, code);
	return filePath;
}
function flushPendingWrites(shared, envName) {
	const writes = shared.pendingWrites.get(envName);
	if (!writes?.size || !shared.readyVmPlugins[envName]) return;
	for (const [filePath, code] of writes) {
		shared.vmPlugins[envName]?.writeModule(filePath, code);
		writes.delete(filePath);
	}
	if (writes.size === 0) shared.pendingWrites.delete(envName);
}
function ensureSilentMockModule(shared, envName) {
	return tryWriteVirtualModule(shared, envName, getVirtualModulePath(shared.root, envName, MOCK_SILENT_FILE), loadSilentMockModule().code);
}
function ensureRuntimeMockModule(opts) {
	const encoded = toBase64Url({
		mode: opts.mode,
		env: opts.env,
		importer: opts.importer,
		specifier: opts.specifier,
		trace: []
	});
	return tryWriteVirtualModule(opts.shared, opts.envName, getVirtualModulePath(opts.shared.root, opts.envName, `${MOCK_RUNTIME_FILE_PREFIX}${encoded}.mjs`), loadMockRuntimeModule(encoded).code);
}
function ensureMockEdgeModule(opts) {
	const encoded = toBase64Url(opts.payload);
	return tryWriteVirtualModule(opts.shared, opts.envName, getVirtualModulePath(opts.shared.root, opts.envName, `${MOCK_EDGE_FILE_PREFIX}${encoded}.mjs`), loadMockEdgeModule(encoded).code);
}
function getMockEdgePayloadFromFile(filePath) {
	const match = /(?:^|[\\/])mock-edge-([^/\\]+)\.mjs$/.exec(filePath);
	if (!match) return;
	try {
		return fromBase64Url(match[1]);
	} catch {
		return;
	}
}
function getModuleResource(module) {
	const resourceResolveData = module.resourceResolveData;
	return normalizeFilePath(resourceResolveData?.path ?? resourceResolveData?.resource ?? module.identifier());
}
var IMPORT_PROTECTION_PARSEABLE_EXTENSIONS = new Set([
	".ts",
	".tsx",
	".mts",
	".cts",
	".js",
	".jsx",
	".mjs",
	".cjs"
]);
function isImportProtectionSourceFile(file) {
	if (!file) return false;
	const extension = extname(normalizeFilePath(file));
	return extension.length > 0 && IMPORT_PROTECTION_PARSEABLE_EXTENSIONS.has(extension);
}
function readModuleSourceFromInputFileSystem(inputFileSystem, file) {
	if (!inputFileSystem) return Promise.resolve(void 0);
	return new Promise((resolve) => {
		inputFileSystem.readFile(file, (error, data) => {
			if (error || data == null) {
				resolve(void 0);
				return;
			}
			resolve(String(data));
		});
	});
}
function buildTransformResultProvider(opts) {
	const resultByModule = /* @__PURE__ */ new WeakMap();
	const loadingResultByModule = /* @__PURE__ */ new WeakMap();
	const missingSource = /* @__PURE__ */ new WeakSet();
	async function loadModuleTransformResult(module) {
		opts.perf?.count("processAssets.provider.modulesLoaded");
		const resource = getModuleResource(module);
		let code;
		let map;
		const source = module.originalSource();
		if (source) {
			const sourceAndMapStartedAt = opts.perf ? performance.now() : 0;
			const sourceAndMap = source.sourceAndMap();
			if (opts.perf) opts.perf.time("processAssets.provider.sourceAndMap", sourceAndMapStartedAt);
			code = String(sourceAndMap.source);
			map = normalizeSourceMap(sourceAndMap.map);
		}
		const originalCodeStartedAt = opts.perf ? performance.now() : 0;
		let originalCode = map?.sourcesContent ? pickOriginalCodeFromSourcesContent(map, resource, opts.root) : void 0;
		if (originalCode === void 0) {
			originalCode = await readModuleSourceFromInputFileSystem(opts.inputFileSystem, resource);
			if (originalCode !== void 0) opts.perf?.count("processAssets.provider.inputFileSystemReads");
		}
		if (opts.perf) opts.perf.time("processAssets.provider.originalCode", originalCodeStartedAt);
		code ??= originalCode;
		if (code === void 0) {
			missingSource.add(module);
			return;
		}
		const result = {
			code,
			filename: resource,
			map,
			originalCode,
			perf: opts.perf
		};
		resultByModule.set(module, result);
		return result;
	}
	return { getTransformResult(module) {
		if (missingSource.has(module)) return Promise.resolve(void 0);
		const cached = resultByModule.get(module);
		if (cached) return Promise.resolve(cached);
		const loading = loadingResultByModule.get(module);
		if (loading) return loading;
		const result = loadModuleTransformResult(module);
		loadingResultByModule.set(module, result);
		return result;
	} };
}
function getCompilationEdgeKey(importer, resolved, specifier) {
	return `${importer}\0${resolved}\0${specifier ?? ""}`;
}
function getCompilationModulesKey(importer, resolved) {
	return `${importer}\0${resolved}`;
}
function hasModuleError(module) {
	return "error" in module && Boolean(module.error);
}
function forEachEntryModule(opts) {
	for (const entry of opts.compilation.entries.values()) for (const dependency of entry.dependencies) {
		const module = opts.compilation.moduleGraph.getConnection(dependency)?.module;
		if (!module || hasModuleError(module)) continue;
		opts.visitModule(module);
	}
}
function addEntryModulesToGraph(opts) {
	forEachEntryModule({
		compilation: opts.compilation,
		visitModule(module) {
			opts.importGraph.addEntry(getModuleResource(module));
		}
	});
}
function forEachModules(opts) {
	const nodes = [];
	for (const module of opts.modules) {
		if (hasModuleError(module)) continue;
		const imports = [];
		const importIndexByModule = /* @__PURE__ */ new WeakMap();
		const connections = opts.compilation.moduleGraph.getOutgoingConnectionsInOrder(module);
		for (const connection of connections) {
			const connectedModule = connection.module;
			if (!connectedModule) continue;
			if (hasModuleError(connectedModule)) continue;
			if (importIndexByModule.get(connectedModule) !== void 0) continue;
			importIndexByModule.set(connectedModule, imports.length);
			imports.push({
				dependency: connection.dependency,
				module: connectedModule
			});
		}
		const node = {
			module,
			imports
		};
		nodes.push(node);
		opts.visitNode(node);
	}
	return nodes;
}
function createCompilationViolationScanner(opts) {
	const specifierViolations = [];
	const fileViolations = [];
	const markerCheckTargets = [];
	const mockPayloadByModule = /* @__PURE__ */ new WeakMap();
	const getMockPayload = (module) => {
		const cached = mockPayloadByModule.get(module);
		if (cached !== void 0) return cached ?? void 0;
		const payload = getMockEdgePayloadFromFile(getModuleResource(module));
		mockPayloadByModule.set(module, payload ?? null);
		return payload;
	};
	return {
		visitEntry(module) {
			markerCheckTargets.push({
				importer: module,
				module
			});
		},
		visitNode(node) {
			const importer = getModuleResource(node.module);
			if (!isImportProtectionSourceFile(importer)) return;
			const shouldCheckImporter = opts.shouldCheckImporter(importer);
			for (const imported of node.imports) {
				const source = imported.dependency.request;
				if (shouldCheckImporter) {
					const payload = getMockPayload(imported.module);
					if (payload?.violation.importer === importer) specifierViolations.push({
						type: "specifier",
						payload,
						edge: {
							importer: node.module,
							module: imported.module
						}
					});
				}
				if (!source) continue;
				const resolved = getModuleResource(imported.module);
				const importProtectionCheck = getRsbuildResolvedImportProtectionCheck(getImportProtectionRelativePath(opts.config.root, resolved), opts.matchers);
				if (!importProtectionCheck) continue;
				if (importProtectionCheck.type === "marker") {
					markerCheckTargets.push({
						importer: node.module,
						module: imported.module
					});
					continue;
				}
				if (shouldCheckImporter) fileViolations.push({
					type: "file",
					edge: {
						importer: node.module,
						module: imported.module
					},
					source,
					pattern: importProtectionCheck.fileMatch.pattern
				});
			}
		},
		finish() {
			const violations = [...specifierViolations, ...fileViolations];
			const checkedMarkerModules = /* @__PURE__ */ new WeakSet();
			for (const target of markerCheckTargets) {
				if (!opts.shouldCheckImporter(getModuleResource(target.importer))) continue;
				if (checkedMarkerModules.has(target.module)) continue;
				checkedMarkerModules.add(target.module);
				const marker = getMarkerForModule(target.module);
				if (!(opts.envType === "client" && marker?.kind === "server" || opts.envType === "server" && marker?.kind === "client")) continue;
				violations.push({
					type: "marker",
					importer: target.module,
					source: marker.source
				});
			}
			return violations;
		}
	};
}
function buildCompilationImportGraph(opts) {
	const importGraph = new ImportGraph();
	const edges = [];
	const edgeByKey = /* @__PURE__ */ new Map();
	const edgesByModules = /* @__PURE__ */ new Map();
	addEntryModulesToGraph({
		compilation: opts.compilation,
		importGraph
	});
	for (const node of opts.nodes) {
		const importer = getModuleResource(node.module);
		for (const imported of node.imports) {
			const resolved = getModuleResource(imported.module);
			const specifier = imported.dependency.request;
			const edge = {
				importerModule: node.module,
				specifier,
				resolved,
				resolvedModule: imported.module
			};
			edges.push(edge);
			importGraph.addEdge(resolved, importer, specifier);
			const edgeKey = getCompilationEdgeKey(importer, resolved, specifier);
			if (!edgeByKey.has(edgeKey)) edgeByKey.set(edgeKey, edge);
			const modulesKey = getCompilationModulesKey(importer, resolved);
			const moduleEdges = edgesByModules.get(modulesKey);
			if (moduleEdges) moduleEdges.push(edge);
			else edgesByModules.set(modulesKey, [edge]);
		}
	}
	return {
		importGraph,
		edgeIndex: {
			edges,
			edgeByKey,
			edgesByModules
		}
	};
}
function findCompilationEdge(edgeIndex, importer, resolved, specifier) {
	if (specifier) {
		const exact = edgeIndex.edgeByKey.get(getCompilationEdgeKey(importer, resolved, specifier));
		if (exact) return exact;
	}
	return edgeIndex.edgesByModules.get(getCompilationModulesKey(importer, resolved))?.[0];
}
var compilationImportSpecifierLocationIndex = createImportSpecifierLocationIndex();
async function resolveImporterLocation(opts) {
	const transformResult = await opts.provider.getTransformResult(opts.importerModule);
	const provider = { getTransformResult: () => transformResult };
	const originalResult = transformResult?.originalCode !== void 0 ? {
		code: transformResult.originalCode,
		filename: transformResult.filename,
		map: void 0,
		originalCode: transformResult.originalCode,
		perf: transformResult.perf
	} : void 0;
	const originalProvider = { getTransformResult: () => originalResult };
	const sourceCandidates = buildSourceCandidates(opts.source, opts.resolved, opts.config.root);
	for (const transformedSource of opts.transformedSources ?? []) for (const candidate of buildSourceCandidates(transformedSource, void 0, opts.config.root)) sourceCandidates.add(candidate);
	const importLocCache = new ImportLocCache();
	const originalImportLocCache = new ImportLocCache();
	for (const source of sourceCandidates) {
		const loc = findOriginalUsageLocation(provider, opts.importer, source, opts.envType, opts.config.root) ?? await findPostCompileUsageLocation(provider, opts.importer, source) ?? await findImportStatementLocationFromTransformed(provider, opts.importer, source, importLocCache, compilationImportSpecifierLocationIndex.find) ?? await findImportStatementLocationFromTransformed(originalProvider, opts.importer, source, originalImportLocCache, compilationImportSpecifierLocationIndex.find);
		if (loc) return loc;
	}
}
async function resolveTraceEdgeLocation(opts) {
	if (!opts.specifier) return;
	const transformResult = await opts.provider.getTransformResult(opts.edge.importerModule);
	const provider = { getTransformResult: () => transformResult };
	for (const source of buildSourceCandidates(opts.specifier, opts.edge.resolved, opts.root)) {
		const loc = await findImportStatementLocationFromTransformed(provider, opts.importer, source, opts.importLocCache, compilationImportSpecifierLocationIndex.find);
		if (loc) return loc;
	}
}
async function rebuildAndAnnotateTrace(opts) {
	const trace = buildTrace(opts.importGraph, opts.importer, opts.maxTraceDepth);
	const importLocCache = new ImportLocCache();
	for (let i = 0; i < trace.length - 1; i++) {
		const step = trace[i];
		const next = trace[i + 1];
		const edge = findCompilationEdge(opts.edgeIndex, step.file, next.file, step.specifier);
		const loc = edge ? await resolveTraceEdgeLocation({
			root: opts.root,
			provider: opts.provider,
			importLocCache,
			importer: step.file,
			edge,
			specifier: edge.specifier ?? step.specifier
		}) : void 0;
		if (loc) {
			step.line = loc.line;
			step.column = loc.column;
		}
	}
	if (trace.length > 0) {
		const last = trace[trace.length - 1];
		if (!last.specifier) last.specifier = opts.specifier;
		if (opts.importerLoc && last.line == null) {
			last.line = opts.importerLoc.line;
			last.column = opts.importerLoc.column;
		}
	}
	return trace;
}
async function buildViolationInfo(opts) {
	const startedAt = opts.perf ? performance.now() : 0;
	opts.perf?.count("violations.enriched");
	const importerLocStartedAt = opts.perf ? performance.now() : 0;
	const importerLoc = await resolveImporterLocation({
		config: opts.config,
		provider: opts.provider,
		importer: opts.importer,
		importerModule: opts.importerModule,
		source: opts.source,
		resolved: opts.resolved,
		transformedSources: opts.transformedSources,
		envType: opts.envType
	});
	if (opts.perf) opts.perf.time("violations.resolveImporterLocation", importerLocStartedAt);
	const traceStartedAt = opts.perf ? performance.now() : 0;
	const trace = await rebuildAndAnnotateTrace({
		root: opts.config.root,
		provider: opts.provider,
		importGraph: opts.importGraph,
		edgeIndex: opts.edgeIndex,
		importer: opts.importer,
		specifier: opts.source,
		importerLoc,
		maxTraceDepth: opts.config.maxTraceDepth
	});
	if (opts.perf) opts.perf.time("violations.trace", traceStartedAt);
	const snippetStartedAt = opts.perf ? performance.now() : 0;
	const transformResult = importerLoc ? await opts.provider.getTransformResult(opts.importerModule) : void 0;
	const snippet = importerLoc ? buildCodeSnippet({ getTransformResult: () => transformResult }, opts.importer, importerLoc) : void 0;
	if (opts.perf && importerLoc) opts.perf.time("violations.snippet", snippetStartedAt);
	const info = {
		env: opts.envName,
		envType: opts.envType,
		behavior: opts.config.effectiveBehavior,
		type: opts.type,
		pattern: opts.pattern,
		specifier: opts.source,
		importer: opts.importer,
		...opts.resolved ? { resolved: opts.resolved } : {},
		...importerLoc ? { importerLoc } : {},
		trace,
		snippet
	};
	if (opts.perf) opts.perf.time("violations.enrich", startedAt);
	return info;
}
function getMarkerForModule(module) {
	if (!isImportProtectionSourceFile(getModuleResource(module))) return;
	const marker = module.buildInfo[IMPORT_PROTECTION_BUILD_INFO_FIELD];
	if (!marker || typeof marker !== "object") return;
	if (!("kind" in marker) || !("source" in marker)) return;
	if (marker.kind !== "server" && marker.kind !== "client" || typeof marker.source !== "string") return;
	return {
		kind: marker.kind,
		source: marker.source
	};
}
async function reportViolation(opts) {
	const key = dedupeKey(opts.info);
	if (opts.config.logMode !== "always" && opts.envState.seenViolations.has(key)) {
		opts.perf?.count("violations.deduped");
		return;
	}
	opts.envState.seenViolations.add(key);
	opts.perf?.count("violations.reported");
	if (opts.config.onViolation) {
		const startedAt = opts.perf ? performance.now() : 0;
		const result = await opts.config.onViolation(opts.info);
		if (opts.perf) opts.perf.time("violations.onViolation", startedAt);
		if (result === false) {
			opts.perf?.count("violations.suppressed");
			return;
		}
	}
	const message = formatViolation(opts.info, opts.config.root);
	const error = new opts.rspack.WebpackError(message);
	if (opts.config.effectiveBehavior === "error") opts.compilation.errors.push(error);
	else opts.compilation.warnings.push(error);
}
function registerImportProtection(api, opts) {
	const perf = isPerfEnabled() ? createPerfCollector() : void 0;
	const extensionlessResolver = new ExtensionlessAbsoluteIdResolver();
	const envStates = /* @__PURE__ */ new Map();
	const shouldCheckImporterCache = /* @__PURE__ */ new Map();
	const config = {
		enabled: true,
		root: "",
		command: api.context.action === "dev" ? "serve" : "build",
		srcDirectory: "",
		framework: opts.framework,
		effectiveBehavior: "error",
		mockAccess: "error",
		logMode: "once",
		maxTraceDepth: 20,
		compiledRules: {
			client: {
				specifiers: [],
				files: [],
				excludeFiles: []
			},
			server: {
				specifiers: [],
				files: [],
				excludeFiles: []
			}
		},
		includeMatchers: [],
		excludeMatchers: [],
		ignoreImporterMatchers: [],
		markerSpecifiers: {
			serverOnly: /* @__PURE__ */ new Set(),
			clientOnly: /* @__PURE__ */ new Set()
		},
		envTypeMap: new Map(opts.environments.map((env) => [env.name, env.type])),
		onViolation: void 0
	};
	const shared = {
		root: "",
		virtualModules: /* @__PURE__ */ new Map(),
		vmPlugins: {},
		readyVmPlugins: {},
		pendingWrites: /* @__PURE__ */ new Map()
	};
	function applyUserConfig() {
		const { startConfig, resolvedStartConfig } = opts.getConfig();
		config.root = resolvedStartConfig.root;
		config.srcDirectory = resolvedStartConfig.srcDirectory;
		shared.root = resolvedStartConfig.root;
		const userOpts = startConfig.importProtection;
		if (userOpts?.enabled === false) {
			config.enabled = false;
			return;
		}
		config.enabled = true;
		const behavior = userOpts?.behavior;
		if (typeof behavior === "string") config.effectiveBehavior = behavior;
		else config.effectiveBehavior = config.command === "serve" ? behavior?.dev ?? "mock" : behavior?.build ?? "error";
		config.logMode = userOpts?.log ?? "once";
		config.mockAccess = userOpts?.mockAccess ?? "error";
		config.maxTraceDepth = userOpts?.maxTraceDepth ?? 20;
		config.onViolation = userOpts?.onViolation ? (info) => userOpts.onViolation?.(info) : void 0;
		const defaults = getDefaultImportProtectionRules();
		const pick = (user, fallback) => user ? [...user] : [...fallback];
		const clientSpecifiers = dedupePatterns([...defaults.client.specifiers, ...userOpts?.client?.specifiers ?? []]);
		config.compiledRules.client = {
			specifiers: compileMatchers(clientSpecifiers),
			files: compileMatchers(pick(userOpts?.client?.files, defaults.client.files)),
			excludeFiles: compileMatchers(pick(userOpts?.client?.excludeFiles, defaults.client.excludeFiles))
		};
		config.compiledRules.server = {
			specifiers: compileMatchers(dedupePatterns(pick(userOpts?.server?.specifiers, defaults.server.specifiers))),
			files: compileMatchers(pick(userOpts?.server?.files, defaults.server.files)),
			excludeFiles: compileMatchers(pick(userOpts?.server?.excludeFiles, defaults.server.excludeFiles))
		};
		config.includeMatchers = compileMatchers(userOpts?.include ?? []);
		config.excludeMatchers = compileMatchers(userOpts?.exclude ?? []);
		config.ignoreImporterMatchers = compileMatchers(userOpts?.ignoreImporters ?? []);
		const markers = getMarkerSpecifiers();
		config.markerSpecifiers = {
			serverOnly: new Set(markers.serverOnly),
			clientOnly: new Set(markers.clientOnly)
		};
	}
	function shouldCheckImporter(file) {
		return shouldCheckImporterWithCache({
			config,
			cache: shouldCheckImporterCache,
			perf,
			file
		});
	}
	api.onBeforeBuild(() => {
		const startedAt = perf ? performance.now() : 0;
		applyUserConfig();
		clearNormalizeFilePathCache();
		extensionlessResolver.clear();
		shouldCheckImporterCache.clear();
		envStates.clear();
		if (perf) perf.time("onBeforeBuild", startedAt);
	});
	api.onBeforeDevCompile(() => {
		const startedAt = perf ? performance.now() : 0;
		applyUserConfig();
		clearNormalizeFilePathCache();
		extensionlessResolver.clear();
		shouldCheckImporterCache.clear();
		for (const envState of envStates.values()) envState.resolveCache.clear();
		if (perf) perf.time("onBeforeDevCompile", startedAt);
	});
	api.modifyRspackConfig((rspackConfig, utils) => {
		const startedAt = perf ? performance.now() : 0;
		applyUserConfig();
		const envName = utils.environment.name;
		if (!opts.environments.some((environment) => environment.name === envName)) return;
		const VMP = utils.rspack.experiments.VirtualModulesPlugin;
		const vmPlugin = new VMP({});
		shared.vmPlugins[envName] = vmPlugin;
		shared.readyVmPlugins[envName] = false;
		const rules = rspackConfig.module.rules ?? [];
		rules.push({
			test: /\.[cm]?[tj]sx?$/,
			enforce: "post",
			use: [{
				loader: importProtectionLoader,
				options: {
					config,
					envName,
					envStates,
					extensionlessResolver,
					perf,
					shared,
					shouldCheckImporterCache
				}
			}]
		});
		rspackConfig.module.rules = rules;
		rspackConfig.plugins.push(vmPlugin);
		rspackConfig.plugins.push({ apply(compiler) {
			compiler.hooks.thisCompilation.tap("TanStackStartImportProtectionVirtualModulesReady", () => {
				shared.readyVmPlugins[envName] = true;
				flushPendingWrites(shared, envName);
			});
		} });
		if (perf) perf.time("modifyRspackConfig", startedAt);
	});
	api.processAssets({
		stage: "report",
		environments: opts.environments.map((environment) => environment.name)
	}, async (context) => {
		const envName = context.environment.name;
		const startedAt = perf ? performance.now() : 0;
		perf?.count("processAssets.calls");
		perf?.count(`processAssets.env.${envName}`);
		try {
			if (!config.enabled) return;
			const envType = getImportProtectionEnvType(config, envName);
			const envState = getOrCreateEnvState(envStates, envName);
			const matchers = getRulesForEnvironment(config, envName);
			const allModules = Array.from(context.compilation.modules);
			perf?.count("processAssets.modules.total", allModules.length);
			const violationScanner = createCompilationViolationScanner({
				config,
				envType,
				matchers,
				shouldCheckImporter
			});
			forEachEntryModule({
				compilation: context.compilation,
				visitModule: violationScanner.visitEntry
			});
			const forEachStartedAt = perf ? performance.now() : 0;
			const moduleGraphNodes = [];
			forEachModules({
				compilation: context.compilation,
				modules: allModules,
				visitNode(node) {
					moduleGraphNodes.push(node);
					violationScanner.visitNode(node);
				}
			});
			if (perf) {
				perf.time("processAssets.forEachModules", forEachStartedAt);
				perf.count("processAssets.modules.collected", moduleGraphNodes.length);
				perf.count("processAssets.imports.collected", moduleGraphNodes.reduce((total, node) => total + node.imports.length, 0));
			}
			const candidateStartedAt = perf ? performance.now() : 0;
			const candidates = violationScanner.finish();
			if (perf) {
				perf.time("processAssets.candidates.finish", candidateStartedAt);
				perf.count("processAssets.candidates", candidates.length);
			}
			if (candidates.length === 0) return;
			const graphStartedAt = perf ? performance.now() : 0;
			const { importGraph, edgeIndex } = buildCompilationImportGraph({
				compilation: context.compilation,
				nodes: moduleGraphNodes
			});
			if (perf) {
				perf.time("processAssets.importGraph.build", graphStartedAt);
				perf.count("processAssets.importGraph.edges", edgeIndex.edges.length);
			}
			let provider;
			const getProvider = () => {
				if (!provider) {
					const providerStartedAt = perf ? performance.now() : 0;
					provider = buildTransformResultProvider({
						root: config.root,
						perf,
						inputFileSystem: context.compilation.inputFileSystem
					});
					if (perf) perf.time("processAssets.provider.build", providerStartedAt);
				}
				return provider;
			};
			for (const candidate of candidates) {
				let info;
				if (candidate.type === "specifier") {
					const { payload } = candidate;
					info = await buildViolationInfo({
						config,
						provider: getProvider(),
						importGraph,
						edgeIndex,
						perf,
						envName,
						envType,
						importer: payload.violation.importer,
						importerModule: candidate.edge.importer,
						source: payload.violation.specifier,
						resolved: payload.violation.resolved,
						transformedSources: [getModuleResource(candidate.edge.module)],
						type: "specifier",
						pattern: payload.violation.patternText
					});
				} else if (candidate.type === "marker") {
					const importer = getModuleResource(candidate.importer);
					info = await buildViolationInfo({
						config,
						provider: getProvider(),
						importGraph,
						edgeIndex,
						perf,
						envName,
						envType,
						importer,
						importerModule: candidate.importer,
						source: candidate.source,
						type: "marker"
					});
				} else {
					const { edge, source } = candidate;
					const importer = getModuleResource(edge.importer);
					const resolved = getModuleResource(edge.module);
					info = await buildViolationInfo({
						config,
						provider: getProvider(),
						importGraph,
						edgeIndex,
						perf,
						envName,
						envType,
						importer,
						importerModule: edge.importer,
						source,
						resolved,
						type: "file",
						pattern: candidate.pattern
					});
				}
				await reportViolation({
					config,
					envState,
					compilation: context.compilation,
					rspack: context.compiler.rspack,
					perf,
					info
				});
			}
		} finally {
			if (perf) {
				perf.time("processAssets", startedAt);
				perf.flush(config.root, envName, "processAssets");
			}
		}
	});
}
//#endregion
export { IMPORT_PROTECTION_BUILD_INFO_FIELD, ensureMockEdgeModule, ensureRuntimeMockModule, ensureSilentMockModule, getOrCreateEnvState, getRulesForEnvironment, registerImportProtection, serializePattern, shouldCheckImporterWithCache };

//# sourceMappingURL=import-protection.js.map