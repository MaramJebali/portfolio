import { Rspack } from '@rsbuild/core';
type WatchIgnored = NonNullable<Rspack.Configuration['watchOptions']>['ignored'];
export declare function addWorkspaceWatchIgnored(ignored: WatchIgnored, directories: Array<string>): WatchIgnored;
export {};
