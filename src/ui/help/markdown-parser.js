// Lightweight Markdown + frontmatter parser tailored to docs/help/ja/*.md.
// Not a general-purpose CommonMark implementation.
//
// Supported:
// - Frontmatter: scalars, nested objects, arrays of scalars, arrays of objects,
//   inline `{ key: value, ... }` and `[ a, b ]` literals.
// - Body blocks: heading (#–######), paragraph, fenced code (```), hr (---),
//   unordered list, ordered list, table (|...|), blockquote (>).
// - Inline: **bold**, *italic*, `code`, [text](href), ![alt](src), {{icon:name}}.

const FRONTMATTER_FENCE = "---";

export function parseMarkdownDocument(raw) {
	const normalized = String(raw ?? "").replace(/\r\n/g, "\n");
	const { frontmatter, body } = splitFrontmatter(normalized);
	const blocks = parseBlocks(body);
	return { frontmatter, blocks };
}

function splitFrontmatter(normalized) {
	if (!normalized.startsWith(`${FRONTMATTER_FENCE}\n`)) {
		return { frontmatter: {}, body: normalized };
	}
	const rest = normalized.slice(FRONTMATTER_FENCE.length + 1);
	const end = rest.indexOf(`\n${FRONTMATTER_FENCE}`);
	if (end === -1) {
		return { frontmatter: {}, body: normalized };
	}
	const yamlText = rest.slice(0, end);
	const body = rest.slice(end + FRONTMATTER_FENCE.length + 1).replace(/^\n/, "");
	return { frontmatter: parseFrontmatter(yamlText), body };
}

export function parseFrontmatter(yamlText) {
	const lines = String(yamlText ?? "").split("\n");
	const { value } = parseYamlBlock(lines, 0, 0);
	return value ?? {};
}

function parseYamlBlock(lines, startLine, indent) {
	let i = startLine;
	while (i < lines.length && lines[i].trim() === "") i++;
	if (i >= lines.length) return { value: {}, nextLine: i };
	const line = lines[i];
	const lineIndent = getIndent(line);
	if (lineIndent < indent) return { value: {}, nextLine: i };
	const content = line.slice(indent);
	if (content.startsWith("- ") || content === "-") {
		return parseYamlArray(lines, startLine, indent);
	}
	return parseYamlObject(lines, startLine, indent);
}

function parseYamlObject(lines, startLine, indent) {
	const result = {};
	let i = startLine;
	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === "") {
			i++;
			continue;
		}
		const lineIndent = getIndent(line);
		if (lineIndent < indent) break;
		if (lineIndent > indent) {
			i++;
			continue;
		}
		const content = line.slice(indent);
		const match = content.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
		if (!match) {
			i++;
			continue;
		}
		const key = match[1];
		const rawValue = match[2];
		if (rawValue.trim() === "") {
			const inner = parseYamlBlock(lines, i + 1, indent + 2);
			result[key] = inner.value;
			i = inner.nextLine;
		} else {
			result[key] = parseScalar(rawValue);
			i++;
		}
	}
	return { value: result, nextLine: i };
}

function parseYamlArray(lines, startLine, indent) {
	const result = [];
	let i = startLine;
	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === "") {
			i++;
			continue;
		}
		const lineIndent = getIndent(line);
		if (lineIndent < indent) break;
		if (lineIndent > indent) {
			i++;
			continue;
		}
		const content = line.slice(indent);
		if (!(content.startsWith("- ") || content === "-")) break;
		const itemContent = content === "-" ? "" : content.slice(2);
		if (itemContent.trim() === "") {
			const inner = parseYamlBlock(lines, i + 1, indent + 2);
			result.push(inner.value);
			i = inner.nextLine;
			continue;
		}
		const kv = itemContent.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
		if (kv) {
			const obj = {};
			const firstKey = kv[1];
			const firstRaw = kv[2];
			if (firstRaw.trim() === "") {
				const inner = parseYamlBlock(lines, i + 1, indent + 2);
				obj[firstKey] = inner.value;
				i = inner.nextLine;
			} else {
				obj[firstKey] = parseScalar(firstRaw);
				i++;
			}
			while (i < lines.length) {
				const line2 = lines[i];
				if (line2.trim() === "") {
					i++;
					continue;
				}
				const l2Indent = getIndent(line2);
				if (l2Indent < indent + 2) break;
				if (l2Indent !== indent + 2) {
					i++;
					continue;
				}
				const inner2 = line2.slice(indent + 2);
				if (inner2.startsWith("- ")) break;
				const m2 = inner2.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
				if (!m2) break;
				const key2 = m2[1];
				const raw2 = m2[2];
				if (raw2.trim() === "") {
					const innerBlock = parseYamlBlock(lines, i + 1, indent + 4);
					obj[key2] = innerBlock.value;
					i = innerBlock.nextLine;
				} else {
					obj[key2] = parseScalar(raw2);
					i++;
				}
			}
			result.push(obj);
		} else {
			result.push(parseScalar(itemContent));
			i++;
		}
	}
	return { value: result, nextLine: i };
}

function getIndent(line) {
	const match = line.match(/^(\s*)/);
	return match ? match[1].length : 0;
}

function parseScalar(raw) {
	const trimmed = String(raw ?? "").trim();
	if (trimmed === "" || trimmed === "null" || trimmed === "~") return null;
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
	if (/^-?\d+\.\d+$/.test(trimmed)) return Number.parseFloat(trimmed);
	const quoted = trimmed.match(/^"(.*)"$/) || trimmed.match(/^'(.*)'$/);
	if (quoted) return quoted[1];
	if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
		return parseInlineObject(trimmed.slice(1, -1));
	}
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		return parseInlineArray(trimmed.slice(1, -1));
	}
	return trimmed;
}

function parseInlineObject(content) {
	const parts = splitTopLevelCommas(content);
	const obj = {};
	for (const part of parts) {
		const match = part.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/);
		if (match) obj[match[1]] = parseScalar(match[2]);
	}
	return obj;
}

function parseInlineArray(content) {
	return splitTopLevelCommas(content).map((part) => parseScalar(part.trim()));
}

function splitTopLevelCommas(content) {
	const parts = [];
	let depth = 0;
	let inQuote = null;
	let current = "";
	for (const ch of content) {
		if (inQuote) {
			current += ch;
			if (ch === inQuote) inQuote = null;
			continue;
		}
		if (ch === '"' || ch === "'") {
			inQuote = ch;
			current += ch;
			continue;
		}
		if (ch === "{" || ch === "[") {
			depth++;
			current += ch;
			continue;
		}
		if (ch === "}" || ch === "]") {
			depth--;
			current += ch;
			continue;
		}
		if (ch === "," && depth === 0) {
			parts.push(current);
			current = "";
			continue;
		}
		current += ch;
	}
	if (current.trim()) parts.push(current);
	return parts;
}

// ---------------- Body blocks ---------------- //

export function parseBlocks(body) {
	const lines = String(body ?? "").split("\n");
	const blocks = [];
	let i = 0;
	while (i < lines.length) {
		if (lines[i].trim() === "") {
			i++;
			continue;
		}
		if (lines[i].startsWith("```")) {
			const lang = lines[i].slice(3).trim();
			const codeLines = [];
			i++;
			while (i < lines.length && !lines[i].startsWith("```")) {
				codeLines.push(lines[i]);
				i++;
			}
			if (i < lines.length) i++;
			blocks.push({ type: "code", lang, content: codeLines.join("\n") });
			continue;
		}
		const headingMatch = lines[i].match(/^(#{1,6})\s+(.*)$/);
		if (headingMatch) {
			blocks.push({
				type: "heading",
				level: headingMatch[1].length,
				content: headingMatch[2].trim(),
			});
			i++;
			continue;
		}
		if (/^\s*(-{3,}|={3,}|_{3,})\s*$/.test(lines[i])) {
			blocks.push({ type: "hr" });
			i++;
			continue;
		}
		if (lines[i].startsWith("> ") || lines[i] === ">") {
			const quoteLines = [];
			while (
				i < lines.length &&
				(lines[i].startsWith("> ") ||
					lines[i] === ">" ||
					lines[i].startsWith(">"))
			) {
				if (lines[i].startsWith("> ")) quoteLines.push(lines[i].slice(2));
				else if (lines[i] === ">") quoteLines.push("");
				else quoteLines.push(lines[i].slice(1));
				i++;
			}
			blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
			continue;
		}
		if (isTableHeader(lines, i)) {
			const header = parseTableRow(lines[i]);
			i += 2;
			const rows = [];
			while (i < lines.length && isTableRow(lines[i])) {
				rows.push(parseTableRow(lines[i]));
				i++;
			}
			blocks.push({ type: "table", header, rows });
			continue;
		}
		const listMatch = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
		if (listMatch) {
			const ordered = /\d+\./.test(listMatch[2]);
			const items = [];
			while (i < lines.length) {
				const line = lines[i];
				const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
				if (!match) {
					if (line.trim() === "") {
						if (
							i + 1 < lines.length &&
							/^(\s*)([-*+]|\d+\.)\s+/.test(lines[i + 1])
						) {
							i++;
							continue;
						}
					}
					break;
				}
				items.push({ content: match[3] });
				i++;
			}
			blocks.push({ type: "list", ordered, items });
			continue;
		}
		const paragraphLines = [];
		while (
			i < lines.length &&
			lines[i].trim() !== "" &&
			!isBlockStart(lines, i)
		) {
			paragraphLines.push(lines[i]);
			i++;
		}
		if (paragraphLines.length > 0) {
			blocks.push({ type: "paragraph", content: paragraphLines.join(" ") });
		}
	}
	return blocks;
}

function isBlockStart(lines, i) {
	const line = lines[i];
	if (!line) return false;
	if (line.startsWith("```")) return true;
	if (/^#{1,6}\s+/.test(line)) return true;
	if (/^\s*(-{3,}|={3,}|_{3,})\s*$/.test(line)) return true;
	if (line.startsWith("> ") || line === ">") return true;
	if (isTableHeader(lines, i)) return true;
	if (/^(\s*)([-*+]|\d+\.)\s+/.test(line)) return true;
	return false;
}

function isTableHeader(lines, i) {
	const line = lines[i];
	if (!isTableRow(line)) return false;
	const next = lines[i + 1];
	if (typeof next !== "string") return false;
	return /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(next);
}

function isTableRow(line) {
	if (typeof line !== "string") return false;
	const trimmed = line.trim();
	return trimmed.startsWith("|") && trimmed.endsWith("|");
}

function parseTableRow(line) {
	const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
	return trimmed.split("|").map((cell) => cell.trim());
}

// ---------------- Inline ---------------- //

export function tokenizeInline(text) {
	const source = String(text ?? "");
	const tokens = [];
	let buffer = "";
	const flushBuffer = () => {
		if (buffer) {
			tokens.push({ type: "text", content: buffer });
			buffer = "";
		}
	};
	let i = 0;
	while (i < source.length) {
		const ch = source[i];
		if (ch === "!" && source[i + 1] === "[") {
			const match = source.slice(i).match(/^!\[([^\]]*)\]\(([^)]+)\)/);
			if (match) {
				flushBuffer();
				tokens.push({ type: "image", alt: match[1], src: match[2] });
				i += match[0].length;
				continue;
			}
		}
		if (ch === "[") {
			const match = source.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
			if (match) {
				flushBuffer();
				tokens.push({ type: "link", text: match[1], href: match[2] });
				i += match[0].length;
				continue;
			}
		}
		if (ch === "*" && source[i + 1] === "*") {
			const end = source.indexOf("**", i + 2);
			if (end > -1) {
				flushBuffer();
				tokens.push({ type: "bold", content: source.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}
		if (ch === "*") {
			const end = source.indexOf("*", i + 1);
			if (end > -1) {
				flushBuffer();
				tokens.push({ type: "italic", content: source.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}
		if (ch === "`") {
			const end = source.indexOf("`", i + 1);
			if (end > -1) {
				flushBuffer();
				tokens.push({ type: "code", content: source.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}
		if (source.startsWith("{{icon:", i)) {
			const end = source.indexOf("}}", i + 7);
			if (end > -1) {
				flushBuffer();
				tokens.push({ type: "icon", name: source.slice(i + 7, end).trim() });
				i = end + 2;
				continue;
			}
		}
		buffer += ch;
		i++;
	}
	flushBuffer();
	return tokens;
}
