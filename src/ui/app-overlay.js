import { html } from "htm/preact";

function renderOverlayButtons(overlay) {
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
						disabled=${Boolean(action.disabled)}
						onClick=${() => action.onClick?.()}
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
	if (!overlay) {
		return null;
	}

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
				${overlay.kind === "progress" ? renderProgressBody(overlay) : null}
				${overlay.kind === "error" ? renderErrorBody(overlay) : null}
				${renderOverlayButtons(overlay)}
			</div>
		</div>
	`;
}
