import { EnvRuntimeState, PerfCollector, PluginConfig, SharedState } from './import-protection.js';
import { ExtensionlessAbsoluteIdResolver } from '../import-protection/extensionlessAbsoluteIdResolver.js';
import { Rspack } from '@rsbuild/core';
export interface ImportProtectionLoaderOptions {
    config: PluginConfig;
    envName: string;
    envStates: Map<string, EnvRuntimeState>;
    extensionlessResolver: ExtensionlessAbsoluteIdResolver;
    perf?: PerfCollector;
    shared: SharedState;
    shouldCheckImporterCache: Map<string, boolean>;
}
declare const importProtectionLoader: Rspack.LoaderDefinition<ImportProtectionLoaderOptions>;
export default importProtectionLoader;
