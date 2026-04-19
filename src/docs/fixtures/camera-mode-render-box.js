// Viewport fixture: camera mode showing the render-box (paper frame)
// overlay on top of the splat backdrop, with anchor dot and meta
// label. The real .render-box is positioned dynamically by the
// controller each frame based on the paper projection; this fixture
// hard-codes a plausible centred rectangle over the cf-test2 backdrop
// so the capture is deterministic.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

// Hard-coded render-box placement inside the 800×560 viewport. These
// dimensions are close to what the cf-test2 paper frame projects onto
// that viewport size in a default camera pose.
const BOX_LEFT = 110;
const BOX_TOP = 70;
const BOX_WIDTH = 580;
const BOX_HEIGHT = 420;

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
/* Force render-box chrome visible without the controller's is-selected /
 * is-resize-active toggles. */
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
`;

const RESIZE_HANDLES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

const PAN_EDGES = ["top", "right", "bottom", "left"];

function renderRenderBox({ frames = [], anchorOffset = { left: "50%", top: "50%" } } = {}) {
	return html`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{
				left: `${BOX_LEFT}px`,
				top: `${BOX_TOP}px`,
				width: `${BOX_WIDTH}px`,
				height: `${BOX_HEIGHT}px`,
			}}
		>
			${frames.map(
				(frame) => html`
					<div
						key=${frame.id}
						class=${`frame-item${frame.active ? " frame-item--active" : ""}`}
						style=${{
							left: frame.left,
							top: frame.top,
							width: frame.width,
							height: frame.height,
							border: frame.active
								? "2px solid rgba(255, 190, 70, 0.95)"
								: "2px solid rgba(255, 190, 70, 0.55)",
							boxSizing: "border-box",
							background: "transparent",
						}}
					>
						<span
							style=${{
								position: "absolute",
								top: "4px",
								left: "6px",
								padding: "2px 8px",
								borderRadius: "999px",
								background: "rgba(10, 18, 28, 0.85)",
								color: "rgba(255, 213, 137, 0.96)",
								fontSize: "11px",
								fontWeight: 700,
								letterSpacing: "0.06em",
							}}
						>
							${frame.label}
						</span>
					</div>
				`,
			)}
			${RESIZE_HANDLES.map(
				(handle) => html`
					<button
						key=${`resize-${handle}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${handle}`}
						aria-label="resize"
					></button>
				`,
			)}
			${PAN_EDGES.map(
				(edge) => html`
					<button
						key=${`pan-${edge}`}
						type="button"
						class=${`render-box__pan-edge render-box__pan-edge--${edge}`}
						aria-label="pan"
					></button>
				`,
			)}
			<div
				id="render-box-meta"
				class="render-box__meta"
				style=${{
					position: "absolute",
					top: "-32px",
					right: "0",
					padding: "4px 12px",
					borderRadius: "999px",
					background: "rgba(10, 18, 28, 0.9)",
					color: "rgba(198, 216, 236, 0.95)",
					fontSize: "12px",
					fontWeight: 600,
					letterSpacing: "0.04em",
					pointerEvents: "auto",
				}}
			>
				1754 × 1240 · center
			</div>
			<div
				id="anchor-dot"
				class="render-box__anchor"
				style=${{
					position: "absolute",
					left: anchorOffset.left,
					top: anchorOffset.top,
					transform: "translate(-50%, -50%)",
					width: "10px",
					height: "10px",
					borderRadius: "50%",
					background: "rgba(114, 227, 157, 0.94)",
					boxShadow: "0 0 0 2px rgba(10, 18, 28, 0.6)",
					pointerEvents: "none",
				}}
			></div>
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const cameraModeRenderBoxFixture = {
	id: "camera-mode-render-box",
	type: "viewport",
	title: "Camera mode with render-box overlay",
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
							active: true,
							left: "6%",
							top: "8%",
							width: "88%",
							height: "84%",
						},
					],
				})}
			</div>
		`;
	},
};

export { renderRenderBox, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, BOX_LEFT, BOX_TOP, BOX_WIDTH, BOX_HEIGHT };
