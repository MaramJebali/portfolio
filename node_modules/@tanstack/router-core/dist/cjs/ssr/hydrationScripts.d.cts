import { RouterManagedTag } from '../manifest.cjs';
export declare const SSR_SERIALIZATION_SCOPE_ID = "tsr";
export declare const MAX_HYDRATION_OUTPUT_CHUNK_BYTES: number;
export declare const HYDRATION_SCRIPT_BOUNDARY_ANCHOR_INDEX: number;
export declare const HYDRATION_SCRIPT_BOUNDARY_BYTES: Uint8Array<ArrayBuffer>;
export declare const HydrationScriptOutputState: {
    readonly Waiting: 0;
    readonly Ready: 1;
    readonly Active: 2;
    readonly Done: 3;
    readonly Failed: 4;
};
export type HydrationScriptOutputState = (typeof HydrationScriptOutputState)[keyof typeof HydrationScriptOutputState];
/** A request-local, single-consumer stream of complete records. */
export type HydrationScriptOutput = {
    readonly state: HydrationScriptOutputState;
    readonly error: unknown;
    pullChunk: () => Uint8Array;
    subscribe: (onChange: () => void) => () => void;
};
/** The one-time initial `<Scripts>` take: hydration tags plus the boundary. */
export type InitialHydrationScriptTags = {
    before: Array<RouterManagedTag>;
    boundary: RouterManagedTag;
};
type HydrationScripts = {
    pushSerializedSource: (data: string, initial: boolean, wrap: boolean) => boolean;
    pushSource: (nextSource: string) => boolean;
    fail: (reason: unknown) => void;
    finish: () => void;
    takeInitialHydrationScriptTags: () => InitialHydrationScriptTags | undefined;
    disableHydration: () => void;
    isInitialTaken: () => boolean;
    skipInitialTake: () => void;
    liftBarrier: () => void;
    claimOutput: () => HydrationScriptOutput;
    reserveFastPath: (output?: HydrationScriptOutput) => boolean;
    startSerializationTimeout: (timeoutMs: number) => void;
    cleanup: () => void;
};
/** Create the hydration-script owner for one server request. */
export declare function createHydrationScripts(nonce: string | undefined, initialSources?: ReadonlyArray<string>): HydrationScripts;
export {};
