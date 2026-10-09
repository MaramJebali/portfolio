import { ImportProtectionBehavior } from '../schema.js';
import { CompiledMatcher } from '../import-protection/matchers.js';
import { FileMatchers } from '../import-protection/utils.js';
import { ViolationInfo } from '../import-protection/trace.js';
import { CompileStartFrameworkOptions, GetConfigFn } from '../types.js';
import { ModifyRspackConfigFn, RsbuildPluginAPI, Rspack, rspack as rspackNamespaceType } from '@rsbuild/core';
type RspackNamespace = typeof rspackNamespaceType;
type RspackVirtualModulesPlugin = Pick<InstanceType<RspackNamespace['experiments']['VirtualModulesPlugin']>, 'writeModule'>;
type ModifyRspackConfig = Parameters<ModifyRspackConfigFn>[0];
type ModifyRspackConfigUtils = Parameters<ModifyRspackConfigFn>[1];
type ImportProtectionRspackConfig = {
    module: Pick<ModifyRspackConfig['module'], 'rules'>;
    plugins: Array<Rspack.Plugin | RspackVirtualModulesPlugin>;
};
type ImportProtectionModifyRspackConfigUtils = {
    environment: Pick<ModifyRspackConfigUtils['environment'], 'name'>;
    rspack: {
        experiments: {
            VirtualModulesPlugin: new (modules: Record<string, string>) => RspackVirtualModulesPlugin;
        };
    };
};
type ImportProtectionRsbuildPluginAPI = {
    context: Pick<RsbuildPluginAPI['context'], 'action'>;
    onBeforeBuild: (handler: () => void) => void;
    onBeforeDevCompile: (handler: () => void) => void;
    modifyRspackConfig: (handler: (config: ImportProtectionRspackConfig, utils: ImportProtectionModifyRspackConfigUtils) => void) => void;
    processAssets: RsbuildPluginAPI['processAssets'];
};
type ImportProtectionGetConfigFn = () => {
    startConfig: Pick<ReturnType<GetConfigFn>['startConfig'], 'importProtection'>;
    resolvedStartConfig: Pick<ReturnType<GetConfigFn>['resolvedStartConfig'], 'root' | 'srcDirectory'>;
};
export type ImportProtectionMarkerKind = 'server' | 'client';
export interface ImportProtectionMarker {
    kind: ImportProtectionMarkerKind;
    source: string;
}
export declare const IMPORT_PROTECTION_BUILD_INFO_FIELD = "tanstack.start.importProtection";
export type PerfCollector = {
    count: (name: string, value?: number) => void;
    time: (name: string, startedAt: number) => void;
    flush: (root: string, envName: string, phase: string) => void;
};
export interface EnvRules {
    specifiers: Array<CompiledMatcher>;
    files: Array<CompiledMatcher>;
    excludeFiles: Array<CompiledMatcher>;
}
export interface PluginConfig {
    enabled: boolean;
    root: string;
    command: 'build' | 'serve';
    srcDirectory: string;
    framework: CompileStartFrameworkOptions;
    effectiveBehavior: ImportProtectionBehavior;
    mockAccess: 'error' | 'warn' | 'off';
    logMode: 'once' | 'always';
    maxTraceDepth: number;
    compiledRules: {
        client: EnvRules;
        server: EnvRules;
    };
    includeMatchers: Array<CompiledMatcher>;
    excludeMatchers: Array<CompiledMatcher>;
    ignoreImporterMatchers: Array<CompiledMatcher>;
    markerSpecifiers: {
        serverOnly: Set<string>;
        clientOnly: Set<string>;
    };
    envTypeMap: Map<string, 'client' | 'server'>;
    onViolation?: (info: ViolationInfo) => boolean | void | Promise<boolean | void>;
}
export interface EnvRuntimeState {
    resolveCache: Map<string, string | null>;
    seenViolations: Set<string>;
}
export interface SharedState {
    root: string;
    virtualModules: Map<string, string>;
    vmPlugins: Record<string, RspackVirtualModulesPlugin>;
    readyVmPlugins: Record<string, boolean>;
    pendingWrites: Map<string, Map<string, string>>;
}
interface MockEdgePayload {
    exports: Array<string>;
    runtimeId: string;
    violation: {
        env: string;
        envType: 'client' | 'server';
        importer: string;
        specifier: string;
        resolved?: string;
        patternText: string;
    };
}
type ResolvedImportProtectionCheck = {
    type: 'file';
    fileMatch: FileMatchers['files'][number];
} | {
    type: 'marker';
};
export declare function getRulesForEnvironment(config: PluginConfig, envName: string): EnvRules;
export declare function serializePattern(pattern: string | RegExp): string;
export declare function getRsbuildResolvedImportProtectionCheck(relativeResolved: string, matchers: FileMatchers): ResolvedImportProtectionCheck | undefined;
export declare function getOrCreateEnvState(envStates: Map<string, EnvRuntimeState>, envName: string): EnvRuntimeState;
export declare function shouldCheckImporterWithCache(opts: {
    config: PluginConfig;
    cache: Map<string, boolean>;
    perf?: PerfCollector;
    file: string;
}): boolean;
export declare function ensureSilentMockModule(shared: SharedState, envName: string): string;
export declare function ensureRuntimeMockModule(opts: {
    shared: SharedState;
    envName: string;
    mode: 'error' | 'warn' | 'off';
    env: string;
    importer: string;
    specifier: string;
}): string;
export declare function ensureMockEdgeModule(opts: {
    shared: SharedState;
    envName: string;
    payload: MockEdgePayload;
}): string;
export declare function registerImportProtection(api: ImportProtectionRsbuildPluginAPI, opts: {
    getConfig: ImportProtectionGetConfigFn;
    framework: CompileStartFrameworkOptions;
    environments: Array<{
        name: string;
        type: 'client' | 'server';
    }>;
}): void;
export {};
