"use client";
import React from "react";
import { jsx } from "react/jsx-runtime";
//#region src/ClientOnly.tsx
var getSnapshot = () => true;
var getServerSnapshot = () => false;
/**
* Render the children only after the JS has loaded client-side. Use an optional
* fallback component if the JS is not yet loaded.
*
* @example
* Render a Chart component if JS loads, renders a simple FakeChart
* component server-side or if there is no JS. The FakeChart can have only the
* UI without the behavior or be a loading spinner or skeleton.
*
* ```tsx
* return (
*   <ClientOnly fallback={<FakeChart />}>
*     <Chart />
*   </ClientOnly>
* )
* ```
*/
function ClientOnly({ children, fallback = null }) {
	return /* @__PURE__ */ jsx(React.Fragment, { children: useHydrated() ? children : fallback });
}
/** @internal */
function useHydrated(enabled = true) {
	return React.useSyncExternalStore(subscribe, getSnapshot, enabled ? getServerSnapshot : getSnapshot);
}
function subscribe() {
	return () => {};
}
//#endregion
export { ClientOnly, useHydrated };

//# sourceMappingURL=ClientOnly.js.map