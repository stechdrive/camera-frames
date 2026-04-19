// Panel fixture: the Display Zoom section of the Camera tab in isolation.
//
// Mounts the real ShotCameraPropertiesSection sibling `DisplayZoomSection`
// against a fresh mock store and a Proxy-backed mock controller. The fixture
// is a scaled-down stand-in for the "camera view zoom" field shown in
// docs/help/ja/05-shot-camera.md.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { DisplayZoomSection } from "../../ui/workbench-camera-export-sections.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

const STYLE = `
.docs-section-host {
	padding: 32px;
	display: flex;
	justify-content: center;
	background: #08111d;
	min-height: 100vh;
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

/** @type {import("../types").Fixture} */
export const sectionDisplayZoomFixture = {
	id: "section-display-zoom",
	type: "panel",
	title: "Display Zoom section",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore();
		const controller = createMockController();
		const t = (key) => translate(lang, key);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${DisplayZoomSection}
						store=${store}
						controller=${() => controller}
						t=${t}
					/>
				</div>
			</div>
		`;
	},
};
