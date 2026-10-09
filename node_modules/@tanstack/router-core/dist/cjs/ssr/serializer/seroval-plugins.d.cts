import { Plugin } from 'seroval';
/**
 * Plugins for JSON transport from a client: serializes RawStream arguments
 * and reads plain JSON responses, which never carry RawStream nodes.
 */
export declare function createDefaultSerovalPlugins(signal?: AbortSignal): Array<Plugin<any, any>>;
export declare const defaultSerovalPlugins: Plugin<any, any>[];
/**
 * `defaultSerovalPlugins` plus RawStream deserialization, for JSON that may
 * carry RawStream nodes: server-function request bodies and cached static
 * responses. Seroval deserializes by first tag match, so the deserialize half
 * precedes the serialize half; it never matches during serialization.
 */
export declare const defaultSerovalDeserializerPlugins: Array<Plugin<any, any>>;
