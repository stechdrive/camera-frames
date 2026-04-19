// Viewport fixture: camera mode with a three-frame spline trajectory
// showing the curved path between frame centres and the control
// handles at each node. The real FrameLayer derives the path from
// frame positions and user-placed bezier handles per frame; here the
// path is hand-drawn to match a plausible pan-then-pull configuration
// so the capture stays deterministic.

import { html } from "htm/preact";
import {
	BOX_HEIGHT,
	BOX_LEFT,
	BOX_TOP,
	BOX_WIDTH,
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
.docs-trajectory-layer {
	position: absolute;
	inset: 0;
	pointer-events: none;
}
.docs-trajectory-layer svg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	overflow: visible;
}
.docs-trajectory-path {
	fill: none;
	stroke: rgba(255, 225, 136, 0.95);
	stroke-width: 2.5;
	stroke-linecap: round;
	stroke-linejoin: round;
	filter: drop-shadow(0 0 6px rgba(255, 225, 136, 0.45));
}
.docs-trajectory-handle-line {
	fill: none;
	stroke: rgba(255, 225, 136, 0.55);
	stroke-width: 1.5;
	stroke-dasharray: 4 3;
}
.docs-trajectory-node {
	position: absolute;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 225, 136, 0.96);
	border: 2px solid rgba(40, 28, 8, 0.85);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.48);
}
.docs-trajectory-node--active {
	background: rgba(255, 120, 80, 0.98);
	border-color: rgba(40, 16, 8, 0.88);
}
.docs-trajectory-tangent {
	position: absolute;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 215, 110, 0.88);
	border: 1.5px solid rgba(40, 28, 8, 0.75);
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.38);
}
`;

// Three frame centre points inside the render-box, plus tangent
// offsets that produce a gentle S-curve.
const FRAMES = [
	{
		id: "frame-1",
		label: "A",
		active: false,
		left: 8,
		top: 28,
		width: 22,
		height: 44,
	},
	{
		id: "frame-2",
		label: "B",
		active: true,
		left: 39,
		top: 12,
		width: 22,
		height: 76,
	},
	{
		id: "frame-3",
		label: "C",
		active: false,
		left: 70,
		top: 28,
		width: 22,
		height: 44,
	},
];

// Node / tangent positions in viewport-host pixel space (so the SVG
// path and the absolute-positioned handle dots share the same
// coordinate frame).
const NODE_A = { x: BOX_LEFT + BOX_WIDTH * 0.19, y: BOX_TOP + BOX_HEIGHT * 0.5 };
const NODE_B = { x: BOX_LEFT + BOX_WIDTH * 0.5, y: BOX_TOP + BOX_HEIGHT * 0.5 };
const NODE_C = { x: BOX_LEFT + BOX_WIDTH * 0.81, y: BOX_TOP + BOX_HEIGHT * 0.5 };
const TAN_A_OUT = { x: NODE_A.x + 60, y: NODE_A.y - 70 };
const TAN_B_IN = { x: NODE_B.x - 60, y: NODE_B.y + 70 };
const TAN_B_OUT = { x: NODE_B.x + 60, y: NODE_B.y - 70 };
const TAN_C_IN = { x: NODE_C.x - 60, y: NODE_C.y + 70 };

function frameRect(frame) {
	return {
		id: frame.id,
		label: frame.label,
		active: frame.active,
		left: `${frame.left}%`,
		top: `${frame.top}%`,
		width: `${frame.width}%`,
		height: `${frame.height}%`,
	};
}

/** @type {import("../types").Fixture} */
export const trajectorySplineFixture = {
	id: "trajectory-spline",
	type: "viewport",
	title: "Camera mode with spline trajectory",
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
				${renderRenderBox({ frames: FRAMES.map(frameRect) })}
				<div class="docs-trajectory-layer">
					<svg>
						<path
							class="docs-trajectory-path"
							d=${`M ${NODE_A.x} ${NODE_A.y} C ${TAN_A_OUT.x} ${TAN_A_OUT.y}, ${TAN_B_IN.x} ${TAN_B_IN.y}, ${NODE_B.x} ${NODE_B.y} C ${TAN_B_OUT.x} ${TAN_B_OUT.y}, ${TAN_C_IN.x} ${TAN_C_IN.y}, ${NODE_C.x} ${NODE_C.y}`}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${NODE_A.x}
							y1=${NODE_A.y}
							x2=${TAN_A_OUT.x}
							y2=${TAN_A_OUT.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${TAN_B_IN.x}
							y1=${TAN_B_IN.y}
							x2=${NODE_B.x}
							y2=${NODE_B.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${NODE_B.x}
							y1=${NODE_B.y}
							x2=${TAN_B_OUT.x}
							y2=${TAN_B_OUT.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${TAN_C_IN.x}
							y1=${TAN_C_IN.y}
							x2=${NODE_C.x}
							y2=${NODE_C.y}
						/>
					</svg>
					<span
						class="docs-trajectory-node"
						style=${{ left: `${NODE_A.x}px`, top: `${NODE_A.y}px` }}
					></span>
					<span
						class="docs-trajectory-node docs-trajectory-node--active"
						style=${{ left: `${NODE_B.x}px`, top: `${NODE_B.y}px` }}
					></span>
					<span
						class="docs-trajectory-node"
						style=${{ left: `${NODE_C.x}px`, top: `${NODE_C.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{ left: `${TAN_A_OUT.x}px`, top: `${TAN_A_OUT.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{ left: `${TAN_B_IN.x}px`, top: `${TAN_B_IN.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{ left: `${TAN_B_OUT.x}px`, top: `${TAN_B_OUT.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{ left: `${TAN_C_IN.x}px`, top: `${TAN_C_IN.y}px` }}
					></span>
				</div>
			</div>
		`;
	},
};
