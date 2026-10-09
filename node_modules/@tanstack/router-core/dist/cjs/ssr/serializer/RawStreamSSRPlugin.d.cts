import { RawStream } from './RawStream.cjs';
import { PluginInfo, SerovalNode } from 'seroval';
interface RawStreamSSRNode extends PluginInfo {
    factory: SerovalNode;
    stream: SerovalNode;
}
/** SSR-only RawStream plugin for streaming JavaScript into HTML. */
export declare const RawStreamSSRPlugin: import('seroval').Plugin<RawStream, RawStreamSSRNode>;
export {};
