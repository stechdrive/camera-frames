import { html } from "htm/preact";
import {
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "../constants.js";
import {
	DirectionalScrubControl,
	HistoryRangeInput,
	INTERACTIVE_FIELD_PROPS,
	NumericDraftInput,
	NumericUnitLabel,
	TextDraftInput,
	applyStandardFrameHorizontalEquivalentMm,
	stopUiEvent,
} from "./workbench-controls.js";
import {
	DisclosureBlock,
	IconButton,
	SectionHeading,
	TooltipBubble,
} from "./workbench-primitives.js";

function CameraPropertyInlineField({
	prefix,
	id,
	value,
	controller,
	historyLabel,
	onCommit,
	onScrubDelta = null,
	onScrubStart = null,
	formatDisplayValue = null,
	scrubStartValue = null,
	inputMode = "decimal",
	min = undefined,
	max = undefined,
	step = "0.01",
	disabled = false,
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
					formatDisplayValue=${formatDisplayValue}
					disabled=${disabled}
					onScrubDelta=${onScrubDelta}
					onScrubStart=${onScrubStart}
					scrubStartValue=${scrubStartValue}
					onCommit=${onCommit}
				/>
			</div>
		</div>
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
				<span class="field-label-tooltip">
					${t("field.shotCameraEquivalentMm")}
					<${TooltipBubble}
						title=${t("field.shotCameraEquivalentMm")}
						description=${t("tooltip.shotCameraEquivalentMmField")}
						placement="right"
					/>
				</span>
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
					<span class="switch-toggle__label field-label-tooltip">
						${t("clipMode.auto")}
						<${TooltipBubble}
							title=${t("clipMode.auto")}
							description=${t("hint.shotCameraClip")}
							placement="left"
						/>
					</span>
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
			icon="export-tab"
			label=${t("section.exportSettings")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<label class="field">
				<span class="field-label-tooltip">
					${t("field.shotCameraExportName")}
					<${TooltipBubble}
						title=${t("field.shotCameraExportName")}
						description=${t("tooltip.shotCameraExportName")}
						placement="right"
					/>
				</span>
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
						<span class="field-label-tooltip">
							${t("field.exportGridLayerMode")}
							<${TooltipBubble}
								title=${t("field.exportGridLayerMode")}
								description=${t("tooltip.exportGridLayerModeField")}
								placement="right"
							/>
						</span>
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
						<span class="field-label-tooltip">
							${t("field.exportModelLayers")}
							<${TooltipBubble}
								title=${t("field.exportModelLayers")}
								description=${t("tooltip.exportModelLayersField")}
								placement="right"
							/>
						</span>
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
						<span class="field-label-tooltip">
							${t("field.exportSplatLayers")}
							<${TooltipBubble}
								title=${t("field.exportSplatLayers")}
								description=${t("tooltip.exportSplatLayersField")}
								placement="right"
							/>
						</span>
					</label>
				`
			}
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
				<span class="field-label-tooltip">
					${t("field.anchor")}
					<${TooltipBubble}
						title=${t("field.anchor")}
						description=${t("tooltip.outputFrameAnchorField")}
						placement="right"
					/>
				</span>
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
	exportPresetIds,
	exportSelectionMissing,
	exportTarget,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	const exportReferenceImagesEnabled =
		store.referenceImages.exportSessionEnabled.value !== false;

	return html`
		<${DisclosureBlock}
			icon="export-tab"
			label=${t("section.export")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--preview"
		>
			<div class="field">
				<div class="field__label-row">
					<label class="field__label-inline" for="export-target">
						${t("field.exportTarget")}
					</label>
					<button
						id="download-output"
						type="button"
						class="button button--primary button--compact field__label-action"
						disabled=${exportBusy || exportSelectionMissing}
						onClick=${() => controller()?.downloadOutput()}
					>
						${t("action.downloadOutput")}
					</button>
				</div>
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
			</div>
			${
				exportTarget === "selected" &&
				html`
					<div class="field">
						<span>${t("field.exportPresetSelection")}</span>
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
										<span class="export-selection-item__name"
											>${shotCamera.name}</span
										>
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
		<//>
	`;
}
