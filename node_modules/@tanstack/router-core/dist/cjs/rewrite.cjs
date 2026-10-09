const require_path = require("./path.cjs");
//#region src/rewrite.ts
/** Compose multiple rewrite pairs into a single in/out rewrite. */
function composeRewrites(rewrites) {
	return {
		input: ({ url }) => {
			for (const rewrite of rewrites) url = executeRewriteInput(rewrite, url);
			return url;
		},
		output: ({ url }) => {
			for (let i = rewrites.length - 1; i >= 0; i--) url = executeRewriteOutput(rewrites[i], url);
			return url;
		}
	};
}
/** Create a rewrite pair that strips/adds a basepath on input/output. */
function rewriteBasepath(basepath, caseSensitive, rewrite) {
	const trimmedBasepath = require_path.trimPath(basepath);
	const normalizedBasepath = `/${trimmedBasepath}`;
	const checkBasepath = caseSensitive ? normalizedBasepath : normalizedBasepath.toLowerCase();
	const checkBasepathWithSlash = `${checkBasepath}/`;
	const basepathRewrite = {
		input: ({ url }) => {
			const pathname = caseSensitive ? url.pathname : url.pathname.toLowerCase();
			if (pathname === checkBasepath) url.pathname = "/";
			else if (pathname.startsWith(checkBasepathWithSlash)) url.pathname = url.pathname.slice(normalizedBasepath.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = require_path.cleanPath(`/${trimmedBasepath}${url.pathname}`);
			return url;
		}
	};
	return rewrite ? {
		input: ({ url }) => executeRewriteInput(rewrite, basepathRewrite.input({ url })),
		output: ({ url }) => basepathRewrite.output({ url: executeRewriteOutput(rewrite, url) })
	} : basepathRewrite;
}
/** Execute a location input rewrite if provided. */
function executeRewriteInput(rewrite, url) {
	const res = rewrite?.input?.({ url });
	if (res) {
		if (typeof res === "string") return new URL(res);
		else if (res instanceof URL) return res;
	}
	return url;
}
/** Execute a location output rewrite if provided. */
function executeRewriteOutput(rewrite, url) {
	const res = rewrite?.output?.({ url });
	if (res) {
		if (typeof res === "string") return new URL(res);
		else if (res instanceof URL) return res;
	}
	return url;
}
//#endregion
exports.composeRewrites = composeRewrites;
exports.executeRewriteInput = executeRewriteInput;
exports.executeRewriteOutput = executeRewriteOutput;
exports.rewriteBasepath = rewriteBasepath;

//# sourceMappingURL=rewrite.cjs.map