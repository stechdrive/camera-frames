import { html } from "htm/preact";
import { WorkbenchIcon } from "../workbench-icons.js";
import { parseBlocks, tokenizeInline } from "./markdown-parser.js";

export function slugify(text) {
	return String(text ?? "")
		.trim()
		.toLowerCase()
		.replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\- ]+/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function renderBlocks(blocks, options = {}) {
	return (blocks ?? []).map((block, index) =>
		renderBlock(block, index, options),
	);
}

function renderBlock(block, index, options) {
	if (!block || typeof block !== "object") return null;
	switch (block.type) {
		case "heading": {
			const id = slugify(block.content);
			const children = renderInline(block.content, options);
			if (block.level === 1) {
				return html`<h1 key=${index} id=${id} class="help-heading help-heading--1">${children}</h1>`;
			}
			if (block.level === 2) {
				return html`<h2 key=${index} id=${id} class="help-heading help-heading--2">${children}</h2>`;
			}
			if (block.level === 3) {
				return html`<h3 key=${index} id=${id} class="help-heading help-heading--3">${children}</h3>`;
			}
			if (block.level === 4) {
				return html`<h4 key=${index} id=${id} class="help-heading help-heading--4">${children}</h4>`;
			}
			if (block.level === 5) {
				return html`<h5 key=${index} id=${id} class="help-heading help-heading--5">${children}</h5>`;
			}
			return html`<h6 key=${index} id=${id} class="help-heading help-heading--6">${children}</h6>`;
		}
		case "paragraph":
			return html`<p key=${index} class="help-paragraph">${renderInline(block.content, options)}</p>`;
		case "code":
			return html`<pre key=${index} class="help-code"><code>${block.content}</code></pre>`;
		case "hr":
			return html`<hr key=${index} class="help-hr"/>`;
		case "blockquote": {
			const innerBlocks = parseBlocks(block.content);
			return html`<blockquote key=${index} class="help-blockquote">${renderBlocks(innerBlocks, options)}</blockquote>`;
		}
		case "list":
			return renderList(block, index, options);
		case "table":
			return renderTable(block, index, options);
		default:
			return null;
	}
}

function renderList(block, index, options) {
	const items = (block.items ?? []).map(
		(item, i) =>
			html`<li key=${i} class="help-list-item">${renderInline(item.content, options)}</li>`,
	);
	if (block.ordered) {
		return html`<ol key=${index} class="help-list help-list--ordered">${items}</ol>`;
	}
	return html`<ul key=${index} class="help-list">${items}</ul>`;
}

function renderTable(block, index, options) {
	return html`
		<div key=${index} class="help-table-wrap">
			<table class="help-table">
				<thead>
					<tr>
						${(block.header ?? []).map(
							(cell, i) =>
								html`<th key=${i}>${renderInline(cell, options)}</th>`,
						)}
					</tr>
				</thead>
				<tbody>
					${(block.rows ?? []).map(
						(row, i) => html`
							<tr key=${i}>
								${row.map(
									(cell, j) =>
										html`<td key=${j}>${renderInline(cell, options)}</td>`,
								)}
							</tr>
						`,
					)}
				</tbody>
			</table>
		</div>
	`;
}

function renderInline(text, options) {
	const tokens = tokenizeInline(text);
	return tokens.map((token, index) => renderInlineToken(token, index, options));
}

function renderInlineToken(token, index, options) {
	switch (token?.type) {
		case "text":
			return token.content;
		case "bold":
			return html`<strong key=${index}>${renderInline(token.content, options)}</strong>`;
		case "italic":
			return html`<em key=${index}>${renderInline(token.content, options)}</em>`;
		case "code":
			return html`<code key=${index} class="help-inline-code">${token.content}</code>`;
		case "link":
			return renderLink(token, index, options);
		case "image":
			return renderImage(token, index, options);
		case "icon":
			return html`<span key=${index} class="help-icon-inline"><${WorkbenchIcon} name=${token.name} size=${14}/></span>`;
		case "variable":
			return resolveInlineVariable(token.name, options);
		default:
			return null;
	}
}

export function resolveInlineVariable(name, options = {}) {
	const value = options.variables?.[name];
	if (value === undefined || value === null) {
		return `{{${name}}}`;
	}
	return String(value);
}

function renderLink(token, index, options) {
	const href = token.href ?? "";
	const internal = resolveInternalLink(href, options);
	if (internal) {
		return html`<a
			key=${index}
			href="#"
			class=${`help-link help-link--internal help-link--${internal.type}`}
			onClick=${(event) => {
				event.preventDefault();
				options.onNavigate?.(internal);
			}}
		>${renderInline(token.text, options)}</a>`;
	}
	return html`<a
		key=${index}
		href=${href}
		target="_blank"
		rel="noopener noreferrer"
		class="help-link help-link--external"
	>${renderInline(token.text, options)}</a>`;
}

function renderImage(token, index, options) {
	const src = resolveImageSrc(token.src, options);
	return html`<img
		key=${index}
		src=${src}
		alt=${token.alt ?? ""}
		class="help-image"
		loading="lazy"
	/>`;
}

function resolveInternalLink(href, options) {
	if (typeof href !== "string" || href === "") return null;
	if (/^(https?:)?\/\//.test(href)) return null;
	if (href.startsWith("mailto:")) return null;
	if (href.startsWith("#")) {
		return { type: "anchor", anchor: href.slice(1) };
	}
	const match = href.match(/^([^#]+?)\.md(?:#(.+))?$/);
	if (!match) return null;
	const filename = match[1].split("/").pop();
	const anchor = match[2] ?? null;
	const chapter = options.findChapterByFilename?.(filename);
	if (!chapter) return null;
	return { type: "chapter", sectionId: chapter.id, anchor };
}

function resolveImageSrc(src, options) {
	if (typeof src !== "string" || src === "") return "";
	if (/^(https?:)?\/\//.test(src)) return src;
	if (src.startsWith("/")) return src;
	let baseAssets = options.assetsBaseUrl ?? "";
	if (baseAssets && src.startsWith("../assets/")) {
		if (!baseAssets.endsWith("/")) baseAssets += "/";
		return baseAssets + src.slice("../assets/".length);
	}
	return src;
}
