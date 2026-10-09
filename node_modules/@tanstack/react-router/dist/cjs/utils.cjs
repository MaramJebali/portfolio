"use client";
const require_runtime = require("./_virtual/_rolldown/runtime.cjs");
let react = require("react");
react = require_runtime.__toESM(react, 1);
let _tanstack_router_core_isServer = require("@tanstack/router-core/isServer");
/**
* React.use if available (React 19+), undefined otherwise.
* Use dynamic lookup to avoid Webpack compilation errors with React 18.
*/
var reactUse = react["use"];
var useLayoutEffect = _tanstack_router_core_isServer.isServer ?? typeof window === "undefined" ? react.useEffect : react.useLayoutEffect;
//#endregion
exports.reactUse = reactUse;
exports.useLayoutEffect = useLayoutEffect;

//# sourceMappingURL=utils.cjs.map