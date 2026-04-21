// Viewport fixture: camera mode with multiple frame rectangles placed
// inside the render-box to demonstrate a camera-work layout (FRAME A
// through FRAME C). Shares the render-box chrome helper with the
// camera-mode-render-box fixture — see that file for the hybrid-backdrop
// rationale.

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

// Frame layout mirrors cf-test2.ssproj / Camera 1 — the canonical
// "tighten up" (TU / zoom-in) shot that ships in the project fixture.
// FRAME A covers the paper (scale 1.0, centred), and FRAME B is a
// smaller inner crop nudged slightly right-down, so the line trajectory
// between centres reads as a push-in onto the motorcycle's cockpit.
// Values are lifted verbatim from the project JSON.
const CF_TEST2_CAMERA_1_FRAMES = [
	{ id: "frame-1", label: "FRAME A", center: { x: 0.5, y: 0.5 }, scale: 1, active: false },
	{
		id: "frame-2",
		label: "FRAME B",
		center: { x: 0.5755, y: 0.5169 },
		scale: 0.5537,
		active: true,
	},
];

function makeFrameRect(frame) {
	const { widthPct, heightPct } = frameSizeForScale(frame.scale);
	return {
		id: frame.id,
		label: frame.label,
		active: frame.active,
		left: `${frame.center.x * 100 - widthPct / 2}%`,
		top: `${frame.center.y * 100 - heightPct / 2}%`,
		width: `${widthPct}%`,
		height: `${heightPct}%`,
	};
}

/** @type {import("../types").Fixture} */
export const multipleFramesFixture = {
	id: "multiple-frames",
	type: "viewport",
	title: "Camera mode with multiple frames (zoom-in / TU)",
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
					frames: CF_TEST2_CAMERA_1_FRAMES.map(makeFrameRect),
				})}
			</div>
		`;
	},
};
