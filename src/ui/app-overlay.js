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

function renderProgressBody(overlay) {
	const stepCount = overlay.steps?.length ?? 0;
	const completedSteps =
		overlay.steps?.filter((step) => step.status === "done").length ?? 0;
	const activeProgress =
		stepCount > 0 ? ((completedSteps + 0.5) / stepCount) * 100 : null;

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

	useEffect(() => {
		setFieldValues(buildOverlayFieldState(overlay?.fields));
		setIsSubmitting(false);
	}, [overlay]);

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
				${overlay.kind === "progress" ? renderProgressBody(overlay) : null}
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
