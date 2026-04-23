import { parseMarkdownDocument } from "./markdown-parser.js";

const rawJaChapterSources = import.meta.glob("../../../docs/help/ja/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});

function buildChaptersFromRaw(rawMap) {
	const chapters = [];
	for (const [path, raw] of Object.entries(rawMap)) {
		const match = path.match(/\/([^/]+)\.md$/);
		if (!match) continue;
		const filename = match[1];
		const { frontmatter, blocks } = parseMarkdownDocument(raw);
		const id = typeof frontmatter.id === "string" ? frontmatter.id : filename;
		const section = Number.isFinite(frontmatter.section)
			? frontmatter.section
			: 999;
		const title =
			typeof frontmatter.title === "string" ? frontmatter.title : id;
		chapters.push({
			id,
			filename,
			section,
			title,
			frontmatter,
			blocks,
		});
	}
	chapters.sort((left, right) => left.section - right.section);
	return chapters;
}

const CHAPTERS_BY_LANG = {
	ja: buildChaptersFromRaw(rawJaChapterSources),
};

export function getHelpChapters(lang = "ja") {
	return CHAPTERS_BY_LANG[lang] ?? CHAPTERS_BY_LANG.ja ?? [];
}

export function getHelpChapterById(id, lang = "ja") {
	const chapters = getHelpChapters(lang);
	if (!Array.isArray(chapters) || chapters.length === 0) return null;
	const byId = chapters.find((chapter) => chapter.id === id);
	if (byId) return byId;
	const indexChapter = chapters.find((chapter) => chapter.id === "index");
	if (indexChapter) return indexChapter;
	return chapters[0] ?? null;
}

export function getHelpChapterByFilename(filename, lang = "ja") {
	const chapters = getHelpChapters(lang);
	return chapters.find((chapter) => chapter.filename === filename) ?? null;
}

export function getHelpSupportedLangs() {
	return Object.keys(CHAPTERS_BY_LANG);
}
