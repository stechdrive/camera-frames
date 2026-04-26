// Three fixtures sharing the real SplatEditToolbar component with
// different mock states — chapter 02's "splat-edit-toolbar" image shows
// the default box tool hint, and chapter 09's per-splat-* images show
// the same toolbar driven into brush / placed-box states.
//
// viewportToolMode is a real signal while splatEdit.active is derived
// from it (computed), so we override the underlying value rather than
// fighting the computed. The real toolbar is position:absolute inside
// the viewport; the fixture pulls it back into the flow with a scoped
// CSS override so the capture crops tightly.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { SplatEditToolbar } from "../../ui/viewport-shell.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

const STYLE = `
.docs-splat-toolbar-host {
	position: relative;
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-splat-toolbar-host .viewport-splat-edit-toolbar {
	position: relative !important;
	bottom: auto !important;
	left: auto !important;
	right: auto !important;
	margin: 0;
	max-width: none;
}
/* The popover is position:absolute above the toolbar in the real app
 * (bottom:100%). domToPng only captures what lives inside the stage's
 * bounding rect, so pull the popover back in-flow above the bar and
 * let the container height grow naturally. */
.docs-splat-toolbar-host .viewport-splat-edit-popover {
	position: relative !important;
	bottom: auto !important;
	left: auto !important;
	transform: none !important;
	margin-bottom: 0.4rem;
	align-self: center;
}
`;

function renderToolbarHost(store, lang) {
	const controller = createMockController();
	const t = (key, params) => translate(lang, key, params);
	return html`
		<div class="docs-splat-toolbar-host">
			<style>${STYLE}</style>
			<${SplatEditToolbar}
				store=${store}
				controller=${() => controller}
				t=${t}
			/>
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const splatEditToolbarFixture = {
	id: "splat-edit-toolbar",
	type: "overlay",
	title: "Splat edit toolbar (box tool, unplaced)",
	mount: ({ lang }) => {
		const store = createMockStore({
			viewportToolMode: "splat-edit",
		});
		return renderToolbarHost(store, lang);
	},
};

/** @type {import("../types").Fixture} */
export const perSplatBrushPreviewFixture = {
	id: "per-splat-brush-preview",
	type: "overlay",
	title: "Splat edit toolbar (brush tool)",
	mount: ({ lang }) => {
		const store = createMockStore({
			viewportToolMode: "splat-edit",
			splatEdit: {
				tool: "brush",
				brushSize: 30,
				brushDepthMode: "depth",
				brushDepth: 0.2,
			},
		});
		return renderToolbarHost(store, lang);
	},
};

/** @type {import("../types").Fixture} */
export const perSplatBoxToolFixture = {
	id: "per-splat-box-tool",
	type: "overlay",
	title: "Splat edit toolbar (box tool, placed)",
	mount: ({ lang }) => {
		const store = createMockStore({
			viewportToolMode: "splat-edit",
			splatEdit: {
				tool: "box",
				boxPlaced: true,
				boxCenter: { x: 0.5, y: 1.2, z: -0.3 },
				boxSize: { x: 1.0, y: 0.6, z: 1.4 },
				boxRotation: { x: 0, y: 0, z: 0, w: 1 },
				selectionCount: 12345,
			},
		});
		return renderToolbarHost(store, lang);
	},
};

/** @type {import("../types").Fixture} */
export const perSplatEditToolbarFixture = {
	id: "per-splat-edit-toolbar",
	type: "overlay",
	title: "Splat edit toolbar (annotated)",
	// Each group sits at an odd nth-of-type because separators (also
	// divs) are interleaved between them. The legacy scenario used
	// nth-of-type(1/2/3) which silently mis-matched two of the three
	// groups; corrected here to (1/3/5).
	annotations: [
		{
			n: 1,
			selector:
				".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)",
			label: "Tool 選択",
		},
		{
			n: 2,
			selector:
				".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)",
			label: "選択操作",
		},
		{
			n: 3,
			selector:
				".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)",
			label: "編集アクション",
		},
		{
			n: 4,
			// Scope to the bar so the selector doesn't match the popover
			// placeholder hint that also carries `.__info`.
			selector:
				".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info",
			label: "選択数",
		},
	],
	mount: ({ lang }) => {
		const store = createMockStore({
			viewportToolMode: "splat-edit",
			splatEdit: {
				tool: "box",
				selectionCount: 42,
			},
		});
		return renderToolbarHost(store, lang);
	},
};
