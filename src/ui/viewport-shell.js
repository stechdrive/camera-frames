import { html } from "htm/preact";
import { IS_DEV_RUNTIME, getBuildDebugLabels } from "../build-info.js";
import { FrameLayer } from "./frame-layer.js";

const OUTPUT_FRAME_RESIZE_HANDLES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

const OUTPUT_FRAME_PAN_EDGES = ["top", "right", "bottom", "left"];

export function ViewportShell({ store, controller, refs, t }) {
	const outputFrameLabel = t("section.outputFrame");
	const buildDebugLabels = getBuildDebugLabels();

	return html`
		<main id="viewport-shell" ref=${refs.viewportShellRef} class="viewport-shell">
			<canvas id="viewport" ref=${refs.viewportCanvasRef} tabindex="0"></canvas>
			${
				IS_DEV_RUNTIME &&
				buildDebugLabels.length > 0 &&
				html`
					<div class="viewport-debug-meta">
						${buildDebugLabels.map(
							(label) =>
								html`<code class="viewport-debug-meta__item">${label}</code>`,
						)}
					</div>
				`
			}
			<div id="drop-hint" ref=${refs.dropHintRef} class="drop-hint">
				<strong>${t("drop.title")}</strong>
				<span>${t("drop.body")}</span>
			</div>
			<div id="render-box" ref=${refs.renderBoxRef} class="render-box">
				<${FrameLayer}
					store=${store}
					controller=${controller}
					frameOverlayCanvasRef=${refs.frameOverlayCanvasRef}
				/>
				${OUTPUT_FRAME_RESIZE_HANDLES.map(
					(handle) => html`
						<button
							type="button"
							class=${`render-box__resize-handle render-box__resize-handle--${handle}`}
							aria-label=${outputFrameLabel}
							onPointerDown=${(event) =>
								controller()?.startOutputFrameResize(handle, event)}
						></button>
					`,
				)}
				${OUTPUT_FRAME_PAN_EDGES.map(
					(edge) => html`
						<button
							type="button"
							class=${`render-box__pan-edge render-box__pan-edge--${edge}`}
							aria-label=${outputFrameLabel}
							onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
						></button>
					`,
				)}
				<div
					id="render-box-meta"
					ref=${refs.renderBoxMetaRef}
					class="render-box__meta"
					onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
				>
					${store.exportSizeLabel.value} · ${store.renderBox.anchor.value}
				</div>
				<div
					id="anchor-dot"
					ref=${refs.anchorDotRef}
					class="render-box__anchor"
				></div>
			</div>
		</main>
	`;
}
