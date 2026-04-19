// Viewport fixture: the reference-image edit mode overlay — a
// reference image layer with an active selection box showing the
// transform handles (4 edges, 8 resize corners/sides, 8 rotation
// zones, 1 anchor dot). The selection chrome reuses the same
// .frame-item classes as frame layers; positions are hard-coded to a
// plausible rotated rectangle over the cf-test2 backdrop.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

// Selection box geometry inside the viewport (pixel values relative
// to the 800x560 host).
const BOX_LEFT = 200;
const BOX_TOP = 110;
const BOX_WIDTH = 400;
const BOX_HEIGHT = 300;
const BOX_ROTATION_DEG = -4;

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
.docs-reference-image {
	position: absolute;
	background: linear-gradient(
		135deg,
		rgba(246, 165, 36, 0.32),
		rgba(56, 134, 234, 0.32)
	);
	border: 1px dashed rgba(255, 255, 255, 0.28);
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(255, 248, 230, 0.92);
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
	box-shadow: 0 18px 44px rgba(0, 0, 0, 0.38);
}
.docs-viewport-host .frame-item__resize-handle,
.docs-viewport-host .frame-item__edge,
.docs-viewport-host .frame-item__anchor {
	/* The real app only reveals these when selected / active; class
	 * modifiers already apply here, but force opacity in case the
	 * shared styles gate on additional state. */
	opacity: 1;
}
`;

const EDGES = ["top", "right", "bottom", "left"];
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
const ROTATION_ZONES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

/** @type {import("../types").Fixture} */
export const referenceEditModeFixture = {
	id: "reference-edit-mode",
	type: "viewport",
	title: "Reference image edit mode",
	mount: () => {
		const scene = makeScene("cf-test2-default");
		const boxStyle = {
			left: `${BOX_LEFT}px`,
			top: `${BOX_TOP}px`,
			width: `${BOX_WIDTH}px`,
			height: `${BOX_HEIGHT}px`,
			transform: `rotate(${BOX_ROTATION_DEG}deg)`,
			transformOrigin: "50% 50%",
		};
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${scene.backdropUrl}
					alt=${scene.description ?? ""}
				/>
				<div class="reference-image-layer reference-image-layer--front">
					<div
						class="reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive docs-reference-image"
						style=${boxStyle}
					>
						<span>reference image (preview)</span>
					</div>
				</div>
				<div class="reference-image-selection-layer">
					<div
						class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
						data-anchor-handle="center"
						style=${boxStyle}
					>
						${EDGES.map(
							(edge) => html`
								<button
									key=${`edge-${edge}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${edge}`}
									aria-label=${edge}
								></button>
							`,
						)}
						${RESIZE_HANDLES.map(
							(handle) => html`
								<button
									key=${`resize-${handle}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${handle}`}
									aria-label="resize"
								></button>
							`,
						)}
						${ROTATION_ZONES.map(
							(zone) => html`
								<button
									key=${`rotate-${zone}`}
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${zone}`}
									aria-label="rotate"
								></button>
							`,
						)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{ left: "50%", top: "50%" }}
							aria-label="anchor"
						></button>
					</div>
				</div>
			</div>
		`;
	},
};
