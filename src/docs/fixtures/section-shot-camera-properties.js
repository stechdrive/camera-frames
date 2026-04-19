// Panel fixture: the Shot Camera Properties section (Camera tab) in
// isolation. See section-display-zoom.js for the rationale behind mounting
// real UI components via the browser-only registry split.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { ShotCameraPropertiesSection } from "../../ui/workbench-camera-export-sections.js";
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
export const sectionShotCameraPropertiesFixture = {
	id: "section-shot-camera-properties",
	type: "panel",
	title: "Shot Camera Properties section",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore({
			shotCamera: {
				positionX: 1.23,
				positionY: 2.45,
				positionZ: -0.5,
				yawDeg: 45,
				pitchDeg: -15,
				rollDeg: 0,
			},
		});
		const controller = createMockController();
		const t = (key) => translate(lang, key);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${ShotCameraPropertiesSection}
						store=${store}
						controller=${() => controller}
						t=${t}
						equivalentMmValue=${store.equivalentMmValue.value}
						fovLabel=${store.fovLabel.value}
						shotCameraClipMode="auto"
						open=${true}
					/>
				</div>
			</div>
		`;
	},
};
