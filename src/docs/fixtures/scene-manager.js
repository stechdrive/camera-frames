// Panel fixture: the Scene Manager section (Scene tab browser) showing a
// kind-grouped asset list. Chapter 04 §1 introduces the section layout
// (model group + splat group, each with a count pill) so this fixture
// mounts the real SceneBrowserSection with a handful of mock assets.
//
// Asset objects only need the fields SceneBrowserSection reads from them
// (id, kind, label, visible). sceneAssets is passed as a prop rather than
// through mock store to avoid signal auto-tracking churn during capture
// (same rationale as shot-camera-manager.js).

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { SceneBrowserSection } from "../../ui/workbench-browser-sections.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

// The live DOM renders the kind heading ("GLB / モデル") comfortably on a
// single line inside the 318.4 px flex row. During modern-screenshot's
// domToPng clone the flex basis of .browser-group__heading strong is
// recomputed differently and the last character ("ル") gets pushed to a
// second line — a capture-time artifact, not a real-app layout. Pinning
// white-space: nowrap inside the fixture's scope restores parity with the
// real inspector without affecting production CSS.
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
.docs-section-host__card .browser-group__heading strong {
	white-space: nowrap;
}
`;

function makeAsset({ id, kind, label, visible = true }) {
	return { id, kind, label, visible };
}

/** @type {import("../types").Fixture} */
export const sceneManagerFixture = {
	id: "scene-manager",
	type: "panel",
	title: "Scene Manager (kind-grouped asset list)",
	size: { width: 360 },
	mount: ({ lang }) => {
		const sceneAssets = [
			makeAsset({ id: 1, kind: "model", label: "Environment.glb" }),
			makeAsset({ id: 2, kind: "model", label: "Figure.glb" }),
			makeAsset({
				id: 3,
				kind: "splat",
				label: "MainScan.ply",
			}),
			makeAsset({
				id: 4,
				kind: "splat",
				label: "Foreground.spz",
				visible: false,
			}),
			makeAsset({
				id: 5,
				kind: "splat",
				label: "Background.ply",
			}),
		];
		const selectedSceneAsset = sceneAssets[2];
		const store = createMockStore({
			selectedSceneAssetIds: [selectedSceneAsset.id],
			selectedSceneAssetId: selectedSceneAsset.id,
		});
		const controller = createMockController();
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${SceneBrowserSection}
						controller=${() => controller}
						draggedAssetId=${null}
						dragHoverState=${null}
						sceneAssets=${sceneAssets}
						selectedSceneAsset=${selectedSceneAsset}
						setDraggedAssetId=${() => {}}
						setDragHoverState=${() => {}}
						store=${store}
						t=${t}
					/>
				</div>
			</div>
		`;
	},
};
