import { html } from "htm/preact";
import { useEffect } from "preact/hooks";
import {
	MOBILE_UI_SCALE_MAX,
	MOBILE_UI_SCALE_MIN,
	MOBILE_UI_SCALE_STEP,
} from "../../constants.js";
import { formatMobileUiScaleLabel } from "../mobile-ui-scale.js";
import { WorkbenchIcon } from "../workbench-icons.js";

export function MobileUiScaleModal({ store, controller, t }) {
	const open = store.mobileUi.settingsOpen.value;
	const userScale = store.mobileUi.userScale.value;
	const autoScale = store.mobileUi.autoScale.value;
	const effectiveScale = store.mobileUi.effectiveScale.value;
	const isCustomized = userScale !== null && userScale !== undefined;

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				controller()?.closeMobileUiSettings?.();
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, controller]);

	if (!open) return null;

	const handleInput = (event) => {
		const next = Number(event.currentTarget.value);
		controller()?.setMobileUiUserScale?.(next);
	};
	const handleReset = () => {
		controller()?.resetMobileUiUserScale?.();
	};
	const handleClose = () => {
		controller()?.closeMobileUiSettings?.();
	};

	return html`
		<div
			class="mobile-ui-scale-modal"
			role="dialog"
			aria-modal="true"
			aria-label=${t("mobileUiScale.title")}
			style=${{ "--cf-ui-scale": String(effectiveScale) }}
			onClick=${(event) => {
				if (event.target === event.currentTarget) {
					handleClose();
				}
			}}
		>
			<div class="mobile-ui-scale-modal__card">
				<header class="mobile-ui-scale-modal__header">
					<h2 class="mobile-ui-scale-modal__title">
						${t("mobileUiScale.title")}
					</h2>
					<button
						type="button"
						class="mobile-ui-scale-modal__close"
						aria-label=${t("action.close")}
						onClick=${handleClose}
					>
						<${WorkbenchIcon} name="close" size=${18} />
					</button>
				</header>
				<div class="mobile-ui-scale-modal__body">
					<p class="mobile-ui-scale-modal__description">
						${t("mobileUiScale.description")}
					</p>
					<div class="mobile-ui-scale-modal__value-row">
						<span class="mobile-ui-scale-modal__value-label">
							${t("mobileUiScale.currentLabel")}
						</span>
						<strong class="mobile-ui-scale-modal__value">
							${formatMobileUiScaleLabel(effectiveScale)}
						</strong>
					</div>
					<input
						type="range"
						class="mobile-ui-scale-modal__slider"
						min=${MOBILE_UI_SCALE_MIN}
						max=${MOBILE_UI_SCALE_MAX}
						step=${MOBILE_UI_SCALE_STEP}
						value=${effectiveScale}
						aria-label=${t("mobileUiScale.sliderLabel")}
						onInput=${handleInput}
					/>
					<div class="mobile-ui-scale-modal__slider-range">
						<span>${formatMobileUiScaleLabel(MOBILE_UI_SCALE_MIN)}</span>
						<span>${formatMobileUiScaleLabel(MOBILE_UI_SCALE_MAX)}</span>
					</div>
					<div class="mobile-ui-scale-modal__recommendation">
						<span>
							${t("mobileUiScale.autoRecommendation", {
								value: formatMobileUiScaleLabel(autoScale),
							})}
						</span>
						${
							isCustomized
								? html`
									<button
										type="button"
										class="mobile-ui-scale-modal__reset"
										onClick=${handleReset}
									>
										${t("mobileUiScale.resetToAuto")}
									</button>
								`
								: html`
									<span class="mobile-ui-scale-modal__auto-active">
										${t("mobileUiScale.autoActiveBadge")}
									</span>
								`
						}
					</div>
					<section
						class="mobile-ui-scale-modal__preview"
						aria-label=${t("mobileUiScale.previewLabel")}
					>
						<h3 class="mobile-ui-scale-modal__preview-title">
							${t("mobileUiScale.previewLabel")}
						</h3>
						<p class="mobile-ui-scale-modal__preview-copy">
							${t("mobileUiScale.previewCopy")}
						</p>
						<div class="mobile-ui-scale-modal__preview-row">
							<button
								type="button"
								class="mobile-ui-scale-modal__preview-button mobile-ui-scale-modal__preview-button--primary"
							>
								${t("mobileUiScale.previewPrimaryButton")}
							</button>
							<button
								type="button"
								class="mobile-ui-scale-modal__preview-button"
							>
								${t("mobileUiScale.previewSecondaryButton")}
							</button>
						</div>
						<label class="mobile-ui-scale-modal__preview-field">
							<span>${t("mobileUiScale.previewFieldLabel")}</span>
							<input
								type="text"
								readonly
								value=${t("mobileUiScale.previewFieldValue")}
							/>
						</label>
					</section>
				</div>
				<footer class="mobile-ui-scale-modal__footer">
					<button
						type="button"
						class="mobile-ui-scale-modal__done"
						onClick=${handleClose}
					>
						${t("action.close")}
					</button>
				</footer>
			</div>
		</div>
	`;
}
