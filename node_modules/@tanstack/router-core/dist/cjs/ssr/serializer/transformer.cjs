//#region src/ssr/serializer/transformer.ts
/**
* Create a strongly-typed serialization adapter for SSR hydration.
* Use to register custom types with the router serializer.
*/
function createSerializationAdapter(opts) {
	if (process.env.NODE_ENV !== "production") {
		if (!opts.key || /[\0"\\<\b\t\f\r\n\u2028\u2029\uD800-\uDFFF]/.test(opts.key)) throw new Error(`createSerializationAdapter: key ${JSON.stringify(opts.key)} is invalid. Serialization adapter keys must be non-empty and not contain NUL, ", \\, <, backspace, tab, form feed, line terminators, or UTF-16 surrogate code units.`);
	}
	return opts;
}
//#endregion
exports.createSerializationAdapter = createSerializationAdapter;

//# sourceMappingURL=transformer.cjs.map