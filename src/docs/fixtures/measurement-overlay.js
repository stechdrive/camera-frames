// Viewport fixture: measurement tool overlay — a line between two
// picked world points with a length chip at the midpoint. Mounts the
// real MeasurementOverlay component with a synthesized overlay state
// on top of the cf-test2 backdrop.
//
// Reading store.measurement.* signals during render subscribes the
// fixture stage to them; the overlay values are set here once before
// render so the component sees the intended picked-line state without
// further updates churning the tree.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { MeasurementOverlay } from "../../ui/measurement-overlay.js";
import { makeScene } from "../mock/scenes.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

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
`;

/** @type {import("../types").Fixture} */
export const measurementOverlayFixture = {
	id: "measurement-overlay",
	type: "viewport",
	title: "Measurement overlay (line + chip)",
	mount: ({ lang }) => {
		const scene = makeScene("cf-test2-default");
		const store = createMockStore({
			measurement: {
				active: true,
				startPointWorld: { x: 0, y: 0, z: 0 },
				endPointWorld: { x: 1, y: 0, z: 0 },
				selectedPointKey: "end",
				lengthInputText: "",
				overlay: {
					contextKind: "viewport",
					start: { visible: true, x: 260, y: 360 },
					end: { visible: true, x: 540, y: 300 },
					draftEnd: { visible: false, x: 0, y: 0 },
					lineVisible: true,
					lineUsesDraft: false,
					chip: {
						visible: true,
						x: 400,
						y: 310,
						label: "53.42 cm",
						placement: "above",
					},
					gizmo: {
						visible: false,
						pointKey: null,
						x: 0,
						y: 0,
						handles: {
							x: { visible: false, x: 0, y: 0 },
							y: { visible: false, x: 0, y: 0 },
							z: { visible: false, x: 0, y: 0 },
						},
					},
				},
			},
		});
		const controller = createMockController();
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${scene.backdropUrl}
					alt=${scene.description ?? ""}
				/>
				<${MeasurementOverlay}
					store=${store}
					controller=${() => controller}
					t=${t}
				/>
			</div>
		`;
	},
};
