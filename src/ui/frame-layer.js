import { html } from "htm/preact";
import { BASE_FRAME } from "../constants.js";
import {
	getFrameAnchorHandleKey,
	getFrameAnchorLocalNormalized,
} from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import { translate } from "../i18n.js";
import { FRAME_NAME_MAX_LENGTH } from "../workspace-model.js";
import { TextDraftInput } from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";

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

function getSelectionAnchorHandleKey(anchor) {
	if (
		!Number.isFinite(anchor?.x) ||
		!Number.isFinite(anchor?.y) ||
		anchor.x < 0 ||
		anchor.x > 1 ||
		anchor.y < 0 ||
		anchor.y > 1
	) {
		return "";
	}

	return getFrameAnchorHandleKey(anchor);
}

export function FrameLayer({
	store,
	controller,
	frameOverlayCanvasRef,
	canvasOnly = false,
	itemsOnly = false,
}) {
	const exportWidth = store.exportWidth.value;
	const exportHeight = store.exportHeight.value;
	const locale = store.locale.value;
	const activeFrameId = store.frames.activeId.value;
	const frameSelectionActive = store.frames.selectionActive.value;
	const selectedFrameIds = new Set(store.frames.selectedIds.value ?? []);
	const multiFrameSelection = frameSelectionActive && selectedFrameIds.size > 1;
	const selectedFrameCount = selectedFrameIds.size;
	const selectionBoxLogical = store.frames.selectionBoxLogical.value;
	const selectionAnchor =
		store.frames.selectionAnchor.value &&
		Number.isFinite(store.frames.selectionAnchor.value.x) &&
		Number.isFinite(store.frames.selectionAnchor.value.y)
			? {
					x: store.frames.selectionAnchor.value.x,
					y: store.frames.selectionAnchor.value.y,
				}
			: selectionBoxLogical
				? {
						x: selectionBoxLogical.anchorX ?? 0.5,
						y: selectionBoxLogical.anchorY ?? 0.5,
					}
				: null;

	return html`
		<div
			class=${[
				"frame-layer",
				canvasOnly ? "frame-layer--canvas" : "",
				itemsOnly ? "frame-layer--items" : "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			${
				!itemsOnly &&
				html`
					<canvas
						id="frame-overlay-canvas"
						ref=${frameOverlayCanvasRef}
						class="frame-layer__canvas"
					></canvas>
				`
			}
			${
				!canvasOnly &&
				store.frames.documents.value.map((frame) => {
					const frameScale = Number(frame.scale) > 0 ? frame.scale : 1;
					const frameScaleLabel = `${Math.round(frameScale * 100)}%`;
					const frameWidthPercent =
						(BASE_FRAME.width * frameScale * 100) / exportWidth;
					const frameHeightPercent =
						(BASE_FRAME.height * frameScale * 100) / exportHeight;
					const selectedFrame =
						frameSelectionActive && selectedFrameIds.has(frame.id);
					const activeFrame = selectedFrame && activeFrameId === frame.id;
					const showItemHandles = activeFrame && !multiFrameSelection;
					const showFrameLabel = selectedFrame && !multiFrameSelection;
					const showDeleteButton = selectedFrame && !multiFrameSelection;
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
					const deleteFrameLabel = translate(locale, "action.deleteFrame");
					const renameFrameLabel = translate(locale, "action.renameFrame");

					return html`
						<div
							class=${[
								"frame-item",
								selectedFrame ? "frame-item--selected" : "",
								showItemHandles ? "frame-item--active" : "",
							]
								.filter(Boolean)
								.join(" ")}
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
							${
								showFrameLabel &&
								html`
									<span class="frame-item__label">
										<span class="frame-item__label-text"
											><${TextDraftInput}
												class="frame-item__label-input"
												value=${frame.name}
												aria-label=${renameFrameLabel}
												maxLength=${FRAME_NAME_MAX_LENGTH}
												selectOnFocus=${true}
												onCommit=${(nextValue) =>
													controller()?.setFrameName?.(frame.id, nextValue)}
											/></span
										>
										<span class="frame-item__label-scale"
											>${frameScaleLabel}</span
										>
										${
											showDeleteButton &&
											html`
												<button
													type="button"
													class="frame-item__label-delete"
													aria-label=${deleteFrameLabel}
													title=${deleteFrameLabel}
													onPointerDown=${(event) => {
														event.preventDefault();
														event.stopPropagation();
													}}
													onClick=${(event) => {
														event.preventDefault();
														event.stopPropagation();
														controller()?.deleteFrame?.(frame.id);
													}}
												>
													<${WorkbenchIcon} name="trash" size=${11} />
												</button>
											`
										}
									</span>
								`
							}
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
											cursor: getFrameRotateCursorCss(
												frame.rotation ?? 0,
												zone,
											),
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
				})
			}
			${
				!canvasOnly &&
				multiFrameSelection &&
				selectionBoxLogical &&
				selectionAnchor &&
				html`
					<div
						class="frame-item frame-item--selected frame-item--active frame-selection-group"
						data-anchor-handle=${getSelectionAnchorHandleKey(selectionAnchor)}
						style=${{
							left: `${(selectionBoxLogical.left * 100) / exportWidth}%`,
							top: `${(selectionBoxLogical.top * 100) / exportHeight}%`,
							width: `${(selectionBoxLogical.width * 100) / exportWidth}%`,
							height: `${(selectionBoxLogical.height * 100) / exportHeight}%`,
							transform: `rotate(${selectionBoxLogical.rotationDeg ?? 0}deg)`,
							transformOrigin: `${selectionAnchor.x * 100}% ${selectionAnchor.y * 100}%`,
						}}
					>
						<span
							class="frame-item__label frame-item__label--group"
						>
							<span class="frame-item__label-text"
								>${`${selectedFrameCount} FRAME`}</span
							>
							<button
								type="button"
								class="frame-item__label-delete"
								aria-label=${translate(locale, "action.deleteFrame")}
								title=${translate(locale, "action.deleteFrame")}
								onPointerDown=${(event) => {
									event.preventDefault();
									event.stopPropagation();
								}}
								onClick=${(event) => {
									event.preventDefault();
									event.stopPropagation();
									controller()?.deleteSelectedFrames?.();
								}}
							>
								<${WorkbenchIcon} name="trash" size=${11} />
							</button>
						</span>
						${["top", "right", "bottom", "left"].map(
							(edge) => html`
								<button
									type="button"
									class=${`frame-item__edge frame-item__edge--${edge}`}
									aria-label="Selected FRAMEs"
									onPointerDown=${(event) =>
										controller()?.startSelectedFramesDrag?.(event)}
								></button>
							`,
						)}
						${FRAME_RESIZE_HANDLES.map(
							(handle) => html`
								<button
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${handle}`}
									style=${{
										cursor: getFrameResizeCursorCss(
											selectionBoxLogical.rotationDeg ?? 0,
											handle,
										),
									}}
									aria-label="Resize selected FRAMEs"
									onPointerDown=${(event) =>
										controller()?.startSelectedFramesResize?.(handle, event)}
								></button>
							`,
						)}
						${FRAME_ROTATION_ZONES.map(
							(zone) => html`
								<button
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${zone}`}
									style=${{
										cursor: getFrameRotateCursorCss(
											selectionBoxLogical.rotationDeg ?? 0,
											zone,
										),
									}}
									aria-label="Rotate selected FRAMEs"
									onPointerDown=${(event) =>
										controller()?.startSelectedFramesRotate?.(zone, event)}
								></button>
							`,
						)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{
								left: `${selectionAnchor.x * 100}%`,
								top: `${selectionAnchor.y * 100}%`,
							}}
							aria-label="Move selected FRAME anchor"
							onPointerDown=${(event) =>
								controller()?.startSelectedFramesAnchorDrag?.(event)}
						></button>
					</div>
				`
			}
		</div>
	`;
}
