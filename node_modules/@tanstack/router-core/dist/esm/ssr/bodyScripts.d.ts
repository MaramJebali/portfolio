import { Manifest, RouterManagedTag } from '../manifest.js';
import { AnyRouteMatch } from '../Matches.js';
import { InitialHydrationScriptTags } from './hydrationScripts.js';
type ScriptTags = Array<RouterManagedTag>;
export type SsrBodyScriptParts = readonly [ScriptTags, ScriptTags];
export declare function getSsrBodyScriptParts(matches: Array<AnyRouteMatch>, manifest: Manifest | undefined, nonce: string | undefined, routeScriptAttrs?: Record<string, unknown>): SsrBodyScriptParts;
export declare function composeSsrBodyScripts([routeScripts, manifestScripts]: SsrBodyScriptParts, initialHydrationScripts?: InitialHydrationScriptTags): Array<RouterManagedTag>;
export {};
