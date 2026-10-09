import { Manifest, RouterManagedTag } from '../manifest.cjs';
import { AnyRouteMatch } from '../Matches.cjs';
import { InitialHydrationScriptTags } from './hydrationScripts.cjs';
type ScriptTags = Array<RouterManagedTag>;
export type SsrBodyScriptParts = readonly [ScriptTags, ScriptTags];
export declare function getSsrBodyScriptParts(matches: Array<AnyRouteMatch>, manifest: Manifest | undefined, nonce: string | undefined, routeScriptAttrs?: Record<string, unknown>): SsrBodyScriptParts;
export declare function composeSsrBodyScripts([routeScripts, manifestScripts]: SsrBodyScriptParts, initialHydrationScripts?: InitialHydrationScriptTags): Array<RouterManagedTag>;
export {};
