import { html, render } from "htm/preact";
import { useEffect, useRef } from "preact/hooks";
import {
	BASE_FRAME,
	FRAME_MAX_COUNT,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "./constants.js";
import { createCameraFramesController } from "./controller.js";
import {
	getFrameAnchorHandleKey,
	getFrameAnchorLocalNormalized,
} from "./engine/frame-transform.js";
import { formatAssetWorldScale } from "./engine/scene-units.js";
import {
	DEFAULT_LOCALE,
	LOCALE_OPTIONS,
	getAnchorOptions,
	translate,
} from "./i18n.js";
import { createCameraFramesStore } from "./store.js";

function CameraFramesApp() {
	const storeRef = useRef(null);
	if (!storeRef.current) {
		storeRef.current = createCameraFramesStore();
	}
	const store = storeRef.current;

	const controllerRef = useRef(null);
	const viewportCanvasRef = useRef(null);
	const viewportShellRef = useRef(null);
	const renderBoxRef = useRef(null);
	const frameOverlayCanvasRef = useRef(null);
	const renderBoxMetaRef = useRef(null);
	const anchorDotRef = useRef(null);
	const dropHintRef = useRef(null);
	const exportCanvasRef = useRef(null);
	const assetInputRef = useRef(null);

	useEffect(() => {
		controllerRef.current = createCameraFramesController(
			{
				viewportCanvas: viewportCanvasRef.current,
				viewportShell: viewportShellRef.current,
				renderBox: renderBoxRef.current,
				frameOverlayCanvas: frameOverlayCanvasRef.current,
				renderBoxMeta: renderBoxMetaRef.current,
				anchorDot: anchorDotRef.current,
				dropHint: dropHintRef.current,
				exportCanvas: exportCanvasRef.current,
				assetInput: assetInputRef.current,
			},
			store,
		);

		return () => {
			controllerRef.current?.dispose?.();
			controllerRef.current = null;
		};
	}, [store]);

	const controller = () => controllerRef.current;
	const locale = store.locale.value;
	const t = (key, params) => translate(locale, key, params);
	const mode = store.mode.value;
	const exportBusy = store.exportBusy.value;
	const exportStatusLabel = store.exportStatusLabel.value;
	const anchorOptions = getAnchorOptions(locale);
	const shotCameraClipMode = store.shotCamera.clippingMode.value;
	const activeShotCamera = store.workspace.activeShotCamera.value;
	const exportTarget = store.exportOptions.target.value;
	const exportPresetIds = store.exportOptions.presetIds.value;
	const activeFrameId = store.frames.activeId.value;
	const frameCount = store.frames.count.value;
	const frameSelectionActive = store.frames.selectionActive.value;
	const frameLimitReached = frameCount >= FRAME_MAX_COUNT;
	const exportWidth = store.exportWidth.value;
	const exportHeight = store.exportHeight.value;
	const exportSelectionMissing =
		exportTarget === "selected" && exportPresetIds.length === 0;

	return html`
    <div class="app-shell">
      <aside class="side-panel">
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

        <section class="panel-section">
          <div class="section-heading">
            <h2>${t("section.view")}</h2>
            <span id="mode-pill" class="pill">${store.modeLabel}</span>
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

        <section class="panel-section">
          <div class="section-heading">
            <h2>${t("section.scene")}</h2>
            <div class="pill-row">
              <span id="scene-unit-pill" class="pill pill--dim">${store.sceneUnitBadge}</span>
              <span id="scene-badge" class="pill pill--dim">${store.sceneBadge}</span>
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
              value=${store.remoteUrl}
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
          <p id="scene-summary" class="summary">${store.sceneSummary}</p>
          <p id="scene-scale-summary" class="summary">${store.sceneScaleSummary}</p>
          ${
						store.sceneAssets.value.length > 0 &&
						html`
            <div class="asset-calibration-list">
              ${store.sceneAssets.value.map(
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
              <output id="fov-x-value">${store.fovLabel}</output>
            </div>
          </label>
          <label class="field">
            <span>${t("field.shotCameraClipMode")}</span>
            <select
              id="shot-camera-clip-mode"
              value=${store.shotCamera.clippingMode}
              onChange=${(event) =>
								controller()?.setShotCameraClippingMode(
									event.currentTarget.value,
								)}
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
								controller()?.setShotCameraExportName(
									event.currentTarget.value,
								)}
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
          <p id="camera-summary" class="summary">${store.cameraSummary}</p>
        </section>

        <section class="panel-section">
          <div class="section-heading">
            <h2>${t("section.frames")}</h2>
            <span class="pill pill--dim">${frameCount} / ${FRAME_MAX_COUNT}</span>
          </div>
          ${
						store.frames.documents.value.length > 0
							? html`
                <label class="field">
                  <span>${t("field.activeFrame")}</span>
                  <select
                    id="active-frame"
                    value=${activeFrameId}
                    onChange=${(event) =>
											controller()?.selectFrame(event.currentTarget.value)}
                  >
                    ${store.frames.documents.value.map(
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

        <section class="panel-section">
          <div class="section-heading">
            <h2>${t("section.outputFrame")}</h2>            <span id="export-size-pill" class="pill pill--dim">${store.exportSizeLabel}</span>
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
              <output id="box-width-value">${store.widthLabel}</output>
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
              <output id="box-height-value">${store.heightLabel}</output>
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
              <output id="view-zoom-value">${store.zoomLabel}</output>
            </div>
          </label>
          <label class="field">
            <span>${t("field.anchor")}</span>
            <select
              id="anchor-select"
              value=${store.renderBox.anchor}
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

        <section class="panel-section panel-section--preview">
          <div class="section-heading">
            <h2>${t("section.output")}</h2>
            <span
              id="export-status-pill"
              class=${
								exportBusy || exportStatusLabel !== t("export.idle")
									? "pill"
									: "pill pill--dim"
							}
            >
              ${store.exportStatusLabel}
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
                        ${shotCamera.exportSettings?.exportName?.trim() || shotCamera.name}
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
            width=${store.exportWidth}
            height=${store.exportHeight}
          ></canvas>
          <p id="export-summary" class="summary">${store.exportSummary}</p>
        </section>

        <footer class="panel-footer">
          <p id="status-line" class="status-line">${store.statusLine}</p>
          <div class="footer-links">
            <a href="https://github.com/stechdrive/spark-cameraframes">GitHub</a>
          </div>
        </footer>
      </aside>

      <main id="viewport-shell" ref=${viewportShellRef} class="viewport-shell">
        <canvas id="viewport" ref=${viewportCanvasRef} tabindex="0"></canvas>
        <div id="drop-hint" ref=${dropHintRef} class="drop-hint">
          <strong>${t("drop.title")}</strong>
          <span>${t("drop.body")}</span>
        </div>
        <div id="render-box" ref=${renderBoxRef} class="render-box">
          <div class="frame-layer">
            <canvas
              id="frame-overlay-canvas"
              ref=${frameOverlayCanvasRef}
              class="frame-layer__canvas"
            ></canvas>
            ${store.frames.documents.value.map((frame) => {
							const frameScale = Number(frame.scale) > 0 ? frame.scale : 1;
							const frameWidthPercent =
								(BASE_FRAME.width * frameScale * 100) / exportWidth;
							const frameHeightPercent =
								(BASE_FRAME.height * frameScale * 100) / exportHeight;
							const selectedFrame =
								frameSelectionActive && activeFrameId === frame.id;
							const frameRotationRadians =
								((frame.rotation ?? 0) * Math.PI) / 180;
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

							return html`
                <div
                  class=${selectedFrame ? "frame-item frame-item--selected" : "frame-item"}
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
                  <span class="frame-item__label">${frame.name}</span>
                  <button
                    type="button"
                    class="frame-item__edge frame-item__edge--top"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameDrag(frame.id, event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__edge frame-item__edge--right"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameDrag(frame.id, event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__edge frame-item__edge--bottom"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameDrag(frame.id, event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__edge frame-item__edge--left"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameDrag(frame.id, event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--top-left"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(
												frame.id,
												"top-left",
												event,
											)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--top"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(frame.id, "top", event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--top-right"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(
												frame.id,
												"top-right",
												event,
											)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--right"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(frame.id, "right", event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--bottom-right"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(
												frame.id,
												"bottom-right",
												event,
											)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--bottom"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(frame.id, "bottom", event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--bottom-left"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(
												frame.id,
												"bottom-left",
												event,
											)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__resize-handle frame-item__resize-handle--left"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameResize(frame.id, "left", event)}
                  ></button>
                  <button
                    type="button"
                    class="frame-item__rotation-handle"
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameRotate(frame.id, event)}
                  ></button>
<button
                    type="button"
                    class="frame-item__anchor"
                    style=${{
											left: `${frameAnchor.x * 100}%`,
											top: `${frameAnchor.y * 100}%`,
										}}
                    aria-label=${frame.name}
                    onPointerDown=${(event) =>
											controller()?.startFrameAnchorDrag(frame.id, event)}
                  ></button>
                </div>
              `;
						})}
          </div>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--top-left"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("top-left", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--top"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("top", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--top-right"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("top-right", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--right"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("right", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--bottom-right"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("bottom-right", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--bottom"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("bottom", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--bottom-left"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("bottom-left", event)}
          ></button>
          <button
            type="button"
            class="render-box__resize-handle render-box__resize-handle--left"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) =>
							controller()?.startOutputFrameResize("left", event)}
          ></button>
          <button
            type="button"
            class="render-box__pan-edge render-box__pan-edge--top"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
          ></button>
          <button
            type="button"
            class="render-box__pan-edge render-box__pan-edge--right"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
          ></button>
          <button
            type="button"
            class="render-box__pan-edge render-box__pan-edge--bottom"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
          ></button>
          <button
            type="button"
            class="render-box__pan-edge render-box__pan-edge--left"
            aria-label=${t("section.outputFrame")}
            onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
          ></button>
          <div
            id="render-box-meta"
            ref=${renderBoxMetaRef}
            class="render-box__meta"
            onPointerDown=${(event) => controller()?.startOutputFramePan(event)}
          >
            ${store.exportSizeLabel} · ${store.renderBox.anchor}
          </div>
          <div id="anchor-dot" ref=${anchorDotRef} class="render-box__anchor"></div>
        </div>      </main>
    </div>

    <input
      id="asset-input"
      ref=${assetInputRef}
      type="file"
      accept=".ply,.spz,.splat,.ksplat,.zip,.sog,.rad,.glb,.gltf,.ssproj"
      multiple
      hidden
      onChange=${(event) => controller()?.handleAssetInputChange(event)}
    />
  `;
}

const root = document.getElementById("app-root");
if (!root) {
	throw new Error(translate(DEFAULT_LOCALE, "error.missingRoot"));
}

render(html`<${CameraFramesApp} />`, root);
