import { AdapterNode, AnySerializationAdapter } from './transformer.js';
import { Plugin } from 'seroval';
/**
 * Create a Seroval plugin for server-side serialization only. `tracker.didRun`
 * becomes true once the plugin serialized a value.
 */
export declare function makeSsrSerovalPlugin(serializationAdapter: AnySerializationAdapter, tracker?: {
    didRun: boolean;
}): Plugin<any, AdapterNode>;
