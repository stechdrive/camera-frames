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
	align-self: stretch;
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
