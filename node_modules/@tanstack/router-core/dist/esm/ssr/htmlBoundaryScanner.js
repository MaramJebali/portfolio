//#region src/ssr/htmlBoundaryScanner.ts
const textEncoder = new TextEncoder();
const DOCUMENT_CLOSE = "</body></html>";
const SCRIPT_CLOSE = "<\/script>";
const DOCUMENT_CLOSE_ANCHOR_INDEX = DOCUMENT_CLOSE.indexOf("y");
const SCRIPT_CLOSE_ANCHOR_INDEX = SCRIPT_CLOSE.indexOf("p");
const DOCUMENT_CLOSE_BYTES = textEncoder.encode(DOCUMENT_CLOSE);
const SCRIPT_CLOSE_BYTES = textEncoder.encode(SCRIPT_CLOSE);
function encodeIntoBoundedChunk(source, sourceOffset, output, outputOffset = 0) {
	return textEncoder.encodeInto(sourceOffset === 0 ? source : source.slice(sourceOffset), outputOffset === 0 ? output : output.subarray(outputOffset));
}
/** Advance matcher state and return the local offset after a complete match. */
function advanceByteMatcher(matcher, value, startIndex = 0, findLast = false) {
	const { pattern, anchorIndex } = matcher;
	let matched = matcher.matched;
	let lastMatchEnd;
	let index = startIndex;
	while (index < value.length) {
		if (matched === 0) if (anchorIndex > 0 && index < value.length - anchorIndex) {
			const anchor = value.indexOf(pattern[anchorIndex], index + anchorIndex);
			if (anchor < 0) {
				index = value.length - anchorIndex;
				continue;
			}
			index = anchor - anchorIndex;
		} else {
			index = value.indexOf(pattern[0], index);
			if (index < 0) {
				matcher.matched = matched;
				return lastMatchEnd;
			}
		}
		const byte = value[index];
		if (byte === pattern[matched]) matched++;
		else matched = byte === pattern[0] ? 1 : 0;
		index++;
		if (matched === pattern.length) {
			matched = 0;
			if (!findLast) {
				matcher.matched = matched;
				return index;
			}
			lastMatchEnd = index;
		}
	}
	matcher.matched = matched;
	return lastMatchEnd;
}
/** Find a complete fixed sequence that is contained in one byte chunk. */
function findExactBytes(value, pattern, startIndex = 0, anchorIndex = 0) {
	let anchor = value.indexOf(pattern[anchorIndex], startIndex + anchorIndex);
	while (anchor >= 0) {
		const candidate = anchor - anchorIndex;
		if (candidate + pattern.length > value.length) return -1;
		let patternIndex = 0;
		while (patternIndex < pattern.length && value[candidate + patternIndex] === pattern[patternIndex]) patternIndex++;
		if (patternIndex === pattern.length) return candidate;
		anchor = value.indexOf(pattern[anchorIndex], anchor + 1);
	}
	return -1;
}
/**
* Find the longest suffix that can become the fixed sequence in the next
* chunk. The returned index starts that suffix.
*/
function getExactBytesPrefixAtEnd(value, pattern, startIndex = 0) {
	candidate: for (let length = Math.min(pattern.length - 1, value.length - startIndex); length > 0; length--) {
		const candidateStart = value.length - length;
		for (let index = 0; index < length; index++) if (value[candidateStart + index] !== pattern[index]) continue candidate;
		return candidateStart;
	}
}
//#endregion
export { DOCUMENT_CLOSE_ANCHOR_INDEX, DOCUMENT_CLOSE_BYTES, SCRIPT_CLOSE_ANCHOR_INDEX, SCRIPT_CLOSE_BYTES, advanceByteMatcher, encodeIntoBoundedChunk, findExactBytes, getExactBytesPrefixAtEnd };

//# sourceMappingURL=htmlBoundaryScanner.js.map