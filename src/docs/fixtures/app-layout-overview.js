import { html } from "htm/preact";
import { getAnchorOptions, translate } from "../../i18n.js";
import { ViewportProjectStatusHud } from "../../ui/viewport-project-status-hud.js";
import {
	OutputFrameSection,
	ShotCameraPropertiesSection,
} from "../../ui/workbench-camera-export-sections.js";
import {
	InspectorTabs,
	ToolRailSection,
} from "../../ui/workbench-rail-sections.js";
import { createMockController } from "../mock/controller.js";
import { makeScene } from "../mock/scenes.js";
import { createMockStore } from "../mock/store.js";

const STAGE_WIDTH = 960;
const STAGE_HEIGHT = 600;

const STYLE = `
.docs-layout-host {
	position: relative;
	width: ${STAGE_WIDTH}px;
	height: ${STAGE_HEIGHT}px;
	background: #050a13;
	color: #e8ecf1;
	box-sizing: border-box;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	overflow: hidden;
}
.docs-layout-host__rail-wrap {
	position: absolute;
	left: 16px;
	top: 16px;
	z-index: 12;
	pointer-events: auto;
}
.docs-layout-host__rail-wrap .workbench-card--tool-rail {
	position: relative;
	width: 3.55rem;
	padding: 0.45rem;
	border-radius: 22px;
	cursor: default;
}
.docs-layout-host__rail-wrap .workbench-tool-rail {
	flex-direction: column;
	flex-wrap: nowrap;
	align-items: center;
	width: 100%;
}
.docs-layout-host__rail-wrap .workbench-tool-rail__group {
	flex-direction: column;
	width: 100%;
}
.docs-layout-host__rail-wrap .workbench-tool-rail__divider {
	width: 100%;
	height: 1px;
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0) 0%,
		rgba(255, 255, 255, 0.16) 25%,
		rgba(255, 255, 255, 0.16) 75%,
		rgba(255, 255, 255, 0) 100%
	);
}
.docs-layout-host__viewport {
	position: relative;
	position: absolute;
	left: 92px;
	top: 16px;
	right: 356px;
	bottom: 16px;
	border-radius: 14px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: #04070c;
}
.docs-layout-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-layout-host__inspector {
	position: absolute;
	top: 16px;
	right: 16px;
	bottom: 16px;
	width: 324px;
	z-index: 11;
	box-sizing: border-box;
	overflow: hidden;
}
.docs-layout-host__inspector.workbench-card--inspector {
	width: 324px;
	height: calc(100% - 32px);
	max-height: none;
	padding: 0.55rem;
	overflow: hidden;
}
.docs-layout-host__inspector .workbench-inspector-stack {
	overflow: hidden;
	max-height: 482px;
}
.docs-layout-host__inspector .workbench-inspector-stack--split {
	grid-template-columns: 1fr;
	gap: 0.5rem;
}
.docs-layout-host__inspector .disclosure-block {
	min-width: 0;
}
.docs-layout-host__viewport .viewport-project-status {
	top: 1rem;
	right: 1rem;
	max-width: calc(100% - 2rem);
}
.docs-layout-host__viewport .viewport-lod-scale__range {
	width: 4.2rem;
	min-width: 4.2rem;
}
.docs-layout-host .tooltip-bubble {
	display: none;
}
`;

/** @type {import("../types").Fixture} */
export const appLayoutOverviewFixture = {
	id: "app-layout-overview",
	type: "composite",
	title: "Full app layout overview",
	annotations: [
		// Large regions can take a centred badge without hiding
		// meaningful content — but the small Project Status HUD chip
		// needs an outside placement so its text stays legible.
		{
			n: 1,
			selector: ".docs-layout-host__viewport",
			label: "ビューポート",
			placement: "center",
		},
		{
			n: 2,
			selector: ".workbench-card--tool-rail",
			label: "ツールレール",
			placement: "center",
		},
		{
			n: 3,
			selector: ".workbench-card--inspector",
			label: "インスペクター",
			placement: "center",
		},
		{
			n: 4,
			selector: ".viewport-project-status",
			label: "プロジェクト状態 HUD",
			placement: "right",
		},
	],
	mount: ({ lang }) => {
		const scene = makeScene("cf-test2-default");
		const store = createMockStore({
			locale: lang,
			project: {
				name: "cf-test2",
				dirty: false,
				packageDirty: true,
			},
			history: {
				canUndo: true,
				canRedo: true,
			},
			shotCamera: {
				positionX: 1.23,
				positionY: 2.45,
				positionZ: -0.5,
				yawDeg: 45,
				pitchDeg: -15,
				rollDeg: 0,
			},
		});
		const controller = createMockController({
			methods: {
				canFitOutputFrameToSafeArea: () => true,
			},
		});
		const t = (key, params) => translate(lang, key, params);
		const projectMenuItems = [
			{
				id: "new-project",
				icon: "plus",
				label: t("menu.newProjectAction"),
				shortcut: "Ctrl+N",
			},
			{
				id: "open-files",
				icon: "folder-open",
				label: t("action.openFiles"),
				shortcut: "Ctrl+O",
			},
			{
				id: "save-project",
				icon: "save",
				label: t("menu.saveWorkingStateAction"),
				shortcut: "Ctrl+S",
			},
			{
				id: "export-project",
				icon: "package",
				label: t("menu.savePackageAction"),
				shortcut: "Ctrl+Shift+S",
			},
		];
		const anchorOptions = getAnchorOptions(lang);
		return html`
			<div class="docs-layout-host">
				<style>${STYLE}</style>
				<div class="docs-layout-host__rail-wrap">
					<section class="workbench-card workbench-card--tool-rail">
						<${ToolRailSection}
							controller=${() => controller}
							mode="camera"
							projectMenuItems=${projectMenuItems}
							showQuickMenu=${true}
							store=${store}
							t=${t}
						/>
					</section>
				</div>
				<main class="docs-layout-host__viewport">
					<img
						class="docs-layout-host__backdrop"
						src=${scene.backdropUrl}
						alt=${scene.description ?? ""}
					/>
					<${ViewportProjectStatusHud}
						store=${store}
						controller=${() => controller}
						t=${t}
					/>
				</main>
				<aside class="docs-layout-host__inspector workbench-card workbench-card--inspector">
					<div class="workbench-inspector-header">
						<${InspectorTabs}
							activeTab="camera"
							setActiveTab=${() => {}}
							t=${t}
						/>
					</div>
					<div class="workbench-inspector-tab-title">
						<strong>${t("section.shotCamera")}</strong>
					</div>
					<div class="workbench-inspector-stack workbench-inspector-stack--split">
						<${ShotCameraPropertiesSection}
							store=${store}
							controller=${() => controller}
							t=${t}
							equivalentMmValue=${store.equivalentMmValue.value}
							fovLabel=${store.fovLabel.value}
							shotCameraClipMode="auto"
							open=${true}
						/>
						<${OutputFrameSection}
							anchorOptions=${anchorOptions}
							controller=${() => controller}
							exportSizeLabel=${store.exportSizeLabel.value}
							heightLabel=${store.heightLabel.value}
							store=${store}
							t=${t}
							widthLabel=${store.widthLabel.value}
							open=${true}
						/>
					</div>
				</aside>
			</div>
		`;
	},
};
