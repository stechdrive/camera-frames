import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
	getBuildCommitLabel,
	getBuildVersionLabel,
	getCodeStampLabel,
} from "../build-info.js";
import {
	FRAME_MAX_COUNT,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "../constants.js";
import { groupSceneAssetsByKind } from "../engine/scene-asset-order.js";
import {
	DirectionalScrubControl,
	HistoryRangeInput,
	INTERACTIVE_FIELD_PROPS,
	LightingDirectionControl,
	NumericDraftInput,
	NumericUnitLabel,
	TextDraftInput,
	applyStandardFrameHorizontalEquivalentMm,
	stopUiEvent,
} from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	DisclosureBlock,
	HeaderMenu,
	HeaderWordmark,
	IconButton,
	SectionHeading,
	TooltipBubble,
	WorkbenchTabs,
} from "./workbench-primitives.js";

export const INSPECTOR_TAB_SCENE = "scene";
export const INSPECTOR_TAB_CAMERA = "camera";
export const INSPECTOR_TAB_REFERENCE = "reference";
export const INSPECTOR_TAB_EXPORT = "export";
export const INSPECTOR_QUICK_SECTION_SCENE = "scene-main";
export const INSPECTOR_QUICK_SECTION_TRANSFORM = "scene-transform";
export const INSPECTOR_QUICK_SECTION_SHOT_CAMERA = "shot-camera";
export const INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES =
	"shot-camera-properties";
export const INSPECTOR_QUICK_SECTION_DISPLAY_ZOOM = "display-zoom";
export const INSPECTOR_QUICK_SECTION_VIEW = "view-settings";
export const INSPECTOR_QUICK_SECTION_LIGHTING = "lighting";
export const INSPECTOR_QUICK_SECTION_OUTPUT_FRAME = "output-frame";
export const INSPECTOR_QUICK_SECTION_REFERENCE = "reference";
export const INSPECTOR_QUICK_SECTION_EXPORT = "export-output";
export const INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS = "export-settings";
export const INSPECTOR_BROWSER_SCENE = "scene";
export const INSPECTOR_BROWSER_REFERENCE = "reference";

function ShotCameraManagerList({
	activeShotCamera,
	controller,
	shotCameras,
	t,
}) {
	const canDeleteShotCamera =
		shotCameras.length > 1 && Boolean(activeShotCamera);

	return html`
		<div class="shot-camera-manager">
			<div class="button-row shot-camera-manager__actions">
				<${IconButton}
					id="new-shot-camera"
					icon="plus"
					label=${t("action.newShotCamera")}
					onClick=${() => controller()?.createShotCamera()}
				/>
				<${IconButton}
					id="duplicate-shot-camera"
					icon="duplicate"
					label=${t("action.duplicateShotCamera")}
					disabled=${!activeShotCamera}
					onClick=${() => controller()?.duplicateActiveShotCamera()}
				/>
				<${IconButton}
					id="delete-shot-camera"
					icon="trash"
					label=${t("action.deleteShotCamera")}
					disabled=${!canDeleteShotCamera}
					onClick=${() => controller()?.deleteActiveShotCamera?.()}
				/>
			</div>
			<div class="shot-camera-manager__list scene-asset-list scene-asset-list--compact">
				${shotCameras.map(
					(shotCamera) => html`
						<article
							key=${shotCamera.id}
							class=${
								shotCamera.id === activeShotCamera?.id
									? "scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active"
									: "scene-asset-row scene-asset-row--compact"
							}
							onClick=${() => controller()?.selectShotCamera(shotCamera.id)}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									${
										shotCamera.id === activeShotCamera?.id
											? html`
												<div class="field shot-camera-manager__inline-name-field">
													<${TextDraftInput}
														id=${`shot-camera-name-${shotCamera.id}`}
														class="shot-camera-manager__inline-name-input"
														placeholder=${t("field.shotCameraName")}
														selectOnFocus=${true}
														value=${shotCamera.name}
														onCommit=${(nextValue) =>
															controller()?.setShotCameraName(nextValue)}
													/>
												</div>
											`
											: html`<strong>${shotCamera.name}</strong>`
									}
								</div>
							</div>
						</article>
					`,
				)}
			</div>
		</div>
	`;
}

export function getInspectorTabs(t) {
	return [
		{
			id: INSPECTOR_TAB_SCENE,
			label: t("section.scene"),
			icon: "scene",
			tooltip: {
				title: t("section.scene"),
				description: t("tooltip.tabScene"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCamera"),
			icon: "camera-dslr",
			tooltip: {
				title: t("section.shotCamera"),
				description: t("tooltip.tabCamera"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_REFERENCE,
			label: t("section.referenceImages"),
			icon: "image",
			tooltip: {
				title: t("section.referenceImages"),
				description: t("tooltip.tabReference"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_EXPORT,
			label: t("section.export"),
			icon: "export",
			tooltip: {
				title: t("section.export"),
				description: t("tooltip.tabExport"),
				placement: "bottom",
			},
		},
	];
}

export function getInspectorQuickSections(t) {
	return [
		{
			id: INSPECTOR_QUICK_SECTION_SCENE,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.sceneManager"),
			icon: "scene",
		},
		{
			id: INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCameraManager"),
			icon: "camera",
		},
		{
			id: INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCameraProperties"),
			icon: "camera-property",
		},
		{
			id: INSPECTOR_QUICK_SECTION_LIGHTING,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.lighting"),
			icon: "light",
		},
		{
			id: INSPECTOR_QUICK_SECTION_TRANSFORM,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.selectedSceneObject"),
			icon: "move",
		},
		{
			id: INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.outputFrame"),
			icon: "render-box",
		},
		{
			id: INSPECTOR_QUICK_SECTION_REFERENCE,
			tabId: INSPECTOR_TAB_REFERENCE,
			label: t("section.referenceImages"),
			icon: "image",
		},
		{
			id: INSPECTOR_QUICK_SECTION_EXPORT,
			tabId: INSPECTOR_TAB_EXPORT,
			label: t("section.output"),
			icon: "export",
		},
		{
			id: INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS,
			tabId: INSPECTOR_TAB_EXPORT,
			label: t("section.exportSettings"),
			icon: "package",
		},
	];
}

export function WorkbenchHeader({
	t,
	compact = false,
	collapsed = false,
	onToggleCollapse,
	projectMenuItems = [],
	menuChildren = null,
	remoteUrl = "",
	onRemoteUrlInput,
	onLoadRemoteUrls,
	onOpenFiles,
}) {
	const buildVersionLabel = getBuildVersionLabel();
	const buildCommitLabel = getBuildCommitLabel();
	const codeStampLabel = getCodeStampLabel();

	return html`
		<header class=${compact ? "panel-header panel-header--compact" : "panel-header"}>
			<div class="panel-header__title-row">
				<div class="panel-header__title-main">
					<${HeaderMenu}
						label=${t("section.file")}
						items=${projectMenuItems}
					>
						${
							menuChildren ??
							html`
								<div class="workbench-menu__group">
									<button
										id="open-files"
										type="button"
										class="workbench-menu__item"
										onClick=${() => onOpenFiles?.()}
									>
										<span class="workbench-menu__item-icon">
											<${WorkbenchIcon} name="folder-open" size=${14} />
										</span>
										<span>${t("action.openFiles")}</span>
									</button>
									<div class="workbench-menu__field">
										<label for="header-url-input">${t("field.remoteUrl")}</label>
										<input
											id="header-url-input"
											type="text"
											placeholder="https://.../scene.spz or model.glb"
											value=${remoteUrl}
											...${INTERACTIVE_FIELD_PROPS}
											onInput=${(event) =>
												onRemoteUrlInput?.(event.currentTarget.value)}
											onKeyDown=${(event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													onLoadRemoteUrls?.();
												}
											}}
										/>
									</div>
									<button
										id="load-url"
										type="button"
										class="workbench-menu__item"
										onClick=${() => onLoadRemoteUrls?.()}
									>
										<span class="workbench-menu__item-icon">
											<${WorkbenchIcon} name="folder-open" size=${14} />
										</span>
										<span>${t("action.loadUrl")}</span>
									</button>
								</div>
							`
						}
					<//>
					<${HeaderWordmark} title="CAMERA_FRAMES" compact=${compact} />
				</div>
				<button
					type="button"
					class="workbench-collapse-toggle"
					aria-label=${
						collapsed
							? t("action.expandWorkbench")
							: t("action.collapseWorkbench")
					}
					onClick=${onToggleCollapse}
				>
					<${WorkbenchIcon}
						name=${collapsed ? "chevron-right" : "chevron-left"}
						size=${14}
					/>
				</button>
			</div>
			<div class="build-meta build-meta--header">
				<span class="pill pill--dim">${buildVersionLabel}</span>
				${buildCommitLabel && html`<code class="build-commit">${buildCommitLabel}</code>`}
				${codeStampLabel && html`<code class="build-commit">${codeStampLabel}</code>`}
			</div>
		</header>
	`;
}

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
	const rememberedMaskFrameIds = store.frames.maskSelectedIds.value ?? [];
	const selectedFrameIds = store.frames.selectedIds.value ?? [];
	const activeFrameId = store.frames.activeId.value;
	const remainingCapacity = FRAME_MAX_COUNT - store.frames.count.value;
	const hasSelectedFrames = rememberedMaskFrameIds.length > 0;
	const duplicateCount = Math.max(
		selectedFrameIds.length,
		activeFrameId ? 1 : 0,
	);
	const canCreateFrame = store.frames.count.value < FRAME_MAX_COUNT;
	const canDuplicateFrames =
		duplicateCount > 0 && remainingCapacity >= duplicateCount;
	const canDeleteFrames = selectedFrameIds.length > 0 || Boolean(activeFrameId);

	return html`
		<div
			class="workbench-tool-rail__popover workbench-tool-rail__popover--mask"
			role="group"
			aria-label=${t("section.mask")}
		>
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
							shortcut: "M",
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
							shortcut: "Shift+M",
							placement: "right",
						}}
					/>
				</div>
			</label>
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
		</div>
	`;
}

export function ToolRailSection({
	controller,
	mode,
	menuChildren = null,
	projectMenuItems = [],
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
	const hasFrames = store.frames.count.value > 0;
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
			if (!maskToolSlotRef.current?.contains(event.target)) {
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
		controller()?.clearReferenceImageSelection?.();
		controller()?.clearFrameSelection?.();
		controller()?.clearOutputFrameSelection?.();
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
		<section class="workbench-tool-rail" aria-label=${t("section.tools")}>
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
									shortcut: "R",
									placement: tooltipPlacement,
								}}
								onClick=${() =>
									toggleTool(store.viewportReferenceImageEditMode.value, () =>
										controller()?.setViewportReferenceImageEditMode(true),
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
							${
								mode === "camera" &&
								html`
									<div
										class="workbench-tool-rail__tool-slot"
										ref=${maskToolSlotRef}
									>
										<${IconButton}
											icon="mask"
											label=${t("section.mask")}
											active=${showMaskToolPopover || frameMaskMode !== "off"}
											className="workbench-tool-rail__button"
											tooltip=${{
												title: t("section.mask"),
												shortcut: "M",
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

export function DisplayZoomSection({
	controller,
	headingActions = null,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<${SectionHeading} icon="zoom" title=${t("section.displayZoom")}>
				${headingActions}
			<//>
			<label class="field field--inline-compact">
				<span>${t("field.cameraViewZoom")}</span>
				<div class="field--inline-compact__value">
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="view-zoom"
							inputMode="decimal"
							min=${MIN_CAMERA_VIEW_ZOOM_PCT}
							max=${MAX_CAMERA_VIEW_ZOOM_PCT}
							step="1"
							value=${Math.round(store.renderBox.viewZoom.value * 100)}
							controller=${controller}
							historyLabel="output-frame.zoom"
							onCommit=${(nextValue) =>
								controller()?.setViewZoomPercent?.(nextValue)}
						/>
						<${NumericUnitLabel} value="%" title=${t("unit.percent")} />
					</div>
				</div>
			</label>
		</section>
	`;
}

export function InspectorBrowserSection({
	activeBrowserSectionId,
	controller,
	draggedAssetId = null,
	dragHoverState = null,
	onSelectBrowserSection,
	sceneAssets = [],
	selectedSceneAsset = null,
	setDraggedAssetId = () => {},
	setDragHoverState = () => {},
	store,
	t,
}) {
	const browserSections = [
		{
			id: INSPECTOR_BROWSER_SCENE,
			label: t("section.scene"),
			icon: "scene",
		},
		{
			id: INSPECTOR_BROWSER_REFERENCE,
			label: t("section.referenceImages"),
			icon: "image",
		},
	];

	return html`
		<section class="panel-section panel-section--browser">
			<div class="inspector-browser">
				<div class="inspector-browser__tabs" role="tablist">
					${browserSections.map(
						(section) => html`
							<button
								key=${section.id}
								type="button"
								role="tab"
								class=${
									activeBrowserSectionId === section.id
										? "inspector-browser__tab is-active"
										: "inspector-browser__tab"
								}
								aria-selected=${activeBrowserSectionId === section.id}
								onClick=${() => onSelectBrowserSection?.(section.id)}
							>
								<${WorkbenchIcon} name=${section.icon} size=${13} />
								<span>${section.label}</span>
							</button>
						`,
					)}
				</div>
				<div class="inspector-browser__body">
					${
						activeBrowserSectionId === INSPECTOR_BROWSER_REFERENCE
							? html`
									<${ReferenceBrowserSection}
										controller=${controller}
										store=${store}
										t=${t}
									/>
								`
							: html`
									<${SceneBrowserSection}
										controller=${controller}
										draggedAssetId=${draggedAssetId}
										dragHoverState=${dragHoverState}
										sceneAssets=${sceneAssets}
										selectedSceneAsset=${selectedSceneAsset}
										setDraggedAssetId=${setDraggedAssetId}
										setDragHoverState=${setDragHoverState}
										store=${store}
										t=${t}
									/>
								`
					}
				</div>
			</div>
		</section>
	`;
}

export function SceneBrowserSection({
	controller,
	draggedAssetId = null,
	dragHoverState = null,
	sceneAssets,
	selectedSceneAsset,
	setDraggedAssetId,
	setDragHoverState,
	store,
	t,
}) {
	const sceneAssetSections = [
		{
			kind: "model",
			label: t("assetKind.model"),
			assets: sceneAssets.filter((asset) => asset.kind === "model"),
		},
		{
			kind: "splat",
			label: t("assetKind.splat"),
			assets: sceneAssets.filter((asset) => asset.kind === "splat"),
		},
	];
	const selectedSceneAssetIds = new Set(store.selectedSceneAssetIds.value);
	const getSceneAssetById = (assetId) =>
		sceneAssets.find((asset) => asset.id === assetId) ?? null;
	const getDropPosition = (event) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
	};
	const getDropTargetKindIndex = (draggedAsset, targetAsset, position) => {
		if (
			!draggedAsset ||
			!targetAsset ||
			draggedAsset.kind !== targetAsset.kind
		) {
			return null;
		}
		const currentKindIndex = draggedAsset.kindOrderIndex - 1;
		const targetKindIndex = targetAsset.kindOrderIndex - 1;
		if (position === "before") {
			return currentKindIndex < targetKindIndex
				? targetKindIndex - 1
				: targetKindIndex;
		}
		return currentKindIndex < targetKindIndex
			? targetKindIndex
			: targetKindIndex + 1;
	};
	const getSceneAssetRowClass = (asset) => {
		const classes = ["scene-asset-row", "scene-asset-row--compact"];
		if (selectedSceneAssetIds.has(asset.id)) {
			classes.push("scene-asset-row--selected");
		}
		if (asset.id === selectedSceneAsset?.id) {
			classes.push("scene-asset-row--active");
		}
		if (dragHoverState?.assetId === asset.id) {
			classes.push(
				dragHoverState.position === "before"
					? "scene-asset-row--drop-before"
					: "scene-asset-row--drop-after",
			);
		}
		return classes.join(" ");
	};

	return html`
		<div class="browser-list">
			${sceneAssetSections.map(
				(section) => html`
					<section key=${section.kind} class="browser-group">
						<div class="browser-group__heading">
							<strong>${section.label}</strong>
							<span class="pill pill--dim">${section.assets.length}</span>
						</div>
						<div class="scene-asset-list scene-asset-list--compact">
							${
								section.assets.length === 0
									? html`<div class="scene-asset-list__placeholder"></div>`
									: section.assets.map(
											(asset) => html`
									<article
										class=${getSceneAssetRowClass(asset)}
										draggable="true"
										onClick=${(event) =>
											controller()?.selectSceneAsset(asset.id, {
												additive: event.ctrlKey || event.metaKey,
												toggle: event.ctrlKey || event.metaKey,
												range: event.shiftKey,
												orderedIds: sceneAssets.map((entry) => entry.id),
											})}
										onDragStart=${(event) => {
											setDraggedAssetId(asset.id);
											setDragHoverState(null);
											event.dataTransfer.effectAllowed = "move";
											event.dataTransfer.setData(
												"text/plain",
												String(asset.id),
											);
										}}
										onDragOver=${(event) => {
											const draggedAsset = getSceneAssetById(
												draggedAssetId ??
													Number(event.dataTransfer.getData("text/plain")),
											);
											if (draggedAsset?.kind !== asset.kind) {
												return;
											}
											event.preventDefault();
											event.dataTransfer.dropEffect = "move";
											setDragHoverState({
												assetId: asset.id,
												position: getDropPosition(event),
											});
										}}
										onDragLeave=${() => {
											if (dragHoverState?.assetId === asset.id) {
												setDragHoverState(null);
											}
										}}
										onDrop=${(event) => {
											event.preventDefault();
											const draggedId =
												draggedAssetId ??
												Number(event.dataTransfer.getData("text/plain"));
											const draggedAsset = getSceneAssetById(draggedId);
											const dropPosition = getDropPosition(event);
											if (
												!Number.isFinite(draggedId) ||
												draggedId === asset.id ||
												draggedAsset?.kind !== asset.kind
											) {
												setDraggedAssetId(null);
												setDragHoverState(null);
												return;
											}
											const targetKindIndex = getDropTargetKindIndex(
												draggedAsset,
												asset,
												dropPosition,
											);
											if (targetKindIndex !== null) {
												controller()?.moveAssetToIndex(
													draggedId,
													targetKindIndex,
												);
											}
											setDraggedAssetId(null);
											setDragHoverState(null);
										}}
										onDragEnd=${() => {
											setDraggedAssetId(null);
											setDragHoverState(null);
										}}
									>
										<div class="scene-asset-row__main">
											<span class="scene-asset-row__handle" aria-hidden="true">
												<${WorkbenchIcon} name="grip" size=${12} strokeWidth=${0} />
											</span>
											<div class="scene-asset-row__title-group">
												<strong>${asset.label}</strong>
											</div>
										</div>
										<div class="scene-asset-row__toolbar">
											<${IconButton}
												icon=${asset.visible ? "eye" : "eye-off"}
												label=${t(
													asset.visible
														? "assetVisibility.visible"
														: "assetVisibility.hidden",
												)}
												active=${asset.visible}
												compact=${true}
												className="scene-asset-row__icon-button"
												onClick=${(event) => {
													event.stopPropagation();
													controller()?.selectSceneAsset(asset.id);
													controller()?.setAssetVisibility(
														asset.id,
														!asset.visible,
													);
												}}
											/>
										</div>
									</article>
								`,
										)
							}
						</div>
					</section>
				`,
			)}
		</div>
	`;
}

export function ReferenceBrowserSection({ controller, store, t }) {
	const items = [...store.referenceImages.items.value].reverse();
	const selectedItemIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const selectedItemId = store.referenceImages.selectedItemId.value;

	if (items.length === 0) {
		return null;
	}

	return html`
		<div class="browser-list">
			<div class="scene-asset-list scene-asset-list--compact">
				${items.map(
					(item) => html`
						<article
							key=${item.id}
							class=${
								item.id === selectedItemId
									? selectedItemIds.has(item.id)
										? "scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active"
										: "scene-asset-row scene-asset-row--compact scene-asset-row--active"
									: selectedItemIds.has(item.id)
										? "scene-asset-row scene-asset-row--compact scene-asset-row--selected"
										: "scene-asset-row scene-asset-row--compact"
							}
							onClick=${(event) =>
								controller()?.selectReferenceImageItem?.(item.id, {
									additive: event.ctrlKey || event.metaKey,
									toggle: event.ctrlKey || event.metaKey,
									range: event.shiftKey,
									orderedIds: items.map((entry) => entry.id),
								})}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									<strong>${item.name}</strong>
								</div>
							</div>
							<div class="scene-asset-row__toolbar">
								<span
									class=${
										item.group === "front"
											? "browser-marker browser-marker--front"
											: "browser-marker browser-marker--back"
									}
									title=${t(`referenceImage.group.${item.group}`)}
								></span>
								<${IconButton}
									icon=${item.previewVisible ? "eye" : "eye-off"}
									label=${t(
										item.previewVisible
											? "assetVisibility.visible"
											: "assetVisibility.hidden",
									)}
									active=${item.previewVisible}
									compact=${true}
									className="scene-asset-row__icon-button"
									onClick=${(event) => {
										event.stopPropagation();
										controller()?.setReferenceImagePreviewVisible?.(
											item.id,
											!item.previewVisible,
										);
									}}
								/>
								<${IconButton}
									icon=${item.exportEnabled ? "export" : "slash-circle"}
									label=${
										item.exportEnabled
											? t("action.excludeReferenceImageFromExport")
											: t("action.includeReferenceImageInExport")
									}
									compact=${true}
									className="scene-asset-row__icon-button"
									onClick=${(event) => {
										event.stopPropagation();
										controller()?.setReferenceImageExportEnabled?.(
											item.id,
											!item.exportEnabled,
										);
									}}
								/>
							</div>
						</article>
					`,
				)}
			</div>
		</div>
	`;
}

export function SceneWorkspaceSection({
	controller,
	sceneAssets,
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	return html`
		<${DisclosureBlock}
			icon="scene"
			label=${t("section.sceneManager")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<section class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
						<${SceneBrowserSection}
							controller=${controller}
							draggedAssetId=${draggedAssetId}
							dragHoverState=${dragHoverState}
							sceneAssets=${sceneAssets}
							selectedSceneAsset=${selectedSceneAsset}
							setDraggedAssetId=${setDraggedAssetId}
							setDragHoverState=${setDragHoverState}
							store=${store}
							t=${t}
						/>
					</div>
				</section>
			</div>
		<//>
	`;
}

function CameraPropertyInlineField({
	prefix,
	id,
	value,
	controller,
	historyLabel,
	onCommit,
	inputMode = "decimal",
	min = undefined,
	max = undefined,
	step = "0.01",
	disabled = false,
	onScrubStart = null,
}) {
	return html`
		<div class="camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${prefix}</span>
			<div class="field camera-property-axis-field__input">
				<${NumericDraftInput}
					id=${id}
					inputMode=${inputMode}
					min=${min}
					max=${max}
					step=${step}
					value=${value}
					controller=${controller}
					historyLabel=${historyLabel}
					disabled=${disabled}
					onScrubStart=${onScrubStart}
					onCommit=${onCommit}
				/>
			</div>
		</div>
	`;
}

export function SelectedSceneAssetInspector({
	controller,
	sceneAssets = [],
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	showEmpty = false,
	store,
	t,
}) {
	const selectedSceneAssetIds = store?.selectedSceneAssetIds?.value ?? [];
	const selectedSceneAssets = selectedSceneAssetIds
		.map((assetId) => sceneAssets.find((asset) => asset.id === assetId) ?? null)
		.filter(Boolean);
	const selectionCount = selectedSceneAssets.length;
	const selectionSignature = selectedSceneAssetIds.join("|");
	const selectionBaselineRef = useRef({
		signature: "",
		assets: new Map(),
	});

	if (selectionBaselineRef.current.signature !== selectionSignature) {
		selectionBaselineRef.current = {
			signature: selectionSignature,
			assets: new Map(
				selectedSceneAssets.map((asset) => [
					asset.id,
					{
						position: {
							x: Number(asset.position?.x ?? 0),
							y: Number(asset.position?.y ?? 0),
							z: Number(asset.position?.z ?? 0),
						},
						rotationDegrees: {
							x: Number(asset.rotationDegrees?.x ?? 0),
							y: Number(asset.rotationDegrees?.y ?? 0),
							z: Number(asset.rotationDegrees?.z ?? 0),
						},
						worldScale: Number(asset.worldScale ?? 1),
					},
				]),
			),
		};
	}
	const selectionBaseline = selectionBaselineRef.current;
	const axisKeys = ["x", "y", "z"];
	const transformSectionTitle = t("section.selectedSceneObject");
	const targetAsset = selectedSceneAsset ?? selectedSceneAssets[0] ?? null;

	const renderAxisInput = ({
		axis,
		value,
		step = "0.01",
		controller,
		historyLabel,
		onCommit,
		onScrubDelta = null,
		disabled = false,
	}) => html`
		<div class="field transform-axis-slot">
			<${NumericDraftInput}
				inputMode="decimal"
				step=${step}
				value=${value}
				placeholder=${axis.toUpperCase()}
				controller=${controller}
				disabled=${disabled}
				historyLabel=${historyLabel}
				onCommit=${onCommit}
				onScrubDelta=${onScrubDelta}
			/>
		</div>
	`;

	function renderTransformContent(content) {
		return html`
			<${DisclosureBlock}
				icon="move"
				label=${transformSectionTitle}
				open=${open}
				summaryActions=${summaryActions}
				onToggle=${onToggle}
				className="panel-disclosure--selection-dock"
			>
				${content}
			<//>
		`;
	}

	if (selectionCount === 0 && !selectedSceneAsset) {
		if (!showEmpty) {
			return null;
		}
		return renderTransformContent(html`
			<div class="transform-inspector">
				<div class="transform-row transform-row--single">
					<span class="transform-row__label">${t("field.assetScale")}</span>
					<div class="field transform-row__value">
						<${NumericDraftInput} value="" disabled=${true} />
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetPosition")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: "",
								disabled: true,
							}),
						)}
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetRotation")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: "",
								disabled: true,
							}),
						)}
					</div>
				</div>
			</div>
		`);
	}

	function formatDeltaInputValue(value) {
		if (!Number.isFinite(value)) {
			return "--";
		}
		return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}`;
	}

	function normalizeDeltaDegrees(value) {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) {
			return 0;
		}
		const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
		return wrapped === -180 ? 180 : wrapped;
	}

	function getSharedSelectionDelta(getValue, { normalize = null } = {}) {
		let sharedValue = null;
		for (const asset of selectedSceneAssets) {
			const baselineAsset = selectionBaseline.assets.get(asset.id);
			if (!baselineAsset) {
				return null;
			}
			let nextValue = getValue(asset, baselineAsset);
			if (normalize) {
				nextValue = normalize(nextValue);
			}
			if (!Number.isFinite(nextValue)) {
				return null;
			}
			if (sharedValue === null) {
				sharedValue = nextValue;
				continue;
			}
			if (Math.abs(sharedValue - nextValue) > 1e-4) {
				return null;
			}
		}
		return sharedValue;
	}

	if (selectionCount > 1) {
		const kindLabels = [
			...new Set(
				selectedSceneAssets.map((asset) =>
					t(asset.kindLabelKey ?? "assetKind.model"),
				),
			),
		];
		const currentScaleFactor = getSharedSelectionDelta(
			(asset, baselineAsset) =>
				Number(asset.worldScale ?? 1) / Number(baselineAsset.worldScale ?? 1),
		);

		return renderTransformContent(html`
				<p class="summary"
					>${t("selection.multipleSceneAssetsTitle", {
						count: selectionCount,
					})}
					${kindLabels.length ? ` / ${kindLabels.join(" / ")}` : ""}</p
				>
				<div class="transform-inspector">
					<div class="transform-row transform-row--single">
						<span class="transform-row__label">${t("field.assetScale")}</span>
						<div class="field transform-row__value">
							<${NumericDraftInput}
								inputMode="decimal"
								step="0.25"
								value=${
									Number.isFinite(currentScaleFactor)
										? formatDeltaInputValue(
												(Number(currentScaleFactor) - 1) * 100,
											)
										: "--"
								}
								scrubStartValue=${
									Number.isFinite(currentScaleFactor)
										? (Number(currentScaleFactor) - 1) * 100
										: 0
								}
								controller=${controller}
								historyLabel="asset.scale"
								onScrubDelta=${(deltaValue) => {
									const scaleDelta = deltaValue / 100;
									controller()?.scaleSelectedSceneAssetsByFactor?.(
										Math.max(0.01, 1 + scaleDelta),
									);
								}}
								onCommit=${(nextValue) => {
									const numericValue = Number(nextValue);
									if (
										!Number.isFinite(numericValue) ||
										Math.abs(numericValue) <= 1e-8
									) {
										return;
									}
									const currentFactor = Number.isFinite(currentScaleFactor)
										? currentScaleFactor
										: 1;
									const targetScaleFactor = Math.max(
										0.01,
										1 + numericValue / 100,
									);
									controller()?.scaleSelectedSceneAssetsByFactor?.(
										Math.max(0.01, targetScaleFactor / currentFactor),
									);
								}}
							/>
						</div>
					</div>
					<div class="transform-row">
						<span class="transform-row__label">${t("field.assetPosition")}</span>
						<div class="transform-row__axes">
							${axisKeys.map((axis) => {
								const currentDelta = getSharedSelectionDelta(
									(asset, baselineAsset) =>
										Number(asset.position?.[axis] ?? 0) -
										Number(baselineAsset.position?.[axis] ?? 0),
								);
								return renderAxisInput({
									axis,
									value: formatDeltaInputValue(currentDelta),
									step: "0.01",
									controller,
									historyLabel: "asset.position",
									onScrubDelta: (deltaValue) => {
										controller()?.offsetSelectedSceneAssetsPosition?.(
											axis,
											deltaValue,
										);
									},
									onCommit: (nextValue) => {
										const numericValue = Number(nextValue);
										if (
											!Number.isFinite(numericValue) ||
											Math.abs(numericValue) <= 1e-8
										) {
											return;
										}
										const currentValue = Number.isFinite(currentDelta)
											? currentDelta
											: 0;
										controller()?.offsetSelectedSceneAssetsPosition?.(
											axis,
											numericValue - currentValue,
										);
									},
								});
							})}
						</div>
					</div>
					<div class="transform-row">
						<span class="transform-row__label">${t("field.assetRotation")}</span>
						<div class="transform-row__axes">
							${axisKeys.map((axis) => {
								const currentDelta = getSharedSelectionDelta(
									(asset, baselineAsset) =>
										Number(asset.rotationDegrees?.[axis] ?? 0) -
										Number(baselineAsset.rotationDegrees?.[axis] ?? 0),
									{ normalize: normalizeDeltaDegrees },
								);
								return renderAxisInput({
									axis,
									value: formatDeltaInputValue(currentDelta),
									step: "0.15",
									controller,
									historyLabel: "asset.rotation",
									onScrubDelta: (deltaValue) => {
										controller()?.offsetSelectedSceneAssetsRotationDegrees?.(
											axis,
											deltaValue,
										);
									},
									onCommit: (nextValue) => {
										const numericValue = Number(nextValue);
										if (
											!Number.isFinite(numericValue) ||
											Math.abs(numericValue) <= 1e-8
										) {
											return;
										}
										const currentValue = Number.isFinite(currentDelta)
											? currentDelta
											: 0;
										controller()?.offsetSelectedSceneAssetsRotationDegrees?.(
											axis,
											numericValue - currentValue,
										);
									},
								});
							})}
						</div>
					</div>
				</div>
		`);
	}

	if (!targetAsset) {
		return null;
	}

	return renderTransformContent(html`
			<div class="transform-selection-header">
				<p class="summary transform-selection-header__summary">${targetAsset.label}</p>
				<${IconButton}
					icon="apply-transform"
					label=${t("action.applyAssetTransform")}
					compact=${true}
					className="transform-selection-header__action"
					iconSize=${17}
					iconStrokeWidth=${2.4}
					onClick=${() => controller()?.applyAssetTransform?.(targetAsset.id)}
					tooltip=${{
						title: t("action.applyAssetTransform"),
						placement: "left",
					}}
				/>
			</div>
			<div class="transform-inspector">
				<div class="transform-row transform-row--single">
					<span class="transform-row__label">${t("field.assetScale")}</span>
					<div class="field transform-row__value">
						<${NumericDraftInput}
							inputMode="decimal"
							min="0.01"
							step="0.01"
							value=${Number(targetAsset.worldScale).toFixed(2)}
							controller=${controller}
							historyLabel="asset.scale"
							onCommit=${(nextValue) =>
								controller()?.setAssetWorldScale(targetAsset.id, nextValue)}
						/>
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetPosition")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: Number(targetAsset.position[axis]).toFixed(2),
								step: "0.01",
								controller,
								historyLabel: `asset.position.${axis}`,
								onCommit: (nextValue) =>
									controller()?.setAssetPosition(
										targetAsset.id,
										axis,
										nextValue,
									),
							}),
						)}
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetRotation")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: Number(targetAsset.rotationDegrees[axis]).toFixed(2),
								step: "0.01",
								controller,
								historyLabel: `asset.rotation.${axis}`,
								onCommit: (nextValue) =>
									controller()?.setAssetRotationDegrees(
										targetAsset.id,
										axis,
										nextValue,
									),
							}),
						)}
					</div>
				</div>
			</div>
	`);
}

export function ViewSettingsSection({
	controller,
	headingActions = null,
	t,
	viewportEquivalentMmValue,
	viewportFovLabel,
}) {
	return html`
		<section class="panel-section">
			<${SectionHeading} icon="viewport" title=${t("section.view")}>
				${headingActions}
			<//>
			<label class="field field--range">
				<span>${t("field.viewportEquivalentMm")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="viewport-fov-mm"
						min=${14}
						max=${200}
						step="1"
						value=${viewportEquivalentMmValue}
						controller=${controller}
						historyLabel="viewport.lens"
						onLiveChange=${(event) =>
							applyStandardFrameHorizontalEquivalentMm(
								(nextValue) => controller()?.setViewportBaseFovX(nextValue),
								event.currentTarget.value,
								{ snap: true },
							)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="viewport-fov-mm-input"
							inputMode="decimal"
							min=${14}
							max=${200}
							step="0.01"
							value=${Number(viewportEquivalentMmValue).toFixed(2)}
							controller=${controller}
							historyLabel="viewport.lens"
							onCommit=${(nextValue) =>
								applyStandardFrameHorizontalEquivalentMm(
									(nextBaseFov) =>
										controller()?.setViewportBaseFovX(nextBaseFov),
									nextValue,
								)}
						/>
						<${NumericUnitLabel} value="mm" title=${t("unit.millimeter")} />
					</div>
				</div>
				<p class="summary">${t("field.viewportFov")} ${viewportFovLabel}</p>
			</label>
		</section>
	`;
}

export function SceneSection({
	controller,
	sceneAssets,
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	const groupedSceneAssets = groupSceneAssetsByKind(sceneAssets);
	const sceneAssetSections = [
		{
			kind: "model",
			kindLabelKey: "assetKind.model",
			assets:
				groupedSceneAssets.find((section) => section.kind === "model")
					?.assets ?? [],
		},
		{
			kind: "splat",
			kindLabelKey: "assetKind.splat",
			assets:
				groupedSceneAssets.find((section) => section.kind === "splat")
					?.assets ?? [],
		},
		...groupedSceneAssets
			.filter((section) => !["model", "splat"].includes(section.kind))
			.map((section) => ({
				...section,
				kindLabelKey:
					section.assets[0]?.kindLabelKey ?? `assetKind.${section.kind}`,
			})),
	];
	const selectedSceneAssetIds = new Set(store.selectedSceneAssetIds.value);
	const getSceneAssetById = (assetId) =>
		sceneAssets.find((asset) => asset.id === assetId) ?? null;
	const getDropPosition = (event) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
	};
	const getDropTargetKindIndex = (draggedAsset, targetAsset, position) => {
		if (
			!draggedAsset ||
			!targetAsset ||
			draggedAsset.kind !== targetAsset.kind
		) {
			return null;
		}
		const currentKindIndex = draggedAsset.kindOrderIndex - 1;
		const targetKindIndex = targetAsset.kindOrderIndex - 1;
		if (position === "before") {
			return currentKindIndex < targetKindIndex
				? targetKindIndex - 1
				: targetKindIndex;
		}
		return currentKindIndex < targetKindIndex
			? targetKindIndex
			: targetKindIndex + 1;
	};
	const getSceneAssetRowClass = (asset) => {
		const classes = ["scene-asset-row"];
		if (selectedSceneAssetIds.has(asset.id)) {
			classes.push("scene-asset-row--selected");
		}
		if (asset.id === selectedSceneAsset?.id) {
			classes.push("scene-asset-row--active");
		}
		if (dragHoverState?.assetId === asset.id) {
			classes.push(
				dragHoverState.position === "before"
					? "scene-asset-row--drop-before"
					: "scene-asset-row--drop-after",
			);
		}
		return classes.join(" ");
	};
	return html`
		<${DisclosureBlock}
			icon="scene"
			label=${t("section.sceneManager")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<div class="scene-asset-section-list">
				${sceneAssetSections.map(
					(section) => html`
						<section class="scene-asset-section">
							<${SectionHeading} title=${t(section.kindLabelKey)}>
								<span class="pill pill--dim">${section.assets.length}</span>
							<//>
							<div
								class=${
									section.assets.length > 0
										? "scene-asset-list"
										: "scene-asset-list scene-asset-list--empty"
								}
							>
								${section.assets.map(
									(asset) => html`
										<article
											class=${getSceneAssetRowClass(asset)}
											draggable="true"
											onClick=${(event) =>
												controller()?.selectSceneAsset(asset.id, {
													additive: event.ctrlKey || event.metaKey,
													toggle: event.ctrlKey || event.metaKey,
													range: event.shiftKey,
													orderedIds: sceneAssets.map((entry) => entry.id),
												})}
											onDragStart=${(event) => {
												setDraggedAssetId(asset.id);
												setDragHoverState(null);
												event.dataTransfer.effectAllowed = "move";
												event.dataTransfer.setData(
													"text/plain",
													String(asset.id),
												);
											}}
											onDragOver=${(event) => {
												const draggedAsset = getSceneAssetById(
													draggedAssetId ??
														Number(event.dataTransfer.getData("text/plain")),
												);
												if (draggedAsset?.kind !== asset.kind) {
													return;
												}
												event.preventDefault();
												event.dataTransfer.dropEffect = "move";
												setDragHoverState({
													assetId: asset.id,
													position: getDropPosition(event),
												});
											}}
											onDragLeave=${() => {
												if (dragHoverState?.assetId === asset.id) {
													setDragHoverState(null);
												}
											}}
											onDrop=${(event) => {
												event.preventDefault();
												const draggedId =
													draggedAssetId ??
													Number(event.dataTransfer.getData("text/plain"));
												const draggedAsset = getSceneAssetById(draggedId);
												const dropPosition = getDropPosition(event);
												if (
													!Number.isFinite(draggedId) ||
													draggedId === asset.id ||
													draggedAsset?.kind !== asset.kind
												) {
													setDraggedAssetId(null);
													setDragHoverState(null);
													return;
												}
												const targetKindIndex = getDropTargetKindIndex(
													draggedAsset,
													asset,
													dropPosition,
												);
												if (targetKindIndex !== null) {
													controller()?.moveAssetToIndex(
														draggedId,
														targetKindIndex,
													);
												}
												setDraggedAssetId(null);
												setDragHoverState(null);
											}}
											onDragEnd=${() => {
												setDraggedAssetId(null);
												setDragHoverState(null);
											}}
										>
											<div class="scene-asset-row__main">
												<span class="scene-asset-row__handle" aria-hidden="true">
													<${WorkbenchIcon} name="grip" size=${12} strokeWidth=${0} />
												</span>
												<div class="scene-asset-row__title-group">
													<strong>${asset.label}</strong>
												</div>
											</div>
											<div class="scene-asset-row__toolbar">
												<${IconButton}
													icon=${asset.visible ? "eye" : "eye-off"}
													label=${t(
														asset.visible
															? "assetVisibility.visible"
															: "assetVisibility.hidden",
													)}
													active=${asset.visible}
													compact=${true}
													className="scene-asset-row__icon-button"
													onClick=${(event) => {
														event.stopPropagation();
														controller()?.selectSceneAsset(asset.id);
														controller()?.setAssetVisibility(
															asset.id,
															!asset.visible,
														);
													}}
												/>
											</div>
										</article>
									`,
								)}
							</div>
						</section>
					`,
				)}
			</div>
			${
				showSelectedInspector &&
				html`<${SelectedSceneAssetInspector}
				controller=${controller}
				sceneAssets=${sceneAssets}
				selectedSceneAsset=${selectedSceneAsset}
				store=${store}
				t=${t}
			/>`
			}
		<//>
	`;
}

export function LightingSection({
	controller,
	open = false,
	onToggle = null,
	store,
	summaryActions = null,
	t,
}) {
	const normalizeDegrees = (value) => {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) {
			return 0;
		}
		const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
		return wrapped === -180 ? 180 : wrapped;
	};
	const ambient = store.lighting.ambient.value;
	const modelLightIntensity = store.lighting.modelLightIntensity.value;
	const modelLightAzimuthDeg = store.lighting.modelLightAzimuthDeg.value;
	const modelLightElevationDeg = store.lighting.modelLightElevationDeg.value;
	const activeCameraViewAzimuthDeg = normalizeDegrees(
		(controller?.()?.getActiveCameraHeadingDeg?.() ?? 0) + 180,
	);

	return html`
		<${DisclosureBlock}
			icon="light"
			label=${t("section.lighting")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<div class="lighting-field-row lighting-field-row--direction">
				<span class="lighting-field-row__label">${t("field.lightDirection")}</span>
				<div class="lighting-field-row__control">
					<${LightingDirectionControl}
						controller=${controller}
						azimuthDeg=${modelLightAzimuthDeg}
						elevationDeg=${modelLightElevationDeg}
						viewAzimuthDeg=${activeCameraViewAzimuthDeg}
						onLiveChange=${(nextDirection) =>
							controller()?.setModelLightDirection?.(nextDirection)}
					/>
				</div>
			</div>
			<div class="lighting-field-row">
				<span class="lighting-field-row__label">${t("field.lightIntensity")}</span>
				<div class="lighting-field-row__control">
					<div class="range-row">
					<${HistoryRangeInput}
						id="lighting-intensity"
						min=${0}
						max=${3}
						step=${0.01}
						value=${Number(modelLightIntensity.toFixed(2))}
						controller=${controller}
						historyLabel="lighting.model.intensity"
						onLiveChange=${(event) =>
							controller()?.setModelLightIntensity?.(event.currentTarget.value)}
					/>
					<div class="field lighting-field-row__numeric">
						<div class="numeric-unit numeric-unit--input-only">
							<${NumericDraftInput}
								id="lighting-intensity-input"
								inputMode="decimal"
								min=${0}
								max=${3}
								step=${0.01}
								value=${Number(modelLightIntensity).toFixed(2)}
								controller=${controller}
								historyLabel="lighting.model.intensity"
								onCommit=${(nextValue) =>
									controller()?.setModelLightIntensity?.(nextValue)}
							/>
						</div>
					</div>
				</div>
				</div>
			</div>
			<div class="lighting-field-row">
				<span class="lighting-field-row__label">${t("field.lightAmbient")}</span>
				<div class="lighting-field-row__control">
					<div class="range-row">
					<${HistoryRangeInput}
						id="lighting-ambient"
						min=${0}
						max=${2.5}
						step=${0.01}
						value=${Number(ambient.toFixed(2))}
						controller=${controller}
						historyLabel="lighting.ambient"
						onLiveChange=${(event) =>
							controller()?.setLightingAmbient?.(event.currentTarget.value)}
					/>
					<div class="field lighting-field-row__numeric">
						<div class="numeric-unit numeric-unit--input-only">
							<${NumericDraftInput}
								id="lighting-ambient-input"
								inputMode="decimal"
								min=${0}
								max=${2.5}
								step=${0.01}
								value=${Number(ambient).toFixed(2)}
								controller=${controller}
								historyLabel="lighting.ambient"
								onCommit=${(nextValue) =>
									controller()?.setLightingAmbient?.(nextValue)}
							/>
						</div>
					</div>
				</div>
				</div>
			</div>
		<//>
	`;
}

export function ShotCameraSection({
	activeShotCamera,
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	return html`
		<${DisclosureBlock}
			icon="camera"
			label=${t("section.shotCameraManager")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<${ShotCameraManagerList}
				activeShotCamera=${activeShotCamera}
				controller=${controller}
				shotCameras=${store.workspace.shotCameras.value}
				t=${t}
			/>
		<//>
	`;
}

export function ShotCameraPropertiesSection({
	controller,
	equivalentMmValue,
	fovLabel,
	open = true,
	summaryActions = null,
	onToggle = null,
	shotCameraClipMode,
	store,
	t,
}) {
	const shotCameraPositionX = Number(store.shotCamera.positionX.value).toFixed(
		2,
	);
	const shotCameraPositionY = Number(store.shotCamera.positionY.value).toFixed(
		2,
	);
	const shotCameraPositionZ = Number(store.shotCamera.positionZ.value).toFixed(
		2,
	);
	const shotCameraYawDeg = Number(store.shotCamera.yawDeg.value).toFixed(2);
	const shotCameraPitchDeg = Number(store.shotCamera.pitchDeg.value).toFixed(2);
	const shotCameraRollDeg = Number(store.shotCamera.rollDeg.value).toFixed(2);
	const shotCameraRollLock = store.shotCamera.rollLock.value;

	return html`
		<${DisclosureBlock}
			icon="camera-property"
			label=${t("section.shotCameraProperties")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<label class="field field--range">
				<span>${t("field.shotCameraEquivalentMm")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="fov-mm"
						min=${14}
						max=${200}
						step="1"
						value=${equivalentMmValue}
						controller=${controller}
						historyLabel="camera.lens"
						onLiveChange=${(event) =>
							applyStandardFrameHorizontalEquivalentMm(
								(nextValue) => controller()?.setBaseFovX(nextValue),
								event.currentTarget.value,
								{ snap: true },
							)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="fov-mm-input"
							inputMode="decimal"
							min=${14}
							max=${200}
							step="0.01"
							value=${Number(equivalentMmValue).toFixed(2)}
							controller=${controller}
							historyLabel="camera.lens"
							onCommit=${(nextValue) =>
								applyStandardFrameHorizontalEquivalentMm(
									(nextBaseFov) => controller()?.setBaseFovX(nextBaseFov),
									nextValue,
								)}
						/>
						<${NumericUnitLabel} value="mm" title=${t("unit.millimeter")} />
					</div>
				</div>
				<p class="summary">${t("field.shotCameraFov")} ${fovLabel}</p>
			</label>
			<div class="pose-action-row">
				<${IconButton}
					id="copy-viewport-to-shot"
					icon="copy-to-camera"
					label=${t("action.viewportToShot")}
					compact=${true}
					tooltip=${{
						title: t("action.viewportToShot"),
						description: t("tooltip.copyViewportPoseToShot"),
						placement: "left",
					}}
					onClick=${() => controller()?.copyViewportToShotCamera()}
				/>
				<${IconButton}
					id="copy-shot-to-viewport"
					icon="copy-to-viewport"
					label=${t("action.shotToViewport")}
					compact=${true}
					tooltip=${{
						title: t("action.shotToViewport"),
						description: t("tooltip.copyShotPoseToViewport"),
						placement: "left",
					}}
					onClick=${() => controller()?.copyShotCameraToViewport()}
				/>
				<${IconButton}
					id="reset-active-view"
					icon="reset"
					label=${t("action.resetActive")}
					compact=${true}
					tooltip=${{
						title: t("action.resetActive"),
						description: t("tooltip.resetActiveView"),
						placement: "left",
					}}
					onClick=${() => controller()?.resetActiveView()}
				/>
			</div>
			<div class="camera-property-inline-row">
				<span class="camera-property-inline-row__label">${t("field.assetPosition")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${CameraPropertyInlineField}
						prefix="X"
						id="shot-camera-position-x"
						value=${shotCameraPositionX}
						controller=${controller}
						historyLabel="camera.position.x"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPositionAxis?.("x", nextValue)}
					/>
					<${CameraPropertyInlineField}
						prefix="Y"
						id="shot-camera-position-y"
						value=${shotCameraPositionY}
						controller=${controller}
						historyLabel="camera.position.y"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPositionAxis?.("y", nextValue)}
					/>
					<${CameraPropertyInlineField}
						prefix="Z"
						id="shot-camera-position-z"
						value=${shotCameraPositionZ}
						controller=${controller}
						historyLabel="camera.position.z"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPositionAxis?.("z", nextValue)}
					/>
				</div>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--action">
				<span class="camera-property-inline-row__label">${t("field.assetRotation")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${CameraPropertyInlineField}
						prefix="Y"
						id="shot-camera-yaw"
						value=${shotCameraYawDeg}
						controller=${controller}
						historyLabel="camera.rotation.yaw"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPoseAngle?.("yaw", nextValue)}
					/>
					<${CameraPropertyInlineField}
						prefix="P"
						id="shot-camera-pitch"
						value=${shotCameraPitchDeg}
						controller=${controller}
						historyLabel="camera.rotation.pitch"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPoseAngle?.("pitch", nextValue)}
					/>
					<${CameraPropertyInlineField}
						prefix="R"
						id="shot-camera-roll"
						value=${shotCameraRollDeg}
						controller=${controller}
						historyLabel="camera.rotation.roll"
						onCommit=${(nextValue) =>
							controller()?.setActiveShotCameraPoseAngle?.("roll", nextValue)}
					/>
				</div>
				<${IconButton}
					icon=${shotCameraRollLock ? "lock" : "lock-open"}
					label=${t("field.shotCameraRollLock")}
					active=${shotCameraRollLock}
					compact=${true}
					className="camera-property-inline-row__action"
					tooltip=${{
						title: t("field.shotCameraRollLock"),
						placement: "left",
					}}
					onClick=${() =>
						controller()?.setShotCameraRollLock?.(!shotCameraRollLock)}
				/>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--clip">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--clip">
					<${CameraPropertyInlineField}
						prefix=${t("field.shotCameraNear")}
						id="shot-camera-near"
						value=${Number(store.shotCamera.near.value).toFixed(2)}
						controller=${controller}
						historyLabel="camera.near"
						min="0.1"
						step="0.1"
						disabled=${shotCameraClipMode === "auto"}
						onScrubStart=${() => {
							if (shotCameraClipMode === "auto") {
								controller()?.setShotCameraClippingMode?.("manual");
							}
						}}
						onCommit=${(nextValue) => controller()?.setShotCameraNear(nextValue)}
					/>
					<${CameraPropertyInlineField}
						prefix=${t("field.shotCameraFar")}
						id="shot-camera-far"
						value=${Number(store.shotCamera.far.value).toFixed(2)}
						controller=${controller}
						historyLabel="camera.far"
						min="0.1"
						step="0.1"
						disabled=${shotCameraClipMode === "auto"}
						onScrubStart=${() => {
							if (shotCameraClipMode === "auto") {
								controller()?.setShotCameraClippingMode?.("manual");
							}
						}}
						onCommit=${(nextValue) => controller()?.setShotCameraFar(nextValue)}
					/>
				</div>
				<label class="switch-toggle camera-property-inline-row__switch">
					<input
						type="checkbox"
						checked=${shotCameraClipMode === "auto"}
						onChange=${(event) =>
							controller()?.setShotCameraClippingMode?.(
								event.currentTarget.checked ? "auto" : "manual",
							)}
					/>
					<span class="switch-toggle__control" aria-hidden="true">
						<span class="switch-toggle__thumb"></span>
					</span>
					<span class="switch-toggle__label">${t("clipMode.auto")}</span>
				</label>
			</div>
				<div class="pose-grid">
					<label class="field">
						<span>${t("field.shotCameraMoveHorizontal")}</span>
						<${DirectionalScrubControl}
							controller=${controller}
							historyLabel="camera.local-move.horizontal"
							ariaLabel=${t("field.shotCameraMoveHorizontal")}
							step=${0.02}
							onDelta=${(deltaDistance) =>
								controller()?.moveActiveShotCameraLocalAxis?.(
									"right",
									deltaDistance,
								)}
						/>
					</label>
					<label class="field">
						<span>${t("field.shotCameraMoveVertical")}</span>
						<${DirectionalScrubControl}
							controller=${controller}
							historyLabel="camera.local-move.vertical"
							ariaLabel=${t("field.shotCameraMoveVertical")}
							step=${0.02}
							onDelta=${(deltaDistance) =>
								controller()?.moveActiveShotCameraLocalAxis?.(
									"up",
									deltaDistance,
								)}
						/>
					</label>
					<label class="field">
						<span>${t("field.shotCameraMoveDepth")}</span>
						<${DirectionalScrubControl}
							controller=${controller}
							historyLabel="camera.local-move.depth"
							ariaLabel=${t("field.shotCameraMoveDepth")}
							step=${0.03}
							onDelta=${(deltaDistance) =>
								controller()?.moveActiveShotCameraLocalAxis?.(
									"forward",
									deltaDistance,
								)}
						/>
					</label>
				</div>
		<//>
	`;
}

export function ExportSettingsSection({
	activeShotCamera,
	controller,
	exportFormat,
	exportGridLayerMode,
	exportGridOverlay,
	exportModelLayers,
	exportSplatLayers,
	open = false,
	onToggle = null,
	summaryActions = null,
	store,
	t,
}) {
	return html`
		<${DisclosureBlock}
			icon="export"
			label=${t("section.exportSettings")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<label class="field">
				<span>${t("field.shotCameraExportName")}</span>
				<${TextDraftInput}
					id="shot-camera-export-name"
					placeholder=${activeShotCamera?.name ?? "Camera"}
					value=${store.shotCamera.exportName.value}
					onCommit=${(nextValue) =>
						controller()?.setShotCameraExportName(nextValue)}
				/>
			</label>
			<label class="field">
				<span>${t("field.exportFormat")}</span>
				<select
					id="shot-camera-export-format"
					value=${exportFormat}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setShotCameraExportFormat(event.currentTarget.value)}
				>
					<option value="png">${t("exportFormat.png")}</option>
					<option value="psd">${t("exportFormat.psd")}</option>
				</select>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-grid-overlay"
					type="checkbox"
					checked=${exportGridOverlay}
					onChange=${(event) =>
						controller()?.setShotCameraExportGridOverlay(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportGridOverlay")}</span>
			</label>
			${
				exportGridOverlay &&
				html`
					<label class="field">
						<span>${t("field.exportGridLayerMode")}</span>
						<select
							id="shot-camera-export-grid-layer-mode"
							value=${exportGridLayerMode}
							...${INTERACTIVE_FIELD_PROPS}
							onChange=${(event) =>
								controller()?.setShotCameraExportGridLayerMode(
									event.currentTarget.value,
								)}
						>
							<option value="bottom">${t("gridLayerMode.bottom")}</option>
							<option value="overlay">${t("gridLayerMode.overlay")}</option>
						</select>
					</label>
				`
			}
			${
				exportFormat === "psd" &&
				html`
					<label class="checkbox-field">
						<input
							id="shot-camera-export-model-layers"
							type="checkbox"
							checked=${exportModelLayers}
							onChange=${(event) =>
								controller()?.setShotCameraExportModelLayers(
									event.currentTarget.checked,
								)}
						/>
						<span>${t("field.exportModelLayers")}</span>
					</label>
					<label class="checkbox-field">
						<input
							id="shot-camera-export-splat-layers"
							type="checkbox"
							checked=${exportSplatLayers}
							disabled=${!exportModelLayers}
							onChange=${(event) =>
								controller()?.setShotCameraExportSplatLayers(
									event.currentTarget.checked,
								)}
						/>
						<span>${t("field.exportSplatLayers")}</span>
					</label>
				`
			}
		<//>
	`;
}

export function FramesSection({
	activeFrameId,
	controller,
	frameCount,
	frameDocuments,
	frameLimitReached,
	open = false,
	onToggle = null,
	showFramePicker = true,
	summaryActions = null,
	store,
	t,
}) {
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const rememberedMaskFrameIds = store.frames.maskSelectedIds.value ?? [];
	const hasFrames = frameDocuments.length > 0;
	const hasSelectedFrames = rememberedMaskFrameIds.length > 0;

	return html`
		<${DisclosureBlock}
			icon="frame"
			label=${`${t("section.frames")} · ${frameCount}/${FRAME_MAX_COUNT}`}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			${
				hasFrames &&
				html`
					<div class="frame-mask-toolbar">
						<div class="frame-mask-toolbar__buttons">
							<${IconButton}
								id="frame-mask-all"
								icon="mask-all"
								label=${t("action.toggleAllFrameMask")}
								active=${frameMaskMode === "all"}
								compact=${true}
								className="frame-mask-toolbar__button"
								onClick=${() => controller()?.toggleFrameMaskMode?.("all")}
								tooltip=${{
									title: t("action.toggleAllFrameMask"),
									description: t("tooltip.frameMaskAll"),
									placement: "bottom",
								}}
							/>
							<${IconButton}
								id="frame-mask-selected"
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
									placement: "bottom",
								}}
							/>
						</div>
						<label class="field field--inline-compact frame-mask-toolbar__opacity">
							<span>${t("field.frameMaskOpacity")}</span>
							<div class="field--inline-compact__value">
								<div class="numeric-unit">
									<${NumericDraftInput}
										value=${Number(frameMaskOpacityPct).toFixed(0)}
										min="0"
										max="100"
										step="1"
										controller=${controller}
										historyLabel="frame.mask-opacity"
										onCommit=${(nextValue) =>
											controller()?.setFrameMaskOpacity?.(nextValue)}
									/>
									<${NumericUnitLabel}
										value="%"
										title=${t("unit.percent")}
									/>
								</div>
							</div>
						</label>
					</div>
				`
			}
			${
				frameDocuments.length > 0
					? html`
						${
							showFramePicker &&
							html`
								<label class="field">
									<span>${t("field.activeFrame")}</span>
									<select
										id="active-frame"
										value=${activeFrameId}
										...${INTERACTIVE_FIELD_PROPS}
										onChange=${(event) =>
											controller()?.selectFrame(event.currentTarget.value)}
									>
										${frameDocuments.map(
											(frame) => html`
												<option value=${frame.id}>${frame.name}</option>
											`,
										)}
									</select>
								</label>
							`
						}
						<div class="button-row">
							<${IconButton}
								id="new-frame"
								icon="plus"
								label=${t("action.newFrame")}
								disabled=${frameLimitReached}
								onClick=${() => controller()?.createFrame()}
							/>
							<${IconButton}
								id="duplicate-frame"
								icon="duplicate"
								label=${t("action.duplicateFrame")}
								disabled=${frameLimitReached}
								onClick=${() => controller()?.duplicateActiveFrame()}
							/>
							<${IconButton}
								id="delete-frame"
								icon="trash"
								label=${t("action.deleteFrame")}
								onClick=${() => controller()?.deleteActiveFrame()}
							/>
						</div>
					`
					: html`
						<div class="button-row">
							<${IconButton}
								id="new-frame"
								icon="plus"
								label=${t("action.newFrame")}
								onClick=${() => controller()?.createFrame()}
							/>
						</div>
					`
			}
		<//>
	`;
}

export function ReferenceSection({
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	showList = true,
	store,
	t,
}) {
	const assets = store.referenceImages.assets.value;
	const items = store.referenceImages.items.value;
	const itemsForDisplay = [...items].reverse();
	const presets = store.referenceImages.presets.value;
	const previewSessionVisible =
		store.referenceImages.previewSessionVisible.value;
	const selectedAssetId = store.referenceImages.selectedAssetId.value;
	const selectedItemId = store.referenceImages.selectedItemId.value;
	const selectedItemIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const panelPresetId = store.referenceImages.panelPresetId.value;
	const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
	const selectedAsset =
		assets.find(
			(asset) => asset.id === (selectedItem?.assetId ?? selectedAssetId),
		) ?? null;

	function getReferenceRowClass({ selected = false, active = false }) {
		const classes = ["scene-asset-row"];
		if (selected) {
			classes.push("scene-asset-row--selected");
		}
		if (active) {
			classes.push("scene-asset-row--active");
		}
		return classes.join(" ");
	}

	return html`
		<${DisclosureBlock}
			icon="image"
			label=${t("section.referenceImages")}
			open=${open}
			summaryMeta=${html`<span class="pill pill--dim">${items.length}</span>`}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<div class="button-row">
				<button
					type="button"
					class="button button--compact"
					onClick=${() => controller()?.openReferenceImageFiles?.()}
				>
					${t("action.openReferenceImages")}
				</button>
				<button
					type="button"
					class=${
						previewSessionVisible
							? "button button--primary button--compact"
							: "button button--compact"
					}
					onClick=${() =>
						controller()?.setReferenceImagePreviewSessionVisible?.(
							!previewSessionVisible,
						)}
				>
					${
						previewSessionVisible
							? t("action.hideReferenceImages")
							: t("action.showReferenceImages")
					}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${t("referenceImage.activePreset")}</span>
					<select
						value=${panelPresetId}
						...${INTERACTIVE_FIELD_PROPS}
						onChange=${(event) =>
							controller()?.setActiveReferenceImagePreset?.(
								event.currentTarget.value,
							)}
					>
						${presets.map(
							(preset) => html`
								<option key=${preset.id} value=${preset.id}>
									${preset.name}
								</option>
							`,
						)}
					</select>
				</label>
				<div class="field field--action">
					<span>${t("referenceImage.activePresetItems", { count: items.length })}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${() => controller()?.duplicateActiveReferenceImagePreset?.()}
					>
						${t("action.duplicateReferencePreset")}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${
					showList &&
					html`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${t("referenceImage.currentPresetSection")}</strong>
								<span class="pill pill--dim">${items.length}</span>
							</div>
							${
								items.length > 0
									? html`
											<div class="scene-asset-list">
												${itemsForDisplay.map(
													(item) => html`
														<article
															class=${getReferenceRowClass({
																selected: selectedItemIds.has(item.id),
																active: item.id === selectedItemId,
															})}
															onClick=${(event) =>
																controller()?.selectReferenceImageItem?.(
																	item.id,
																	{
																		additive: event.ctrlKey || event.metaKey,
																		toggle: event.ctrlKey || event.metaKey,
																		range: event.shiftKey,
																		orderedIds: itemsForDisplay.map(
																			(entry) => entry.id,
																		),
																	},
																)}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${item.name}</strong>
																	<span class="scene-asset-row__meta">
																		${item.fileName || t("referenceImage.untitled")} ·
																		${t(`referenceImage.group.${item.group}`)} ·
																		${t("referenceImage.orderLabel", {
																			order: item.order + 1,
																		})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${IconButton}
																	icon=${item.previewVisible ? "eye" : "eye-off"}
																	label=${t(
																		item.previewVisible
																			? "assetVisibility.visible"
																			: "assetVisibility.hidden",
																	)}
																	active=${item.previewVisible}
																	compact=${true}
																	className="scene-asset-row__icon-button"
																	onClick=${(event) => {
																		event.stopPropagation();
																		controller()?.setReferenceImagePreviewVisible?.(
																			item.id,
																			!item.previewVisible,
																		);
																	}}
																/>
																<${IconButton}
																	icon=${item.exportEnabled ? "export" : "slash-circle"}
																	label=${
																		item.exportEnabled
																			? t(
																					"action.excludeReferenceImageFromExport",
																				)
																			: t(
																					"action.includeReferenceImageInExport",
																				)
																	}
																	compact=${true}
																	className="scene-asset-row__icon-button"
																	onClick=${(event) => {
																		event.stopPropagation();
																		controller()?.setReferenceImageExportEnabled?.(
																			item.id,
																			!item.exportEnabled,
																		);
																	}}
																/>
															</div>
														</article>
													`,
												)}
											</div>
										`
									: html`<p class="summary">${t("referenceImage.currentCameraEmpty")}</p>`
							}
						</section>
					`
				}
				${
					selectedItem && selectedAsset
						? html`
								<${DisclosureBlock}
									icon="image"
									label=${selectedItem.name}
									open=${true}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${selectedItem.name} ·
											${selectedAsset.fileName || t("referenceImage.untitled")}
										</p>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageOpacity")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(selectedItem.opacity * 100)}
														controller=${controller}
														historyLabel="reference-image.opacity"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOpacity?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="%" title=${t("unit.percent")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageScale")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(selectedItem.scalePct).toFixed(2)}
														controller=${controller}
														historyLabel="reference-image.scale"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageScalePct?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="%" title=${t("unit.percent")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageOffsetX")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="1"
														value=${Number(selectedItem.offsetPx?.x ?? 0).toFixed(0)}
														controller=${controller}
														historyLabel="reference-image.offset.x"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOffsetPx?.(
																selectedItem.id,
																"x",
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="px" title=${t("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="1"
														value=${Number(selectedItem.offsetPx?.y ?? 0).toFixed(0)}
														controller=${controller}
														historyLabel="reference-image.offset.y"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOffsetPx?.(
																selectedItem.id,
																"y",
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="px" title=${t("unit.pixel")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageRotation")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="0.01"
														value=${Number(selectedItem.rotationDeg).toFixed(2)}
														controller=${controller}
														historyLabel="reference-image.rotation"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageRotationDeg?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="deg" title=${t("unit.degree")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageOrder")}</span>
												<${NumericDraftInput}
													inputMode="numeric"
													min="1"
													step="1"
													value=${selectedItem.order + 1}
													controller=${controller}
													historyLabel="reference-image.order"
													onCommit=${(nextValue) =>
														controller()?.setReferenceImageOrder?.(
															selectedItem.id,
															Math.max(0, Number(nextValue) - 1),
														)}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageGroup")}</span>
												<select
													value=${selectedItem.group}
													...${INTERACTIVE_FIELD_PROPS}
													onChange=${(event) =>
														controller()?.setReferenceImageGroup?.(
															selectedItem.id,
															event.currentTarget.value,
														)}
												>
													<option value="back">
														${t("referenceImage.group.back")}
													</option>
													<option value="front">
														${t("referenceImage.group.front")}
													</option>
												</select>
											</label>
										</div>
										<div class="button-row">
											<button
												type="button"
												class=${
													selectedItem.previewVisible
														? "button button--primary button--compact"
														: "button button--compact"
												}
												onClick=${() =>
													controller()?.setReferenceImagePreviewVisible?.(
														selectedItem.id,
														!selectedItem.previewVisible,
													)}
											>
												${
													selectedItem.previewVisible
														? t("action.hideReferenceImage")
														: t("action.showReferenceImage")
												}
											</button>
											<button
												type="button"
												class=${
													selectedItem.exportEnabled
														? "button button--primary button--compact"
														: "button button--compact"
												}
												onClick=${() =>
													controller()?.setReferenceImageExportEnabled?.(
														selectedItem.id,
														!selectedItem.exportEnabled,
													)}
											>
												${
													selectedItem.exportEnabled
														? t("action.excludeReferenceImageFromExport")
														: t("action.includeReferenceImageInExport")
												}
											</button>
										</div>
									</div>
								<//>
							`
						: html`<p class="summary">${t("referenceImage.selectedEmpty")}</p>`
				}
			</div>
		<//>
	`;
}

export function OutputFrameSection({
	anchorOptions,
	controller,
	exportSizeLabel,
	open = true,
	summaryActions = null,
	onToggle = null,
	heightLabel,
	store,
	t,
	widthLabel,
}) {
	const anchorValue = store.renderBox.anchor.value;

	return html`
		<${DisclosureBlock}
			icon="render-box"
			label=${t("section.outputFrame")}
			open=${open}
			summaryMeta=${html`<span id="export-size-pill" class="pill pill--dim">${exportSizeLabel}</span>`}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<label class="field field--range">
				<span>${t("field.outputFrameWidth")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="box-width"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_WIDTH_PCT}
						step="1"
						value=${Math.round(store.renderBox.widthScale.value * 100)}
						controller=${controller}
						historyLabel="output-frame.width"
						onLiveChange=${(event) =>
							controller()?.setBoxWidthPercent(event.currentTarget.value)}
					/>
					<output id="box-width-value">${widthLabel}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${t("field.outputFrameHeight")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="box-height"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_HEIGHT_PCT}
						step="1"
						value=${Math.round(store.renderBox.heightScale.value * 100)}
						controller=${controller}
						historyLabel="output-frame.height"
						onLiveChange=${(event) =>
							controller()?.setBoxHeightPercent(event.currentTarget.value)}
					/>
					<output id="box-height-value">${heightLabel}</output>
				</div>
			</label>
			<div class="field field--inline-compact field--anchor-compact">
				<span>${t("field.anchor")}</span>
				<div class="field--inline-compact__value field--anchor-compact__value">
					<div
						class="anchor-matrix"
						role="grid"
						aria-label=${t("field.anchor")}
					>
					${anchorOptions.map(
						(option) => html`
							<button
								key=${option.value}
								type="button"
								class=${
									option.value === anchorValue
										? "anchor-matrix__cell anchor-matrix__cell--active"
										: "anchor-matrix__cell"
								}
								aria-label=${option.label}
								title=${option.label}
								onPointerDown=${stopUiEvent}
							onClick=${(event) => {
								stopUiEvent(event);
								controller()?.setAnchor(option.value);
							}}
						></button>
						`,
					)}
					</div>
				</div>
			</div>
		<//>
	`;
}

export function ExportSection({
	controller,
	exportBusy,
	exportFormatLabel,
	exportPresetIds,
	exportSelectionMissing,
	exportStatusLabel,
	exportTarget,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	const exportStatusClass =
		exportBusy || exportStatusLabel !== t("export.idle")
			? "pill"
			: "pill pill--dim";
	const exportReferenceImagesEnabled =
		store.referenceImages.exportSessionEnabled.value !== false;

	return html`
		<${DisclosureBlock}
			icon="export"
			label=${t("section.export")}
			open=${open}
			summaryMeta=${html`<span id="export-status-pill" class=${exportStatusClass}>
				${exportStatusLabel}
			</span>`}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--preview"
		>
			<label class="field">
				<span>${t("field.exportTarget")}</span>
				<select
					id="export-target"
					value=${exportTarget}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setExportTarget(event.currentTarget.value)}
				>
					<option value="current">${t("exportTarget.current")}</option>
					<option value="all">${t("exportTarget.all")}</option>
					<option value="selected">${t("exportTarget.selected")}</option>
				</select>
			</label>
			${
				exportTarget === "selected" &&
				html`
					<div class="export-selection-list">
						${store.workspace.shotCameras.value.map(
							(shotCamera) => html`
								<label class="export-selection-item">
									<input
										type="checkbox"
										checked=${exportPresetIds.includes(shotCamera.id)}
										onChange=${() =>
											controller()?.toggleExportPreset(shotCamera.id)}
									/>
									<span class="export-selection-item__name">${shotCamera.name}</span>
									<span class="export-selection-item__meta">
										${
											shotCamera.exportSettings?.exportName?.trim() ||
											shotCamera.name
										}
									</span>
								</label>
							`,
						)}
					</div>
				`
			}
			<label class="checkbox-field">
				<input
					type="checkbox"
					checked=${exportReferenceImagesEnabled}
					onChange=${(event) =>
						controller()?.setReferenceImageExportSessionEnabled?.(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportReferenceImages")}</span>
			</label>
			<div class="button-row">
				<button
					id="download-output"
					class="button button--primary"
					type="button"
					disabled=${exportBusy || exportSelectionMissing}
					onClick=${() => controller()?.downloadOutput()}
				>
					${t("action.downloadOutput")}
				</button>
			</div>
			<p id="export-summary" class="summary">
				${exportFormatLabel} · ${store.exportSummary.value}
			</p>
		<//>
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
