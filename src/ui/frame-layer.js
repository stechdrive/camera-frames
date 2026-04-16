import { html } from "htm/preact";
import { BASE_FRAME } from "../constants.js";
import {
	FRAME_MASK_SHAPE_TRAJECTORY,
	FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
	FRAME_TRAJECTORY_MODE_SPLINE,
	getFrameTrajectoryHandlePointNormalized,
	getFrameTrajectoryNodeMode,
	sampleFrameTrajectoryPoints,
} from "../engine/frame-trajectory.js";
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

function buildSvgPolylinePath(points = []) {
	if (!Array.isArray(points) || points.length === 0) {
		return "";
	}
	return points
		.map(
			(point, index) =>
				`${index === 0 ? "M" : "L"} ${Number(point.x).toFixed(2)} ${Number(point.y).toFixed(2)}`,
		)
		.join(" ");
}

function getDistanceBetweenPoints(a, b) {
	if (!a || !b) {
		return 0;
	}
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function mirrorPointAcrossCenter(point, center) {
	if (!point || !center) {
		return null;
	}
	return {
		x: center.x - (point.x - center.x),
		y: center.y - (point.y - center.y),
	};
}

function FrameTrajectoryOverlay({
	controller,
	exportWidth,
	exportHeight,
	frames,
	frameMaskShape,
	trajectoryMode,
	trajectoryNodesByFrameId,
	trajectoryEditMode,
	activeTrajectoryNodeMode,
	activeFrameId,
	selectedFrameIds,
	interactionsEnabled,
}) {
	const showTrajectory =
		frameMaskShape === FRAME_MASK_SHAPE_TRAJECTORY || trajectoryEditMode;
	if (!showTrajectory || frames.length === 0) {
		return null;
	}

	const frameMaskSettings = {
		shape: frameMaskShape,
		trajectoryMode,
		trajectory: {
			nodesByFrameId: trajectoryNodesByFrameId,
		},
	};
	const centerPoints = sampleFrameTrajectoryPoints(
		frames,
		frameMaskSettings,
		exportWidth,
		exportHeight,
		{
			source: FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
		},
	);
	const activeFrame =
		frames.find((frame) => frame.id === activeFrameId) ??
		frames[frames.length - 1] ??
		null;
	const activeFrameIndex = activeFrame
		? frames.findIndex((frame) => frame.id === activeFrame.id)
		: -1;
	const activeFrameCenter = activeFrame
		? {
				x: activeFrame.x * exportWidth,
				y: activeFrame.y * exportHeight,
			}
		: null;
	const showTrajectoryHandles =
		trajectoryEditMode &&
		trajectoryMode === FRAME_TRAJECTORY_MODE_SPLINE &&
		activeFrame &&
		activeTrajectoryNodeMode !== "corner";
	const handleIn = showTrajectoryHandles
		? getFrameTrajectoryHandlePointNormalized(
				frames,
				frameMaskSettings,
				activeFrame.id,
				"in",
				exportWidth,
				exportHeight,
			)
		: null;
	const handleOut = showTrajectoryHandles
		? getFrameTrajectoryHandlePointNormalized(
				frames,
				frameMaskSettings,
				activeFrame.id,
				"out",
				exportWidth,
				exportHeight,
			)
		: null;
	const handleInPoint = handleIn
		? {
				x: handleIn.x * exportWidth,
				y: handleIn.y * exportHeight,
			}
		: null;
	const handleOutPoint = handleOut
		? {
				x: handleOut.x * exportWidth,
				y: handleOut.y * exportHeight,
			}
		: null;
	const visibleHandleInPoint =
		handleInPoint &&
		activeFrameCenter &&
		getDistanceBetweenPoints(handleInPoint, activeFrameCenter) > 1
			? handleInPoint
			: null;
	const visibleHandleOutPoint =
		handleOutPoint &&
		activeFrameCenter &&
		getDistanceBetweenPoints(handleOutPoint, activeFrameCenter) > 1
			? handleOutPoint
			: null;
	const showEndpointGhostHandle =
		showTrajectoryHandles &&
		activeTrajectoryNodeMode === "auto" &&
		(activeFrameIndex === 0 || activeFrameIndex === frames.length - 1);
	const ghostHandleInPoint =
		showEndpointGhostHandle &&
		!visibleHandleInPoint &&
		visibleHandleOutPoint &&
		activeFrameCenter
			? mirrorPointAcrossCenter(visibleHandleOutPoint, activeFrameCenter)
			: null;
	const ghostHandleOutPoint =
		showEndpointGhostHandle &&
		!visibleHandleOutPoint &&
		visibleHandleInPoint &&
		activeFrameCenter
			? mirrorPointAcrossCenter(visibleHandleInPoint, activeFrameCenter)
			: null;
	const renderHandleInPoint = visibleHandleInPoint ?? ghostHandleInPoint;
	const renderHandleOutPoint = visibleHandleOutPoint ?? ghostHandleOutPoint;
	const renderHandleInGhost = Boolean(ghostHandleInPoint);
	const renderHandleOutGhost = Boolean(ghostHandleOutPoint);
	const startFrameTrajectoryHandleDrag = (handleKey, event) =>
		controller()?.startFrameTrajectoryHandleDrag?.(
			activeFrame.id,
			handleKey,
			event,
		);

	return html`
		<div class="frame-trajectory-layer">
			<svg
				class="frame-trajectory-layer__svg"
				viewBox=${`0 0 ${exportWidth} ${exportHeight}`}
				preserveAspectRatio="none"
			>
				${
					centerPoints.length >= 2 &&
					html`
						<path
							class=${
								trajectoryEditMode
									? "frame-trajectory-layer__path frame-trajectory-layer__path--editing"
									: "frame-trajectory-layer__path"
							}
							d=${buildSvgPolylinePath(centerPoints)}
						></path>
					`
				}
				${
					trajectoryEditMode &&
					activeFrameCenter &&
					renderHandleInPoint &&
					html`
						<line
							class=${[
								"frame-trajectory-layer__handle-guide",
								"frame-trajectory-layer__handle-guide--in",
								renderHandleInGhost
									? "frame-trajectory-layer__handle-guide--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							x1=${activeFrameCenter.x}
							y1=${activeFrameCenter.y}
							x2=${renderHandleInPoint.x}
							y2=${renderHandleInPoint.y}
						></line>
					`
				}
				${
					trajectoryEditMode &&
					activeFrameCenter &&
					renderHandleOutPoint &&
					html`
						<line
							class=${[
								"frame-trajectory-layer__handle-guide",
								"frame-trajectory-layer__handle-guide--out",
								renderHandleOutGhost
									? "frame-trajectory-layer__handle-guide--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							x1=${activeFrameCenter.x}
							y1=${activeFrameCenter.y}
							x2=${renderHandleOutPoint.x}
							y2=${renderHandleOutPoint.y}
						></line>
					`
				}
				${
					trajectoryEditMode &&
					frames.map((frame) => {
						const selectedFrame = selectedFrameIds.has(frame.id);
						return html`
							<circle
								class=${[
									"frame-trajectory-layer__node-hit",
									selectedFrame
										? "frame-trajectory-layer__node-hit--selected"
										: "",
									frame.id === activeFrameId
										? "frame-trajectory-layer__node-hit--active"
										: "",
								]
									.filter(Boolean)
									.join(" ")}
								cx=${frame.x * exportWidth}
								cy=${frame.y * exportHeight}
								r="14"
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag?.(frame.id, event)
										: undefined
								}
							></circle>
							<circle
								class=${[
									"frame-trajectory-layer__node",
									selectedFrame ? "frame-trajectory-layer__node--selected" : "",
									frame.id === activeFrameId
										? "frame-trajectory-layer__node--active"
										: "",
								]
									.filter(Boolean)
									.join(" ")}
								cx=${frame.x * exportWidth}
								cy=${frame.y * exportHeight}
								r="12"
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag?.(frame.id, event)
										: undefined
								}
							></circle>
						`;
					})
				}
				${
					trajectoryEditMode &&
					renderHandleInPoint &&
					html`
						<circle
							class=${[
								"frame-trajectory-layer__handle-contrast",
								"frame-trajectory-layer__handle-contrast--in",
								renderHandleInGhost
									? "frame-trajectory-layer__handle-contrast--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleInPoint.x}
							cy=${renderHandleInPoint.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${renderHandleInPoint.x}
							cy=${renderHandleInPoint.y}
							r="12"
							onPointerDown=${
								interactionsEnabled
									? (event) => startFrameTrajectoryHandleDrag("in", event)
									: undefined
							}
						></circle>
						<circle
							class=${[
								"frame-trajectory-layer__handle",
								"frame-trajectory-layer__handle--in",
								renderHandleInGhost
									? "frame-trajectory-layer__handle--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleInPoint.x}
							cy=${renderHandleInPoint.y}
							r="9"
							onPointerDown=${
								interactionsEnabled
									? (event) => startFrameTrajectoryHandleDrag("in", event)
									: undefined
							}
						></circle>
						<circle
							class=${[
								"frame-trajectory-layer__handle-core",
								"frame-trajectory-layer__handle-core--in",
								renderHandleInGhost
									? "frame-trajectory-layer__handle-core--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleInPoint.x}
							cy=${renderHandleInPoint.y}
							r="2.25"
						></circle>
					`
				}
				${
					trajectoryEditMode &&
					renderHandleOutPoint &&
					html`
						<circle
							class=${[
								"frame-trajectory-layer__handle-contrast",
								"frame-trajectory-layer__handle-contrast--out",
								renderHandleOutGhost
									? "frame-trajectory-layer__handle-contrast--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleOutPoint.x}
							cy=${renderHandleOutPoint.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${renderHandleOutPoint.x}
							cy=${renderHandleOutPoint.y}
							r="12"
							onPointerDown=${
								interactionsEnabled
									? (event) => startFrameTrajectoryHandleDrag("out", event)
									: undefined
							}
						></circle>
						<circle
							class=${[
								"frame-trajectory-layer__handle",
								"frame-trajectory-layer__handle--out",
								renderHandleOutGhost
									? "frame-trajectory-layer__handle--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleOutPoint.x}
							cy=${renderHandleOutPoint.y}
							r="9"
							onPointerDown=${
								interactionsEnabled
									? (event) => startFrameTrajectoryHandleDrag("out", event)
									: undefined
							}
						></circle>
						<circle
							class=${[
								"frame-trajectory-layer__handle-core",
								"frame-trajectory-layer__handle-core--out",
								renderHandleOutGhost
									? "frame-trajectory-layer__handle-core--ghost"
									: "",
							]
								.filter(Boolean)
								.join(" ")}
							cx=${renderHandleOutPoint.x}
							cy=${renderHandleOutPoint.y}
							r="2.25"
						></circle>
					`
				}
			</svg>
		</div>
	`;
}

export function FrameLayer({
	store,
	controller,
	frameOverlayCanvasRef,
	canvasOnly = false,
	itemsOnly = false,
	interactionsEnabled = true,
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
	const frameMaskShape = store.frames.maskShape.value;
	const trajectoryMode = store.frames.trajectoryMode.value;
	const trajectoryEditMode = store.frames.trajectoryEditMode.value;
	const trajectoryNodesByFrameId =
		store.frames.trajectoryNodesByFrameId.value ?? {};
	const activeTrajectoryNodeMode =
		store.frames.trajectoryNodeMode.value ??
		getFrameTrajectoryNodeMode(
			{
				trajectory: {
					nodesByFrameId: trajectoryNodesByFrameId,
				},
			},
			activeFrameId,
		);
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
				!interactionsEnabled ? "frame-layer--noninteractive" : "",
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
				html`
					<${FrameTrajectoryOverlay}
						controller=${controller}
						exportWidth=${exportWidth}
						exportHeight=${exportHeight}
						frames=${store.frames.documents.value}
						frameMaskShape=${frameMaskShape}
						trajectoryMode=${trajectoryMode}
						trajectoryNodesByFrameId=${trajectoryNodesByFrameId}
						trajectoryEditMode=${trajectoryEditMode}
						activeTrajectoryNodeMode=${activeTrajectoryNodeMode}
						activeFrameId=${activeFrameId}
						selectedFrameIds=${selectedFrameIds}
						interactionsEnabled=${interactionsEnabled}
					/>
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
														if (!interactionsEnabled) {
															return;
														}
														event.preventDefault();
														event.stopPropagation();
													}}
													onClick=${
														interactionsEnabled
															? (event) => {
																	event.preventDefault();
																	event.stopPropagation();
																	controller()?.deleteFrame?.(frame.id);
																}
															: undefined
													}
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
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag(frame.id, event)
										: undefined
								}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--right"
								aria-label=${frame.name}
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag(frame.id, event)
										: undefined
								}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--bottom"
								aria-label=${frame.name}
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag(frame.id, event)
										: undefined
								}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--left"
								aria-label=${frame.name}
								onPointerDown=${
									interactionsEnabled
										? (event) => controller()?.startFrameDrag(frame.id, event)
										: undefined
								}
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
										onPointerDown=${
											interactionsEnabled
												? (event) =>
														controller()?.startFrameResize(
															frame.id,
															handle,
															event,
														)
												: undefined
										}
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
										onPointerDown=${
											interactionsEnabled
												? (event) =>
														controller()?.startFrameRotate(
															frame.id,
															zone,
															event,
														)
												: undefined
										}
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
								onPointerDown=${
									interactionsEnabled
										? (event) =>
												controller()?.startFrameAnchorDrag(frame.id, event)
										: undefined
								}
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
									onPointerDown=${
										interactionsEnabled
											? (event) =>
													controller()?.startSelectedFramesDrag?.(event)
											: undefined
									}
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
									onPointerDown=${
										interactionsEnabled
											? (event) =>
													controller()?.startSelectedFramesResize?.(
														handle,
														event,
													)
											: undefined
									}
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
									onPointerDown=${
										interactionsEnabled
											? (event) =>
													controller()?.startSelectedFramesRotate?.(zone, event)
											: undefined
									}
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
							onPointerDown=${
								interactionsEnabled
									? (event) =>
											controller()?.startSelectedFramesAnchorDrag?.(event)
									: undefined
							}
						></button>
					</div>
				`
			}
		</div>
	`;
}
