"use client";
const require_runtime = require("./_virtual/_rolldown/runtime.cjs");
let react = require("react");
react = require_runtime.__toESM(react, 1);
let react_jsx_runtime = require("react/jsx-runtime");
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
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.default.Fragment, { children: useHydrated() ? children : fallback });
}
/** @internal */
function useHydrated(enabled = true) {
	return react.default.useSyncExternalStore(subscribe, getSnapshot, enabled ? getServerSnapshot : getSnapshot);
}
function subscribe() {
	return () => {};
}
//#endregion
exports.ClientOnly = ClientOnly;
exports.useHydrated = useHydrated;

//# sourceMappingURL=ClientOnly.cjs.map