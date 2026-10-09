"use client";
import { useHydrated } from "./ClientOnly.js";
import { useRouter } from "./useRouter.js";
import * as React$1 from "react";
import { isServer } from "@tanstack/router-core/isServer";
import { jsx } from "react/jsx-runtime";
//#region src/Asset.tsx
var INLINE_CSS_HYDRATION_ATTR = "data-tsr-inline-css";
var noopScriptHandler = () => {};
function setScriptAttrs(script, attrs) {
	if (!attrs) return;
	for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
}
function Asset(asset) {
	const { attrs, children, nonce, preventScriptHoist } = asset;
	const innerHTML = React$1.useMemo(() => children === void 0 ? void 0 : { __html: children }, [children]);
	switch (asset.tag) {
		case "title": return /* @__PURE__ */ jsx("title", {
			...attrs,
			suppressHydrationWarning: true,
			children
		});
		case "meta": return /* @__PURE__ */ jsx("meta", {
			...attrs,
			suppressHydrationWarning: true
		});
		case "link": return /* @__PURE__ */ jsx("link", {
			...attrs,
			precedence: attrs?.precedence ?? (attrs?.rel === "stylesheet" ? "default" : void 0),
			nonce,
			suppressHydrationWarning: true
		});
		case "style":
			if (asset.inlineCss && (process.env.TSS_INLINE_CSS_ENABLED === "true" || process.env.TSS_INLINE_CSS_ENABLED === void 0 && isServer)) return /* @__PURE__ */ jsx(InlineCssStyle, {
				attrs,
				nonce,
				children
			});
			return /* @__PURE__ */ jsx("style", {
				...attrs,
				dangerouslySetInnerHTML: innerHTML,
				nonce
			});
		case "script": return /* @__PURE__ */ jsx(Script, {
			attrs,
			preventScriptHoist,
			children
		});
		default: return null;
	}
}
function InlineCssStyle({ attrs, children, nonce }) {
	const isInlineCssPlaceholder = children === void 0;
	const [hydratedInlineCss] = React$1.useState(() => {
		if (!isInlineCssPlaceholder || typeof document === "undefined") return;
		return document.querySelector(`style[${INLINE_CSS_HYDRATION_ATTR}]`)?.textContent ?? void 0;
	});
	const html = isInlineCssPlaceholder ? hydratedInlineCss ?? "" : children ?? "";
	const innerHTML = React$1.useMemo(() => ({ __html: html }), [html]);
	return /* @__PURE__ */ jsx("style", {
		...attrs,
		[INLINE_CSS_HYDRATION_ATTR]: "",
		dangerouslySetInnerHTML: innerHTML,
		nonce,
		suppressHydrationWarning: true
	});
}
function Script({ attrs, children, preventScriptHoist }) {
	const router = useRouter();
	const hydrated = useHydrated();
	const innerHTML = React$1.useMemo(() => children === void 0 ? void 0 : { __html: children }, [children]);
	const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
	if (process.env.NODE_ENV !== "production" && attrs?.src && typeof children === "string" && children.trim().length) console.warn("[TanStack Router] <Script> received both `src` and `children`. The `children` content will be ignored. Remove `children` or remove `src`.");
	React$1.useEffect(() => {
		if (dataScript) return;
		if (attrs?.src) {
			const link = document.createElement("a");
			link.href = attrs.src;
			const normSrc = link.href;
			for (const el of document.scripts) if (el.src === normSrc) return;
			const script = document.createElement("script");
			setScriptAttrs(script, attrs);
			document.head.appendChild(script);
			return () => script.remove();
		}
		if (typeof children === "string") {
			const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
			const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
			for (const el of document.scripts) {
				if (el.hasAttribute("src")) continue;
				const sType = el.getAttribute("type") ?? "text/javascript";
				const sNonce = el.getAttribute("nonce") ?? void 0;
				if (el.textContent === children && sType === typeAttr && sNonce === nonceAttr) return;
			}
			const script = document.createElement("script");
			script.textContent = children;
			setScriptAttrs(script, attrs);
			document.head.appendChild(script);
			return () => script.remove();
		}
	}, [
		attrs,
		children,
		dataScript
	]);
	if (isServer ?? router.isServer) {
		if (attrs?.src) {
			if (!preventScriptHoist) return /* @__PURE__ */ jsx("script", {
				...attrs,
				suppressHydrationWarning: true
			});
			return /* @__PURE__ */ jsx("script", {
				...attrs,
				onLoad: noopScriptHandler,
				suppressHydrationWarning: true
			});
		}
		if (typeof children === "string") return /* @__PURE__ */ jsx("script", {
			...attrs,
			dangerouslySetInnerHTML: innerHTML,
			suppressHydrationWarning: true
		});
		return null;
	}
	if (dataScript && typeof children === "string") return /* @__PURE__ */ jsx("script", {
		...attrs,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: innerHTML
	});
	if (!hydrated) {
		if (attrs?.src) return /* @__PURE__ */ jsx("script", {
			...attrs,
			suppressHydrationWarning: true
		});
		if (typeof children === "string") return /* @__PURE__ */ jsx("script", {
			...attrs,
			dangerouslySetInnerHTML: innerHTML,
			suppressHydrationWarning: true
		});
	}
	return null;
}
//#endregion
export { Asset };

//# sourceMappingURL=Asset.js.map