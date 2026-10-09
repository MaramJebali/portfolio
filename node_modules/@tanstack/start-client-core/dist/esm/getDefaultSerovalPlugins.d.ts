import { Plugin } from 'seroval';
/** Start's serialization adapters followed by `routerPlugins`. */
export declare function getSerovalPlugins(routerPlugins: Array<Plugin<any, any>>): Array<Plugin<any, any>>;
/**
 * Plugins for client JSON transport. The optional signal stops RawStream
 * pumps when the request is aborted.
 */
export declare function getDefaultSerovalPlugins(signal?: AbortSignal): Array<Plugin<any, any>>;
