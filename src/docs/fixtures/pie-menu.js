// Overlay fixture: the viewport pie menu, captured in its resting open
// state. The real pie is emitted inline inside ViewportShell alongside
// live viewport refs and dynamic positioning state; recreating that
// entire surface in a fixture is out of scope. Instead this fixture
// calls the same buildViewportPieActions() engine helper to get the
// real action list, then lays out the pie DOM using the same CSS
// classes from app.css so the visuals match the real app.

import { html } from "htm/preact";
import {
	VIEWPORT_PIE_INNER_RADIUS,
	VIEWPORT_PIE_RADIUS,
	buildViewportPieActions,
} from "../../engine/viewport-pie.js";
import { translate } from "../../i18n.js";
import { WorkbenchIcon } from "../../ui/workbench-icons.js";

const PIE_CENTER_X = 240;
const PIE_CENTER_Y = 200;
const HOST_WIDTH = 480;
const HOST_HEIGHT = 400;

const STYLE = `
.docs-pie-host {
	position: relative;
	width: ${HOST_WIDTH}px;
	height: ${HOST_HEIGHT}px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;

function renderPieMenu({ lang, coarse = false }) {
	const t = (key, params) => translate(lang, key, params);
	const actions = buildViewportPieActions({
		mode: "camera",
		t,
		viewportToolMode: "select",
		viewportOrthographic: false,
		referencePreviewSessionVisible: true,
		hasReferenceImages: false,
		frameMaskMode: "off",
	});
	const hovered = actions.find((action) => action.id === "tool-select") ?? null;
	return html`
		<div class="docs-pie-host">
			<style>${STYLE}</style>
			<div
				class=${coarse ? "viewport-pie viewport-pie--coarse" : "viewport-pie"}
				style=${{
					left: `${PIE_CENTER_X}px`,
					top: `${PIE_CENTER_Y}px`,
				}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${hovered?.label ?? t("action.quickMenu")}
					</span>
				</button>
				${actions.map((action) => {
					const offsetX = Math.cos(action.angle) * VIEWPORT_PIE_RADIUS;
					const offsetY = Math.sin(action.angle) * VIEWPORT_PIE_RADIUS;
					const classes = [
						"viewport-pie__item",
						action.id === hovered?.id || action.active
							? "viewport-pie__item--active"
							: "",
						action.disabled ? "viewport-pie__item--disabled" : "",
					]
						.filter(Boolean)
						.join(" ");
					return html`
						<button
							key=${action.id}
							type="button"
							class=${classes}
							style=${{
								left: `${offsetX}px`,
								top: `${offsetY}px`,
							}}
							disabled=${Boolean(action.disabled)}
						>
							<span class="viewport-pie__item-icon">
								<${WorkbenchIcon} name=${action.icon} size=${18} />
							</span>
						</button>
					`;
				})}
			</div>
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const pieMenuFixture = {
	id: "pie-menu",
	type: "overlay",
	title: "Viewport pie menu (open)",
	mount: ({ lang }) => renderPieMenu({ lang, coarse: false }),
};

/** @type {import("../types").Fixture} */
export const pieMenuExpandedFixture = {
	id: "pie-menu-expanded",
	type: "overlay",
	title: "Viewport pie menu (coarse / expanded)",
	mount: ({ lang }) => renderPieMenu({ lang, coarse: true }),
};

// Constants referenced but kept next to STYLE for readability.
void VIEWPORT_PIE_INNER_RADIUS;
