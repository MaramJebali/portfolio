import { AdapterNode, AnySerializationAdapter } from './transformer.cjs';
import { Plugin } from 'seroval';
/** Create a Seroval plugin for client/server symmetric (de)serialization. */
export declare function makeSerovalPlugin(serializationAdapter: AnySerializationAdapter): Plugin<any, AdapterNode>;
