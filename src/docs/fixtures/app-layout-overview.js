// Composite fixture: the whole app layout at a glance — Tool Rail on
// the left, Viewport in the middle with a backdrop, Inspector on the
// right, and the Project Status HUD floating inside the viewport.
// Four annotations point at each region so chapter 02's layout intro
// image reads as a labelled map.
//
// Unlike the panel / overlay fixtures that mount a single real
// component, this fixture stitches together simplified stand-ins
// (matching the real class selectors) purely so the overall layout
// reads at a glance. Each pane's actual content is covered by its
// own dedicated fixture (tool-rail, inspector-tabs, first-scene-loaded,
// etc.), so deeply re-mounting each real component here would
// duplicate work without adding docs value.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 960;
const VIEWPORT_HEIGHT = 600;

const STYLE = `
.docs-layout-host {
	position: relative;
	width: ${VIEWPORT_WIDTH}px;
	height: ${VIEWPORT_HEIGHT}px;
	background: #050a13;
	color: #e8ecf1;
	display: grid;
	grid-template-columns: 64px 1fr 320px;
	gap: 12px;
	padding: 16px;
	box-sizing: border-box;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	overflow: hidden;
}
.docs-layout-host__rail {
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 14px;
	background: #10161e;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 10px 4px;
}
.docs-layout-host__rail-item {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.02);
}
.docs-layout-host__rail-item--active {
	border-color: rgba(246, 165, 36, 0.78);
	background: rgba(246, 165, 36, 0.12);
	box-shadow: 0 0 0 1px rgba(246, 165, 36, 0.3);
}
.docs-layout-host__viewport {
	position: relative;
	border-radius: 16px;
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
.docs-layout-host__hud {
	position: absolute;
	top: 14px;
	left: 16px;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	border-radius: 8px;
	background: rgba(4, 10, 18, 0.82);
	border: 1px solid rgba(255, 255, 255, 0.1);
	color: rgba(220, 233, 248, 0.96);
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.04em;
	backdrop-filter: blur(6px);
}
.docs-layout-host__hud-badge {
	padding: 1px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.08em;
	background: rgba(246, 165, 36, 0.22);
	color: rgba(255, 212, 128, 0.98);
}
.docs-layout-host__inspector {
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 14px;
	background: #10161e;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.docs-layout-host__inspector-tabs {
	display: flex;
	gap: 8px;
}
.docs-layout-host__inspector-tab {
	flex: 1;
	height: 36px;
	border-radius: 9px;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
}
.docs-layout-host__inspector-tab--active {
	background: rgba(246, 165, 36, 0.16);
	border-color: rgba(246, 165, 36, 0.72);
}
.docs-layout-host__inspector-section {
	padding: 14px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.02);
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.docs-layout-host__section-title {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.12em;
	color: rgba(198, 216, 236, 0.88);
	text-transform: uppercase;
}
.docs-layout-host__field {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.04);
	font-size: 12px;
	color: rgba(220, 233, 248, 0.86);
}
.docs-layout-host__field-label {
	width: 50px;
	color: rgba(198, 216, 236, 0.7);
	font-size: 11px;
}
.docs-layout-host__field-value {
	flex: 1;
	text-align: right;
	font-variant-numeric: tabular-nums;
	font-weight: 600;
}
`;

const RAIL_ITEMS = [
	{ active: false },
	{ active: false },
	{ active: false },
	{ active: false },
	{ active: true },
	{ active: false },
	{ active: false },
	{ active: false },
	{ active: false },
	{ active: false },
];

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
			label: "Viewport",
			placement: "center",
		},
		{
			n: 2,
			selector: ".workbench-card--tool-rail",
			label: "Tool Rail",
			placement: "center",
		},
		{
			n: 3,
			selector: ".workbench-card--inspector",
			label: "Inspector",
			placement: "center",
		},
		{
			n: 4,
			selector: ".viewport-project-status",
			label: "Project Status HUD",
			placement: "right",
		},
	],
	mount: () => {
		const scene = makeScene("cf-test2-default");
		return html`
			<div class="docs-layout-host">
				<style>${STYLE}</style>
				<aside class="docs-layout-host__rail workbench-card workbench-card--tool-rail">
					${RAIL_ITEMS.map(
						(item, index) => html`
							<div
								key=${index}
								class=${
									item.active
										? "docs-layout-host__rail-item docs-layout-host__rail-item--active"
										: "docs-layout-host__rail-item"
								}
							></div>
						`,
					)}
				</aside>
				<main class="docs-layout-host__viewport">
					<img
						class="docs-layout-host__backdrop"
						src=${scene.backdropUrl}
						alt=${scene.description ?? ""}
					/>
					<div class="docs-layout-host__hud viewport-project-status">
						<span>cf-test2</span>
						<span class="docs-layout-host__hud-badge">PKG</span>
					</div>
				</main>
				<aside class="docs-layout-host__inspector workbench-card workbench-card--inspector">
					<div class="docs-layout-host__inspector-tabs">
						${["scene", "camera", "reference", "export"].map(
							(id) => html`
								<div
									key=${id}
									class=${
										id === "camera"
											? "docs-layout-host__inspector-tab docs-layout-host__inspector-tab--active"
											: "docs-layout-host__inspector-tab"
									}
								></div>
							`,
						)}
					</div>
					<section class="docs-layout-host__inspector-section">
						<div class="docs-layout-host__section-title">Shot Camera</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">焦点距離</span>
							<span class="docs-layout-host__field-value">35 mm</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">位置</span>
							<span class="docs-layout-host__field-value">1.2 / 2.4 / -0.5</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">回転</span>
							<span class="docs-layout-host__field-value">45° / -15° / 0°</span>
						</div>
					</section>
					<section class="docs-layout-host__inspector-section">
						<div class="docs-layout-host__section-title">用紙</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">サイズ</span>
							<span class="docs-layout-host__field-value">1754 × 1240 px</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">アンカー</span>
							<span class="docs-layout-host__field-value">center</span>
						</div>
					</section>
				</aside>
			</div>
		`;
	},
};
