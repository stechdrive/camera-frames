// Panel fixture: the Shot Camera Manager list (Camera tab) with four
// numbered annotations over the add / duplicate / delete buttons and the
// shot list. First fixture to exercise the declarative annotation DSL
// (see src/docs/types.d.ts FixtureAnnotation and src/docs/docs-app.js
// AnnotationLayer).
//
// Fixes two silently-wrong selectors from the legacy scenario along the
// way: `#add-shot-camera` never existed (the real id is
// `#new-shot-camera`), and `.shot-camera-manager-list` missed the BEM
// double underscore (`.shot-camera-manager__list`).

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { ShotCameraManagerList } from "../../ui/workbench-browser-sections.js";
import { createShotCameraDocument } from "../../workspace-model.js";
import { createMockController } from "../mock/controller.js";

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

/** @type {import("../types").Fixture} */
export const shotCameraManagerFixture = {
	id: "shot-camera-manager",
	type: "panel",
	title: "Shot Camera Manager list",
	size: { width: 360 },
	annotations: [
		{ n: 1, selector: "#new-shot-camera", label: "追加" },
		{ n: 2, selector: "#duplicate-shot-camera", label: "複製" },
		{ n: 3, selector: "#delete-shot-camera", label: "削除" },
		{ n: 4, selector: ".shot-camera-manager__list", label: "shot 一覧" },
	],
	mount: ({ lang }) => {
		// Build three full ShotCameraDocuments from the real factory. Passing
		// them directly as props (rather than going through createMockStore)
		// avoids subscribing this render to signal reads that would churn
		// under preact-signals auto-tracking.
		const baseCamera = createShotCameraDocument({
			id: "shot-camera-1",
			name: "Camera 1",
		});
		const shotCameras = [
			baseCamera,
			createShotCameraDocument({
				id: "shot-camera-2",
				name: "Camera 2",
				source: baseCamera,
			}),
			createShotCameraDocument({
				id: "shot-camera-3",
				name: "Camera 3",
				source: baseCamera,
			}),
		];
		const activeShotCamera = shotCameras[1];
		const controller = createMockController();
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${ShotCameraManagerList}
						activeShotCamera=${activeShotCamera}
						controller=${() => controller}
						shotCameras=${shotCameras}
						t=${t}
					/>
				</div>
			</div>
		`;
	},
};
