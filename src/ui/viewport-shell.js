import { html } from "htm/preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import * as THREE from "three";
import { getBuildVersionLabel } from "../build-info.js";
import { VIEWPORT_PIXEL_RATIO } from "../constants.js";
import {
	drawFrameMaskToContext,
	resolveFrameMaskFrames,
} from "../engine/frame-mask-export.js";
import { getFrameAnchorHandleKey } from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	VIEWPORT_PIE_RADIUS,
	buildViewportPieActions,
} from "../engine/viewport-pie.js";
import {
	WORKSPACE_MIN_PANE_SIZE_PX,
	WORKSPACE_SPLIT_RATIO_MAX,
	WORKSPACE_SPLIT_RATIO_MIN,
	WORKSPACE_SPLITTER_SIZE_PX,
	resolveWorkspaceSplitRatioForSize,
} from "../app/workspace-view-layout.js";
import {
	WORKSPACE_LAYOUT_SPLIT,
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../workspace-model.js";
import { BackgroundTaskIndicator } from "./background-task-indicator.js";
import { CompositionGuideLayer } from "./composition-guide-layer.js";
import { computeDropHintStyle, getOverlayBounds } from "./drop-hint-layout.js";
import { FrameLayer } from "./frame-layer.js";
import { MeasurementOverlay } from "./measurement-overlay.js";
import { ViewportAxisGizmo } from "./viewport-axis-gizmo.js";
import { ViewportProjectStatusHud } from "./viewport-project-status-hud.js";
import { NumericDraftInput } from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import { TooltipBubble } from "./workbench-primitives.js";

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

const REFERENCE_IMAGE_TRANSFORM_HANDLES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

const REFERENCE_IMAGE_ROTATION_ZONES = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

export function SplatEditToolbar({
	store,
	controller,
	t,
	style = undefined,
	onDragPointerDown = undefined,
}) {
	const splatEditTool = store.splatEdit.tool.value;
	const splatEditSelectionCount = store.splatEdit.selectionCount.value;
	const splatEditBrushSize = store.splatEdit.brushSize.value;
	const splatEditBrushDepthMode = store.splatEdit.brushDepthMode.value;
	const splatEditBrushDepth = store.splatEdit.brushDepth.value;
	const splatEditBoxPlaced = store.splatEdit.boxPlaced.value;
	const splatEditBoxCenter = store.splatEdit.boxCenter.value;
	const splatEditBoxSize = store.splatEdit.boxSize.value;
	const splatEditBoxRotation = store.splatEdit.boxRotation.value;
	const splatEditLodStatus = store.splatEdit.lodStatus?.value ?? "empty";
	const backgroundTask = store.backgroundTask?.value ?? null;
	const lodBakeRunning =
		backgroundTask?.kind === "auto-lod" && backgroundTask?.status === "running";

	const setSplatEditTool = (tool) => controller()?.setSplatEditTool?.(tool);
	const setSplatEditBrushDepthMode = (nextMode) =>
		controller()?.setSplatEditBrushDepthMode?.(nextMode);
	const handleSplatEditBoxCenterInput = (axisKey, nextValue) => {
		const numericValue = Number(nextValue);
		if (Number.isFinite(numericValue)) {
			controller()?.setSplatEditBoxCenterAxis?.(axisKey, numericValue);
		}
	};
	const handleSplatEditBoxSizeInput = (axisKey, nextValue) => {
		const numericValue = Number(nextValue);
		if (Number.isFinite(numericValue)) {
			controller()?.setSplatEditBoxSizeAxis?.(axisKey, numericValue);
		}
	};
	const handleSplatEditBoxRotationInput = (axisKey, nextValue) => {
		const numericValue = Number(nextValue);
		if (Number.isFinite(numericValue)) {
			controller()?.setSplatEditBoxRotationAxis?.(axisKey, numericValue);
		}
	};
	const handleSplatEditBrushSizeInput = (nextValue) => {
		const numericValue = Number(nextValue);
		if (Number.isFinite(numericValue)) {
			controller()?.setSplatEditBrushSize?.(numericValue);
		}
	};
	const handleSplatEditBrushDepthInput = (nextValue) => {
		const numericValue = Number(nextValue);
		if (Number.isFinite(numericValue)) {
			controller()?.setSplatEditBrushDepth?.(numericValue);
		}
	};
	const formatSplatEditNumericValue = (numericValue) =>
		Number(numericValue ?? 0).toFixed(2);
	const renderSplatEditField = ({
		label,
		value,
		step = "0.10",
		min = undefined,
		historyLabel,
		onScrubValue,
		onCommitValue,
	}) => html`
		<div class="viewport-splat-edit-toolbar__field camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${label}</span>
			<div class="camera-property-axis-field__input field">
				<${NumericDraftInput}
					inputMode="decimal"
					min=${min}
					step=${step}
					value=${formatSplatEditNumericValue(value)}
					controller=${controller}
					historyLabel=${historyLabel}
					formatDisplayValue=${formatSplatEditNumericValue}
					scrubStartValue=${Number(value ?? 0)}
					onScrubDelta=${(_deltaValue, nextValue) => onScrubValue(nextValue)}
					onCommit=${(nextValue) => onCommitValue(nextValue)}
				/>
			</div>
		</div>
	`;

	const splatEditBoxRotationEuler = new THREE.Euler().setFromQuaternion(
		new THREE.Quaternion(
			Number(splatEditBoxRotation?.x ?? 0),
			Number(splatEditBoxRotation?.y ?? 0),
			Number(splatEditBoxRotation?.z ?? 0),
			Number(splatEditBoxRotation?.w ?? 1),
		),
	);
	const splatEditBoxRotationDegrees = {
		x: THREE.MathUtils.radToDeg(splatEditBoxRotationEuler.x),
		y: THREE.MathUtils.radToDeg(splatEditBoxRotationEuler.y),
		z: THREE.MathUtils.radToDeg(splatEditBoxRotationEuler.z),
	};

	return html`
		<div class="viewport-splat-edit-toolbar" style=${style}>
			${
				splatEditTool === "brush" &&
				html`
				<div class="viewport-splat-edit-popover">
					${renderSplatEditField({ label: "px", value: splatEditBrushSize ?? 30, step: "1", min: "4", historyLabel: "splat-edit.brush-size", onScrubValue: (v) => handleSplatEditBrushSizeInput(v), onCommitValue: (v) => handleSplatEditBrushSizeInput(v) })}
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${splatEditBrushDepthMode === "through" ? " viewport-splat-edit-toolbar__btn--active" : ""}`} onClick=${() => setSplatEditBrushDepthMode("through")}>
						${t("status.splatEditBrushModeThrough")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${splatEditBrushDepthMode === "depth" ? " viewport-splat-edit-toolbar__btn--active" : ""}`} onClick=${() => setSplatEditBrushDepthMode("depth")}>
						${t("status.splatEditBrushModeDepth")}
					</button>
					${
						splatEditBrushDepthMode === "depth" &&
						html`
						${renderSplatEditField({ label: t("status.splatEditBrushModeDepth"), value: splatEditBrushDepth ?? 0.2, min: "0.01", historyLabel: "splat-edit.brush-depth", onScrubValue: (v) => handleSplatEditBrushDepthInput(v), onCommitValue: (v) => handleSplatEditBrushDepthInput(v) })}
					`
					}
				</div>
			`
			}
			${
				splatEditTool === "box" &&
				html`
				<div class="viewport-splat-edit-popover">
					${
						splatEditBoxPlaced
							? html`
						<div class="viewport-splat-edit-toolbar__box-panel">
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditCenter")}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${renderSplatEditField({ label: t("field.positionX"), value: splatEditBoxCenter?.x ?? 0, historyLabel: "splat-edit.box-center.x", onScrubValue: (v) => handleSplatEditBoxCenterInput("x", v), onCommitValue: (v) => handleSplatEditBoxCenterInput("x", v) })}
									${renderSplatEditField({ label: t("field.positionY"), value: splatEditBoxCenter?.y ?? 0, historyLabel: "splat-edit.box-center.y", onScrubValue: (v) => handleSplatEditBoxCenterInput("y", v), onCommitValue: (v) => handleSplatEditBoxCenterInput("y", v) })}
									${renderSplatEditField({ label: t("field.positionZ"), value: splatEditBoxCenter?.z ?? 0, historyLabel: "splat-edit.box-center.z", onScrubValue: (v) => handleSplatEditBoxCenterInput("z", v), onCommitValue: (v) => handleSplatEditBoxCenterInput("z", v) })}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditSize")}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${renderSplatEditField({ label: t("field.positionX"), value: splatEditBoxSize?.x ?? 1, min: "0.01", historyLabel: "splat-edit.box-size.x", onScrubValue: (v) => handleSplatEditBoxSizeInput("x", v), onCommitValue: (v) => handleSplatEditBoxSizeInput("x", v) })}
									${renderSplatEditField({ label: t("field.positionY"), value: splatEditBoxSize?.y ?? 1, min: "0.01", historyLabel: "splat-edit.box-size.y", onScrubValue: (v) => handleSplatEditBoxSizeInput("y", v), onCommitValue: (v) => handleSplatEditBoxSizeInput("y", v) })}
									${renderSplatEditField({ label: t("field.positionZ"), value: splatEditBoxSize?.z ?? 1, min: "0.01", historyLabel: "splat-edit.box-size.z", onScrubValue: (v) => handleSplatEditBoxSizeInput("z", v), onCommitValue: (v) => handleSplatEditBoxSizeInput("z", v) })}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${t("field.assetRotation")}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${renderSplatEditField({ label: t("field.positionX"), value: splatEditBoxRotationDegrees.x, step: "1", historyLabel: "splat-edit.box-rotation.x", onScrubValue: (v) => handleSplatEditBoxRotationInput("x", v), onCommitValue: (v) => handleSplatEditBoxRotationInput("x", v) })}
									${renderSplatEditField({ label: t("field.positionY"), value: splatEditBoxRotationDegrees.y, step: "1", historyLabel: "splat-edit.box-rotation.y", onScrubValue: (v) => handleSplatEditBoxRotationInput("y", v), onCommitValue: (v) => handleSplatEditBoxRotationInput("y", v) })}
									${renderSplatEditField({ label: t("field.positionZ"), value: splatEditBoxRotationDegrees.z, step: "1", historyLabel: "splat-edit.box-rotation.z", onScrubValue: (v) => handleSplatEditBoxRotationInput("z", v), onCommitValue: (v) => handleSplatEditBoxRotationInput("z", v) })}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__action-row">
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${() => controller()?.applySplatEditBoxSelection?.({ subtract: false })}>${t("status.splatEditAdd")}</button>
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${() => controller()?.applySplatEditBoxSelection?.({ subtract: true })}>${t("status.splatEditSubtract")}</button>
								<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${() => controller()?.scaleSplatEditBoxUniform?.(0.9)}>−<${TooltipBubble} title=${t("status.splatEditScaleDown")} placement="top" /></button>
								<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${() => controller()?.scaleSplatEditBoxUniform?.(1.1)}>+<${TooltipBubble} title=${t("status.splatEditScaleUp")} placement="top" /></button>
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${() => controller()?.fitSplatEditBoxToScope?.()}>${t("status.splatEditFitScope")}</button>
							</div>
						</div>
					`
							: html`
						<span class="viewport-splat-edit-toolbar__info">${t("status.splatEditPlaceBoxHint")}</span>
					`
					}
					${
						!splatEditBoxPlaced &&
						html`<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${() => controller()?.fitSplatEditBoxToScope?.()}>${t("status.splatEditFitScope")}</button>`
					}
				</div>
			`
			}
			<div class="viewport-splat-edit-toolbar__bar">
				<button
					type="button"
					class="viewport-splat-edit-toolbar__drag-handle button--tooltip"
					aria-label=${t("action.moveToolbar")}
					onPointerDown=${onDragPointerDown}
				>
					<${WorkbenchIcon} name="grip" size=${14} strokeWidth=${0} />
					<${TooltipBubble} title=${t("action.moveToolbar")} placement="top" />
				</button>
				<!-- Tool selector -->
				<div class="viewport-splat-edit-toolbar__group" role="group" aria-label=${t("action.splatEditTool")}>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${splatEditTool === "box" ? " viewport-splat-edit-toolbar__btn--active" : ""}`} onClick=${() => setSplatEditTool("box")}>
						${t("status.splatEditToolBox")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${splatEditTool === "brush" ? " viewport-splat-edit-toolbar__btn--active" : ""}`} onClick=${() => setSplatEditTool("brush")}>
						${t("status.splatEditToolBrush")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${splatEditTool === "transform" ? " viewport-splat-edit-toolbar__btn--active" : ""}`} disabled=${splatEditSelectionCount <= 0 && splatEditTool !== "transform"} onClick=${() => setSplatEditTool("transform")}>
						${t("status.splatEditToolTransform")}
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection operations -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${() => controller()?.selectAllSplats?.()}>
						${t("status.splatEditSelectAll")}<${TooltipBubble} title=${t("status.splatEditSelectAll")} shortcut="Ctrl+A" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${splatEditSelectionCount <= 0} onClick=${() => controller()?.invertSplatSelection?.()}>
						${t("status.splatEditInvert")}<${TooltipBubble} title=${t("status.splatEditInvert")} shortcut="Ctrl+I" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${splatEditSelectionCount <= 0} onClick=${() => controller()?.clearSplatSelection?.()}>
						${t("action.clearSelection")}<${TooltipBubble} title=${t("action.clearSelection")} shortcut="Ctrl+D" placement="top" />
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Edit actions -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--danger" disabled=${splatEditSelectionCount <= 0} onClick=${() => void controller()?.deleteSelectedSplats?.()}>
						${t("status.splatEditDelete")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${splatEditSelectionCount <= 0} onClick=${() => void controller()?.separateSelectedSplats?.()}>
						${t("status.splatEditSeparate")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${splatEditSelectionCount <= 0} onClick=${() => void controller()?.duplicateSelectedSplats?.()}>
						${t("status.splatEditDuplicate")}
					</button>
				</div>
				${
					splatEditLodStatus !== "empty" &&
					html`
						<div class="viewport-splat-edit-toolbar__separator" />
						<div
							class="viewport-splat-edit-toolbar__group"
							role="group"
							aria-label=${t("action.splatEditOptimizeLod")}
						>
							<button
								type="button"
								class=${`viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--lod button--tooltip${
									splatEditLodStatus === "ready"
										? " viewport-splat-edit-toolbar__btn--lod-ready"
										: ""
								}${
									lodBakeRunning
										? " viewport-splat-edit-toolbar__btn--lod-running"
										: ""
								}`}
								disabled=${splatEditLodStatus === "ready" || lodBakeRunning}
								onClick=${() => controller()?.rebuildSplatEditLod?.()}
							>
								<span
									class=${`viewport-splat-edit-toolbar__lod-icon${
										lodBakeRunning
											? " viewport-splat-edit-toolbar__lod-icon--spin"
											: splatEditLodStatus === "ready"
												? " viewport-splat-edit-toolbar__lod-icon--done"
												: ""
									}`}
									aria-hidden="true"
								>
									${
										lodBakeRunning
											? ""
											: splatEditLodStatus === "ready"
												? "✓"
												: "⚡"
									}
								</span>
								<span>
									${
										lodBakeRunning
											? t("status.splatEditLodRunning")
											: splatEditLodStatus === "ready"
												? t("status.splatEditLodReady")
												: t("status.splatEditLodStale")
									}
								</span>
								<${TooltipBubble}
									title=${t("status.splatEditLodTooltip")}
									placement="top"
								/>
							</button>
						</div>
					`
				}
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection count (right end) -->
				<span class="viewport-splat-edit-toolbar__info">
					${splatEditSelectionCount} sel
				</span>
			</div>
		</div>
	`;
}

function SplatEditBrushPreview({ store, viewportShellRef }) {
	const splatEditActive = store.splatEdit.active.value;
	const splatEditTool = store.splatEdit.tool.value;
	const brushPreview = store.splatEdit.brushPreview.value;
	if (!splatEditActive || splatEditTool !== "brush" || !brushPreview?.visible) {
		return null;
	}
	const shellElement = viewportShellRef?.current ?? viewportShellRef ?? null;
	if (!(shellElement instanceof HTMLElement)) {
		return null;
	}
	const radiusPx = Math.max(0, Number(brushPreview?.radiusPx ?? 0));
	const shellRect = shellElement.getBoundingClientRect();
	const style = {
		left: `${brushPreview.x - shellRect.left - radiusPx}px`,
		top: `${brushPreview.y - shellRect.top - radiusPx}px`,
		width: `${radiusPx * 2}px`,
		height: `${radiusPx * 2}px`,
	};
	const depthBarVisible = store.splatEdit.brushDepthBarVisible.value;
	return html`
		<div
			class=${
				brushPreview?.subtract
					? brushPreview?.painting
						? "viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract viewport-splat-edit-brush-preview--painting"
						: "viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract"
					: brushPreview?.painting
						? "viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--painting"
						: "viewport-splat-edit-brush-preview"
			}
			style=${style}
			aria-hidden="true"
		>
			<div class="viewport-splat-edit-brush-preview__ring"></div>
			${
				depthBarVisible &&
				Number(brushPreview?.depthBarPx) > 2 &&
				html`
					<div
						class="viewport-splat-edit-brush-preview__depth-bar"
						style=${{ height: `${Number(brushPreview.depthBarPx)}px` }}
					></div>
				`
			}
		</div>
	`;
}

function FrameMaskCanvas({ store, refs }) {
	const canvasRef = useRef(null);
	const drawMaskCanvasRef = useRef(() => {});
	const frames = store.frames.documents.value;
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const frameMaskShape = store.frames.maskShape.value;
	const frameTrajectoryMode = store.frames.trajectoryMode.value;
	const frameTrajectoryNodesByFrameId =
		store.frames.trajectoryNodesByFrameId.value ?? {};
	const exportWidth = store.exportWidth.value;
	const exportHeight = store.exportHeight.value;
	const frameMaskOpacity = Math.min(
		1,
		Math.max(0, (Number(frameMaskOpacityPct) || 0) / 100),
	);
	const maskedFrames = resolveFrameMaskFrames(frames, {
		mode: frameMaskMode,
		selectedIds: store.frames.maskSelectedIds.value ?? [],
	});

	const drawMaskCanvas = () => {
		const canvas = canvasRef.current;
		const shellElement =
			refs.cameraPaneRef?.current ?? refs.cameraPaneRef ?? null;
		const renderBoxNode =
			refs.renderBoxRef?.current ?? refs.renderBoxRef ?? null;
		if (
			!(canvas instanceof HTMLCanvasElement) ||
			!(shellElement instanceof HTMLElement)
		) {
			return;
		}
		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}
		const shellWidth = Math.max(1, shellElement.clientWidth);
		const shellHeight = Math.max(1, shellElement.clientHeight);
		const canvasWidth = Math.max(
			1,
			Math.round(shellWidth * VIEWPORT_PIXEL_RATIO),
		);
		const canvasHeight = Math.max(
			1,
			Math.round(shellHeight * VIEWPORT_PIXEL_RATIO),
		);
		if (canvas.width !== canvasWidth) {
			canvas.width = canvasWidth;
		}
		if (canvas.height !== canvasHeight) {
			canvas.height = canvasHeight;
		}
		canvas.style.width = `${shellWidth}px`;
		canvas.style.height = `${shellHeight}px`;
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (
			frameMaskOpacity <= 0 ||
			maskedFrames.length === 0 ||
			!(renderBoxNode instanceof HTMLElement) ||
			renderBoxNode.offsetWidth <= 0 ||
			renderBoxNode.offsetHeight <= 0
		) {
			return;
		}
		context.scale(VIEWPORT_PIXEL_RATIO, VIEWPORT_PIXEL_RATIO);
		drawFrameMaskToContext(context, maskedFrames, {
			canvasWidth: shellWidth,
			canvasHeight: shellHeight,
			frameSpaceWidth: renderBoxNode.offsetWidth,
			frameSpaceHeight: renderBoxNode.offsetHeight,
			logicalSpaceWidth: exportWidth,
			logicalSpaceHeight: exportHeight,
			offsetX: renderBoxNode.offsetLeft,
			offsetY: renderBoxNode.offsetTop,
			fillStyle: `rgba(3, 6, 11, ${frameMaskOpacity})`,
			frameMaskSettings: {
				shape: frameMaskShape,
				trajectoryMode: frameTrajectoryMode,
				trajectory: {
					nodesByFrameId: frameTrajectoryNodesByFrameId,
				},
			},
		});
		context.setTransform(1, 0, 0, 1, 0, 0);
	};
	drawMaskCanvasRef.current = drawMaskCanvas;

	useLayoutEffect(() => {
		drawMaskCanvas();
	});

	useLayoutEffect(() => {
		const shellElement =
			refs.cameraPaneRef?.current ?? refs.cameraPaneRef ?? null;
		const renderBoxNode =
			refs.renderBoxRef?.current ?? refs.renderBoxRef ?? null;
		if (
			!(shellElement instanceof HTMLElement) &&
			!(renderBoxNode instanceof HTMLElement)
		) {
			return;
		}
		let redrawFrameId = 0;
		const redraw = () => {
			if (redrawFrameId) {
				return;
			}
			redrawFrameId = window.requestAnimationFrame(() => {
				redrawFrameId = 0;
				drawMaskCanvasRef.current?.();
			});
		};
		const resizeObserver =
			typeof ResizeObserver === "function"
				? new ResizeObserver(() => {
						redraw();
					})
				: null;
		if (shellElement instanceof HTMLElement) {
			resizeObserver?.observe(shellElement);
		}
		if (renderBoxNode instanceof HTMLElement) {
			resizeObserver?.observe(renderBoxNode);
		}
		window.addEventListener("resize", redraw);
		return () => {
			if (redrawFrameId) {
				window.cancelAnimationFrame(redrawFrameId);
			}
			window.removeEventListener("resize", redraw);
			resizeObserver?.disconnect();
		};
	}, [refs.cameraPaneRef, refs.renderBoxRef]);

	if (frameMaskOpacity <= 0 || maskedFrames.length === 0) {
		return null;
	}
	return html`
		<div class="frame-mask-layer camera-pane-layer">
			<canvas ref=${canvasRef} class="frame-mask-layer__canvas"></canvas>
		</div>
	`;
}

function getReferenceImageAnchorHandleKey(anchorAx, anchorAy) {
	if (
		!Number.isFinite(anchorAx) ||
		!Number.isFinite(anchorAy) ||
		anchorAx < 0 ||
		anchorAx > 1 ||
		anchorAy < 0 ||
		anchorAy > 1
	) {
		return "";
	}
	return getFrameAnchorHandleKey({ x: anchorAx, y: anchorAy });
}

const WORKSPACE_VERTICAL_SPLIT_MAX_WIDTH_PX = 720;

function resolveWorkspaceSplitOrientation(width) {
	const numericWidth = Number(width);
	const fallbackWidth =
		typeof window === "undefined"
			? Number.POSITIVE_INFINITY
			: window.innerWidth;
	return (Number.isFinite(numericWidth) ? numericWidth : fallbackWidth) <=
		WORKSPACE_VERTICAL_SPLIT_MAX_WIDTH_PX
		? "vertical"
		: "horizontal";
}

function WorkspacePaneChrome({ pane, active, split, controller, paneRef, t }) {
	if (!pane) {
		return null;
	}
	const label =
		pane.role === WORKSPACE_PANE_CAMERA ? t("mode.camera") : t("mode.viewport");
	return html`
		<section
			ref=${paneRef}
			class=${
				active ? "workspace-pane workspace-pane--active" : "workspace-pane"
			}
			data-workspace-pane=${pane.id}
			data-pane-role=${pane.role}
			aria-label=${label}
		>
			<div class="workspace-pane__chrome">
				<span class="workspace-pane__label">${label}</span>
				${
					split
						? html`
						<button
							type="button"
							class="workspace-pane__close"
							aria-label=${t("action.closeWorkspacePane", { name: label })}
							title=${t("action.closeWorkspacePane", { name: label })}
							onPointerDown=${(event) => event.stopPropagation()}
							onClick=${() => controller()?.closeWorkspacePane?.(pane.id)}
						>
							×
						</button>
					`
						: html`
						<button
							type="button"
							class="workspace-pane__dual"
							aria-label=${t("action.showDualWorkspace")}
							title=${t("action.showDualWorkspace")}
							onPointerDown=${(event) => event.stopPropagation()}
							onClick=${() => controller()?.showDualWorkspace?.()}
						>
							▥
						</button>
					`
				}
			</div>
		</section>
	`;
}

export function ViewportShell({ store, controller, refs, t }) {
	const splatEditHudDragRef = useRef(null);
	const workspaceSplitDragRef = useRef(null);
	const [workspaceSplitOrientation, setWorkspaceSplitOrientation] = useState(
		resolveWorkspaceSplitOrientation,
	);
	const [workspaceShellSize, setWorkspaceShellSize] = useState({
		width: 0,
		height: 0,
	});
	const workspaceLayout = store.workspace.layout.value;
	const workspaceSplitRatio = store.workspace.splitRatio?.value ?? 0.5;
	const workspacePanes = store.workspace.panes.value ?? [];
	const activeWorkspacePaneId = store.workspace.activePaneId.value;
	const cameraWorkspacePane = workspacePanes.find(
		(pane) => pane.role === WORKSPACE_PANE_CAMERA,
	);
	const viewportWorkspacePane = workspacePanes.find(
		(pane) => pane.role === WORKSPACE_PANE_VIEWPORT,
	);
	const workspaceSplit = workspaceLayout === WORKSPACE_LAYOUT_SPLIT;
	const cameraPaneVisible =
		workspaceSplit || activeWorkspacePaneId === cameraWorkspacePane?.id;
	const viewportPaneVisible =
		workspaceSplit || activeWorkspacePaneId === viewportWorkspacePane?.id;
	const activeWorkspacePane = workspacePanes.find(
		(pane) => pane.id === activeWorkspacePaneId,
	);
	const activeWorkspacePaneRef =
		activeWorkspacePane?.role === WORKSPACE_PANE_VIEWPORT
			? refs.viewportPaneRef
			: refs.cameraPaneRef;

	useEffect(() => {
		const shell = refs.viewportShellRef?.current;
		if (!shell) {
			return undefined;
		}
		const syncLayoutForSize = () => {
			const rect = shell.getBoundingClientRect?.();
			if (!(rect?.width > 0) || !(rect?.height > 0)) {
				return;
			}
			const nextOrientation = resolveWorkspaceSplitOrientation(rect.width);
			setWorkspaceSplitOrientation(nextOrientation);
			setWorkspaceShellSize((previousSize) =>
				previousSize.width === rect.width && previousSize.height === rect.height
					? previousSize
					: { width: rect.width, height: rect.height },
			);
			if (workspaceSplit) {
				controller()?.setWorkspaceSplitRatio?.(
					store.workspace.splitRatio?.peek?.() ??
						store.workspace.splitRatio?.value ??
						0.5,
					{
						orientation: nextOrientation,
						width: rect.width,
						height: rect.height,
					},
				);
			}
		};
		syncLayoutForSize();
		const resizeObserver =
			typeof ResizeObserver === "function"
				? new ResizeObserver(syncLayoutForSize)
				: null;
		resizeObserver?.observe(shell);
		window.addEventListener?.("resize", syncLayoutForSize);
		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener?.("resize", syncLayoutForSize);
		};
	}, [workspaceSplit, controller, refs.viewportShellRef, store]);

	const updateWorkspaceSplitFromPointer = (event) => {
		const drag = workspaceSplitDragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}
		const shell = refs.viewportShellRef?.current;
		const rect = shell?.getBoundingClientRect?.();
		if (!(rect?.width > 0) || !(rect?.height > 0)) {
			return;
		}
		const availableSize = Math.max(
			(drag.orientation === "vertical" ? rect.height : rect.width) -
				WORKSPACE_SPLITTER_SIZE_PX,
			1,
		);
		const nextRatio =
			drag.orientation === "vertical"
				? (event.clientY - rect.top - drag.pointerOffsetPx) / availableSize
				: (event.clientX - rect.left - drag.pointerOffsetPx) / availableSize;
		controller()?.setWorkspaceSplitRatio?.(nextRatio, {
			orientation: drag.orientation,
			width: rect.width,
			height: rect.height,
			persist: false,
		});
		event.preventDefault();
	};

	const finishWorkspaceSplitDrag = (event) => {
		const drag = workspaceSplitDragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}
		workspaceSplitDragRef.current = null;
		controller()?.persistWorkspaceViewLayout?.();
		refs.workspaceSplitterRef?.current?.releasePointerCapture?.(
			event.pointerId,
		);
		event.preventDefault();
		event.stopPropagation();
	};

	const startWorkspaceSplitDrag = (event) => {
		if (event.button !== 0) {
			return;
		}
		workspaceSplitDragRef.current = {
			pointerId: event.pointerId,
			orientation: workspaceSplitOrientation,
			pointerOffsetPx:
				workspaceSplitOrientation === "vertical"
					? event.clientY - event.currentTarget.getBoundingClientRect().top
					: event.clientX - event.currentTarget.getBoundingClientRect().left,
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
		event.preventDefault();
		event.stopPropagation();
	};

	const handleWorkspaceSplitKeyDown = (event) => {
		const decrementKey =
			workspaceSplitOrientation === "vertical" ? "ArrowUp" : "ArrowLeft";
		const incrementKey =
			workspaceSplitOrientation === "vertical" ? "ArrowDown" : "ArrowRight";
		let nextRatio = null;
		if (event.key === decrementKey) {
			nextRatio = workspaceSplitRatio - 0.025;
		} else if (event.key === incrementKey) {
			nextRatio = workspaceSplitRatio + 0.025;
		} else if (event.key === "Home") {
			nextRatio = 0.2;
		} else if (event.key === "End") {
			nextRatio = 0.8;
		}
		if (nextRatio === null) {
			return;
		}
		const shellRect = refs.viewportShellRef?.current?.getBoundingClientRect?.();
		controller()?.setWorkspaceSplitRatio?.(nextRatio, {
			orientation: workspaceSplitOrientation,
			width: shellRect?.width ?? 0,
			height: shellRect?.height ?? 0,
		});
		event.preventDefault();
		event.stopPropagation();
	};
	const workspaceAvailableSplitSize =
		Math.max(
			(workspaceSplitOrientation === "vertical"
				? workspaceShellSize.height
				: workspaceShellSize.width) ?? 0,
			0,
		) - WORKSPACE_SPLITTER_SIZE_PX;
	const workspaceSplitMinRatio = resolveWorkspaceSplitRatioForSize({
		splitRatio: WORKSPACE_SPLIT_RATIO_MIN,
		availableSize: workspaceAvailableSplitSize,
		minPaneSize: WORKSPACE_MIN_PANE_SIZE_PX,
	});
	const workspaceSplitMaxRatio = resolveWorkspaceSplitRatioForSize({
		splitRatio: WORKSPACE_SPLIT_RATIO_MAX,
		availableSize: workspaceAvailableSplitSize,
		minPaneSize: WORKSPACE_MIN_PANE_SIZE_PX,
	});
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const splatEditActive = store.splatEdit.active.value;
	const splatEditHudPosition = store.splatEdit.hudPosition.value;
	const referenceImageEditMode = store.viewportReferenceImageEditMode.value;
	const blockOverlayInteractions =
		store.mode.value !== WORKSPACE_PANE_CAMERA ||
		referenceImageEditMode ||
		splatEditActive;
	const outputFrameLabel = t("section.outputFrame");
	const referenceImageLayers = store.referenceImages.previewLayers.value;
	const selectedReferenceImageIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const backReferenceImageLayers = referenceImageLayers.filter(
		(layer) => layer.group === "back",
	);
	const frontReferenceImageLayers = referenceImageLayers.filter(
		(layer) => layer.group !== "back",
	);
	const hasBackReferenceImagePreview = backReferenceImageLayers.length > 0;
	const selectedReferenceImageLayers = referenceImageLayers.filter((layer) =>
		selectedReferenceImageIds.has(layer.id),
	);
	const activeReferenceImageLayer =
		selectedReferenceImageLayers.find(
			(layer) => layer.id === store.referenceImages.selectedItemId.value,
		) ??
		selectedReferenceImageLayers[selectedReferenceImageLayers.length - 1] ??
		null;
	const selectionAnchor = store.referenceImages.selectionAnchor.value;
	const multiSelectionBox = store.referenceImages.selectionBoxScreen.value;
	const referenceImageSelectionBox = (() => {
		if (selectedReferenceImageLayers.length === 0) {
			return null;
		}
		if (
			selectedReferenceImageLayers.length === 1 &&
			activeReferenceImageLayer
		) {
			return {
				leftPx: activeReferenceImageLayer.leftPx,
				topPx: activeReferenceImageLayer.topPx,
				widthPx: activeReferenceImageLayer.widthPx,
				heightPx: activeReferenceImageLayer.heightPx,
				rotationDeg: activeReferenceImageLayer.rotationDeg,
				anchorAx: activeReferenceImageLayer.anchorAx,
				anchorAy: activeReferenceImageLayer.anchorAy,
				anchorHandleKey: getReferenceImageAnchorHandleKey(
					activeReferenceImageLayer.anchorAx,
					activeReferenceImageLayer.anchorAy,
				),
			};
		}
		if (!multiSelectionBox) {
			return null;
		}
		return {
			leftPx: multiSelectionBox.left,
			topPx: multiSelectionBox.top,
			widthPx: multiSelectionBox.width,
			heightPx: multiSelectionBox.height,
			rotationDeg: multiSelectionBox.rotationDeg ?? 0,
			anchorAx: Number.isFinite(selectionAnchor?.x)
				? selectionAnchor.x
				: (multiSelectionBox.anchorX ?? 0.5),
			anchorAy: Number.isFinite(selectionAnchor?.y)
				? selectionAnchor.y
				: (multiSelectionBox.anchorY ?? 0.5),
			anchorHandleKey: getReferenceImageAnchorHandleKey(
				Number.isFinite(selectionAnchor?.x)
					? selectionAnchor.x
					: (multiSelectionBox.anchorX ?? 0.5),
				Number.isFinite(selectionAnchor?.y)
					? selectionAnchor.y
					: (multiSelectionBox.anchorY ?? 0.5),
			),
		};
	})();
	const pieState = store.viewportPieMenu.value;
	const lensHud = store.viewportLensHud.value;
	const rollHud = store.viewportRollHud.value;
	const pieActions = pieState.open
		? buildViewportPieActions({
				mode: store.mode.value,
				t,
				viewportToolMode: store.viewportToolMode.value,
				viewportOrthographic:
					store.mode.value === "viewport" &&
					store.viewportProjectionMode.value === "orthographic",
				referencePreviewSessionVisible:
					store.referenceImages.previewSessionVisible.value !== false,
				hasReferenceImages:
					(store.referenceImages.items.value?.length ?? 0) > 0,
				frameMaskMode: store.frames.maskMode.value,
				hasRememberedFrameMaskSelection:
					(store.frames.maskSelectedIds.value?.length ?? 0) > 0,
			})
		: [];
	const hoveredPieAction =
		pieActions.find((action) => action.id === pieState.hoveredActionId) ?? null;
	const handlePieCenterPointerDown = (event) => {
		event.preventDefault();
		event.stopPropagation();
	};
	const handlePieCenterClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		controller()?.closeViewportPieMenu?.();
	};
	const handlePieActionPointerDown = (event) => {
		event.preventDefault();
		event.stopPropagation();
	};
	const handlePieActionClick = (actionId, event) => {
		event.preventDefault();
		event.stopPropagation();
		controller()?.executeViewportPieAction?.(actionId, event);
	};
	const getReferenceImageContainerStyle = (layer) => ({
		left: `${layer.leftPx}px`,
		top: `${layer.topPx}px`,
		width: `${layer.widthPx}px`,
		height: `${layer.heightPx}px`,
		opacity: layer.opacity,
		transform: `rotate(${layer.rotationDeg}deg)`,
		transformOrigin: `${layer.anchorAx * 100}% ${layer.anchorAy * 100}%`,
	});
	const getReferenceImageImageStyle = (layer) => ({
		imageRendering: layer.pixelPerfect ? "pixelated" : "auto",
	});
	const getReferenceImageSelectionBoxStyle = (selectionBox) => ({
		left: `${selectionBox.leftPx}px`,
		top: `${selectionBox.topPx}px`,
		width: `${selectionBox.widthPx}px`,
		height: `${selectionBox.heightPx}px`,
		transform: `rotate(${selectionBox.rotationDeg}deg)`,
		transformOrigin: `${selectionBox.anchorAx * 100}% ${selectionBox.anchorAy * 100}%`,
	});
	const getReferenceImageSelectionAnchorStyle = (selectionBox) => ({
		left: `${selectionBox.anchorAx * 100}%`,
		top: `${selectionBox.anchorAy * 100}%`,
	});
	const viewportShellElement =
		refs.viewportShellRef?.current ?? refs.viewportShellRef ?? null;
	const renderBoxElement =
		refs.renderBoxRef?.current ?? refs.renderBoxRef ?? null;
	const dropHintStyle = computeDropHintStyle({
		viewportRect: getOverlayBounds(viewportShellElement, {
			preferClientSize: true,
		}),
		renderBoxRect: getOverlayBounds(renderBoxElement),
	});
	const splatEditHudStyle =
		Number.isFinite(splatEditHudPosition?.x) &&
		Number.isFinite(splatEditHudPosition?.y)
			? {
					left: `${splatEditHudPosition.x}px`,
					top: `${splatEditHudPosition.y}px`,
					right: "auto",
					bottom: "auto",
					margin: "0",
				}
			: undefined;
	const startReferenceImageMove = (itemId, event) =>
		controller()?.startReferenceImageMove?.(itemId, event);
	const startReferenceImageResize = (handleKey, event) =>
		controller()?.startReferenceImageResize?.(handleKey, event);
	const startReferenceImageRotate = (zoneKey, event) =>
		controller()?.startReferenceImageRotate?.(zoneKey, event);
	const startReferenceImageAnchorDrag = (event) =>
		controller()?.startReferenceImageAnchorDrag?.(event);
	const startSplatEditHudDrag = (event) => {
		if (event.button !== 0) {
			return;
		}
		const shellElement =
			refs.viewportShellRef?.current ?? refs.viewportShellRef ?? null;
		const hudElement = event.currentTarget?.closest?.(
			".viewport-splat-edit-toolbar",
		);
		if (
			!(shellElement instanceof HTMLElement) ||
			!(hudElement instanceof HTMLElement)
		) {
			return;
		}
		const shellRect = shellElement.getBoundingClientRect();
		const hudRect = hudElement.getBoundingClientRect();
		splatEditHudDragRef.current = {
			pointerId: event.pointerId,
			offsetX: event.clientX - hudRect.left,
			offsetY: event.clientY - hudRect.top,
			width: hudRect.width,
			height: hudRect.height,
			shellRect,
		};
		event.currentTarget?.setPointerCapture?.(event.pointerId);
		event.preventDefault();
		event.stopPropagation();
	};

	useLayoutEffect(() => {
		const handlePointerMove = (event) => {
			const dragState = splatEditHudDragRef.current;
			if (!dragState || event.pointerId !== dragState.pointerId) {
				return;
			}
			const nextX = Math.min(
				Math.max(
					0,
					event.clientX - dragState.shellRect.left - dragState.offsetX,
				),
				Math.max(0, dragState.shellRect.width - dragState.width),
			);
			const nextY = Math.min(
				Math.max(
					0,
					event.clientY - dragState.shellRect.top - dragState.offsetY,
				),
				Math.max(0, dragState.shellRect.height - dragState.height),
			);
			store.splatEdit.hudPosition.value = {
				x: Math.round(nextX),
				y: Math.round(nextY),
			};
		};
		const handlePointerEnd = (event) => {
			if (splatEditHudDragRef.current?.pointerId === event.pointerId) {
				splatEditHudDragRef.current = null;
			}
		};
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerEnd);
		window.addEventListener("pointercancel", handlePointerEnd);
		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerEnd);
			window.removeEventListener("pointercancel", handlePointerEnd);
		};
	}, [store]);

	const transformHandleConfigs = [
		{
			id: "move-x",
			label: "X",
			className: "viewport-gizmo__handle--axis viewport-gizmo__handle--x",
			axis: "x",
		},
		{
			id: "move-y",
			label: "Y",
			className: "viewport-gizmo__handle--axis viewport-gizmo__handle--y",
			axis: "y",
		},
		{
			id: "move-z",
			label: "Z",
			className: "viewport-gizmo__handle--axis viewport-gizmo__handle--z",
			axis: "z",
		},
		{
			id: "scale-uniform",
			label: "S",
			className: "viewport-gizmo__handle--scale",
		},
	];

	return html`
		<main
			id="viewport-shell"
			ref=${refs.viewportShellRef}
			data-workspace-layout=${workspaceLayout}
			data-workspace-orientation=${workspaceSplitOrientation}
			data-active-workspace-pane=${activeWorkspacePaneId}
			data-camera-pane-visible=${cameraPaneVisible ? "true" : "false"}
			data-viewport-pane-visible=${viewportPaneVisible ? "true" : "false"}
			data-mobile-workbench=${store.mobileUi?.active?.value ? "true" : "false"}
			style=${{
				"--workspace-split-ratio": String(workspaceSplitRatio),
				"--workspace-camera-size": `calc(${(workspaceSplitRatio * 100).toFixed(
					4,
				)}% - ${(workspaceSplitRatio * WORKSPACE_SPLITTER_SIZE_PX).toFixed(
					4,
				)}px)`,
			}}
			class=${[
				"viewport-shell",
				workbenchCollapsed
					? "viewport-shell--inspector-collapsed"
					: "viewport-shell--inspector-open",
				hasBackReferenceImagePreview
					? "viewport-shell--back-reference-visible"
					: "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<canvas
				id="viewport"
				ref=${refs.viewportCanvasRef}
				tabindex="0"
				aria-label=${t(`mode.${activeWorkspacePane?.role ?? "camera"}`)}
			></canvas>
			<div
				class="workspace-pane-layout"
				role="group"
				aria-label=${t("workspace.views")}
			>
				<${WorkspacePaneChrome}
					pane=${cameraWorkspacePane}
					active=${activeWorkspacePaneId === cameraWorkspacePane?.id}
					split=${workspaceSplit}
					controller=${controller}
					paneRef=${refs.cameraPaneRef}
					t=${t}
				/>
				${
					workspaceSplit &&
					html`
						<div
							ref=${refs.workspaceSplitterRef}
							class="workspace-splitter"
							role="separator"
							tabindex="0"
							aria-label=${t("workspace.resizeViews")}
							aria-orientation=${
								workspaceSplitOrientation === "horizontal"
									? "vertical"
									: "horizontal"
							}
							aria-valuemin=${Math.round(workspaceSplitMinRatio * 100)}
							aria-valuemax=${Math.round(workspaceSplitMaxRatio * 100)}
							aria-valuenow=${Math.round(workspaceSplitRatio * 100)}
							onPointerDown=${startWorkspaceSplitDrag}
							onPointerMove=${updateWorkspaceSplitFromPointer}
							onPointerUp=${finishWorkspaceSplitDrag}
							onPointerCancel=${finishWorkspaceSplitDrag}
							onKeyDown=${handleWorkspaceSplitKeyDown}
						></div>
					`
				}
				<${WorkspacePaneChrome}
					pane=${viewportWorkspacePane}
					active=${activeWorkspacePaneId === viewportWorkspacePane?.id}
					split=${workspaceSplit}
					controller=${controller}
					paneRef=${refs.viewportPaneRef}
					t=${t}
				/>
			</div>
			<${ViewportProjectStatusHud} store=${store} controller=${controller} t=${t} />
			<${BackgroundTaskIndicator} store=${store} t=${t} />
			<div class="active-workspace-pane-overlay">
				<${SplatEditBrushPreview}
					store=${store}
					viewportShellRef=${activeWorkspacePaneRef}
				/>
				<div class="viewport-orbit-reticle" aria-hidden="true">
					<div class="viewport-orbit-reticle__ring"></div>
					<div class="viewport-orbit-reticle__dot"></div>
				</div>
			</div>
			${
				splatEditActive &&
				html`<${SplatEditToolbar}
					store=${store}
					controller=${controller}
					t=${t}
					style=${splatEditHudStyle}
					onDragPointerDown=${startSplatEditHudDrag}
				/>`
			}
			<div
				id="drop-hint"
				ref=${refs.dropHintRef}
				class="drop-hint"
				style=${dropHintStyle}
			>
				<span class="drop-hint__meta">
					${`CAMERA_FRAMES ${getBuildVersionLabel()}`}
				</span>
				<strong>${t("drop.title")}</strong>
				<span>${t("drop.body")}</span>
				<div class="drop-hint__controls">
					<strong class="drop-hint__controls-title">
						${t("drop.controlsTitle")}
					</strong>
					<div class="drop-hint__controls-grid">
						<span>${t("drop.controlOrbit")}</span>
						<span>${t("drop.controlPan")}</span>
						<span>${t("drop.controlDolly")}</span>
						<span>${t("drop.controlAnchorOrbit")}</span>
					</div>
				</div>
			</div>
			<div class="reference-image-layer reference-image-layer--back">
				${backReferenceImageLayers.map(
					(layer) => html`
						<div
							key=${layer.id}
							class=${
								selectedReferenceImageIds.has(layer.id)
									? "reference-image-layer__entry reference-image-layer__entry--selected"
									: "reference-image-layer__entry"
							}
							style=${getReferenceImageContainerStyle(layer)}
						>
							<img
								class=${
									layer.pixelPerfect
										? "reference-image-layer__item reference-image-layer__item--pixelated"
										: "reference-image-layer__item"
								}
								src=${layer.sourceUrl}
								alt=${layer.name}
								title=${layer.fileName || layer.name}
								draggable="false"
								style=${getReferenceImageImageStyle(layer)}
							/>
						</div>
					`,
				)}
			</div>
			<div class="active-workspace-pane-overlay active-workspace-pane-overlay--transient">
				${
					pieState.open &&
					html`
						<div
							class=${
								pieState.coarse
									? "viewport-pie viewport-pie--coarse"
									: "viewport-pie"
							}
							style=${{
								left: `${pieState.x}px`,
								top: `${pieState.y}px`,
								"--cf-pie-scale": String(pieState.scale ?? 1),
							}}
						>
							<button
								type="button"
								class="viewport-pie__center"
								onPointerDown=${handlePieCenterPointerDown}
								onClick=${handlePieCenterClick}
							>
								<span class="viewport-pie__center-label">
									${hoveredPieAction?.label ?? t("action.quickMenu")}
								</span>
							</button>
							${pieActions.map((action) => {
								const offsetX =
									Math.cos(action.angle) *
									(pieState.radius ?? VIEWPORT_PIE_RADIUS);
								const offsetY =
									Math.sin(action.angle) *
									(pieState.radius ?? VIEWPORT_PIE_RADIUS);
								return html`
									<button
										key=${action.id}
										type="button"
										class=${[
											"viewport-pie__item",
											action.id === pieState.hoveredActionId || action.active
												? "viewport-pie__item--active"
												: "",
											action.disabled ? "viewport-pie__item--disabled" : "",
										]
											.filter(Boolean)
											.join(" ")}
										style=${{
											left: `${offsetX}px`,
											top: `${offsetY}px`,
										}}
										disabled=${Boolean(action.disabled)}
										onPointerDown=${handlePieActionPointerDown}
										onClick=${(event) =>
											action.disabled
												? undefined
												: handlePieActionClick(action.id, event)}
									>
										<span class="viewport-pie__item-icon">
											<${WorkbenchIcon} name=${action.icon} size=${18} />
										</span>
									</button>
								`;
							})}
						</div>
					`
				}
			</div>
			<div class="active-workspace-pane-overlay">
				${
					lensHud.visible &&
					html`
						<div
							class="viewport-lens-hud"
							style=${{
								left: `${lensHud.x}px`,
								top: `${lensHud.y}px`,
							}}
						>
							<strong>${lensHud.mmLabel}</strong>
							<span>${lensHud.fovLabel}</span>
						</div>
					`
				}
				${
					rollHud.visible &&
					html`
						<div
							class="viewport-lens-hud viewport-roll-hud"
							style=${{
								left: `${rollHud.x}px`,
								top: `${rollHud.y}px`,
							}}
						>
							<strong>${rollHud.angleLabel}</strong>
							<span>${t("action.adjustRoll")}</span>
						</div>
					`
				}
				<${MeasurementOverlay} store=${store} controller=${controller} t=${t} />
			</div>
			<${ViewportAxisGizmo}
				controller=${controller}
				rootRef=${refs.viewportAxisGizmoRef}
				svgRef=${refs.viewportAxisGizmoSvgRef}
			/>
			<${FrameMaskCanvas} store=${store} refs=${refs} />
			<div class="camera-workspace-pane-overlay camera-pane-layer">
			<div
				id="render-box"
				ref=${refs.renderBoxRef}
				class=${
					blockOverlayInteractions
						? "render-box render-box--interaction-disabled"
						: "render-box"
				}
			>
				<${CompositionGuideLayer} store=${store} forceVisible=${true} />
				<${FrameLayer}
					store=${store}
					controller=${controller}
					frameOverlayCanvasRef=${refs.frameOverlayCanvasRef}
					canvasOnly=${true}
					interactionsEnabled=${!blockOverlayInteractions}
				/>
				<${FrameLayer}
					store=${store}
					controller=${controller}
					itemsOnly=${true}
					interactionsEnabled=${!blockOverlayInteractions}
				/>
				${OUTPUT_FRAME_RESIZE_HANDLES.map(
					(handle) => html`
						<button
							type="button"
							class=${`render-box__resize-handle render-box__resize-handle--${handle}`}
							aria-label=${outputFrameLabel}
							onPointerDown=${
								blockOverlayInteractions
									? undefined
									: (event) =>
											controller()?.startOutputFrameResize(handle, event)
							}
						></button>
					`,
				)}
				${OUTPUT_FRAME_PAN_EDGES.map(
					(edge) => html`
						<button
							type="button"
							class=${`render-box__pan-edge render-box__pan-edge--${edge}`}
							aria-label=${outputFrameLabel}
							onPointerDown=${
								blockOverlayInteractions
									? undefined
									: (event) => controller()?.startOutputFramePan(event)
							}
						></button>
					`,
				)}
				<div
					id="render-box-meta"
					ref=${refs.renderBoxMetaRef}
					class="render-box__meta"
					onPointerDown=${
						blockOverlayInteractions
							? undefined
							: (event) => controller()?.startOutputFramePan(event)
					}
				>
					${store.exportSizeLabel.value} · ${store.renderBox.anchor.value}
				</div>
				<div
					id="anchor-dot"
					ref=${refs.anchorDotRef}
					class="render-box__anchor"
				></div>
			</div>
			</div>
			<div class="reference-image-layer reference-image-layer--front">
				${frontReferenceImageLayers.map(
					(layer) => html`
						<div
							key=${layer.id}
							class=${
								selectedReferenceImageIds.has(layer.id)
									? "reference-image-layer__entry reference-image-layer__entry--selected"
									: "reference-image-layer__entry"
							}
							style=${getReferenceImageContainerStyle(layer)}
						>
							<img
								class=${
									layer.pixelPerfect
										? "reference-image-layer__item reference-image-layer__item--pixelated"
										: "reference-image-layer__item"
								}
								src=${layer.sourceUrl}
								alt=${layer.name}
								title=${layer.fileName || layer.name}
								draggable="false"
								style=${getReferenceImageImageStyle(layer)}
							/>
						</div>
					`,
				)}
			</div>
			${
				referenceImageEditMode &&
				html`
					<div class="reference-image-hit-layer">
						${referenceImageLayers.map(
							(layer) => html`
								<div
									key=${layer.id}
									class="reference-image-layer__entry reference-image-layer__entry--interactive reference-image-hit-layer__entry"
									style=${getReferenceImageContainerStyle(layer)}
									onPointerDown=${(event) =>
										startReferenceImageMove(layer.id, event)}
								></div>
							`,
						)}
					</div>
				`
			}
			${
				referenceImageEditMode &&
				referenceImageSelectionBox &&
				html`
					<div class="reference-image-selection-layer">
						<div
							class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
							data-anchor-handle=${referenceImageSelectionBox.anchorHandleKey}
							style=${getReferenceImageSelectionBoxStyle(
								referenceImageSelectionBox,
							)}
						>
							${OUTPUT_FRAME_PAN_EDGES.map(
								(edge) => html`
									<button
										key=${edge}
										type="button"
										class=${`frame-item__edge frame-item__edge--${edge}`}
										onPointerDown=${(event) =>
											startReferenceImageMove(
												activeReferenceImageLayer?.id ?? "",
												event,
											)}
									></button>
								`,
							)}
							${REFERENCE_IMAGE_TRANSFORM_HANDLES.map(
								(handle) => html`
									<button
										key=${handle}
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${handle}`}
										style=${{
											cursor: getFrameResizeCursorCss(
												referenceImageSelectionBox.rotationDeg,
												handle,
											),
										}}
										onPointerDown=${(event) =>
											startReferenceImageResize(handle, event)}
									></button>
								`,
							)}
							${REFERENCE_IMAGE_ROTATION_ZONES.map(
								(zone) => html`
									<button
										key=${zone}
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${zone}`}
										style=${{
											cursor: getFrameRotateCursorCss(
												referenceImageSelectionBox.rotationDeg,
												zone,
											),
										}}
										onPointerDown=${(event) =>
											startReferenceImageRotate(zone, event)}
									></button>
								`,
							)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${getReferenceImageSelectionAnchorStyle(
									referenceImageSelectionBox,
								)}
								onPointerDown=${startReferenceImageAnchorDrag}
							></button>
						</div>
					</div>
				`
			}
			<div class="active-workspace-pane-overlay">
				<div
					id="viewport-gizmo"
					ref=${refs.viewportGizmoRef}
					class="viewport-gizmo is-hidden"
				>
				<svg
					class="viewport-gizmo__rings"
					ref=${refs.viewportGizmoSvgRef}
					width="100%"
					height="100%"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					${["xy", "yz", "zx"].map(
						(plane) => html`
							<path
								key=${`move-${plane}`}
								class=${`viewport-gizmo__plane viewport-gizmo__plane--${plane}`}
								data-gizmo-plane=${`move-${plane}`}
								onPointerEnter=${() =>
									controller()?.setViewportTransformHover(`move-${plane}`)}
								onPointerLeave=${() =>
									controller()?.setViewportTransformHover(null)}
								onPointerDown=${(event) =>
									controller()?.startViewportTransformDrag(
										`move-${plane}`,
										event,
									)}
							/>
						`,
					)}
					${["x", "y", "z"].flatMap((axis) => [
						html`
							<path
								key=${`rotate-${axis}-back`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${axis} viewport-gizmo__ring--back`}
								data-gizmo-ring=${`rotate-${axis}-back`}
								onPointerEnter=${() =>
									controller()?.setViewportTransformHover(`rotate-${axis}`)}
								onPointerLeave=${() =>
									controller()?.setViewportTransformHover(null)}
								onPointerDown=${(event) =>
									controller()?.startViewportTransformDrag(
										`rotate-${axis}`,
										event,
									)}
							/>
						`,
						html`
							<path
								key=${`rotate-${axis}-front`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${axis} viewport-gizmo__ring--front`}
								data-gizmo-ring=${`rotate-${axis}-front`}
								onPointerEnter=${() =>
									controller()?.setViewportTransformHover(`rotate-${axis}`)}
								onPointerLeave=${() =>
									controller()?.setViewportTransformHover(null)}
								onPointerDown=${(event) =>
									controller()?.startViewportTransformDrag(
										`rotate-${axis}`,
										event,
									)}
							/>
						`,
					])}
				</svg>
				${transformHandleConfigs.map(
					(handle) => html`
						<button
							key=${handle.id}
							type="button"
							class=${`viewport-gizmo__handle ${handle.className}`}
							data-gizmo-handle=${handle.id}
							aria-label=${handle.ariaLabel ?? handle.label}
							onPointerEnter=${() =>
								controller()?.setViewportTransformHover(handle.id)}
							onPointerLeave=${() =>
								controller()?.setViewportTransformHover(null)}
							onPointerDown=${(event) =>
								controller()?.startViewportTransformDrag(handle.id, event)}
						>
							<span>${handle.label}</span>
						</button>
					`,
				)}
				</div>
			</div>
		</main>
	`;
}
