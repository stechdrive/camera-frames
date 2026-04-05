import { html } from "htm/preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { getBuildVersionLabel } from "../build-info.js";
import { BASE_FRAME, VIEWPORT_PIXEL_RATIO } from "../constants.js";
import { drawFrameMaskToContext } from "../engine/frame-mask-export.js";
import { getFrameAnchorHandleKey } from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	VIEWPORT_PIE_RADIUS,
	buildViewportPieActions,
} from "../engine/viewport-pie.js";
import { FrameLayer } from "./frame-layer.js";
import { MeasurementOverlay } from "./measurement-overlay.js";
import { getProjectStatusDisplay } from "./project-status.js";
import { ViewportAxisGizmo } from "./viewport-axis-gizmo.js";
import { NumericDraftInput } from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";

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

export function ViewportShell({ store, controller, refs, t }) {
	const frameMaskCanvasRef = useRef(null);
	const splatEditHudDragRef = useRef(null);
	const mode = store.mode.value;
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const splatEditActive = store.splatEdit.active.value;
	const splatEditTool = store.splatEdit.tool.value;
	const splatEditScopeCount = store.splatEdit.scopeAssetIds.value.length;
	const splatEditSelectionCount = store.splatEdit.selectionCount.value;
	const splatEditBoxCenter = store.splatEdit.boxCenter.value;
	const splatEditBoxSize = store.splatEdit.boxSize.value;
	const splatEditHudPosition = store.splatEdit.hudPosition.value;
	const frames = store.frames.documents.value;
	const selectedFrameIds = new Set(store.frames.selectedIds.value ?? []);
	const rememberedMaskFrameIds = new Set(
		store.frames.maskSelectedIds.value ?? [],
	);
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const referenceImageEditMode = store.viewportReferenceImageEditMode.value;
	const blockOverlayInteractions = referenceImageEditMode || splatEditActive;
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
	const maskedFrames =
		frameMaskMode === "all"
			? frames
			: frameMaskMode === "selected"
				? frames.filter((frame) => rememberedMaskFrameIds.has(frame.id))
				: [];
	const renderBoxElement =
		refs.renderBoxRef?.current ?? refs.renderBoxRef ?? null;
	const dropHintStyle =
		renderBoxElement instanceof HTMLElement &&
		renderBoxElement.offsetWidth > 0 &&
		renderBoxElement.offsetHeight > 0
			? {
					left: `${renderBoxElement.offsetLeft + renderBoxElement.offsetWidth * 0.5}px`,
					top: `${renderBoxElement.offsetTop + renderBoxElement.offsetHeight * 0.5}px`,
					bottom: "auto",
					transform: "translate(-50%, -50%)",
				}
			: undefined;
	const splatEditHudStyle =
		Number.isFinite(splatEditHudPosition?.x) &&
		Number.isFinite(splatEditHudPosition?.y)
			? {
					left: `${splatEditHudPosition.x}px`,
					top: `${splatEditHudPosition.y}px`,
					right: "auto",
					bottom: "auto",
				}
			: undefined;
	const frameMaskOpacity = Math.min(
		1,
		Math.max(0, (Number(frameMaskOpacityPct) || 0) / 100),
	);
	const { projectDisplayName, projectDirty, showProjectPackageDirty } =
		getProjectStatusDisplay(store, t);
	const startReferenceImageMove = (itemId, event) =>
		controller()?.startReferenceImageMove?.(itemId, event);
	const startReferenceImageResize = (handleKey, event) =>
		controller()?.startReferenceImageResize?.(handleKey, event);
	const startReferenceImageRotate = (zoneKey, event) =>
		controller()?.startReferenceImageRotate?.(zoneKey, event);
	const startReferenceImageAnchorDrag = (event) =>
		controller()?.startReferenceImageAnchorDrag?.(event);
	const setSplatEditTool = (tool) => controller()?.setSplatEditTool?.(tool);
	const formatSplatEditNumericValue = (numericValue) =>
		Number(numericValue ?? 0).toFixed(2);
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
	const renderSplatEditField = ({
		label,
		value,
		step = "0.10",
		min = undefined,
		historyLabel,
		onScrubValue,
		onCommitValue,
	}) => html`
		<div class="viewport-splat-edit-hud__field camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${label}</span>
			<div class="viewport-splat-edit-hud__field-input camera-property-axis-field__input field">
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

	const startSplatEditHudDrag = (event) => {
		if (event.button !== 0) {
			return;
		}
		const shellElement =
			refs.viewportShellRef?.current ?? refs.viewportShellRef ?? null;
		const hudElement = event.currentTarget?.closest?.(
			".viewport-splat-edit-hud",
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
		const canvas = frameMaskCanvasRef.current;
		const shellElement =
			refs.viewportShellRef?.current ?? refs.viewportShellRef ?? null;
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
			mode !== "camera" ||
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
			logicalSpaceWidth: store.exportWidth.value,
			logicalSpaceHeight: store.exportHeight.value,
			offsetX: renderBoxNode.offsetLeft,
			offsetY: renderBoxNode.offsetTop,
			fillStyle: `rgba(3, 6, 11, ${frameMaskOpacity})`,
		});
		context.setTransform(1, 0, 0, 1, 0, 0);
	}, [
		frameMaskOpacity,
		maskedFrames,
		mode,
		refs.renderBoxRef,
		refs.viewportShellRef,
		store.exportHeight.value,
		store.exportWidth.value,
	]);

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
			class=${
				workbenchCollapsed
					? "viewport-shell viewport-shell--inspector-collapsed"
					: "viewport-shell viewport-shell--inspector-open"
			}
		>
			<canvas id="viewport" ref=${refs.viewportCanvasRef} tabindex="0"></canvas>
			<div class="viewport-project-status" aria-hidden="true">
				<span class="viewport-project-status__name">${projectDisplayName}</span>
				${
					projectDirty &&
					html`
					<span class="viewport-project-status__badge">*</span>
				`
				}
				${
					showProjectPackageDirty &&
					html`
					<span
						class="viewport-project-status__badge viewport-project-status__badge--package"
					>
						PKG
					</span>
				`
				}
			</div>
			${
				splatEditActive &&
				html`
					<div class="viewport-splat-edit-hud" style=${splatEditHudStyle}>
						<div
							class="viewport-splat-edit-hud__header"
							onPointerDown=${startSplatEditHudDrag}
						>
							<strong>${t("action.splatEditTool")}</strong>
							<span>
								${t("status.splatEditScopeSummary", {
									scope: splatEditScopeCount,
									selected: splatEditSelectionCount,
								})}
							</span>
						</div>
						<div
							class="viewport-splat-edit-hud__tools"
							role="group"
							aria-label=${t("action.splatEditTool")}
						>
							<button
								type="button"
								class=${
									splatEditTool === "box"
										? "viewport-splat-edit-hud__tool viewport-splat-edit-hud__tool--active"
										: "viewport-splat-edit-hud__tool"
								}
								onClick=${() => setSplatEditTool("box")}
							>
								${t("status.splatEditToolBox")}
							</button>
							<button
								type="button"
								class=${
									splatEditTool === "brush"
										? "viewport-splat-edit-hud__tool viewport-splat-edit-hud__tool--active"
										: "viewport-splat-edit-hud__tool"
								}
								onClick=${() => setSplatEditTool("brush")}
							>
								${t("status.splatEditToolBrush")}
							</button>
						</div>
						${
							splatEditTool === "box" &&
							html`
								<div class="viewport-splat-edit-hud__section">
									<span class="viewport-splat-edit-hud__section-label">
										${t("status.splatEditCenter")}
									</span>
									<div class="viewport-splat-edit-hud__grid">
										${renderSplatEditField({
											label: t("field.positionX"),
											value: splatEditBoxCenter?.x ?? 0,
											historyLabel: "splat-edit.box-center.x",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxCenterInput("x", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxCenterInput("x", nextValue),
										})}
										${renderSplatEditField({
											label: t("field.positionY"),
											value: splatEditBoxCenter?.y ?? 0,
											historyLabel: "splat-edit.box-center.y",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxCenterInput("y", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxCenterInput("y", nextValue),
										})}
										${renderSplatEditField({
											label: t("field.positionZ"),
											value: splatEditBoxCenter?.z ?? 0,
											historyLabel: "splat-edit.box-center.z",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxCenterInput("z", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxCenterInput("z", nextValue),
										})}
									</div>
								</div>
								<div class="viewport-splat-edit-hud__section">
									<span class="viewport-splat-edit-hud__section-label">
										${t("status.splatEditSize")}
									</span>
									<div class="viewport-splat-edit-hud__grid">
										${renderSplatEditField({
											label: t("field.positionX"),
											value: splatEditBoxSize?.x ?? 1,
											min: "0.01",
											historyLabel: "splat-edit.box-size.x",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxSizeInput("x", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxSizeInput("x", nextValue),
										})}
										${renderSplatEditField({
											label: t("field.positionY"),
											value: splatEditBoxSize?.y ?? 1,
											min: "0.01",
											historyLabel: "splat-edit.box-size.y",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxSizeInput("y", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxSizeInput("y", nextValue),
										})}
										${renderSplatEditField({
											label: t("field.positionZ"),
											value: splatEditBoxSize?.z ?? 1,
											min: "0.01",
											historyLabel: "splat-edit.box-size.z",
											onScrubValue: (nextValue) =>
												handleSplatEditBoxSizeInput("z", nextValue),
											onCommitValue: (nextValue) =>
												handleSplatEditBoxSizeInput("z", nextValue),
										})}
									</div>
								</div>
								<div class="viewport-splat-edit-hud__actions">
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() => controller()?.scaleSplatEditBoxUniform?.(0.9)}
									>
										${t("status.splatEditScaleDown")}
									</button>
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() => controller()?.scaleSplatEditBoxUniform?.(1.1)}
									>
										${t("status.splatEditScaleUp")}
									</button>
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() => controller()?.fitSplatEditBoxToScope?.()}
									>
										${t("status.splatEditFitScope")}
									</button>
								</div>
								<div class="viewport-splat-edit-hud__actions">
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() =>
											controller()?.applySplatEditBoxSelection?.({
												subtract: false,
											})}
									>
										${t("status.splatEditAdd")}
									</button>
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() =>
											controller()?.applySplatEditBoxSelection?.({
												subtract: true,
											})}
									>
										${t("status.splatEditSubtract")}
									</button>
									<button
										type="button"
										class="viewport-splat-edit-hud__tool"
										onClick=${() => controller()?.clearSplatSelection?.()}
									>
										${t("action.clearSelection")}
									</button>
								</div>
							`
						}
					</div>
				`
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
									? referenceImageEditMode
										? "reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive"
										: "reference-image-layer__entry reference-image-layer__entry--selected"
									: referenceImageEditMode
										? "reference-image-layer__entry reference-image-layer__entry--interactive"
										: "reference-image-layer__entry"
							}
							style=${getReferenceImageContainerStyle(layer)}
							onPointerDown=${
								referenceImageEditMode
									? (event) => startReferenceImageMove(layer.id, event)
									: undefined
							}
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
			<${ViewportAxisGizmo}
				controller=${controller}
				rootRef=${refs.viewportAxisGizmoRef}
				svgRef=${refs.viewportAxisGizmoSvgRef}
			/>
			${
				mode === "camera" &&
				frameMaskOpacity > 0 &&
				maskedFrames.length > 0 &&
				html`
					<div class="frame-mask-layer">
						<canvas
							ref=${frameMaskCanvasRef}
							class="frame-mask-layer__canvas"
						></canvas>
					</div>
				`
			}
			<div
				id="render-box"
				ref=${refs.renderBoxRef}
				class=${
					blockOverlayInteractions
						? "render-box render-box--interaction-disabled"
						: "render-box"
				}
			>
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
			<div class="reference-image-layer reference-image-layer--front">
				${frontReferenceImageLayers.map(
					(layer) => html`
						<div
							key=${layer.id}
							class=${
								selectedReferenceImageIds.has(layer.id)
									? referenceImageEditMode
										? "reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive"
										: "reference-image-layer__entry reference-image-layer__entry--selected"
									: referenceImageEditMode
										? "reference-image-layer__entry reference-image-layer__entry--interactive"
										: "reference-image-layer__entry"
							}
							style=${getReferenceImageContainerStyle(layer)}
							onPointerDown=${
								referenceImageEditMode
									? (event) => startReferenceImageMove(layer.id, event)
									: undefined
							}
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
		</main>
	`;
}
