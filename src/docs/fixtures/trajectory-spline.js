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
/* Trajectory styling mirrors .frame-trajectory-layer__* in app.css so
 * the capture matches the live spline overlay's palette (warm path,
 * cyan-vs-orange in/out tangent distinction, peach active node). */
.docs-trajectory-path {
	fill: none;
	stroke: rgba(255, 170, 120, 0.92);
	stroke-width: 3.5;
	stroke-linecap: round;
	stroke-linejoin: round;
}
.docs-trajectory-handle-line {
	fill: none;
	stroke-width: 2;
	stroke-dasharray: 10 8;
	filter: drop-shadow(0 0 1px rgba(6, 10, 18, 0.92));
}
.docs-trajectory-handle-line--in {
	stroke: rgba(145, 222, 255, 0.84);
}
.docs-trajectory-handle-line--out {
	stroke: rgba(255, 208, 158, 0.84);
}
.docs-trajectory-node {
	position: absolute;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 121, 88, 0.78);
	border: 2px solid rgba(9, 16, 25, 0.86);
}
.docs-trajectory-node--active {
	background: rgba(255, 225, 190, 0.98);
}
.docs-trajectory-tangent {
	position: absolute;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	border: 2px solid rgba(9, 16, 25, 0.86);
	filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.28));
}
.docs-trajectory-tangent--in {
	background: rgba(46, 118, 154, 0.98);
}
.docs-trajectory-tangent--out {
	background: rgba(163, 92, 34, 0.98);
}
`;

// Frame layout + spline handles mirror cf-test2.ssproj / Camera 3 —
// the canonical spline-trajectory shot that ships in the project
// fixture. FRAME A is paper-scale 1.0 placed so it overflows the
// render-box on the left (real shots frequently do this), FRAME B is
// scale 0.855 up-right. Both nodes have `mirrored` spline handles
// lifted verbatim from the project JSON so the curve matches what the
// app would render for this exact state.
const CF_TEST2_CAMERA_3_FRAMES = [
	{
		id: "frame-1",
		label: "FRAME A",
		center: { x: 0.3933, y: 0.5404 },
		scale: 1,
		active: false,
		// handle offsets in paper-normalised coords (mirrored: in = -out)
		tangent: { in: { x: -0.0874, y: 0.0026 }, out: { x: 0.0874, y: -0.0026 } },
	},
	{
		id: "frame-2",
		label: "FRAME B",
		center: { x: 0.6461, y: 0.4232 },
		scale: 0.8549,
		active: true,
		tangent: { in: { x: -0.077, y: 0.0809 }, out: { x: 0.077, y: -0.0809 } },
	},
];

function paperToPixel(px, py) {
	return { x: BOX_LEFT + BOX_WIDTH * px, y: BOX_TOP + BOX_HEIGHT * py };
}

function buildFrameRect(frame) {
	const { widthPct, heightPct } = frameSizeForScale(frame.scale);
	return {
		id: frame.id,
		label: frame.label,
		active: frame.active,
		left: frame.center.x * 100 - widthPct / 2,
		top: frame.center.y * 100 - heightPct / 2,
		width: widthPct,
		height: heightPct,
	};
}

const FRAMES = CF_TEST2_CAMERA_3_FRAMES.map(buildFrameRect);

// Node + tangent positions in viewport-host pixel space so the SVG
// path and the absolutely-positioned handle dots share one coord
// frame. Tangent offsets are relative to the frame centre, scaled by
// the render-box dimensions.
const NODE_A = paperToPixel(
	CF_TEST2_CAMERA_3_FRAMES[0].center.x,
	CF_TEST2_CAMERA_3_FRAMES[0].center.y,
);
const NODE_B = paperToPixel(
	CF_TEST2_CAMERA_3_FRAMES[1].center.x,
	CF_TEST2_CAMERA_3_FRAMES[1].center.y,
);

function applyHandleOffset(node, offset) {
	return {
		x: node.x + offset.x * BOX_WIDTH,
		y: node.y + offset.y * BOX_HEIGHT,
	};
}

const TAN_A_IN = applyHandleOffset(NODE_A, CF_TEST2_CAMERA_3_FRAMES[0].tangent.in);
const TAN_A_OUT = applyHandleOffset(NODE_A, CF_TEST2_CAMERA_3_FRAMES[0].tangent.out);
const TAN_B_IN = applyHandleOffset(NODE_B, CF_TEST2_CAMERA_3_FRAMES[1].tangent.in);
const TAN_B_OUT = applyHandleOffset(NODE_B, CF_TEST2_CAMERA_3_FRAMES[1].tangent.out);

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
	title: "Camera mode with spline trajectory (cf-test2 Camera 3)",
	mount: () => {
		const scene = makeScene("cf-test2-default");
		// The spline from A to B is the canonical shot's cubic bezier:
		//   M A  C A_out, B_in  B
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
							d=${`M ${NODE_A.x} ${NODE_A.y} C ${TAN_A_OUT.x} ${TAN_A_OUT.y}, ${TAN_B_IN.x} ${TAN_B_IN.y}, ${NODE_B.x} ${NODE_B.y}`}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${TAN_A_IN.x}
							y1=${TAN_A_IN.y}
							x2=${NODE_A.x}
							y2=${NODE_A.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${NODE_A.x}
							y1=${NODE_A.y}
							x2=${TAN_A_OUT.x}
							y2=${TAN_A_OUT.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${TAN_B_IN.x}
							y1=${TAN_B_IN.y}
							x2=${NODE_B.x}
							y2=${NODE_B.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${NODE_B.x}
							y1=${NODE_B.y}
							x2=${TAN_B_OUT.x}
							y2=${TAN_B_OUT.y}
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
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{ left: `${TAN_A_IN.x}px`, top: `${TAN_A_IN.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{ left: `${TAN_A_OUT.x}px`, top: `${TAN_A_OUT.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{ left: `${TAN_B_IN.x}px`, top: `${TAN_B_IN.y}px` }}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{ left: `${TAN_B_OUT.x}px`, top: `${TAN_B_OUT.y}px` }}
					></span>
				</div>
			</div>
		`;
	},
};
