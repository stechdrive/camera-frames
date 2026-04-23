import { getHelpChapters } from "./help-chapters.js";

const MAX_HITS_PER_CHAPTER = 3;
const SNIPPET_PREFIX_CHARS = 40;
const SNIPPET_SUFFIX_CHARS = 80;

function blocksToSearchItems(blocks) {
	const items = [];
	for (const block of blocks ?? []) {
		switch (block?.type) {
			case "heading":
				items.push({
					kind: "heading",
					level: block.level,
					text: block.content,
				});
				break;
			case "paragraph":
				items.push({ kind: "paragraph", text: block.content });
				break;
			case "list":
				for (const item of block.items ?? []) {
					items.push({ kind: "list-item", text: item.content });
				}
				break;
			case "table":
				for (const row of block.rows ?? []) {
					items.push({ kind: "table-row", text: (row ?? []).join(" / ") });
				}
				break;
			case "blockquote":
				items.push({ kind: "blockquote", text: block.content });
				break;
			case "code":
				items.push({ kind: "code", text: block.content });
				break;
			default:
				break;
		}
	}
	return items;
}

export function stripInlineMarkers(text) {
	return String(text ?? "")
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\{\{icon:[^}]+\}\}/g, "");
}

export function searchHelpChapters(query, lang = "ja") {
	const normalized = String(query ?? "")
		.trim()
		.toLowerCase();
	if (!normalized) return [];
	const chapters = getHelpChapters(lang);
	const results = [];
	for (const chapter of chapters) {
		if (chapter.id === "index") continue;
		const titleLower = chapter.title.toLowerCase();
		const titleHit = titleLower.includes(normalized);
		const items = blocksToSearchItems(chapter.blocks);
		const hits = [];
		for (const item of items) {
			const plain = stripInlineMarkers(item.text);
			const lowered = plain.toLowerCase();
			const index = lowered.indexOf(normalized);
			if (index === -1) continue;
			hits.push({
				kind: item.kind,
				text: plain,
				matchIndex: index,
				matchLength: normalized.length,
			});
			if (hits.length >= MAX_HITS_PER_CHAPTER) break;
		}
		if (titleHit || hits.length > 0) {
			results.push({ chapter, titleHit, hits });
		}
	}
	return results;
}

export function buildHitSnippet(hit) {
	if (!hit) return null;
	const { text, matchIndex, matchLength } = hit;
	const start = Math.max(0, matchIndex - SNIPPET_PREFIX_CHARS);
	const end = Math.min(
		text.length,
		matchIndex + matchLength + SNIPPET_SUFFIX_CHARS,
	);
	return {
		prefix: start > 0 ? "…" : "",
		beforeMatch: text.slice(start, matchIndex),
		match: text.slice(matchIndex, matchIndex + matchLength),
		afterMatch: text.slice(matchIndex + matchLength, end),
		suffix: end < text.length ? "…" : "",
	};
}
