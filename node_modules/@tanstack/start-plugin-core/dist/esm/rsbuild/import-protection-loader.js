import { canonicalizeResolvedId, checkFileDenial, normalizeFilePath } from "../import-protection/utils.js";
import { matchesAny } from "../import-protection/matchers.js";
import { getImportProtectionEnvType, getImportProtectionRelativePath } from "../import-protection/adapterUtils.js";
import { normalizeSourceMap } from "../import-protection/sourceLocation.js";
import { getImportSourcesFromResult, getMockExportNamesBySourceFromResult, getNamedExportsFromResult } from "../import-protection/analysis.js";
import { rewriteDeniedImports } from "../import-protection/rewrite.js";
import { generateDevSelfDenialModule, generateSelfContainedMockModule } from "../import-protection/virtualModules.js";
import { IMPORT_PROTECTION_BUILD_INFO_FIELD, ensureMockEdgeModule, ensureRuntimeMockModule, ensureSilentMockModule, getOrCreateEnvState, getRulesForEnvironment, serializePattern, shouldCheckImporterWithCache } from "./import-protection.js";
import remapping from "@jridgewell/remapping";
//#region src/rsbuild/import-protection-loader.ts
async function resolveAgainstImporter(opts) {
	const importerDir = opts.context ?? opts.importerId.replace(/[/\\][^/\\]*$/, "");
	const cacheKey = `${normalizeFilePath(importerDir)}:${opts.source}`;
	if (opts.envState.resolveCache.has(cacheKey)) {
		opts.perf?.count("resolve.cached");
		return opts.envState.resolveCache.get(cacheKey) ?? null;
	}
	const startedAt = opts.perf ? performance.now() : 0;
	opts.perf?.count("resolve.calls");
	const resolved = await new Promise((resolve, reject) => {
		opts.resolve(importerDir, opts.source, (error, result) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(typeof result === "string" ? result : null);
		});
	}).catch(() => null).finally(() => {
		if (opts.perf) opts.perf.time("resolve", startedAt);
	});
	if (!resolved) {
		opts.envState.resolveCache.set(cacheKey, null);
		return null;
	}
	const canonical = canonicalizeResolvedId(resolved, opts.config.root, (value) => opts.extensionlessResolver.resolve(value));
	opts.envState.resolveCache.set(cacheKey, canonical);
	return canonical;
}
async function transformImportProtection(loaderContext, code, options) {
	const startedAt = options.perf ? performance.now() : 0;
	const { config, envName, perf, shared } = options;
	perf?.count("transform.calls");
	perf?.count(`transform.env.${envName}`);
	try {
		const id = loaderContext.resource;
		delete loaderContext._module.buildInfo[IMPORT_PROTECTION_BUILD_INFO_FIELD];
		if (!config.enabled) return code;
		const envType = getImportProtectionEnvType(config, envName);
		const envState = getOrCreateEnvState(options.envStates, envName);
		const file = normalizeFilePath(loaderContext.resourcePath);
		if (!shouldCheckImporterWithCache({
			config,
			cache: options.shouldCheckImporterCache,
			perf,
			file
		})) {
			perf?.count("transform.skippedImporter");
			return code;
		}
		const matchers = getRulesForEnvironment(config, envName);
		const relativeFile = getImportProtectionRelativePath(config.root, file);
		const transformResult = {
			code,
			filename: file,
			map: void 0,
			originalCode: void 0,
			perf
		};
		const importSources = getImportSourcesFromResult(transformResult);
		perf?.count("transform.importSources", importSources.length);
		const serverOnlyMarker = importSources.find((source) => config.markerSpecifiers.serverOnly.has(source));
		const clientOnlyMarker = importSources.find((source) => config.markerSpecifiers.clientOnly.has(source));
		if (serverOnlyMarker && clientOnlyMarker) throw new Error(`[import-protection] File "${relativeFile}" has both server-only and client-only markers. This is not allowed.`);
		const marker = serverOnlyMarker ? {
			kind: "server",
			source: serverOnlyMarker
		} : clientOnlyMarker ? {
			kind: "client",
			source: clientOnlyMarker
		} : void 0;
		if (marker) loaderContext._module.buildInfo[IMPORT_PROTECTION_BUILD_INFO_FIELD] = marker;
		const fileMatch = checkFileDenial(relativeFile, matchers);
		const markerViolation = envType === "client" && marker?.kind === "server" || envType === "server" && marker?.kind === "client";
		if (fileMatch || markerViolation) {
			let exportNames = [];
			try {
				exportNames = getNamedExportsFromResult(transformResult);
			} catch {
				exportNames = [];
			}
			if (config.command === "build") return generateSelfContainedMockModule(exportNames);
			const runtimeId = ensureRuntimeMockModule({
				shared,
				envName,
				mode: config.mockAccess,
				env: envName,
				importer: file,
				specifier: relativeFile
			});
			return generateDevSelfDenialModule(exportNames, runtimeId);
		}
		const deniedSpecifierReplacements = /* @__PURE__ */ new Map();
		let exportsBySource;
		const getExportsBySource = () => {
			if (exportsBySource) return exportsBySource;
			try {
				exportsBySource = getMockExportNamesBySourceFromResult(transformResult);
			} catch {
				exportsBySource = /* @__PURE__ */ new Map();
			}
			return exportsBySource;
		};
		for (const source of importSources) {
			const specifierMatch = matchesAny(source, matchers.specifiers);
			if (!specifierMatch) continue;
			const resolved = await resolveAgainstImporter({
				envState,
				config,
				context: loaderContext.context,
				importerId: id,
				source,
				resolve: loaderContext.resolve.bind(loaderContext),
				extensionlessResolver: options.extensionlessResolver,
				perf
			});
			const runtimeId = config.command === "build" ? ensureSilentMockModule(shared, envName) : ensureRuntimeMockModule({
				shared,
				envName,
				mode: config.mockAccess,
				env: envName,
				importer: file,
				specifier: source
			});
			const replacement = ensureMockEdgeModule({
				shared,
				envName,
				payload: {
					exports: getExportsBySource().get(source) ?? [],
					runtimeId,
					violation: {
						env: envName,
						envType,
						importer: file,
						specifier: source,
						...resolved ? { resolved } : {},
						patternText: serializePattern(specifierMatch.pattern)
					}
				}
			});
			deniedSpecifierReplacements.set(source, replacement);
		}
		if (deniedSpecifierReplacements.size === 0) return code;
		const rewritten = rewriteDeniedImports(code, id, new Set(deniedSpecifierReplacements.keys()), (source) => deniedSpecifierReplacements.get(source) ?? source);
		if (!rewritten) return code;
		return {
			code: rewritten.code,
			map: normalizeSourceMap(rewritten.map) ?? null
		};
	} finally {
		if (perf) perf.time("transform", startedAt);
	}
}
var importProtectionLoader = function(source, sourceMap) {
	const callback = this.async();
	const options = this.getOptions();
	transformImportProtection(this, source, options).then((result) => {
		if (typeof result === "string") {
			callback(null, result, sourceMap);
			return;
		}
		const mergedMap = sourceMap && result.map ? remapping([result.map, sourceMap], () => null) : result.map ?? sourceMap;
		callback(null, result.code, mergedMap);
	}, (error) => {
		callback(error instanceof Error ? error : new Error(String(error)));
	});
};
//#endregion
export { importProtectionLoader as default };

//# sourceMappingURL=import-protection-loader.js.map