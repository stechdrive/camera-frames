import { html } from "htm/preact";
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
import { formatAssetWorldScale } from "../engine/scene-units.js";
import {
	DirectionalScrubControl,
	HistoryRangeInput,
	INTERACTIVE_FIELD_PROPS,
	LightingDirectionControl,
	NumericDraftInput,
	NumericUnitLabel,
	TextDraftInput,
	applyStandardFrameHorizontalEquivalentMm,
} from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	DisclosureBlock,
	HeaderMenu,
	HeaderWordmark,
	IconButton,
	SectionHeading,
	WorkbenchTabs,
} from "./workbench-primitives.js";

export const INSPECTOR_TAB_SCENE = "scene";
export const INSPECTOR_TAB_CAMERA = "camera";
export const INSPECTOR_TAB_EXPORT = "export";

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
			icon: "camera",
			tooltip: {
				title: t("section.shotCamera"),
				description: t("tooltip.tabCamera"),
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

export function ToolRailSection({
	controller,
	mode,
	menuChildren = null,
	projectMenuItems = [],
	store,
	tailContent = null,
	t,
	tooltipPlacement = "right",
	menuPanelPlacement = "down",
}) {
	const canUseTransformTools = mode === "viewport" || mode === "camera";
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
		<section class="workbench-tool-rail" aria-label=${t("section.view")}>
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
			<div class="workbench-tool-rail__divider"></div>
			<div class="workbench-tool-rail__group">
				<${IconButton}
					id="mode-camera"
					icon="camera"
					label=${t("mode.camera")}
					active=${mode === "camera"}
					className="workbench-tool-rail__button"
					tooltip=${{
						title: t("mode.camera"),
						description: t("tooltip.modeCamera"),
						placement: tooltipPlacement,
					}}
					onClick=${() => controller()?.setMode("camera")}
				/>
				<${IconButton}
					id="mode-viewport"
					icon="viewport"
					label=${t("mode.viewport")}
					active=${mode === "viewport"}
					className="workbench-tool-rail__button"
					tooltip=${{
						title: t("mode.viewport"),
						description: t("tooltip.modeViewport"),
						placement: tooltipPlacement,
					}}
					onClick=${() => controller()?.setMode("viewport")}
				/>
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
					</div>
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

export function InspectorRailSection({ activeTab, onTogglePeek, t }) {
	const tabs = getInspectorTabs(t);
	return html`
		<section class="workbench-inspector-rail" aria-label=${t("section.project")}>
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
						onClick=${() => onTogglePeek?.(tab.id)}
					/>
				`,
			)}
		</section>
	`;
}

export function ViewSettingsSection({
	controller,
	mode,
	selectedSceneAsset,
	store,
	t,
	viewportEquivalentMmValue,
	viewportFovLabel,
}) {
	const showTransformControls =
		selectedSceneAsset &&
		(store.viewportTransformMode.value || store.viewportPivotEditMode.value);

	return html`
		<section class="panel-section">
			<${SectionHeading} icon="view" title=${t("section.view")}>
				<span id="mode-pill" class="pill">${mode === "camera" ? t("mode.camera") : t("mode.viewport")}</span>
			<//>
			${
				mode === "camera" &&
				html`
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
				`
			}
			${
				mode === "viewport" &&
				html`
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
				`
			}
			${
				showTransformControls &&
				html`
					<${DisclosureBlock}
						icon="move"
						label=${t("field.transformSpace")}
						open=${true}
					>
						<div class="button-row">
							<button
								type="button"
								class=${
									store.viewportTransformSpace.value === "world"
										? "button button--primary button--compact"
										: "button button--compact"
								}
								onClick=${() => controller()?.setViewportTransformSpace("world")}
							>
								${t("transformSpace.world")}
							</button>
							<button
								type="button"
								class=${
									store.viewportTransformSpace.value === "local"
										? "button button--primary button--compact"
										: "button button--compact"
								}
								onClick=${() => controller()?.setViewportTransformSpace("local")}
							>
								${t("transformSpace.local")}
							</button>
						</div>
						${
							selectedSceneAsset?.hasWorkingPivot &&
							html`
								<div class="button-row">
									<button
										type="button"
										class="button button--compact"
										onClick=${() => controller()?.resetSelectedAssetWorkingPivot()}
									>
										${t("action.resetPivot")}
									</button>
								</div>
							`
						}
					<//>
				`
			}
		</section>
	`;
}

export function SceneSection({
	controller,
	sceneAssets,
	sceneBadge,
	sceneScaleSummary,
	sceneSummary,
	sceneUnitBadge,
	selectedSceneAsset,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	const sceneAssetSections = groupSceneAssetsByKind(sceneAssets);
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
	const sceneSummaryParts = [sceneSummary, sceneScaleSummary].filter(Boolean);

	return html`
		<section class="panel-section">
			<${SectionHeading} icon="scene" title=${t("section.scene")}>
				<div class="pill-row">
					<span id="scene-unit-pill" class="pill pill--dim">${sceneUnitBadge}</span>
					<span id="scene-badge" class="pill pill--dim">${sceneBadge}</span>
				</div>
			<//>
			${
				sceneSummaryParts.length > 0 &&
				html`
					<p id="scene-summary" class="summary">
						${sceneSummaryParts.join(" · ")}
					</p>
				`
			}
			${
				sceneAssets.length > 0 &&
				html`
					<div class="scene-asset-section-list">
						${sceneAssetSections.map(
							(section) => html`
								<section class="scene-asset-section">
									<${SectionHeading} title=${t(section.assets[0].kindLabelKey)}>
										<span class="pill pill--dim">${section.assets.length}</span>
									<//>
									<div class="scene-asset-list">
										${section.assets.map(
											(asset) => html`
												<article
													class=${getSceneAssetRowClass(asset)}
													draggable="true"
													onClick=${(event) =>
														controller()?.selectSceneAsset(asset.id, {
															additive:
																event.shiftKey ||
																event.ctrlKey ||
																event.metaKey,
															toggle:
																event.shiftKey ||
																event.ctrlKey ||
																event.metaKey,
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
																Number(
																	event.dataTransfer.getData("text/plain"),
																),
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
															<span class="scene-asset-row__meta">
																#${asset.kindOrderIndex} ·
																${formatAssetWorldScale(asset.worldScale)}
															</span>
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
				`
			}
			${
				selectedSceneAsset &&
				html`
					<${DisclosureBlock}
						icon="scene"
						label=${selectedSceneAsset.label}
					>
						<div class="button-row">
							<${IconButton}
								icon=${selectedSceneAsset.visible ? "eye" : "eye-off"}
								label=${t(
									selectedSceneAsset.visible
										? "assetVisibility.visible"
										: "assetVisibility.hidden",
								)}
								active=${selectedSceneAsset.visible}
								compact=${true}
								onClick=${() =>
									controller()?.setAssetVisibility(
										selectedSceneAsset.id,
										!selectedSceneAsset.visible,
									)}
							/>
							<${IconButton}
								icon="reset"
								label=${t("action.resetScale")}
								compact=${true}
								onClick=${() =>
									controller()?.resetAssetWorldScale(selectedSceneAsset.id)}
							/>
						</div>
						<label class="field">
							<span>${t("field.assetScale")}</span>
							<${NumericDraftInput}
								inputMode="decimal"
								min="0.01"
								step="0.01"
								value=${Number(selectedSceneAsset.worldScale).toFixed(2)}
								controller=${controller}
								historyLabel="asset.scale"
								onCommit=${(nextValue) =>
									controller()?.setAssetWorldScale(
										selectedSceneAsset.id,
										nextValue,
									)}
							/>
						</label>
						<div class="triple-field-row">
							${["x", "y", "z"].map(
								(axis) => html`
									<label class="field">
										<span>${t("field.assetPosition")} ${axis.toUpperCase()}</span>
										<${NumericDraftInput}
											inputMode="decimal"
											step="0.01"
											value=${Number(selectedSceneAsset.position[axis]).toFixed(2)}
											controller=${controller}
											historyLabel=${`asset.position.${axis}`}
											onCommit=${(nextValue) =>
												controller()?.setAssetPosition(
													selectedSceneAsset.id,
													axis,
													nextValue,
												)}
										/>
									</label>
								`,
							)}
						</div>
						<div class="triple-field-row">
							${["x", "y", "z"].map(
								(axis) => html`
									<label class="field">
										<span>${t("field.assetRotation")} ${axis.toUpperCase()}</span>
										<${NumericDraftInput}
											inputMode="decimal"
											step="0.01"
											value=${Number(selectedSceneAsset.rotationDegrees[axis]).toFixed(2)}
											controller=${controller}
											historyLabel=${`asset.rotation.${axis}`}
											onCommit=${(nextValue) =>
												controller()?.setAssetRotationDegrees(
													selectedSceneAsset.id,
													axis,
													nextValue,
												)}
										/>
									</label>
								`,
							)}
						</div>
					<//>
				`
			}
		</section>
	`;
}

export function LightingSection({ controller, store, t }) {
	const ambient = store.lighting.ambient.value;
	const modelLightIntensity = store.lighting.modelLightIntensity.value;
	const modelLightAzimuthDeg = store.lighting.modelLightAzimuthDeg.value;
	const modelLightElevationDeg = store.lighting.modelLightElevationDeg.value;
	const activeCameraHeadingDeg =
		controller?.()?.getActiveCameraHeadingDeg?.() ?? 0;

	return html`
		<${DisclosureBlock}
			icon="light"
			label=${t("section.lighting")}
		>
			<label class="field">
				<span>${t("field.lightDirection")}</span>
				<${LightingDirectionControl}
					controller=${controller}
					azimuthDeg=${modelLightAzimuthDeg}
					elevationDeg=${modelLightElevationDeg}
					viewAzimuthDeg=${activeCameraHeadingDeg}
					onLiveChange=${(nextDirection) =>
						controller()?.setModelLightDirection?.(nextDirection)}
				/>
			</label>
			<label class="field field--range">
				<span>${t("field.lightIntensity")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="lighting-intensity"
						min=${0}
						max=${2}
						step=${0.01}
						value=${Number(modelLightIntensity.toFixed(2))}
						controller=${controller}
						historyLabel="lighting.model.intensity"
						onLiveChange=${(event) =>
							controller()?.setModelLightIntensity?.(event.currentTarget.value)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="lighting-intensity-input"
							inputMode="decimal"
							min=${0}
							max=${2}
							step=${0.01}
							value=${Number(modelLightIntensity).toFixed(2)}
							controller=${controller}
							historyLabel="lighting.model.intensity"
							onCommit=${(nextValue) =>
								controller()?.setModelLightIntensity?.(nextValue)}
						/>
					</div>
				</div>
			</label>
			<label class="field field--range">
				<span>${t("field.lightAmbient")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="lighting-ambient"
						min=${0}
						max=${2}
						step=${0.01}
						value=${Number(ambient.toFixed(2))}
						controller=${controller}
						historyLabel="lighting.ambient"
						onLiveChange=${(event) =>
							controller()?.setLightingAmbient?.(event.currentTarget.value)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="lighting-ambient-input"
							inputMode="decimal"
							min=${0}
							max=${2}
							step=${0.01}
							value=${Number(ambient).toFixed(2)}
							controller=${controller}
							historyLabel="lighting.ambient"
							onCommit=${(nextValue) =>
								controller()?.setLightingAmbient?.(nextValue)}
						/>
					</div>
				</div>
			</label>
		<//>
	`;
}

export function ShotCameraSection({
	activeShotCamera,
	controller,
	equivalentMmValue,
	fovLabel,
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
		<section class="panel-section">
			<${SectionHeading} icon="camera" title=${t("section.shotCamera")} />
			<div class="split-field-row split-field-row--wide-action">
				<label class="field">
					<span>${t("field.activeShotCamera")}</span>
					<select
						id="active-shot-camera"
						value=${store.workspace.activeShotCameraId.value}
						...${INTERACTIVE_FIELD_PROPS}
						onChange=${(event) =>
							controller()?.selectShotCamera(event.currentTarget.value)}
					>
						${store.workspace.shotCameras.value.map(
							(shotCamera) => html`
								<option value=${shotCamera.id}>${shotCamera.name}</option>
							`,
						)}
					</select>
				</label>
				<div class="field field--action field--action-end">
					<span>${t("section.shotCamera")}</span>
					<div class="button-row">
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
							onClick=${() => controller()?.duplicateActiveShotCamera()}
						/>
					</div>
				</div>
			</div>
			<label class="field">
				<span>${t("field.shotCameraName")}</span>
				<${TextDraftInput}
					id="shot-camera-name"
					value=${activeShotCamera?.name ?? ""}
					onCommit=${(nextValue) => controller()?.setShotCameraName(nextValue)}
				/>
			</label>
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
			<${DisclosureBlock}
				icon="move"
				label=${t("section.pose")}
				open=${true}
			>
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
				<div class="pose-grid">
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.positionX")}</span>
								<span class="pill pill--cool pill--micro pill--literal">m</span>
							</span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-position-x"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraPositionX}
							controller=${controller}
							historyLabel="camera.position.x"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPositionAxis?.("x", nextValue)}
						/>
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.positionY")}</span>
								<span class="pill pill--cool pill--micro pill--literal">m</span>
							</span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-position-y"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraPositionY}
							controller=${controller}
							historyLabel="camera.position.y"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPositionAxis?.("y", nextValue)}
						/>
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.positionZ")}</span>
								<span class="pill pill--cool pill--micro pill--literal">m</span>
							</span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-position-z"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraPositionZ}
							controller=${controller}
							historyLabel="camera.position.z"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPositionAxis?.("z", nextValue)}
						/>
					</label>
				</div>
				<div class="pose-grid">
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.shotCameraYaw")}</span>
								<span class="pill pill--cool pill--micro pill--literal">°</span>
							</span>
							<span class="field__label-placeholder" aria-hidden="true"></span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-yaw"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraYawDeg}
							controller=${controller}
							historyLabel="camera.rotation.yaw"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPoseAngle?.("yaw", nextValue)}
						/>
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.shotCameraPitch")}</span>
								<span class="pill pill--cool pill--micro pill--literal">°</span>
							</span>
							<span class="field__label-placeholder" aria-hidden="true"></span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-pitch"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraPitchDeg}
							controller=${controller}
							historyLabel="camera.rotation.pitch"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPoseAngle?.(
									"pitch",
									nextValue,
								)}
						/>
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.shotCameraRoll")}</span>
								<span class="pill pill--cool pill--micro pill--literal">°</span>
							</span>
						<${IconButton}
							icon=${shotCameraRollLock ? "lock" : "lock-open"}
							label=${t("field.shotCameraRollLock")}
							active=${shotCameraRollLock}
							compact=${true}
							className="field__label-action"
							tooltip=${{
								title: t("field.shotCameraRollLock"),
								placement: "left",
							}}
							onClick=${() =>
								controller()?.setShotCameraRollLock?.(!shotCameraRollLock)}
						/>
						</div>
						<${NumericDraftInput}
							id="shot-camera-roll"
							inputMode="decimal"
							step="0.01"
							value=${shotCameraRollDeg}
							controller=${controller}
							historyLabel="camera.rotation.roll"
							onCommit=${(nextValue) =>
								controller()?.setActiveShotCameraPoseAngle?.("roll", nextValue)}
						/>
					</label>
				</div>
				<div class="pose-grid">
					<label class="field">
						<div class="field__label-row">
							<span>${t("field.shotCameraClipMode")}</span>
						</div>
						<label class="switch-toggle">
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
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.shotCameraNear")}</span>
								<span class="pill pill--cool pill--micro pill--literal">m</span>
							</span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-near"
							inputMode="decimal"
							min="0.1"
							step="0.1"
							value=${Number(store.shotCamera.near.value).toFixed(2)}
							controller=${controller}
							historyLabel="camera.near"
							disabled=${shotCameraClipMode === "auto"}
							onScrubStart=${() => {
								if (shotCameraClipMode === "auto") {
									controller()?.setShotCameraClippingMode?.("manual");
								}
							}}
							onCommit=${(nextValue) => controller()?.setShotCameraNear(nextValue)}
						/>
					</label>
					<label class="field">
						<div class="field__label-row">
							<span class="field__label-inline">
								<span>${t("field.shotCameraFar")}</span>
								<span class="pill pill--cool pill--micro pill--literal">m</span>
							</span>
						</div>
						<${NumericDraftInput}
							id="shot-camera-far"
							inputMode="decimal"
							min="0.1"
							step="0.1"
							value=${Number(store.shotCamera.far.value).toFixed(2)}
							controller=${controller}
							historyLabel="camera.far"
							disabled=${shotCameraClipMode === "auto"}
							onScrubStart=${() => {
								if (shotCameraClipMode === "auto") {
									controller()?.setShotCameraClippingMode?.("manual");
								}
							}}
							onCommit=${(nextValue) => controller()?.setShotCameraFar(nextValue)}
						/>
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
		</section>
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
	store,
	t,
}) {
	return html`
		<${DisclosureBlock}
			icon="export"
			label=${t("section.exportSettings")}
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
	store,
	t,
}) {
	const frameMaskMode = store.frames.maskMode.value;
	const frameMaskOpacityPct = store.frames.maskOpacityPct.value;
	const selectedFrameIds = store.frames.selectedIds.value ?? [];
	const hasFrames = frameDocuments.length > 0;
	const hasSelectedFrames = selectedFrameIds.length > 0;

	return html`
		<${DisclosureBlock}
			icon="frame"
			label=${`${t("section.frames")} · ${frameCount}/${FRAME_MAX_COUNT}`}
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

export function ReferenceSection({ controller, store, t }) {
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
		<section class="panel-section">
			<${SectionHeading} icon="image" title=${t("section.referenceImages")}>
				<span class="pill pill--dim">${items.length}</span>
			<//>
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
															event,
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
								`
							: html`<p class="summary">${t("referenceImage.currentCameraEmpty")}</p>`
					}
				</section>
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
		</section>
	`;
}

export function OutputFrameSection({
	anchorOptions,
	controller,
	exportSizeLabel,
	heightLabel,
	store,
	t,
	widthLabel,
}) {
	return html`
		<section class="panel-section">
			<${SectionHeading} icon="render-box" title=${t("section.outputFrame")}>
				<span id="export-size-pill" class="pill pill--dim">${exportSizeLabel}</span>
			<//>
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
			<label class="field">
				<span>${t("field.anchor")}</span>
				<select
					id="anchor-select"
					value=${store.renderBox.anchor.value}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) => controller()?.setAnchor(event.currentTarget.value)}
				>
					${anchorOptions.map(
						(option) =>
							html`<option value=${option.value}>${option.label}</option>`,
					)}
				</select>
			</label>
		</section>
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
		<section class="panel-section panel-section--preview">
			<${SectionHeading} icon="export" title=${t("section.export")}>
				<span id="export-status-pill" class=${exportStatusClass}>
					${exportStatusLabel}
				</span>
			<//>
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
		</section>
	`;
}

export function FooterSection({ store }) {
	return html`
		<footer class="panel-footer">
			<p id="status-line" class="status-line">${store.statusLine.value}</p>
		</footer>
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
		/>
	`;
}
