// Viewport fixture: the initial "drop a file here" hint shown on an
// empty viewport before any project loads. The real drop-hint DOM lives
// inline inside ViewportShell with a JS-positioned style derived from
// the render-box. For docs purposes the hint placement is static;
// replicate the DOM with the same CSS classes (from styles/workbench.css)
// so a backdrop is not needed — the empty viewport-shell container is
// exactly the intended visual.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

const STYLE = `
.docs-viewport-host {
	position: relative;
	width: ${VIEWPORT_WIDTH}px;
	height: ${VIEWPORT_HEIGHT}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host::before {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 50% 50%, rgba(56, 134, 234, 0.05), transparent 60%);
	pointer-events: none;
}
.docs-viewport-host .drop-hint {
	/* Override the real app's JS-computed inline style so the hint sits
	 * centred inside the mock viewport. */
	position: absolute !important;
	left: 50% !important;
	top: 50% !important;
	transform: translate(-50%, -50%) !important;
}
`;

/** @type {import("../types").Fixture} */
export const dropHintFixture = {
	id: "drop-hint",
	type: "viewport",
	title: "Viewport drop hint (empty project)",
	mount: ({ lang }) => {
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<div class="drop-hint">
					<span class="drop-hint__meta">
						CAMERA_FRAMES docs-fixture
					</span>
					<strong>${t("drop.title")}</strong>
					<span>${t("drop.body")}</span>
					<div class="drop-hint__controls">
						<strong class="drop-hint__controls-title">
							${t("drop.controlsTitle")}
						</strong>
						<div class="drop-hint__controls-grid">
							<span>${t("drop.controlOrbit")}</span>
							<span>${t("drop.controlPan")}</span>
							<span>${t("drop.controlDolly")}</span>
							<span>${t("drop.controlAnchorOrbit")}</span>
						</div>
					</div>
				</div>
			</div>
		`;
	},
};
