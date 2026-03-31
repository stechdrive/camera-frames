import { html } from "htm/preact";

function getAbsoluteStyle(entry) {
	return {
		left: `${entry.x}px`,
		top: `${entry.y}px`,
	};
}

function getLineStyle(start, end) {
	const dx = (end?.x ?? 0) - (start?.x ?? 0);
	const dy = (end?.y ?? 0) - (start?.y ?? 0);
	const length = Math.hypot(dx, dy);
	if (!Number.isFinite(length) || length <= 0.001) {
		return null;
	}
	return {
		left: `${start.x}px`,
		top: `${start.y}px`,
		width: `${length}px`,
		transform: `rotate(${Math.atan2(dy, dx)}rad)`,
	};
}

export function MeasurementOverlay({ store, controller, t }) {
	const active = store.measurement.active.value;
	if (!active) {
		return null;
	}

	const overlay = store.measurement.overlay.value;
	const hasStart = Boolean(store.measurement.startPointWorld.value);
	const hasEnd = Boolean(store.measurement.endPointWorld.value);
	const selectedPointKey =
		store.measurement.selectedPointKey.value ?? (hasEnd ? "end" : "start");
	const desiredLength = Number(store.measurement.lengthInputText.value);
	const canApply =
		hasEnd &&
		overlay.chip.visible &&
		(store.selectedSceneAssetIds.value?.length ?? 0) > 0 &&
		Number.isFinite(desiredLength) &&
		desiredLength > 0;
	const lineTarget = overlay.lineUsesDraft ? overlay.draftEnd : overlay.end;
	const lineStyle =
		overlay.lineVisible && overlay.start.visible && lineTarget?.visible
			? getLineStyle(overlay.start, lineTarget)
			: null;

	return html`
		<div class="measurement-overlay" aria-hidden="false">
			${
				lineStyle &&
				html`
					<div
						class=${
							overlay.lineUsesDraft
								? "measurement-overlay__line-track measurement-overlay__line-track--draft"
								: "measurement-overlay__line-track"
						}
						style=${lineStyle}
					>
						<div class="measurement-overlay__line-outline"></div>
						<div class="measurement-overlay__line-main"></div>
					</div>
				`
			}
			${
				hasStart &&
				overlay.start.visible &&
				html`
					<button
						type="button"
						class=${
							selectedPointKey === "start"
								? "measurement-overlay__point measurement-overlay__point--selected"
								: "measurement-overlay__point"
						}
						style=${getAbsoluteStyle(overlay.start)}
						aria-label=${t("action.measurementStartPoint")}
						onPointerDown=${(event) =>
							controller()?.selectMeasurementPoint?.("start", event)}
					></button>
				`
			}
			${
				hasEnd &&
				overlay.end.visible &&
				html`
					<button
						type="button"
						class=${
							selectedPointKey === "end"
								? "measurement-overlay__point measurement-overlay__point--selected"
								: "measurement-overlay__point"
						}
						style=${getAbsoluteStyle(overlay.end)}
						aria-label=${t("action.measurementEndPoint")}
						onPointerDown=${(event) =>
							controller()?.selectMeasurementPoint?.("end", event)}
					></button>
				`
			}
			${
				overlay.chip.visible &&
				html`
					<div
						class=${`measurement-overlay__chip measurement-overlay__chip--${
							overlay.chip.placement ?? "dock-bottom"
						}`}
						style=${getAbsoluteStyle(overlay.chip)}
						onPointerDown=${(event) => {
							event.stopPropagation();
						}}
					>
						<label class="measurement-overlay__chip-field">
							<span>${overlay.chip.label}</span>
							<div class="measurement-overlay__chip-row">
								<input
									type="text"
									inputmode="decimal"
									class="measurement-overlay__chip-input"
									value=${store.measurement.lengthInputText.value}
									aria-label=${t("field.measurementLength")}
									onInput=${(event) =>
										controller()?.setMeasurementLengthInputText?.(
											event.currentTarget.value,
										)}
									onKeyDown=${(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											controller()?.applyMeasurementScale?.();
										}
									}}
								/>
								<span class="measurement-overlay__chip-unit">m</span>
								<button
									type="button"
									class="measurement-overlay__chip-apply"
									disabled=${!canApply}
									onClick=${() => controller()?.applyMeasurementScale?.()}
								>
									${t("action.apply")}
								</button>
							</div>
						</label>
					</div>
				`
			}
		</div>
	`;
}
