// Viewport fixture: camera mode showing the render-box (paper frame)
// overlay on top of the splat backdrop, with anchor dot and meta
// label. The real .render-box is positioned dynamically by the
// controller each frame based on the paper projection; this fixture
// hard-codes a plausible centred rectangle over the cf-test2 backdrop
// so the capture is deterministic.
//
// Frame geometry matches the real app's contract:
//   - Aspect ratio is fixed at BASE_FRAME.width : BASE_FRAME.height
//     = 1536 : 864 = 16 : 9 (see src/constants.js). Per-frame `scale`
//     multiplies both dimensions uniformly — frames can never become
//     portrait without a 90° rotation, so fixtures must respect that.
//   - Stroke colour is rgba(255, 87, 72, 0.92) (see
//     src/controllers/output-frame/overlay-render.js); the selected
//     overlay dash is rgba(255, 182, 170, 0.98).
//   - Label chip sits above the frame's top-left corner on a red-orange
//     pill with monospace uppercase text (#ffd8d1 on
//     rgba(255, 87, 72, 0.18), see .frame-item__label in app.css).

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

const FRAME_STROKE_COLOR = "rgba(255, 87, 72, 0.92)";
const FRAME_SELECTED_DASH_COLOR = "rgba(255, 182, 170, 0.98)";
const FRAME_LABEL_BG = "rgba(255, 87, 72, 0.18)";
const FRAME_LABEL_FG = "#ffd8d1";

// Frame aspect ratio (16:9) projected into render-box CSS %:
// height% = width% × (BOX_WIDTH / BOX_HEIGHT) × (9 / 16).
const FRAME_HEIGHT_PER_WIDTH_RATIO = (BOX_WIDTH / BOX_HEIGHT) * (9 / 16);

/**
 * Convert a BASE_FRAME scale (0..1) into render-box-relative width / height
 * percentages so fixtures can place frames by "paper-space scale" rather
 * than guessing CSS dimensions that violate the 16:9 aspect contract.
 *   widthPct  = scale × 87.6%  (= 1536 / 1754)
 *   heightPct = scale × 69.7%  (= 864 / 1240)
 */
function frameSizeForScale(scale) {
	return {
		widthPct: scale * (1536 / 1754) * 100,
		heightPct: scale * (864 / 1240) * 100,
	};
}

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

function renderRenderBox({
	frames = [],
	anchorOffset = { left: "50%", top: "50%" },
} = {}) {
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
						class=${`frame-item${frame.active ? " frame-item--active frame-item--selected" : ""}`}
						style=${{
							left: frame.left,
							top: frame.top,
							width: frame.width,
							height: frame.height,
							border: `2px solid ${FRAME_STROKE_COLOR}`,
							boxSizing: "border-box",
							background: "transparent",
							boxShadow: frame.active
								? `inset 0 0 0 1px ${FRAME_SELECTED_DASH_COLOR}`
								: "none",
						}}
					>
						${
							frame.active &&
							html`
							<span
								aria-hidden="true"
								style=${{
									position: "absolute",
									inset: "-1px",
									border: `1px dashed ${FRAME_SELECTED_DASH_COLOR}`,
									borderRadius: "1px",
									pointerEvents: "none",
								}}
							></span>
						`
						}
						<span
							style=${{
								position: "absolute",
								top: "-22px",
								left: "0",
								padding: "2px 9px",
								borderRadius: "999px",
								background: FRAME_LABEL_BG,
								color: FRAME_LABEL_FG,
								fontFamily: '"Consolas", "Andale Mono", monospace',
								fontSize: "11px",
								fontWeight: 600,
								letterSpacing: "0.05em",
								textTransform: "uppercase",
								whiteSpace: "nowrap",
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
		// Single frame at the paper-scale-1 default size (fills the paper
		// up to 87.6% × 69.7%), centred, matching what a newly created
		// shot has before the user resizes it.
		const { widthPct, heightPct } = frameSizeForScale(1);
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
							left: `${(100 - widthPct) / 2}%`,
							top: `${(100 - heightPct) / 2}%`,
							width: `${widthPct}%`,
							height: `${heightPct}%`,
						},
					],
				})}
			</div>
		`;
	},
};

export {
	renderRenderBox,
	frameSizeForScale,
	FRAME_HEIGHT_PER_WIDTH_RATIO,
	FRAME_STROKE_COLOR,
	FRAME_SELECTED_DASH_COLOR,
	VIEWPORT_WIDTH,
	VIEWPORT_HEIGHT,
	BOX_LEFT,
	BOX_TOP,
	BOX_WIDTH,
	BOX_HEIGHT,
};
