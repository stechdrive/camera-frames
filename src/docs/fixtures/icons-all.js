// Reference fixture: auto-generated list of every workbench icon.
//
// The icon data is resolved via vite's import.meta.glob at mount time. That
// call is only valid inside a vite transform (dev server / production build);
// it would throw in a plain Node environment. Keeping the glob inside the
// mount body means node test can import this module for metadata inspection
// without triggering the glob.

import { html } from "htm/preact";

const STYLE = `
.docs-icons-all {
	padding: 32px;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-icons-all h1 {
	margin: 0 0 8px 0;
	font-size: 20px;
}
.docs-icons-all p {
	margin: 0 0 24px 0;
	color: #a7afbb;
	font-size: 13px;
}
.docs-icons-all__grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 12px;
	list-style: none;
	margin: 0;
	padding: 0;
}
.docs-icons-all__item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 18px 10px 14px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.02);
}
.docs-icons-all__svg {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #e8ecf1;
}
.docs-icons-all__svg svg {
	width: 100%;
	height: 100%;
}
.docs-icons-all__item code {
	font-size: 11px;
	color: #a7afbb;
	word-break: break-all;
	text-align: center;
}
`;

function collectIcons() {
	// biome-ignore lint/correctness/noUndeclaredVariables: import.meta.glob is injected by Vite
	const iconModules = import.meta.glob("../../ui/svg/*.svg", {
		eager: true,
		query: "?raw",
		import: "default",
	});
	const entries = Object.entries(iconModules)
		.map(([path, rawSvg]) => {
			const match = path.match(/\/([^/]+)\.svg$/i);
			const name = match ? match[1] : null;
			return name && typeof rawSvg === "string"
				? { name, rawSvg }
				: null;
		})
		.filter(Boolean);
	entries.sort((left, right) => left.name.localeCompare(right.name));
	return entries;
}

/** @type {import("../types").Fixture} */
export const iconsAllFixture = {
	id: "icons-all",
	type: "reference",
	title: "All workbench icons",
	mount: ({ lang }) => {
		const entries = collectIcons();
		return html`
			<div class="docs-icons-all">
				<style>${STYLE}</style>
				<h1>All workbench icons (${entries.length})</h1>
				<p>
					Auto-generated from <code>src/ui/svg/*.svg</code>. Language:
					<code>${lang}</code>.
				</p>
				<ul class="docs-icons-all__grid">
					${entries.map(
						(entry) => html`
							<li
								key=${entry.name}
								class="docs-icons-all__item"
								data-icon-name=${entry.name}
							>
								<div
									class="docs-icons-all__svg"
									dangerouslySetInnerHTML=${{ __html: entry.rawSvg }}
								></div>
								<code>${entry.name}</code>
							</li>
						`,
					)}
				</ul>
			</div>
		`;
	},
};
