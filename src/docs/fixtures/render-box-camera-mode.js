// Viewport fixture: camera mode showing the render-box overlay with
// four numbered callouts over the resize handle, pan edge, anchor dot
// and meta label. Reuses the renderRenderBox() helper from the sibling
// camera-mode-render-box fixture so the paper frame chrome stays in
// lockstep.

import { html } from "htm/preact";
import {
	VIEWPORT_HEIGHT,
	VIEWPORT_WIDTH,
	frameSizeForScale,
	renderRenderBox,
} from "./camera-mode-render-box.js";
import { makeScene } from "../mock/scenes.js";

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
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
`;

/** @type {import("../types").Fixture} */
export const renderBoxCameraModeFixture = {
	id: "render-box-camera-mode",
	type: "viewport",
	title: "Render-box in camera mode (annotated)",
	annotations: [
		{
			n: 1,
			selector: ".render-box__resize-handle--top-right",
			label: "リサイズハンドル（8 方向）",
		},
		{
			n: 2,
			selector: ".render-box__pan-edge--top",
			label: "パンエッジ（4 辺）",
		},
		{ n: 3, selector: "#anchor-dot", label: "anchor dot" },
		{ n: 4, selector: "#render-box-meta", label: "meta ラベル" },
	],
	mount: () => {
		const scene = makeScene("cf-test2-default");
		const { widthPct, heightPct } = frameSizeForScale(1);
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${scene.backdropUrl}
					alt=${scene.description ?? ""}
				/>
				${renderRenderBox({
					frames: [
						{
							id: "frame-1",
							label: "A",
							active: true,
							left: `${(100 - widthPct) / 2}%`,
							top: `${(100 - heightPct) / 2}%`,
							width: `${widthPct}%`,
							height: `${heightPct}%`,
						},
					],
				})}
			</div>
		`;
	},
};
