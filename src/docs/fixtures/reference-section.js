// Two fixtures that reuse the real ReferenceSection component with
// different mock states to match chapter 07's two image ids:
//   - reference-presets: multiple presets, no items (focus on preset row)
//   - reference-manager: populated item list (focus on the item table)
//
// See section-display-zoom.js for the rationale behind mounting real UI
// components via the browser-only registry split.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { ReferenceSection } from "../../ui/workbench-reference-sections.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

// modern-screenshot's domToPng re-layouts flex children during the
// clone step and sometimes wraps short button labels mid-word (e.g.
// "下絵を非表示" breaks after "表"). The live DOM renders each button
// on a single line in the 297 px .button-row, so pin white-space:
// nowrap inside the fixture scope to restore capture-time parity with
// the real panel — production CSS is untouched.
const STYLE = `
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`;

function makePreset(id, name) {
	return { id, name, itemRefs: [] };
}

function makeItem({ id, name, fileName, group, order }) {
	return {
		id,
		assetId: `asset-${id}`,
		name,
		fileName,
		group,
		order,
		previewVisible: true,
		exportEnabled: true,
		opacity: 1,
		scalePct: 100,
		rotationDeg: 0,
		offsetPx: { x: 0, y: 0 },
		anchor: { ax: 0.5, ay: 0.5 },
	};
}

function renderReferenceSection(store, lang) {
	const controller = createMockController();
	const t = (key, params) => translate(lang, key, params);
	return html`
		<div class="docs-section-host">
			<style>${STYLE}</style>
			<div class="docs-section-host__card">
				<${ReferenceSection}
					store=${store}
					controller=${() => controller}
					t=${t}
					open=${true}
				/>
			</div>
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const referencePresetsFixture = {
	id: "reference-presets",
	type: "panel",
	title: "Reference Presets row",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore({
			referenceImages: {
				presets: [
					makePreset("reference-preset-blank", "(blank)"),
					makePreset("reference-preset-outdoor", "屋外ロケハン"),
					makePreset("reference-preset-storyboard", "コンテ A"),
				],
				panelPresetId: "reference-preset-outdoor",
				items: [],
			},
		});
		return renderReferenceSection(store, lang);
	},
};

/** @type {import("../types").Fixture} */
export const referenceManagerFixture = {
	id: "reference-manager",
	type: "panel",
	title: "Reference Manager list",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore({
			referenceImages: {
				presets: [makePreset("reference-preset-blank", "(blank)")],
				panelPresetId: "reference-preset-blank",
				items: [
					makeItem({
						id: "ref-1",
						name: "Layout",
						fileName: "layout.png",
						group: "front",
						order: 0,
					}),
					makeItem({
						id: "ref-2",
						name: "Rough Sketch",
						fileName: "rough.png",
						group: "back",
						order: 1,
					}),
					makeItem({
						id: "ref-3",
						name: "Pose Reference",
						fileName: "pose-reference.jpg",
						group: "front",
						order: 2,
					}),
				],
			},
		});
		return renderReferenceSection(store, lang);
	},
};
