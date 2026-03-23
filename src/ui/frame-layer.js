import { html } from "htm/preact";
import { BASE_FRAME } from "../constants.js";
import {
	getFrameAnchorHandleKey,
	getFrameAnchorLocalNormalized,
} from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";

const FRAME_RESIZE_HANDLES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

const FRAME_ROTATION_ZONES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

export function FrameLayer({ store, controller, frameOverlayCanvasRef }) {
	const exportWidth = store.exportWidth.value;
	const exportHeight = store.exportHeight.value;
	const activeFrameId = store.frames.activeId.value;
	const frameSelectionActive = store.frames.selectionActive.value;

	return html`
		<div class="frame-layer">
			<canvas
				id="frame-overlay-canvas"
				ref=${frameOverlayCanvasRef}
				class="frame-layer__canvas"
			></canvas>
			${store.frames.documents.value.map((frame) => {
				const frameScale = Number(frame.scale) > 0 ? frame.scale : 1;
				const frameWidthPercent =
					(BASE_FRAME.width * frameScale * 100) / exportWidth;
				const frameHeightPercent =
					(BASE_FRAME.height * frameScale * 100) / exportHeight;
				const selectedFrame =
					frameSelectionActive && activeFrameId === frame.id;
				const frameRotationRadians = ((frame.rotation ?? 0) * Math.PI) / 180;
				const frameAnchor = getFrameAnchorLocalNormalized(
					frame,
					{
						width: BASE_FRAME.width * frameScale,
						height: BASE_FRAME.height * frameScale,
						rotationRadians: frameRotationRadians,
					},
					{
						boxWidth: exportWidth,
						boxHeight: exportHeight,
					},
				);
				const frameAnchorHandle = getFrameAnchorHandleKey(frameAnchor);

				return html`
					<div
						class=${
							selectedFrame ? "frame-item frame-item--selected" : "frame-item"
						}
						data-anchor-handle=${frameAnchorHandle}
						style=${{
							left: `${frame.x * 100 - frameWidthPercent * 0.5}%`,
							top: `${frame.y * 100 - frameHeightPercent * 0.5}%`,
							width: `${frameWidthPercent}%`,
							height: `${frameHeightPercent}%`,
							transform: `rotate(${frame.rotation ?? 0}deg)`,
							transformOrigin: "center center",
						}}
					>
						<span class="frame-item__label">${frame.name}</span>
						<button
							type="button"
							class="frame-item__edge frame-item__edge--top"
							aria-label=${frame.name}
							onPointerDown=${(event) =>
								controller()?.startFrameDrag(frame.id, event)}
						></button>
						<button
							type="button"
							class="frame-item__edge frame-item__edge--right"
							aria-label=${frame.name}
							onPointerDown=${(event) =>
								controller()?.startFrameDrag(frame.id, event)}
						></button>
						<button
							type="button"
							class="frame-item__edge frame-item__edge--bottom"
							aria-label=${frame.name}
							onPointerDown=${(event) =>
								controller()?.startFrameDrag(frame.id, event)}
						></button>
						<button
							type="button"
							class="frame-item__edge frame-item__edge--left"
							aria-label=${frame.name}
							onPointerDown=${(event) =>
								controller()?.startFrameDrag(frame.id, event)}
						></button>
						${FRAME_RESIZE_HANDLES.map(
							(handle) => html`
								<button
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${handle}`}
									style=${{
										cursor: getFrameResizeCursorCss(
											frame.rotation ?? 0,
											handle,
										),
									}}
									aria-label=${frame.name}
									onPointerDown=${(event) =>
										controller()?.startFrameResize(frame.id, handle, event)}
								></button>
							`,
						)}
						${FRAME_ROTATION_ZONES.map(
							(zone) => html`
								<button
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${zone}`}
									style=${{
										cursor: getFrameRotateCursorCss(frame.rotation ?? 0, zone),
									}}
									aria-label=${frame.name}
									onPointerDown=${(event) =>
										controller()?.startFrameRotate(frame.id, zone, event)}
								></button>
							`,
						)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{
								left: `${frameAnchor.x * 100}%`,
								top: `${frameAnchor.y * 100}%`,
							}}
							aria-label=${frame.name}
							onPointerDown=${(event) =>
								controller()?.startFrameAnchorDrag(frame.id, event)}
						></button>
					</div>
				`;
			})}
		</div>
	`;
}
