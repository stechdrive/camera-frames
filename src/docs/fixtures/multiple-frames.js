// Viewport fixture: camera mode with multiple frame rectangles placed
// inside the render-box to demonstrate a camera-work layout (FRAME A
// through FRAME C). Shares the render-box chrome helper with the
// camera-mode-render-box fixture — see that file for the hybrid-backdrop
// rationale.

import { html } from "htm/preact";
import {
	VIEWPORT_HEIGHT,
	VIEWPORT_WIDTH,
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
export const multipleFramesFixture = {
	id: "multiple-frames",
	type: "viewport",
	title: "Camera mode with multiple frames",
	mount: () => {
		const scene = makeScene("cf-test2-default");
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
							active: false,
							left: "8%",
							top: "22%",
							width: "32%",
							height: "56%",
						},
						{
							id: "frame-2",
							label: "B",
							active: true,
							left: "34%",
							top: "12%",
							width: "32%",
							height: "76%",
						},
						{
							id: "frame-3",
							label: "C",
							active: false,
							left: "60%",
							top: "22%",
							width: "32%",
							height: "56%",
						},
					],
				})}
			</div>
		`;
	},
};
