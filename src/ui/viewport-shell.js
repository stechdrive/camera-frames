import { html } from "htm/preact";
import { getBuildVersionLabel } from "../build-info.js";
import { BASE_FRAME } from "../constants.js";
import { getFrameAnchorHandleKey } from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	VIEWPORT_PIE_RADIUS,
	buildViewportPieActions,
} from "../engine/viewport-pie.js";
import { FrameLayer } from "./frame-layer.js";
import { getProjectStatusDisplay } from "./project-status.js";
import { ViewportAxisGizmo } from "./viewport-axis-gizmo.js";
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

function getFrameBoundingBoxPercent(frame, exportWidth, exportHeight) {
	const scale = Number(frame?.scale);
	const frameScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
	const widthPct =
		(BASE_FRAME.width * frameScale * 100) / Math.max(exportWidth, 1e-6);
	const heightPct =
		(BASE_FRAME.height * frameScale * 100) / Math.max(exportHeight, 1e-6);
	const centerX = (Number(frame?.x) || 0.5) * 100;
	const centerY = (Number(frame?.y) || 0.5) * 100;
	const rotationRadians = ((Number(frame?.rotation) || 0) * Math.PI) / 180 || 0;
	const halfWidth = widthPct * 0.5;
	const halfHeight = heightPct * 0.5;
	const corners = [
		{ x: -halfWidth, y: -halfHeight },
		{ x: halfWidth, y: -halfHeight },
		{ x: halfWidth, y: halfHeight },
		{ x: -halfWidth, y: halfHeight },
	].map((corner) => ({
		x:
			centerX +
			corner.x * Math.cos(rotationRadians) -
			corner.y * Math.sin(rotationRadians),
		y:
			centerY +
			corner.x * Math.sin(rotationRadians) +
			corner.y * Math.cos(rotationRadians),
	}));
	const xs = corners.map((corner) => corner.x);
	const ys = corners.map((corner) => corner.y);
	const left = Math.max(0, Math.min(...xs));
	const top = Math.max(0, Math.min(...ys));
	const right = Math.min(100, Math.max(...xs));
	const bottom = Math.min(100, Math.max(...ys));
	return {
		left,
		top,
		right,
		bottom,
		width: Math.max(0, right - left),
		height: Math.max(0, bottom - top),
	};
}

function getAggregateFrameBoundingBoxPercent(
	frames,
	exportWidth,
	exportHeight,
) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}
	const bounds = frames.map((frame) =>
		getFrameBoundingBoxPercent(frame, exportWidth, exportHeight),
	);
	return {
		left: Math.max(0, Math.min(...bounds.map((bound) => bound.left))),
		top: Math.max(0, Math.min(...bounds.map((bound) => bound.top))),
		right: Math.min(100, Math.max(...bounds.map((bound) => bound.right))),
		bottom: Math.min(100, Math.max(...bounds.map((bound) => bound.bottom))),
	};
}

export function ViewportShell({ store, controller, refs, t }) {
	const mode = store.mode.value;
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const frames = store.frames.documents.value;
	const selectedFrameIds = new Set(store.frames.selectedIds.value ?? []);
	const rememberedMaskFrameIds = new Set(
		store.frames.maskSelectedIds.value ?? [],
	);
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const referenceImageEditMode = store.viewportReferenceImageEditMode.value;
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
	const frameMaskBounds =
		mode === "camera" && maskedFrames.length > 0
			? getAggregateFrameBoundingBoxPercent(
					maskedFrames,
					store.exportWidth.value,
					store.exportHeight.value,
				)
			: null;
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
	const frameMaskViewportBounds =
		frameMaskBounds &&
		renderBoxElement instanceof HTMLElement &&
		renderBoxElement.offsetWidth > 0 &&
		renderBoxElement.offsetHeight > 0
			? {
					left:
						renderBoxElement.offsetLeft +
						(renderBoxElement.offsetWidth * frameMaskBounds.left) / 100,
					top:
						renderBoxElement.offsetTop +
						(renderBoxElement.offsetHeight * frameMaskBounds.top) / 100,
					right:
						renderBoxElement.offsetLeft +
						(renderBoxElement.offsetWidth * frameMaskBounds.right) / 100,
					bottom:
						renderBoxElement.offsetTop +
						(renderBoxElement.offsetHeight * frameMaskBounds.bottom) / 100,
				}
			: null;
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
			<${ViewportAxisGizmo}
				controller=${controller}
				rootRef=${refs.viewportAxisGizmoRef}
				svgRef=${refs.viewportAxisGizmoSvgRef}
			/>
			${
				frameMaskViewportBounds &&
				frameMaskOpacity > 0 &&
				html`
					<div class="frame-mask-layer">
						<div
							class="frame-mask-layer__segment"
							style=${{
								left: "0px",
								top: "0px",
								width: "100%",
								height: `${frameMaskViewportBounds.top}px`,
								opacity: frameMaskOpacity,
							}}
						></div>
						<div
							class="frame-mask-layer__segment"
							style=${{
								left: "0px",
								top: `${frameMaskViewportBounds.bottom}px`,
								width: "100%",
								height: `calc(100% - ${frameMaskViewportBounds.bottom}px)`,
								opacity: frameMaskOpacity,
							}}
						></div>
						<div
							class="frame-mask-layer__segment"
							style=${{
								left: "0px",
								top: `${frameMaskViewportBounds.top}px`,
								width: `${frameMaskViewportBounds.left}px`,
								height: `${Math.max(
									0,
									frameMaskViewportBounds.bottom - frameMaskViewportBounds.top,
								)}px`,
								opacity: frameMaskOpacity,
							}}
						></div>
						<div
							class="frame-mask-layer__segment"
							style=${{
								left: `${frameMaskViewportBounds.right}px`,
								top: `${frameMaskViewportBounds.top}px`,
								width: `calc(100% - ${frameMaskViewportBounds.right}px)`,
								height: `${Math.max(
									0,
									frameMaskViewportBounds.bottom - frameMaskViewportBounds.top,
								)}px`,
								opacity: frameMaskOpacity,
							}}
						></div>
					</div>
				`
			}
			<div id="render-box" ref=${refs.renderBoxRef} class="render-box">
				<${FrameLayer}
					store=${store}
					controller=${controller}
					frameOverlayCanvasRef=${refs.frameOverlayCanvasRef}
					canvasOnly=${true}
				/>
				<${FrameLayer}
					store=${store}
					controller=${controller}
					itemsOnly=${true}
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
