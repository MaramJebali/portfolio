"use client";
import { routerContext } from "./routerContext.js";
import * as React$1 from "react";
//#region src/useRouter.tsx
/**
* Access the current TanStack Router instance from React context.
* Must be used within a `RouterProvider`.
*
* Options:
* - `warn`: Log a warning if no router context is found (default: true).
*
* @returns The registered router instance.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useRouterHook
*/
function useRouter(opts) {
	const value = React$1.useContext(routerContext);
	if (!value) warnMissingRouter(opts);
	return value;
}
function warnMissingRouter(opts) {
	if (process.env.NODE_ENV !== "production" && (opts?.warn ?? true)) console.warn("Warning: useRouter must be used inside a <RouterProvider> component!");
}
//#endregion
export { useRouter };

//# sourceMappingURL=useRouter.js.map