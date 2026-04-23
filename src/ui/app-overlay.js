import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";

function buildOverlayFieldState(fields = []) {
	return Object.fromEntries(
		fields.map((field) => [field.id, field.value ?? ""]),
	);
}

function renderOverlayFields(overlay, fieldValues, setFieldValues) {
	if (!overlay?.fields?.length) {
		return null;
	}

	return html`
		<div class="overlay-field-list">
			${overlay.fields.map((field) => {
				const isDisabled =
					typeof field.disabled === "function"
						? Boolean(field.disabled(fieldValues))
						: Boolean(field.disabled);
				if (field.type === "checkbox") {
					return html`
						<label class="overlay-checkbox-field">
							<input
								type="checkbox"
								checked=${Boolean(fieldValues[field.id])}
								disabled=${isDisabled}
								onChange=${(event) =>
									setFieldValues((current) => ({
										...current,
										[field.id]: event.currentTarget.checked,
									}))}
							/>
							<span>${field.label}</span>
						</label>
					`;
				}

				if (field.type === "select") {
					return html`
						<label class="overlay-field">
							<span>${field.label}</span>
							<select
								value=${String(fieldValues[field.id] ?? "")}
								disabled=${isDisabled}
								onChange=${(event) =>
									setFieldValues((current) => ({
										...current,
										[field.id]: event.currentTarget.value,
									}))}
							>
								${(field.options ?? []).map(
									(option) => html`
										<option value=${option.value}>${option.label}</option>
									`,
								)}
							</select>
						</label>
					`;
				}

				if (field.type === "radio") {
					const currentValue = String(fieldValues[field.id] ?? "");
					return html`
						<fieldset
							class="overlay-field overlay-field--radio"
							disabled=${isDisabled}
						>
							<legend>${field.label}</legend>
							${(field.options ?? []).map((option) => {
								const optionDisabled =
									Boolean(option.disabled) || isDisabled;
								return html`
									<label
										class=${`overlay-radio-option ${
											optionDisabled
												? "overlay-radio-option--disabled"
												: ""
										}`}
									>
										<input
											type="radio"
											name=${field.id}
											value=${option.value}
											checked=${currentValue === option.value}
											disabled=${optionDisabled}
											onChange=${(event) => {
												const nextValue = event.currentTarget.value;
												setFieldValues((current) => ({
													...current,
													[field.id]: nextValue,
												}));
											}}
										/>
										<span class="overlay-radio-option__body">
											<span class="overlay-radio-option__label">
												${option.label}
											</span>
											${option.hint
												? html`
														<span class="overlay-radio-option__hint">
															${option.hint}
														</span>
													`
												: null}
										</span>
									</label>
								`;
							})}
						</fieldset>
					`;
				}

				return html`
					<label class="overlay-field">
						<span>${field.label}</span>
						<input
							type=${field.type ?? "text"}
							value=${String(fieldValues[field.id] ?? "")}
							disabled=${isDisabled}
							onInput=${(event) =>
								setFieldValues((current) => ({
									...current,
									[field.id]: event.currentTarget.value,
								}))}
						/>
					</label>
				`;
			})}
		</div>
	`;
}

function renderOverlayButtonsWithState(
	overlay,
	fieldValues = {},
	isSubmitting = false,
) {
	if (!overlay?.actions?.length) {
		return null;
	}

	return html`
		<div class="overlay-card__actions">
			${overlay.actions.map(
				(action) => html`
					<button
						type="button"
						class=${action.primary ? "button button--primary" : "button"}
						disabled=${Boolean(action.disabled) || isSubmitting}
						onClick=${async () => {
							if (action.submit) {
								await overlay.onSubmit?.(fieldValues);
								return;
							}
							await action.onClick?.(fieldValues);
						}}
					>
						${action.label}
					</button>
				`,
			)}
		</div>
	`;
}

function formatOverlayElapsedTime(elapsedSeconds) {
	if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
		return "";
	}
	if (elapsedSeconds < 60) {
		return `${elapsedSeconds}s`;
	}
	const minutes = Math.floor(elapsedSeconds / 60);
	const seconds = elapsedSeconds % 60;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function renderProgressBody(overlay, progressTick = Date.now()) {
	const stepCount = overlay.steps?.length ?? 0;
	const completedSteps =
		overlay.steps?.filter((step) => step.status === "done").length ?? 0;
	const activeProgress =
		stepCount > 0 ? ((completedSteps + 0.5) / stepCount) * 100 : null;
	const elapsedSeconds = overlay.startedAt
		? Math.max(0, Math.floor((progressTick - overlay.startedAt) / 1000))
		: null;
	const activeDotCount = ((Math.floor(progressTick / 400) % 3) + 1).toString();

	return html`
		${
			activeProgress != null &&
			html`
				<div
					class="overlay-progress"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow=${Math.round(activeProgress)}
				>
					<div
						class="overlay-progress__fill"
						style=${`width:${activeProgress}%`}
					></div>
				</div>
			`
		}
		${
			overlay.detail &&
			html`<p class="overlay-card__detail">${overlay.detail}</p>`
		}
		${
			overlay.phaseLabel &&
			html`
				<div class="overlay-phase">
					<div class="overlay-phase__header">
						<strong class="overlay-phase__title">${overlay.phaseLabel}</strong>
						${
							overlay.phaseDetail &&
							html`
								<span class="overlay-phase__detail">${overlay.phaseDetail}</span>
							`
						}
					</div>
					${
						overlay.phases?.length > 0 &&
						html`
							<ol class="overlay-phase-list">
								${overlay.phases.map(
									(phase) => html`
										<li class=${`overlay-phase-step overlay-phase-step--${phase.status}`}>
											<span class="overlay-phase-step__marker" aria-hidden="true"></span>
											<span class="overlay-phase-step__label">${phase.label}</span>
										</li>
									`,
								)}
							</ol>
						`
					}
				</div>
			`
		}
		${
			elapsedSeconds != null &&
			html`
				<div
					class="overlay-card__heartbeat"
					data-dot-count=${activeDotCount}
					aria-hidden="true"
				>
					<span class="overlay-card__heartbeat-dots">
						<span></span>
						<span></span>
						<span></span>
					</span>
					<span class="overlay-card__heartbeat-time">
						${formatOverlayElapsedTime(elapsedSeconds)}
					</span>
				</div>
			`
		}
		${
			overlay.steps?.length > 0 &&
			html`
				<ol class="overlay-step-list">
					${overlay.steps.map(
						(step) => html`
							<li class=${`overlay-step overlay-step--${step.status}`}>
								<span class="overlay-step__label">${step.label}</span>
							</li>
						`,
					)}
				</ol>
			`
		}
	`;
}

function renderErrorBody(overlay) {
	if (!overlay.detail && !overlay.urls?.length) {
		return null;
	}

	return html`
		<details class="overlay-card__details">
			<summary>${overlay.detailLabel || "Details"}</summary>
			${
				overlay.urls?.length > 0 &&
				html`
					<ul class="overlay-url-list">
						${overlay.urls.map(
							(url) => html`
								<li>
									<code>${url}</code>
								</li>
							`,
						)}
					</ul>
				`
			}
			${
				overlay.detail &&
				html`<pre class="overlay-card__error-detail">${overlay.detail}</pre>`
			}
		</details>
	`;
}

export function AppOverlay({ overlay }) {
	const [fieldValues, setFieldValues] = useState(
		buildOverlayFieldState(overlay?.fields),
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [progressTick, setProgressTick] = useState(() => Date.now());

	useEffect(() => {
		setFieldValues(buildOverlayFieldState(overlay?.fields));
		setIsSubmitting(false);
	}, [overlay]);

	useEffect(() => {
		if (overlay?.kind !== "progress" || !overlay?.startedAt) {
			return;
		}

		const timer = globalThis.setInterval(() => {
			setProgressTick(Date.now());
		}, 400);
		return () => globalThis.clearInterval(timer);
	}, [overlay?.kind, overlay?.startedAt]);

	if (!overlay) {
		return null;
	}

	const overlayWithActions = {
		...overlay,
		onSubmit:
			typeof overlay.onSubmit === "function"
				? async (values) => {
						setIsSubmitting(true);
						try {
							await overlay.onSubmit(values);
						} finally {
							setIsSubmitting(false);
						}
					}
				: null,
	};

	return html`
		<div class="app-overlay" role="presentation">
			<div
				class="overlay-card"
				role=${overlay.kind === "error" ? "alertdialog" : "dialog"}
				aria-modal="true"
			>
				<div class="overlay-card__header">
					<h2>${overlay.title}</h2>
				</div>
				${
					overlay.message &&
					html`<p class="overlay-card__message">${overlay.message}</p>`
				}
				${
					overlay.kind === "confirm" &&
					overlay.urls?.length > 0 &&
					html`
						<ul class="overlay-url-list">
							${overlay.urls.map(
								(url) => html`
									<li>
										<code>${url}</code>
									</li>
								`,
							)}
						</ul>
					`
				}
				${renderOverlayFields(overlay, fieldValues, setFieldValues)}
				${
					overlay.kind === "progress"
						? renderProgressBody(overlay, progressTick)
						: null
				}
				${overlay.kind === "error" ? renderErrorBody(overlay) : null}
				${renderOverlayButtonsWithState(
					overlayWithActions,
					fieldValues,
					isSubmitting,
				)}
			</div>
		</div>
	`;
}
