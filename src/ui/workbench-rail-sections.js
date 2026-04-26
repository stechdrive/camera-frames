import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
	FRAME_MAX_COUNT,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
} from "../constants.js";
import {
	NumericDraftInput,
	applyStandardFrameHorizontalEquivalentMm,
} from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	HeaderMenu,
	IconButton,
	TooltipBubble,
	WorkbenchTabs,
} from "./workbench-primitives.js";
import { getInspectorTabs } from "./workbench-section-ids.js";

function ZoomToolPopover({ controller, mode, store, t }) {
	const isCameraMode = mode === "camera";
	const title = isCameraMode ? t("section.displayZoom") : t("section.view");
	const value = isCameraMode
		? Math.round(store.renderBox.viewZoom.value * 100)
		: Number(store.viewportEquivalentMmValue.value).toFixed(2);
	const canFitView = isCameraMode
		? Boolean(controller()?.canFitOutputFrameToSafeArea?.())
		: false;

	return html`
		<div class="workbench-tool-rail__popover" role="group" aria-label=${title}>
			<label class="field workbench-tool-rail__popover-field">
				<span>${title}</span>
				<div class="workbench-tool-rail__popover-value">
					<div class="workbench-tool-rail__popover-input">
						<${NumericDraftInput}
							id=${isCameraMode ? "tool-view-zoom" : "tool-viewport-fov"}
							inputMode="decimal"
							min=${isCameraMode ? MIN_CAMERA_VIEW_ZOOM_PCT : 14}
							max=${isCameraMode ? MAX_CAMERA_VIEW_ZOOM_PCT : 200}
							step=${isCameraMode ? "1" : "0.01"}
							value=${value}
							controller=${controller}
							historyLabel=${isCameraMode ? "output-frame.zoom" : "viewport.lens"}
							onCommit=${(nextValue) =>
								isCameraMode
									? controller()?.setViewZoomPercent?.(nextValue)
									: applyStandardFrameHorizontalEquivalentMm(
											(nextBaseFov) =>
												controller()?.setViewportBaseFovX(nextBaseFov),
											nextValue,
										)}
						/>
					</div>
					<span
						class="workbench-tool-rail__popover-suffix"
						aria-label=${t(isCameraMode ? "unit.percent" : "unit.millimeter")}
						>${isCameraMode ? "%" : "mm"}</span
					>
				</div>
			</label>
			${
				!isCameraMode &&
				html`
					<p class="workbench-tool-rail__popover-summary">
						${t("field.viewportFov")} ${store.viewportFovLabel.value}
					</p>
				`
			}
			${
				isCameraMode &&
				html`
					<div class="button-row button-row--compact workbench-tool-rail__popover-actions">
						<${IconButton}
							icon="reset"
							label=${t("action.fitOutputFrameToSafeArea")}
							compact=${true}
							disabled=${!canFitView}
							onClick=${() => controller()?.fitOutputFrameToSafeArea?.()}
						/>
					</div>
				`
			}
		</div>
	`;
}

function MaskToolPopover({ controller, hasFrames, store, t }) {
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const frameMaskShape = store.frames.maskShape.value;
	const frameTrajectoryMode = store.frames.trajectoryMode.value;
	const activeTrajectoryNodeMode = store.frames.trajectoryNodeMode.value;
	const frameTrajectoryExportSource = store.frames.trajectoryExportSource.value;
	const trajectoryEditMode = store.frames.trajectoryEditMode.value;
	const rememberedMaskFrameIds = store.frames.maskSelectedIds.value ?? [];
	const selectedFrameIds = store.frames.selectedIds.value ?? [];
	const activeFrameId = store.frames.activeId.value;
	const remainingCapacity = FRAME_MAX_COUNT - store.frames.count.value;
	const hasSelectedFrames = rememberedMaskFrameIds.length > 0;
	const hasTrajectoryPath = store.frames.count.value > 1;
	const hasEditableTrajectoryNode =
		hasTrajectoryPath &&
		frameTrajectoryMode === "spline" &&
		Boolean(activeFrameId);
	const duplicateCount = Math.max(
		selectedFrameIds.length,
		activeFrameId ? 1 : 0,
	);
	const canCreateFrame = store.frames.count.value < FRAME_MAX_COUNT;
	const canDuplicateFrames =
		duplicateCount > 0 && remainingCapacity >= duplicateCount;
	const canDeleteFrames = selectedFrameIds.length > 0 || Boolean(activeFrameId);
	const frameMaskShapeOptions = [
		{ value: "bounds", label: t("frameMaskShape.bounds") },
		{ value: "trajectory", label: t("frameMaskShape.trajectory") },
	];
	const trajectoryModeOptions = [
		{ value: "line", label: t("frameTrajectoryMode.line") },
		{ value: "spline", label: t("frameTrajectoryMode.spline") },
	];
	const trajectoryNodeModeOptions = [
		{ value: "auto", label: t("frameTrajectoryNodeMode.auto") },
		{ value: "corner", label: t("frameTrajectoryNodeMode.corner") },
		{ value: "mirrored", label: t("frameTrajectoryNodeMode.mirrored") },
		{ value: "free", label: t("frameTrajectoryNodeMode.free") },
	];
	const trajectoryExportSourceOptions = [
		{ value: "none", label: t("trajectorySource.none") },
		{ value: "center", label: t("trajectorySource.center") },
		{ value: "top-left", label: t("trajectorySource.topLeft") },
		{ value: "top-right", label: t("trajectorySource.topRight") },
		{ value: "bottom-right", label: t("trajectorySource.bottomRight") },
		{ value: "bottom-left", label: t("trajectorySource.bottomLeft") },
	];

	return html`
		<div
			class="workbench-tool-rail__popover workbench-tool-rail__popover--mask"
			role="group"
			aria-label=${t("action.frameTool")}
		>
			<label class="field workbench-tool-rail__popover-field">
				<span>${t("section.frames")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${IconButton}
						icon="plus"
						label=${t("action.newFrame")}
						compact=${true}
						className="frame-mask-toolbar__button"
						disabled=${!canCreateFrame}
						onClick=${() => controller()?.createFrame?.()}
						tooltip=${{
							title: t("action.newFrame"),
							placement: "right",
						}}
					/>
					<${IconButton}
						icon="duplicate"
						label=${t("action.duplicateFrame")}
						compact=${true}
						className="frame-mask-toolbar__button"
						disabled=${!canDuplicateFrames}
						onClick=${() =>
							controller()?.duplicateSelectedFrames?.(
								selectedFrameIds.length > 0 ? selectedFrameIds : null,
							)}
						tooltip=${{
							title: t("action.duplicateFrame"),
							placement: "right",
						}}
					/>
					<${IconButton}
						icon="trash"
						label=${t("action.deleteFrame")}
						compact=${true}
						className="frame-mask-toolbar__button"
						disabled=${!canDeleteFrames}
						onClick=${() =>
							selectedFrameIds.length > 0
								? controller()?.deleteSelectedFrames?.(selectedFrameIds)
								: controller()?.deleteActiveFrame?.()}
						tooltip=${{
							title: t("action.deleteFrame"),
							placement: "right",
						}}
					/>
				</div>
			</label>
			<label class="field workbench-tool-rail__popover-field">
				<span>${t("section.mask")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${IconButton}
						icon="slash-circle"
						label=${t("transformMode.none")}
						active=${frameMaskMode === "off"}
						compact=${true}
						className="frame-mask-toolbar__button"
						onClick=${() => controller()?.setFrameMaskMode?.("off")}
						tooltip=${{
							title: t("transformMode.none"),
							placement: "right",
						}}
					/>
					<${IconButton}
						icon="mask-all"
						label=${t("action.toggleAllFrameMask")}
						active=${frameMaskMode === "all"}
						compact=${true}
						className="frame-mask-toolbar__button"
						disabled=${!hasFrames}
						onClick=${() => controller()?.toggleFrameMaskMode?.("all")}
						tooltip=${{
							title: t("action.toggleAllFrameMask"),
							description: t("tooltip.frameMaskAll"),
							shortcut: "F",
							placement: "right",
						}}
					/>
					<${IconButton}
						icon="mask-selected"
						label=${t("action.toggleSelectedFrameMask")}
						active=${frameMaskMode === "selected"}
						compact=${true}
						className="frame-mask-toolbar__button"
						disabled=${!hasSelectedFrames}
						onClick=${() => controller()?.toggleFrameMaskMode?.("selected")}
						tooltip=${{
							title: t("action.toggleSelectedFrameMask"),
							description: t("tooltip.frameMaskSelected"),
							shortcut: "Shift+F",
							placement: "right",
						}}
					/>
				</div>
			</label>
			<div class="workbench-tool-rail__popover-grid">
				<label class="field workbench-tool-rail__popover-field">
					<span>${t("field.frameMaskOpacity")}</span>
					<div class="workbench-tool-rail__popover-value">
						<div class="workbench-tool-rail__popover-input">
							<${NumericDraftInput}
								id="tool-frame-mask-opacity"
								inputMode="decimal"
								min="0"
								max="100"
								step="1"
								value=${Number(frameMaskOpacityPct).toFixed(0)}
								controller=${controller}
								disabled=${!hasFrames}
								historyLabel="frame.mask-opacity"
								onCommit=${(nextValue) =>
									controller()?.setFrameMaskOpacity?.(nextValue)}
							/>
						</div>
						<span
							class="workbench-tool-rail__popover-suffix"
							aria-label=${t("unit.percent")}
							>%</span
						>
					</div>
				</label>
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${t("field.frameMaskShape")}
						<${TooltipBubble}
							title=${t("field.frameMaskShape")}
							description=${t("tooltip.frameMaskShapeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${frameMaskShape}
							onChange=${(event) =>
								controller()?.setFrameMaskShape?.(event.currentTarget.value)}
						>
							${frameMaskShapeOptions.map(
								(option) => html`
									<option value=${option.value}>${option.label}</option>
								`,
							)}
						</select>
					</div>
				</label>
			</div>
			<div class="workbench-tool-rail__popover-mode-row">
				<label class="field workbench-tool-rail__popover-field workbench-tool-rail__popover-mode-field">
					<span class="field-label-tooltip">
						${t("field.frameTrajectoryMode")}
						<${TooltipBubble}
							title=${t("field.frameTrajectoryMode")}
							description=${t("tooltip.frameTrajectoryModeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${frameTrajectoryMode}
							disabled=${!hasFrames}
							onChange=${(event) =>
								controller()?.setFrameTrajectoryMode?.(
									event.currentTarget.value,
								)}
						>
							${trajectoryModeOptions.map(
								(option) => html`
									<option value=${option.value}>${option.label}</option>
								`,
							)}
						</select>
					</div>
				</label>
				<div class="button-row button-row--compact workbench-tool-rail__popover-actions workbench-tool-rail__popover-mode-actions">
					<${IconButton}
						icon="cursor"
						label=${t("action.toggleFrameTrajectoryEdit")}
						active=${trajectoryEditMode}
						compact=${true}
						disabled=${!hasFrames}
						onClick=${() => controller()?.toggleFrameTrajectoryEditMode?.()}
						tooltip=${{
							title: t("action.toggleFrameTrajectoryEdit"),
							description: t("tooltip.toggleFrameTrajectoryEdit"),
							placement: "right",
						}}
					/>
					<${IconButton}
						icon="reset"
						label=${t("action.resetFrameTrajectoryNodeAuto")}
						compact=${true}
						disabled=${!hasEditableTrajectoryNode || activeTrajectoryNodeMode === "auto"}
						onClick=${() =>
							controller()?.setFrameTrajectoryNodeMode?.(activeFrameId, "auto")}
						tooltip=${{
							title: t("action.resetFrameTrajectoryNodeAuto"),
							description: t("tooltip.resetFrameTrajectoryNodeAuto"),
							placement: "right",
						}}
					/>
				</div>
			</div>
			<div class="workbench-tool-rail__popover-grid">
				${
					hasEditableTrajectoryNode &&
					html`
						<label class="field workbench-tool-rail__popover-field">
							<span class="field-label-tooltip">
								${t("field.frameTrajectoryNodeMode")}
								<${TooltipBubble}
									title=${t("field.frameTrajectoryNodeMode")}
									description=${t("tooltip.frameTrajectoryNodeModeField")}
									placement="right"
								/>
							</span>
							<div class="workbench-tool-rail__popover-value">
								<select
									class="workbench-tool-rail__popover-select"
									value=${activeTrajectoryNodeMode}
									onChange=${(event) =>
										controller()?.setFrameTrajectoryNodeMode?.(
											activeFrameId,
											event.currentTarget.value,
										)}
								>
									${trajectoryNodeModeOptions.map(
										(option) => html`
											<option value=${option.value}>${option.label}</option>
										`,
									)}
								</select>
							</div>
						</label>
					`
				}
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${t("field.frameTrajectoryExportSource")}
						<${TooltipBubble}
							title=${t("field.frameTrajectoryExportSource")}
							description=${t("tooltip.frameTrajectoryExportSourceField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${frameTrajectoryExportSource}
							disabled=${!hasTrajectoryPath}
							onChange=${(event) =>
								controller()?.setFrameTrajectoryExportSource?.(
									event.currentTarget.value,
								)}
						>
							${trajectoryExportSourceOptions.map(
								(option) => html`
									<option value=${option.value}>${option.label}</option>
								`,
							)}
						</select>
					</div>
				</label>
			</div>
		</div>
	`;
}

export function ToolRailSection({
	controller,
	mode,
	menuChildren = null,
	projectMenuItems = [],
	railRef = null,
	railOnWheel = null,
	store,
	tailContent = null,
	showQuickMenu = false,
	t,
	tooltipPlacement = "right",
	menuPanelPlacement = "down",
}) {
	const canUseTransformTools = mode === "viewport" || mode === "camera";
	const selectedSceneAsset = store.selectedSceneAsset.value;
	const interactionMode = store.interactionMode.value;
	const frameMaskMode = store.frames.maskMode.value;
	const measurementActive = store.measurement.active.value;
	const hasFrames = store.frames.count.value > 0;
	const canUndo = store.history.canUndo.value;
	const canRedo = store.history.canRedo.value;
	const [maskToolPopoverOpen, setMaskToolPopoverOpen] = useState(false);
	const maskToolSlotRef = useRef(null);
	const showTransformSpaceToggle =
		Boolean(selectedSceneAsset) &&
		(store.viewportTransformMode.value || store.viewportPivotEditMode.value);
	const showZoomToolPopover =
		canUseTransformTools && interactionMode === "zoom";
	const showMaskToolPopover = mode === "camera" && maskToolPopoverOpen;
	const zoomToolTitle =
		mode === "camera" ? t("section.displayZoom") : t("section.view");
	const worldSpaceTooltipLabel = `${t("section.transformSpace")} / ${t("transformSpace.world")}`;
	const localSpaceTooltipLabel = `${t("section.transformSpace")} / ${t("transformSpace.local")}`;

	useEffect(() => {
		if (!showMaskToolPopover) {
			return undefined;
		}

		const handlePointerDown = (event) => {
			const target = event.target instanceof Element ? event.target : null;
			if (
				target?.closest(".frame-item, .frame-trajectory-layer") ||
				maskToolSlotRef.current?.contains(target)
			) {
				return;
			}
			if (!maskToolSlotRef.current?.contains(target)) {
				setMaskToolPopoverOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				setMaskToolPopoverOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [showMaskToolPopover]);

	useEffect(() => {
		if (mode !== "camera") {
			setMaskToolPopoverOpen(false);
		}
	}, [mode]);

	const clearSelectionAndExitTool = () => {
		controller()?.clearSceneAssetSelection?.();
		controller()?.clearSplatSelection?.();
		controller()?.clearReferenceImageSelection?.();
		controller()?.clearFrameSelection?.();
		controller()?.clearOutputFrameSelection?.();
		controller()?.setMeasurementMode?.(false, { silent: true });
		controller()?.setSplatEditMode?.(false, { silent: true });
		controller()?.setViewportTransformMode(false);
	};
	const toggleTool = (isActive, enableTool) => {
		if (isActive) {
			clearSelectionAndExitTool();
			return;
		}
		enableTool?.();
	};

	return html`
		<section
			class="workbench-tool-rail"
			aria-label=${t("section.tools")}
			ref=${railRef}
			onWheel=${railOnWheel}
		>
			<${HeaderMenu}
				label=${t("section.file")}
				items=${projectMenuItems}
				panelPlacement=${menuPanelPlacement}
				tooltip=${{
					title: t("section.file"),
					description: t("tooltip.fileMenu"),
					placement: tooltipPlacement,
				}}
			>
				${menuChildren}
			<//>
			${
				showQuickMenu &&
				html`
					<${IconButton}
						icon="undo"
						label=${t("action.undo")}
						disabled=${!canUndo}
						className="workbench-tool-rail__button"
						tooltip=${{
							title: t("action.undo"),
							description: t("tooltip.undo"),
							shortcut: "Ctrl+Z",
							placement: tooltipPlacement,
						}}
						onClick=${() => controller()?.undoHistory?.()}
					/>
					<${IconButton}
						icon="redo"
						label=${t("action.redo")}
						disabled=${!canRedo}
						className="workbench-tool-rail__button"
						tooltip=${{
							title: t("action.redo"),
							description: t("tooltip.redo"),
							shortcut: "Ctrl+Shift+Z",
							placement: tooltipPlacement,
						}}
						onClick=${() => controller()?.redoHistory?.()}
					/>
				`
			}
			${
				showQuickMenu &&
				html`
					<${IconButton}
						icon="pie-menu"
						label=${t("action.quickMenu")}
						className="workbench-tool-rail__button"
						tooltip=${{
							title: t("action.quickMenu"),
							description: t("tooltip.quickMenu"),
							placement: tooltipPlacement,
						}}
						onClick=${() => controller()?.openViewportPieMenuAtCenter?.()}
					/>
				`
			}
			<div class="workbench-tool-rail__divider"></div>
			<div class="workbench-tool-rail__group">
				<div
					class="workbench-tool-rail__segmented workbench-tool-rail__segmented--vertical"
					role="group"
					aria-label=${t("section.viewMode")}
				>
					<button
						id="mode-camera"
						type="button"
						class=${
							mode === "camera"
								? "workbench-tool-rail__segment is-active"
								: "workbench-tool-rail__segment"
						}
						aria-label=${t("mode.camera")}
						onClick=${() => controller()?.setMode("camera")}
					>
						<${WorkbenchIcon} name="camera-dslr" size=${16} />
						<${TooltipBubble}
							title=${t("mode.camera")}
							description=${t("tooltip.modeCamera")}
							placement=${tooltipPlacement}
						/>
					</button>
					<button
						id="mode-viewport"
						type="button"
						class=${
							mode === "viewport"
								? "workbench-tool-rail__segment is-active"
								: "workbench-tool-rail__segment"
						}
						aria-label=${t("mode.viewport")}
						onClick=${() => controller()?.setMode("viewport")}
					>
						<${WorkbenchIcon} name="viewport" size=${16} />
						<${TooltipBubble}
							title=${t("mode.viewport")}
							description=${t("tooltip.modeViewport")}
							placement=${tooltipPlacement}
						/>
					</button>
				</div>
			</div>
			${
				canUseTransformTools &&
				html`
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
							<${IconButton}
								icon="cursor"
								label=${t("transformMode.select")}
								active=${store.viewportSelectMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("transformMode.select"),
									description: t("tooltip.toolSelect"),
									shortcut: "V",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.viewportSelectMode.value, () =>
										controller()?.setViewportSelectMode(true),
									)}
							/>
							<${IconButton}
								icon="reference-tool"
								label=${t("transformMode.reference")}
								active=${store.viewportReferenceImageEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("transformMode.reference"),
									description: t("tooltip.toolReference"),
									shortcut: "Shift+R",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.viewportReferenceImageEditMode.value, () =>
										controller()?.setViewportReferenceImageEditMode(true),
									)}
							/>
							<${IconButton}
								icon="splat-edit"
								label=${t("action.splatEditTool")}
								active=${store.splatEdit.active.value}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("action.splatEditTool"),
									description: t("tooltip.toolSplatEdit"),
									shortcut: "Shift+E",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.splatEdit.active.value, () =>
										controller()?.setSplatEditMode?.(true),
									)}
							/>
							<${IconButton}
								icon="move"
								label=${t("transformMode.transform")}
								active=${store.viewportTransformMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("transformMode.transform"),
									description: t("tooltip.toolTransform"),
									shortcut: "T",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.viewportTransformMode.value, () =>
										controller()?.setViewportTransformMode(true),
									)}
							/>
							<${IconButton}
								icon="pivot"
								label=${t("transformMode.pivot")}
								active=${store.viewportPivotEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("transformMode.pivot"),
									description: t("tooltip.toolPivot"),
									shortcut: "Q",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.viewportPivotEditMode.value, () =>
										controller()?.setViewportPivotEditMode(true),
									)}
							/>
							<div class="workbench-tool-rail__tool-slot">
								<${IconButton}
									icon="zoom"
									label=${t("action.zoomTool")}
									active=${showZoomToolPopover}
									className="workbench-tool-rail__button"
									tooltip=${{
										title: zoomToolTitle,
										description: t("tooltip.toolZoom"),
										shortcut: "Z",
										placement: tooltipPlacement,
									}}
									onClick=${() => controller()?.toggleZoomTool?.()}
								/>
								${
									showZoomToolPopover &&
									html`
										<${ZoomToolPopover}
											controller=${controller}
											mode=${mode}
											store=${store}
											t=${t}
										/>
									`
								}
							</div>
							<${IconButton}
								icon="ruler"
								label=${t("action.measureTool")}
								active=${measurementActive}
								className="workbench-tool-rail__button"
								tooltip=${{
									title: t("action.measureTool"),
									description: t("tooltip.measureTool"),
									shortcut: "M",
									placement: tooltipPlacement,
								}}
								onClick=${() => controller()?.toggleMeasurementMode?.()}
							/>
							${
								mode === "camera" &&
								html`
									<div
										class="workbench-tool-rail__tool-slot"
										ref=${maskToolSlotRef}
									>
										<${IconButton}
											icon="mask"
											label=${t("action.frameTool")}
											active=${showMaskToolPopover || frameMaskMode !== "off"}
											className="workbench-tool-rail__button"
											tooltip=${{
												title: t("action.frameTool"),
												description: t("tooltip.frameTool"),
												shortcut: "F",
												placement: tooltipPlacement,
											}}
											onClick=${() =>
												setMaskToolPopoverOpen((currentValue) => !currentValue)}
										/>
										${
											showMaskToolPopover &&
											html`
												<${MaskToolPopover}
													controller=${controller}
													hasFrames=${hasFrames}
													store=${store}
													t=${t}
												/>
											`
										}
									</div>
								`
							}
					</div>
					${
						showTransformSpaceToggle &&
						html`
							<div class="workbench-tool-rail__divider"></div>
							<div class="workbench-tool-rail__group workbench-tool-rail__group--compact">
								<div
									class="workbench-tool-rail__segmented"
									role="group"
									aria-label=${t("section.transformSpace")}
								>
									<button
										type="button"
										class=${
											store.viewportTransformSpace.value === "world"
												? "workbench-tool-rail__segment is-active"
												: "workbench-tool-rail__segment"
										}
										aria-label=${worldSpaceTooltipLabel}
										title=${worldSpaceTooltipLabel}
										onClick=${() =>
											controller()?.setViewportTransformSpace("world")}
									>
										W
									</button>
									<button
										type="button"
										class=${
											store.viewportTransformSpace.value === "local"
												? "workbench-tool-rail__segment is-active"
												: "workbench-tool-rail__segment"
										}
										aria-label=${localSpaceTooltipLabel}
										title=${localSpaceTooltipLabel}
										onClick=${() =>
											controller()?.setViewportTransformSpace("local")}
									>
										L
									</button>
								</div>
							</div>
						`
					}
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
						<${IconButton}
							icon="selection-clear"
							label=${t("action.clearSelection")}
							className="workbench-tool-rail__button"
							tooltip=${{
								title: t("action.clearSelection"),
								description: t("tooltip.clearSelection"),
								shortcut: "Ctrl+D",
								placement: tooltipPlacement,
							}}
							onClick=${() => clearSelectionAndExitTool()}
						/>
					</div>
				`
			}
			${tailContent}
		</section>
	`;
}

export function InspectorRailSection({
	activeQuickSectionId = null,
	activeTab,
	onOpenFullTab,
	onToggleQuickSection,
	quickSections = [],
	t,
}) {
	const tabs = getInspectorTabs(t);
	return html`
		<section class="workbench-inspector-rail" aria-label=${t("section.project")}>
			<div class="workbench-inspector-rail__group">
				${tabs.map(
					(tab) => html`
						<${IconButton}
							key=${tab.id}
							icon=${tab.icon}
							label=${tab.label}
							active=${activeTab === tab.id}
							compact=${true}
							className="workbench-inspector-rail__button"
							tooltip=${{
								title: tab.tooltip?.title ?? tab.label,
								description: tab.tooltip?.description ?? "",
								shortcut: tab.tooltip?.shortcut ?? "",
								placement: "left",
							}}
							onClick=${() => onOpenFullTab?.(tab.id)}
						/>
					`,
				)}
			</div>
			${
				quickSections.length > 0 &&
				html`
					<div class="workbench-inspector-rail__divider"></div>
					<div class="workbench-inspector-rail__group">
						${quickSections.map(
							(section) => html`
								<${IconButton}
									key=${section.id}
									icon=${section.icon}
									label=${section.label}
									active=${activeQuickSectionId === section.id}
									compact=${true}
									className="workbench-inspector-rail__button"
									tooltip=${{
										title: section.label,
										description: t("tooltip.openQuickSection"),
										placement: "left",
									}}
									onClick=${() => onToggleQuickSection?.(section.id)}
								/>
							`,
						)}
					</div>
				`
			}
		</section>
	`;
}

export function InspectorTabs({ activeTab, setActiveTab, t }) {
	const tabs = getInspectorTabs(t);

	return html`
		<${WorkbenchTabs}
			tabs=${tabs}
			activeTab=${activeTab}
			setActiveTab=${setActiveTab}
			ariaLabel=${t("section.project")}
			iconOnly=${true}
		/>
	`;
}
