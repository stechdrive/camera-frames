// Viewport fixture: the axis gizmo shown in the top-right of the
// viewport when the camera snaps to an orthographic view. The real
// app computes SVG line endpoints and button positions per frame
// based on live camera orientation; for the fixture those values are
// hard-coded to a plausible "looking down +Z" pose so the capture
// stays deterministic. The axis DOM / classes match the real
// ViewportAxisGizmo 1:1.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

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
/* Show the gizmo inside the fixture — the real app toggles .is-hidden
 * via controller logic that this fixture doesn't drive. */
.docs-viewport-host .viewport-axis-gizmo {
	display: block !important;
}
`;

// Hardcoded coords for a "looking down +Z" orthographic pose: X axis
// points right, Y points up, Z points out of the screen (dot at centre).
// All values in the axis gizmo's 100×100 SVG viewBox coordinate space
// for the SVG <line>s, and in percent within the 6rem square gizmo for
// the buttons (matching the default CSS transforms).
const AXIS_SVG_LINES = {
	x: { x2: "92", y2: "50" },
	y: { x2: "50", y2: "8" },
	z: { x2: "50", y2: "50" },
};

const AXIS_BUTTONS = [
	{ key: "pos-x", cls: "positive--x", label: "X", left: "92%", top: "50%" },
	{ key: "pos-y", cls: "positive--y", label: "Y", left: "50%", top: "8%" },
	{ key: "pos-z", cls: "positive--z", label: "Z", left: "50%", top: "50%" },
	{ key: "neg-x", cls: "negative--x", label: "", left: "8%", top: "50%" },
	{ key: "neg-y", cls: "negative--y", label: "", left: "50%", top: "92%" },
	{ key: "neg-z", cls: "negative--z", label: "", left: "50%", top: "50%" },
];

function renderAxisGizmo() {
	return html`
		<div class="viewport-axis-gizmo" aria-label="Viewport Axis Gizmo">
			<svg
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${["x", "y", "z"].map(
					(axis) => html`
						<line
							key=${axis}
							data-axis-gizmo-line=${axis}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${axis}`}
							x1="50"
							y1="50"
							x2=${AXIS_SVG_LINES[axis].x2}
							y2=${AXIS_SVG_LINES[axis].y2}
						/>
					`,
				)}
			</svg>
			${AXIS_BUTTONS.map(
				(btn) => html`
					<button
						key=${btn.key}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--${btn.cls.split("--")[0]} viewport-axis-gizmo__button--${btn.cls.split("--")[1]}`}
						data-axis-gizmo-node=${btn.key}
						aria-label=${btn.label || btn.key}
						style=${{ left: btn.left, top: btn.top }}
					>
						<span>${btn.label}</span>
					</button>
				`,
			)}
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const axisGizmoFixture = {
	id: "axis-gizmo",
	type: "viewport",
	title: "Viewport axis gizmo (orthographic posZ)",
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
				${renderAxisGizmo()}
			</div>
		`;
	},
};
