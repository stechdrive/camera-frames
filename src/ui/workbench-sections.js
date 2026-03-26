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
	HistoryRangeInput,
	INTERACTIVE_FIELD_PROPS,
	NumericDraftInput,
	applyStandardFrameEquivalentMm,
} from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	HeaderWordmark,
	IconButton,
	SectionHeading,
	WorkbenchTabs,
} from "./workbench-primitives.js";

export const INSPECTOR_TAB_CAMERA = "camera";
export const INSPECTOR_TAB_EXPORT = "export";

export function WorkbenchHeader({
	t,
	compact = false,
	collapsed = false,
	onToggleCollapse,
}) {
	const buildVersionLabel = getBuildVersionLabel();
	const buildCommitLabel = getBuildCommitLabel();
	const codeStampLabel = getCodeStampLabel();

	return html`
		<header class=${compact ? "panel-header panel-header--compact" : "panel-header"}>
			<div class="panel-header__title-row">
				<${HeaderWordmark} title="CAMERA_FRAMES" compact=${compact} />
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

export function ViewSection({
	controller,
	mode,
	modeLabel,
	selectedSceneAsset,
	store,
	t,
	viewportEquivalentMmLabel,
	viewportEquivalentMmValue,
	viewportFovLabel,
}) {
	const canUseTransformTools = mode === "viewport" || mode === "camera";
	const showTransformControls =
		selectedSceneAsset &&
		(store.viewportTransformMode.value || store.viewportPivotEditMode.value);

	return html`
		<section class="panel-section">
			<${SectionHeading} icon="view" title=${t("section.view")}>
				<span id="mode-pill" class="pill">${modeLabel}</span>
			<//>
			<div class="button-row">
				<${IconButton}
					id="mode-camera"
					icon="camera"
					label=${t("mode.camera")}
					active=${mode === "camera"}
					onClick=${() => controller()?.setMode("camera")}
				/>
				<${IconButton}
					id="mode-viewport"
					icon="viewport"
					label=${t("mode.viewport")}
					active=${mode === "viewport"}
					onClick=${() => controller()?.setMode("viewport")}
				/>
			</div>
			${
				mode === "camera" &&
				html`
					<label class="field field--range">
						<span>${t("field.cameraViewZoom")}</span>
						<div class="range-row">
							<${HistoryRangeInput}
								id="view-zoom"
								min=${MIN_CAMERA_VIEW_ZOOM_PCT}
								max=${MAX_CAMERA_VIEW_ZOOM_PCT}
								step="1"
								value=${Math.round(store.renderBox.viewZoom.value * 100)}
								controller=${controller}
								historyLabel="output-frame.zoom"
								onLiveChange=${(event) =>
									controller()?.setViewZoomPercent(event.currentTarget.value)}
							/>
							<output id="view-zoom-value">${store.zoomLabel.value}</output>
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
									applyStandardFrameEquivalentMm(
										(nextValue) => controller()?.setViewportBaseFovX(nextValue),
										event.currentTarget.value,
										{ snap: true },
									)}
							/>
							<div class="numeric-unit">
								<${NumericDraftInput}
									id="viewport-fov-mm-input"
									inputMode="numeric"
									min=${14}
									max=${200}
									step="1"
									value=${viewportEquivalentMmValue}
									onCommit=${(nextValue) =>
										applyStandardFrameEquivalentMm(
											(nextBaseFov) =>
												controller()?.setViewportBaseFovX(nextBaseFov),
											nextValue,
										)}
								/>
								<span>mm</span>
							</div>
						</div>
						<p class="summary">
							${t("field.viewportFov")} · ${viewportFovLabel} (${viewportEquivalentMmLabel})
						</p>
					</label>
				`
			}
			${
				canUseTransformTools &&
				html`
					<div class="field">
						<span>${t("field.transformMode")}</span>
						<div class="button-row">
							<${IconButton}
								icon="slash-circle"
								label=${t("transformMode.none")}
								active=${store.viewportToolMode.value === "none"}
								compact=${true}
								onClick=${() => controller()?.setViewportTransformMode(false)}
							/>
							<${IconButton}
								icon="cursor"
								label=${t("transformMode.select")}
								active=${store.viewportSelectMode.value}
								compact=${true}
								onClick=${() => controller()?.setViewportSelectMode(true)}
							/>
							<${IconButton}
								icon="move"
								label=${t("transformMode.transform")}
								active=${store.viewportTransformMode.value}
								compact=${true}
								onClick=${() => controller()?.setViewportTransformMode(true)}
							/>
							<${IconButton}
								icon="pivot"
								label=${t("transformMode.pivot")}
								active=${store.viewportPivotEditMode.value}
								compact=${true}
								disabled=${!selectedSceneAsset}
								onClick=${() => controller()?.setViewportPivotEditMode(true)}
							/>
						</div>
					</div>
					${
						showTransformControls &&
						html`
							<div class="field">
								<span>${t("field.transformSpace")}</span>
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
							</div>
							<div class="field">
								<div class="button-row">
									<button
										type="button"
										class="button button--compact"
										disabled=${!selectedSceneAsset.hasWorkingPivot}
										onClick=${() => controller()?.resetSelectedAssetWorkingPivot()}
									>
										${t("action.resetPivot")}
									</button>
								</div>
							</div>
						`
					}
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

	return html`
		<section class="panel-section">
			<${SectionHeading} icon="scene" title=${t("section.scene")}>
				<div class="pill-row">
					<span id="scene-unit-pill" class="pill pill--dim">${sceneUnitBadge}</span>
					<span id="scene-badge" class="pill pill--dim">${sceneBadge}</span>
				</div>
			<//>
			<div class="button-row">
				<button
					id="open-project"
					class="button"
					type="button"
					onClick=${() => controller()?.openProject()}
				>
					${t("action.openProject")}
				</button>
				<button
					id="open-working-project"
					class="button"
					type="button"
					onClick=${() => controller()?.openWorkingProject()}
				>
					${t("action.openWorkingProject")}
				</button>
			</div>
			<div class="button-row">
				<button
					id="save-project"
					class="button"
					type="button"
					onClick=${() => controller()?.saveProject()}
				>
					${t("action.saveProject")}
				</button>
				<button
					id="export-project"
					class="button"
					type="button"
					onClick=${() => controller()?.exportProject()}
				>
					${t("action.exportProject")}
				</button>
			</div>
			<div class="button-row">
				<button
					id="open-files"
					class="button button--primary"
					type="button"
					onClick=${() => controller()?.openFiles()}
				>
					${t("action.openFiles")}
				</button>
				<button
					id="clear-scene"
					class="button"
					type="button"
					onClick=${() => controller()?.clearScene()}
				>
					${t("action.clear")}
				</button>
			</div>
			<label class="field">
				<span>${t("field.remoteUrl")}</span>
				<input
					id="url-input"
					type="text"
					placeholder="https://.../scene.spz or model.glb"
					value=${store.remoteUrl.value}
					...${INTERACTIVE_FIELD_PROPS}
					onInput=${(event) => {
						store.remoteUrl.value = event.currentTarget.value;
					}}
					onKeyDown=${(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							controller()?.loadRemoteUrls();
						}
					}}
				/>
			</label>
			<button
				id="load-url"
				class="button button--wide"
				type="button"
				onClick=${() => controller()?.loadRemoteUrls()}
			>
				${t("action.loadUrl")}
			</button>
			<p id="scene-summary" class="summary">${sceneSummary}</p>
			<p id="scene-scale-summary" class="summary">${sceneScaleSummary}</p>
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
														<span class="scene-asset-row__handle">≡</span>
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
															icon=${asset.visible ? "eye-off" : "eye"}
															label=${
																asset.visible
																	? t("action.hideAsset")
																	: t("action.showAsset")
															}
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
					<section class="scene-asset-inspector">
						<${SectionHeading} title=${selectedSceneAsset.label}>
							<span class="pill pill--dim">${t(selectedSceneAsset.kindLabelKey)}</span>
						<//>
						<div class="button-row">
							<${IconButton}
								icon=${selectedSceneAsset.visible ? "eye-off" : "eye"}
								label=${
									selectedSceneAsset.visible
										? t("action.hideAsset")
										: t("action.showAsset")
								}
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
											inputMode="numeric"
											step="1"
											value=${Number(selectedSceneAsset.rotationDegrees[axis]).toFixed(0)}
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
					</section>
				`
			}
		</section>
	`;
}

export function ShotCameraSection({
	activeShotCamera,
	cameraSummary,
	controller,
	equivalentMmLabel,
	equivalentMmValue,
	fovLabel,
	shotCameraClipMode,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<${SectionHeading} icon="camera" title=${t("section.shotCamera")}>
				<div class="pill-row">
					<span class="pill pill--dim">${t("badge.horizontalFov")}</span>
					<span class="pill pill--dim">${t("badge.clipRange")}</span>
				</div>
			<//>
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
							applyStandardFrameEquivalentMm(
								(nextValue) => controller()?.setBaseFovX(nextValue),
								event.currentTarget.value,
								{ snap: true },
							)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="fov-mm-input"
							inputMode="numeric"
							min=${14}
							max=${200}
							step="1"
							value=${equivalentMmValue}
							onCommit=${(nextValue) =>
								applyStandardFrameEquivalentMm(
									(nextBaseFov) => controller()?.setBaseFovX(nextBaseFov),
									nextValue,
								)}
						/>
						<span>mm</span>
					</div>
				</div>
				<p class="summary">${t("field.shotCameraFov")} · ${fovLabel} (${equivalentMmLabel})</p>
			</label>
			<label class="field">
				<span>${t("field.shotCameraClipMode")}</span>
				<select
					id="shot-camera-clip-mode"
					value=${shotCameraClipMode}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setShotCameraClippingMode(event.currentTarget.value)}
				>
					<option value="auto">${t("clipMode.auto")}</option>
					<option value="manual">${t("clipMode.manual")}</option>
				</select>
			</label>
			<div class="split-field-row">
				<label class="field">
					<span>${t("field.shotCameraNear")}</span>
					<${NumericDraftInput}
						id="shot-camera-near"
						inputMode="decimal"
						min="0.1"
						step="0.1"
						value=${Number(store.shotCamera.near.value).toFixed(2)}
						onCommit=${(nextValue) => controller()?.setShotCameraNear(nextValue)}
					/>
				</label>
				<label class="field">
					<span>${t("field.shotCameraFar")}</span>
					<${NumericDraftInput}
						id="shot-camera-far"
						inputMode="decimal"
						min="0.1"
						step="0.1"
						value=${Number(store.shotCamera.far.value).toFixed(2)}
						disabled=${shotCameraClipMode !== "manual"}
						onCommit=${(nextValue) => controller()?.setShotCameraFar(nextValue)}
					/>
				</label>
			</div>
			<div class="button-row">
				<button
					id="copy-viewport-to-shot"
					class="button"
					type="button"
					onClick=${() => controller()?.copyViewportToShotCamera()}
				>
					${t("action.viewportToShot")}
				</button>
				<button
					id="copy-shot-to-viewport"
					class="button"
					type="button"
					onClick=${() => controller()?.copyShotCameraToViewport()}
				>
					${t("action.shotToViewport")}
				</button>
				<button
					id="reset-active-view"
					class="button"
					type="button"
					onClick=${() => controller()?.resetActiveView()}
				>
					${t("action.resetActive")}
				</button>
			</div>
			<p id="camera-summary" class="summary">${cameraSummary}</p>
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
		<section class="panel-section">
			<${SectionHeading} icon="export" title=${t("section.exportSettings")}>
				<span class="pill pill--dim">${t(`exportFormat.${exportFormat}`)}</span>
			<//>
			<label class="field">
				<span>${t("field.shotCameraExportName")}</span>
				<input
					id="shot-camera-export-name"
					type="text"
					placeholder=${activeShotCamera?.name ?? "Camera"}
					value=${store.shotCamera.exportName.value}
					...${INTERACTIVE_FIELD_PROPS}
					onInput=${(event) =>
						controller()?.setShotCameraExportName(event.currentTarget.value)}
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
			<label class="checkbox-field">
				<input
					id="shot-camera-export-model-layers"
					type="checkbox"
					checked=${exportModelLayers}
					disabled=${exportFormat !== "psd"}
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
					disabled=${exportFormat !== "psd" || !exportModelLayers}
					onChange=${(event) =>
						controller()?.setShotCameraExportSplatLayers(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportSplatLayers")}</span>
			</label>
		</section>
	`;
}

export function FramesSection({
	activeFrameId,
	controller,
	frameCount,
	frameDocuments,
	frameLimitReached,
	t,
}) {
	return html`
		<section class="panel-section">
			<${SectionHeading} icon="frame" title=${t("section.frames")}>
				<span class="pill pill--dim">${frameCount} / ${FRAME_MAX_COUNT}</span>
			<//>
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
	const tabs = [
		{
			id: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCamera"),
			icon: "camera",
		},
		{ id: INSPECTOR_TAB_EXPORT, label: t("section.export"), icon: "export" },
	];

	return html`
		<${WorkbenchTabs}
			tabs=${tabs}
			activeTab=${activeTab}
			setActiveTab=${setActiveTab}
			ariaLabel=${t("section.export")}
		/>
	`;
}
