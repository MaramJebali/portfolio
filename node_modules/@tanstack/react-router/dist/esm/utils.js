"use client";
import * as React$1 from "react";
import { isServer } from "@tanstack/router-core/isServer";
/**
* React.use if available (React 19+), undefined otherwise.
* Use dynamic lookup to avoid Webpack compilation errors with React 18.
*/
var reactUse = React$1["use"];
var useLayoutEffect = isServer ?? typeof window === "undefined" ? React$1.useEffect : React$1.useLayoutEffect;
//#endregion
export { reactUse, useLayoutEffect };

//# sourceMappingURL=utils.js.map