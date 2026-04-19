// Viewport fixture: transform gizmo (move arrows + rotate rings +
// uniform scale handle) over a selected asset. The real
// .viewport-gizmo SVG rings and paths are dynamically generated from
// camera orientation per frame; reproducing that math in a fixture is
// out of scope. Instead the fixture paints a clean "static pose"
// gizmo using the same axis colour palette and CSS classes so the
// image reads as the real tool.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

// Gizmo centre in viewport-host pixel space (sits roughly over the
// motorcycle body in the cf-test2 backdrop).
const CX = 400;
const CY = 310;
// Arrow length / ring radius.
const ARM = 70;
const RING = 90;

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
.docs-gizmo-layer {
	position: absolute;
	inset: 0;
	pointer-events: none;
}
.docs-gizmo-layer svg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	overflow: visible;
}
.docs-gizmo-handle {
	position: absolute;
	transform: translate(-50%, -50%);
	min-width: 26px;
	min-height: 26px;
	padding: 0 8px;
	border-radius: 999px;
	background: rgba(6, 17, 30, 0.94);
	border: 1px solid currentColor;
	color: currentColor;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	letter-spacing: 0.06em;
	font-size: 12px;
}
.docs-gizmo-handle--x { color: #ff5f74; }
.docs-gizmo-handle--y { color: #bddb35; }
.docs-gizmo-handle--z { color: #5ba7ff; }
.docs-gizmo-handle--scale {
	color: rgba(245, 215, 130, 0.98);
	border-color: rgba(245, 215, 130, 0.98);
	background: rgba(40, 28, 8, 0.92);
	border-radius: 6px;
}
`;

/** @type {import("../types").Fixture} */
export const transformGizmoFixture = {
	id: "transform-gizmo",
	type: "viewport",
	title: "Transform gizmo over selected asset",
	mount: () => {
		const scene = makeScene("cf-test2-default");
		// +X points right-down, +Y points up, +Z points toward camera
		// right — this matches a typical near-default orbit pose in
		// Camera mode. Values are tuned by eye against the backdrop.
		const X_END = { x: CX + ARM * 0.95, y: CY + ARM * 0.15 };
		const Y_END = { x: CX - ARM * 0.1, y: CY - ARM * 0.98 };
		const Z_END = { x: CX + ARM * 0.5, y: CY + ARM * 0.75 };
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${scene.backdropUrl}
					alt=${scene.description ?? ""}
				/>
				<div class="docs-gizmo-layer">
					<svg>
						<!-- Rotate rings (ellipses approximating the projected rings) -->
						<ellipse
							cx=${CX}
							cy=${CY}
							rx=${RING}
							ry=${RING * 0.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${CX}
							cy=${CY}
							rx=${RING * 0.32}
							ry=${RING}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${CX}
							cy=${CY}
							rx=${RING * 0.78}
							ry=${RING * 0.78}
							fill="none"
							stroke="#5ba7ff"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<!-- Move arrows -->
						<line
							x1=${CX}
							y1=${CY}
							x2=${X_END.x}
							y2=${X_END.y}
							stroke="#ff5f74"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${CX}
							y1=${CY}
							x2=${Y_END.x}
							y2=${Y_END.y}
							stroke="#bddb35"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${CX}
							y1=${CY}
							x2=${Z_END.x}
							y2=${Z_END.y}
							stroke="#5ba7ff"
							stroke-width="3"
							stroke-linecap="round"
						/>
					</svg>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--x docs-gizmo-handle docs-gizmo-handle--x"
						style=${{ left: `${X_END.x}px`, top: `${X_END.y}px` }}
					>
						X
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--y docs-gizmo-handle docs-gizmo-handle--y"
						style=${{ left: `${Y_END.x}px`, top: `${Y_END.y}px` }}
					>
						Y
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--z docs-gizmo-handle docs-gizmo-handle--z"
						style=${{ left: `${Z_END.x}px`, top: `${Z_END.y}px` }}
					>
						Z
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--scale docs-gizmo-handle docs-gizmo-handle--scale"
						style=${{ left: `${CX}px`, top: `${CY}px` }}
					>
						S
					</span>
				</div>
			</div>
		`;
	},
};
