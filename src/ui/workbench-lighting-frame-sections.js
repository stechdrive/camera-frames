import { html } from "htm/preact";
import { FRAME_MAX_COUNT } from "../constants.js";
import {
	HistoryRangeInput,
	INTERACTIVE_FIELD_PROPS,
	LightingDirectionControl,
	NumericDraftInput,
	NumericUnitLabel,
} from "./workbench-controls.js";
import {
	DisclosureBlock,
	IconButton,
	TooltipBubble,
} from "./workbench-primitives.js";

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
				<span class="lighting-field-row__label field-label-tooltip">
					${t("field.lightDirection")}
					<${TooltipBubble}
						title=${t("field.lightDirection")}
						description=${t("hint.lightDirection")}
						placement="right"
					/>
				</span>
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
	const frameMaskShape = store.frames.maskShape.value;
	const frameTrajectoryMode = store.frames.trajectoryMode.value;
	const frameTrajectoryExportSource = store.frames.trajectoryExportSource.value;
	const trajectoryEditMode = store.frames.trajectoryEditMode.value;
	const rememberedMaskFrameIds = store.frames.maskSelectedIds.value ?? [];
	const hasFrames = frameDocuments.length > 0;
	const hasSelectedFrames = rememberedMaskFrameIds.length > 0;
	const hasTrajectoryPath = frameDocuments.length > 1;
	const frameMaskShapeOptions = [
		{ value: "bounds", label: t("frameMaskShape.bounds") },
		{ value: "trajectory", label: t("frameMaskShape.trajectory") },
	];
	const trajectoryModeOptions = [
		{ value: "line", label: t("frameTrajectoryMode.line") },
		{ value: "spline", label: t("frameTrajectoryMode.spline") },
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
					<div class="frame-mask-toolbar__settings">
						<label class="field">
							<span>${t("field.frameMaskShape")}</span>
							<select
								value=${frameMaskShape}
								...${INTERACTIVE_FIELD_PROPS}
								onChange=${(event) =>
									controller()?.setFrameMaskShape?.(event.currentTarget.value)}
							>
								${frameMaskShapeOptions.map(
									(option) => html`
										<option value=${option.value}>${option.label}</option>
									`,
								)}
							</select>
						</label>
						<label class="field">
							<span>${t("field.frameTrajectoryMode")}</span>
							<select
								value=${frameTrajectoryMode}
								disabled=${!hasFrames}
								...${INTERACTIVE_FIELD_PROPS}
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
						</label>
						<label class="field">
							<span>${t("field.frameTrajectoryExportSource")}</span>
							<select
								value=${frameTrajectoryExportSource}
								disabled=${!hasTrajectoryPath}
								...${INTERACTIVE_FIELD_PROPS}
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
						</label>
						<div class="button-row button-row--compact">
							<${IconButton}
								id="toggle-frame-trajectory-edit"
								icon="cursor"
								label=${t("action.toggleFrameTrajectoryEdit")}
								active=${trajectoryEditMode}
								compact=${true}
								disabled=${!hasFrames}
								onClick=${() => controller()?.toggleFrameTrajectoryEditMode?.()}
							/>
						</div>
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
