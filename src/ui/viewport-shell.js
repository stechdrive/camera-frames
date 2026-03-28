import { html } from "htm/preact";
import { getBuildVersionLabel } from "../build-info.js";
import { getFrameAnchorHandleKey } from "../engine/frame-transform.js";
import { getFrameResizeCursorCss } from "../engine/resize-cursor.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	VIEWPORT_PIE_RADIUS,
	buildViewportPieActions,
} from "../engine/viewport-pie.js";
import { FrameLayer } from "./frame-layer.js";
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
		? buildViewportPieActions({ mode: store.mode.value, t })
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
		<main id="viewport-shell" ref=${refs.viewportShellRef} class="viewport-shell">
			<canvas id="viewport" ref=${refs.viewportCanvasRef} tabindex="0"></canvas>
			<div id="drop-hint" ref=${refs.dropHintRef} class="drop-hint">
				<span class="drop-hint__meta">
					${`CAMERA_FRAMES ${getBuildVersionLabel()}`}
				</span>
				<strong>${t("drop.title")}</strong>
				<span>${t("drop.body")}</span>
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
									class=${
										action.id === pieState.hoveredActionId
											? "viewport-pie__item viewport-pie__item--active"
											: "viewport-pie__item"
									}
									style=${{
										left: `${offsetX}px`,
										top: `${offsetY}px`,
									}}
									onPointerDown=${handlePieActionPointerDown}
									onClick=${(event) => handlePieActionClick(action.id, event)}
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
							class="frame-item frame-item--selected reference-image-transform-box"
							data-anchor-handle=${referenceImageSelectionBox.anchorHandleKey}
							style=${getReferenceImageSelectionBoxStyle(
								referenceImageSelectionBox,
							)}
						>
							${OUTPUT_FRAME_PAN_EDGES.map(
								(edge) => html`
									<button
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
