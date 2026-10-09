import { ServerFn } from './types.js';
interface GenerateServerFnResolverModuleOptions {
    serverFnsById: Record<string, ServerFn>;
    includeClientReferencedCheck: boolean;
    useStaticImports?: boolean;
    /**
     * Keep each imported module on its manifest entry after the first call.
     * Only safe when modules cannot be hot-replaced (production builds).
     */
    memoizeModules?: boolean;
}
export declare function generateServerFnResolverModule(opts: GenerateServerFnResolverModuleOptions): string;
export {};
