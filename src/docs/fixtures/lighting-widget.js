// Panel fixture: the Lighting Direction widget (132 × 132 px, radius 46).
// Chapter 04 §3.1 introduces the circular control that sets azimuth /
// elevation of the key light. Mounts the real LightingDirectionControl
// with the default lighting orientation (azimuth 36.87°, elevation 45°
// — see Reset Lighting defaults in §3.3).
//
// The widget internally uses requestAnimationFrame to poll
// controller.getActiveCameraHeadingDeg(); the mock controller returns
// undefined, which the effect's Number.isFinite guard treats as "no
// update", so capture stays deterministic.

import { html } from "htm/preact";
import { LightingDirectionControl } from "../../ui/workbench-controls.js";
import { createMockController } from "../mock/controller.js";

const STYLE = `
.docs-widget-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-widget-host__card {
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	display: inline-flex;
}
`;

/** @type {import("../types").Fixture} */
export const lightingWidgetFixture = {
	id: "lighting-widget",
	type: "panel",
	title: "Lighting Direction widget",
	mount: () => {
		const controller = createMockController();
		return html`
			<div class="docs-widget-host">
				<style>${STYLE}</style>
				<div class="docs-widget-host__card">
					<${LightingDirectionControl}
						controller=${() => controller}
						azimuthDeg=${36.87}
						elevationDeg=${45}
						viewAzimuthDeg=${0}
						onLiveChange=${() => {}}
					/>
				</div>
			</div>
		`;
	},
};
