import { html } from "htm/preact";
import { getBuildCommitLabel, getBuildVersionLabel } from "../build-info.js";
import {
	FRAME_MAX_COUNT,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "../constants.js";
import { formatAssetWorldScale } from "../engine/scene-units.js";
import { LOCALE_OPTIONS, getAnchorOptions, translate } from "../i18n.js";

function renderHeader({ controller, locale, t }) {
	return html`
		<header class="panel-header">
			<div class="header-meta-row">
				<p class="eyebrow">${t("app.previewTag")}</p>
				<label class="locale-field">
					<span>${t("field.language")}</span>
					<select
						value=${locale}
						onChange=${(event) => controller()?.setLocale(event.currentTarget.value)}
					>
						${LOCALE_OPTIONS.map(
							(option) => html`
								<option value=${option.value}>
									${translate(locale, option.labelKey)}
								</option>
							`,
						)}
					</select>
				</label>
			</div>
			<h1>CAMERA_FRAMES</h1>
			<p class="panel-copy">${t("app.panelCopy")}</p>
		</header>
	`;
}

function renderViewSection({ controller, mode, modeLabel, t }) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.view")}</h2>
				<span id="mode-pill" class="pill">${modeLabel}</span>
			</div>
			<div class="button-row">
				<button
					id="mode-camera"
					class=${mode === "camera" ? "button button--primary" : "button"}
					type="button"
					onClick=${() => controller()?.setMode("camera")}
				>
					${t("mode.camera")}
				</button>
				<button
					id="mode-viewport"
					class=${mode === "viewport" ? "button button--primary" : "button"}
					type="button"
					onClick=${() => controller()?.setMode("viewport")}
				>
					${t("mode.viewport")}
				</button>
			</div>
			<p class="hint">${t("hint.viewMode")}</p>
		</section>
	`;
}

function renderSceneSection({
	controller,
	sceneAssets,
	sceneBadge,
	sceneScaleSummary,
	sceneSummary,
	sceneUnitBadge,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.scene")}</h2>
				<div class="pill-row">
					<span id="scene-unit-pill" class="pill pill--dim">${sceneUnitBadge}</span>
					<span id="scene-badge" class="pill pill--dim">${sceneBadge}</span>
				</div>
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
					id="load-sample"
					class="button"
					type="button"
					onClick=${() => controller()?.loadSample()}
				>
					${t("action.loadSample")}
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
					<div class="asset-calibration-list">
						${sceneAssets.map(
							(asset) => html`
								<article class="asset-card">
									<div class="asset-card__header">
										<div class="asset-card__title-group">
											<strong>${asset.label}</strong>
											<span class="asset-card__meta">
												${t(asset.kindLabelKey)} · ${t(asset.unitModeLabelKey)}
											</span>
										</div>
										<span class="pill pill--dim">
											${formatAssetWorldScale(asset.worldScale)}
										</span>
									</div>
									<div class="asset-card__controls">
										<label class="field">
											<span>${t("field.assetScale")}</span>
											<input
												type="number"
												min="0.01"
												step="0.01"
												value=${Number(asset.worldScale).toFixed(2)}
												onInput=${(event) =>
													controller()?.setAssetWorldScale(
														asset.id,
														event.currentTarget.value,
													)}
											/>
										</label>
										<button
											class="button"
											type="button"
											onClick=${() => controller()?.resetAssetWorldScale(asset.id)}
										>
											${t("action.resetScale")}
										</button>
									</div>
								</article>
							`,
						)}
					</div>
					<p class="summary">${t("hint.sceneCalibration")}</p>
				`
			}
		</section>
	`;
}

function renderShotCameraSection({
	activeShotCamera,
	cameraSummary,
	controller,
	fovLabel,
	shotCameraClipMode,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.shotCamera")}</h2>
				<div class="pill-row">
					<span class="pill pill--dim">${t("badge.horizontalFov")}</span>
					<span class="pill pill--dim">${t("badge.clipRange")}</span>
				</div>
			</div>
			<label class="field">
				<span>${t("field.activeShotCamera")}</span>
				<select
					id="active-shot-camera"
					value=${store.workspace.activeShotCameraId.value}
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
				<button
					id="new-shot-camera"
					class="button"
					type="button"
					onClick=${() => controller()?.createShotCamera()}
				>
					${t("action.newShotCamera")}
				</button>
				<button
					id="duplicate-shot-camera"
					class="button"
					type="button"
					onClick=${() => controller()?.duplicateActiveShotCamera()}
				>
					${t("action.duplicateShotCamera")}
				</button>
			</div>
			<p class="summary">${t("hint.shotCameraList")}</p>
			<label class="field field--range">
				<span>${t("field.shotCameraFov")}</span>
				<div class="range-row">
					<input
						id="fov-x"
						type="range"
						min="35"
						max="100"
						step="1"
						value=${Math.round(store.baseFovX.value)}
						onInput=${(event) =>
							controller()?.setBaseFovX(event.currentTarget.value)}
					/>
					<output id="fov-x-value">${fovLabel}</output>
				</div>
			</label>
			<label class="field">
				<span>${t("field.shotCameraClipMode")}</span>
				<select
					id="shot-camera-clip-mode"
					value=${shotCameraClipMode}
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
					<input
						id="shot-camera-near"
						type="number"
						min="0.01"
						step="0.01"
						value=${Number(store.shotCamera.near.value).toFixed(2)}
						disabled=${shotCameraClipMode !== "manual"}
						onInput=${(event) =>
							controller()?.setShotCameraNear(event.currentTarget.value)}
					/>
				</label>
				<label class="field">
					<span>${t("field.shotCameraFar")}</span>
					<input
						id="shot-camera-far"
						type="number"
						min="0.1"
						step="0.1"
						value=${Number(store.shotCamera.far.value).toFixed(2)}
						disabled=${shotCameraClipMode !== "manual"}
						onInput=${(event) =>
							controller()?.setShotCameraFar(event.currentTarget.value)}
					/>
				</label>
			</div>
			<p class="summary">${t("hint.shotCameraClip")}</p>
			<label class="field">
				<span>${t("field.shotCameraExportName")}</span>
				<input
					id="shot-camera-export-name"
					type="text"
					placeholder=${activeShotCamera?.name ?? "Camera"}
					value=${store.shotCamera.exportName.value}
					onInput=${(event) =>
						controller()?.setShotCameraExportName(event.currentTarget.value)}
				/>
			</label>
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

function renderFramesSection({
	activeFrameId,
	controller,
	frameCount,
	frameDocuments,
	frameLimitReached,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.frames")}</h2>
				<span class="pill pill--dim">${frameCount} / ${FRAME_MAX_COUNT}</span>
			</div>
			${
				frameDocuments.length > 0
					? html`
						<label class="field">
							<span>${t("field.activeFrame")}</span>
							<select
								id="active-frame"
								value=${activeFrameId}
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
							<button
								id="new-frame"
								class="button"
								type="button"
								disabled=${frameLimitReached}
								onClick=${() => controller()?.createFrame()}
							>
								${t("action.newFrame")}
							</button>
							<button
								id="duplicate-frame"
								class="button"
								type="button"
								disabled=${frameLimitReached}
								onClick=${() => controller()?.duplicateActiveFrame()}
							>
								${t("action.duplicateFrame")}
							</button>
							<button
								id="delete-frame"
								class="button"
								type="button"
								onClick=${() => controller()?.deleteActiveFrame()}
							>
								${t("action.deleteFrame")}
							</button>
						</div>
						<p class="summary">${t("hint.frames")}</p>
					`
					: html`
						<div class="button-row">
							<button
								id="new-frame"
								class="button"
								type="button"
								onClick=${() => controller()?.createFrame()}
							>
								${t("action.newFrame")}
							</button>
						</div>
						<p class="summary">${t("hint.framesEmpty")}</p>
					`
			}
		</section>
	`;
}

function renderOutputFrameSection({
	anchorOptions,
	controller,
	exportSizeLabel,
	heightLabel,
	store,
	t,
	widthLabel,
	zoomLabel,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.outputFrame")}</h2>
				<span id="export-size-pill" class="pill pill--dim">${exportSizeLabel}</span>
			</div>
			<label class="field field--range">
				<span>${t("field.outputFrameWidth")}</span>
				<div class="range-row">
					<input
						id="box-width"
						type="range"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_WIDTH_PCT}
						step="1"
						value=${Math.round(store.renderBox.widthScale.value * 100)}
						onInput=${(event) =>
							controller()?.setBoxWidthPercent(event.currentTarget.value)}
					/>
					<output id="box-width-value">${widthLabel}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${t("field.outputFrameHeight")}</span>
				<div class="range-row">
					<input
						id="box-height"
						type="range"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_HEIGHT_PCT}
						step="1"
						value=${Math.round(store.renderBox.heightScale.value * 100)}
						onInput=${(event) =>
							controller()?.setBoxHeightPercent(event.currentTarget.value)}
					/>
					<output id="box-height-value">${heightLabel}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${t("field.cameraViewZoom")}</span>
				<div class="range-row">
					<input
						id="view-zoom"
						type="range"
						min=${MIN_CAMERA_VIEW_ZOOM_PCT}
						max=${MAX_CAMERA_VIEW_ZOOM_PCT}
						step="1"
						value=${Math.round(store.renderBox.viewZoom.value * 100)}
						onInput=${(event) =>
							controller()?.setViewZoomPercent(event.currentTarget.value)}
					/>
					<output id="view-zoom-value">${zoomLabel}</output>
				</div>
			</label>
			<label class="field">
				<span>${t("field.anchor")}</span>
				<select
					id="anchor-select"
					value=${store.renderBox.anchor.value}
					onChange=${(event) => controller()?.setAnchor(event.currentTarget.value)}
				>
					${anchorOptions.map(
						(option) =>
							html`<option value=${option.value}>${option.label}</option>`,
					)}
				</select>
			</label>
			<p class="summary">${t("hint.outputFrame")}</p>
		</section>
	`;
}

function renderExportSection({
	controller,
	exportBusy,
	exportCanvasRef,
	exportHeight,
	exportPresetIds,
	exportSelectionMissing,
	exportStatusLabel,
	exportTarget,
	exportWidth,
	store,
	t,
}) {
	const exportStatusClass =
		exportBusy || exportStatusLabel !== t("export.idle")
			? "pill"
			: "pill pill--dim";

	return html`
		<section class="panel-section panel-section--preview">
			<div class="section-heading">
				<h2>${t("section.output")}</h2>
				<span id="export-status-pill" class=${exportStatusClass}>
					${exportStatusLabel}
				</span>
			</div>
			<label class="field">
				<span>${t("field.exportTarget")}</span>
				<select
					id="export-target"
					value=${exportTarget}
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
					<p class="summary">
						${t("hint.exportTargetSelection", {
							count: store.exportOptions.presetCount.value,
						})}
					</p>
				`
			}
			<div class="button-row">
				<button
					id="refresh-preview"
					class="button button--primary"
					type="button"
					disabled=${exportBusy}
					onClick=${() => controller()?.refreshOutputPreview()}
				>
					${t("action.refreshPreview")}
				</button>
				<button
					id="download-png"
					class="button"
					type="button"
					disabled=${exportBusy || exportSelectionMissing}
					onClick=${() => controller()?.downloadPng()}
				>
					${t("action.downloadPng")}
				</button>
			</div>
			<canvas
				id="export-preview"
				ref=${exportCanvasRef}
				width=${exportWidth}
				height=${exportHeight}
			></canvas>
			<p id="export-summary" class="summary">${store.exportSummary.value}</p>
		</section>
	`;
}

function renderFooter({ store }) {
	const buildVersionLabel = getBuildVersionLabel();
	const buildCommitLabel = getBuildCommitLabel();

	return html`
		<footer class="panel-footer">
			<p id="status-line" class="status-line">${store.statusLine.value}</p>
			<div class="build-meta">
				<span class="pill pill--dim">${buildVersionLabel}</span>
				${
					buildCommitLabel &&
					html`<code class="build-commit">${buildCommitLabel}</code>`
				}
			</div>
			<div class="footer-links">
				<a href="https://github.com/stechdrive/camera-frames">GitHub</a>
				<a href="./version.json">version.json</a>
			</div>
		</footer>
	`;
}

export function SidePanel({ store, controller, locale, t, exportCanvasRef }) {
	const mode = store.mode.value;
	const modeLabel = store.modeLabel.value;
	const sceneUnitBadge = store.sceneUnitBadge.value;
	const sceneBadge = store.sceneBadge.value;
	const sceneSummary = store.sceneSummary.value;
	const sceneScaleSummary = store.sceneScaleSummary.value;
	const sceneAssets = store.sceneAssets.value;
	const activeShotCamera = store.workspace.activeShotCamera.value;
	const shotCameraClipMode = store.shotCamera.clippingMode.value;
	const cameraSummary = store.cameraSummary.value;
	const fovLabel = store.fovLabel.value;
	const frameDocuments = store.frames.documents.value;
	const activeFrameId = store.frames.activeId.value;
	const frameCount = store.frames.count.value;
	const frameLimitReached = frameCount >= FRAME_MAX_COUNT;
	const exportSizeLabel = store.exportSizeLabel.value;
	const widthLabel = store.widthLabel.value;
	const heightLabel = store.heightLabel.value;
	const zoomLabel = store.zoomLabel.value;
	const exportBusy = store.exportBusy.value;
	const exportStatusLabel = store.exportStatusLabel.value;
	const exportTarget = store.exportOptions.target.value;
	const exportPresetIds = store.exportOptions.presetIds.value;
	const exportSelectionMissing =
		exportTarget === "selected" && exportPresetIds.length === 0;
	const anchorOptions = getAnchorOptions(locale);

	return html`
		<aside class="side-panel">
			${renderHeader({ controller, locale, t })}
			${renderViewSection({ controller, mode, modeLabel, t })}
			${renderSceneSection({
				controller,
				sceneAssets,
				sceneBadge,
				sceneScaleSummary,
				sceneSummary,
				sceneUnitBadge,
				store,
				t,
			})}
			${renderShotCameraSection({
				activeShotCamera,
				cameraSummary,
				controller,
				fovLabel,
				shotCameraClipMode,
				store,
				t,
			})}
			${renderFramesSection({
				activeFrameId,
				controller,
				frameCount,
				frameDocuments,
				frameLimitReached,
				t,
			})}
			${renderOutputFrameSection({
				anchorOptions,
				controller,
				exportSizeLabel,
				heightLabel,
				store,
				t,
				widthLabel,
				zoomLabel,
			})}
			${renderExportSection({
				controller,
				exportBusy,
				exportCanvasRef,
				exportHeight: store.exportHeight.value,
				exportPresetIds,
				exportSelectionMissing,
				exportStatusLabel,
				exportTarget,
				exportWidth: store.exportWidth.value,
				store,
				t,
			})}
			${renderFooter({ store })}
		</aside>
	`;
}
