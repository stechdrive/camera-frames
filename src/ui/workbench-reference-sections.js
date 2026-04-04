import { html } from "htm/preact";
import { getReferenceImageDisplayItems } from "../reference-image-model.js";
import {
	INTERACTIVE_FIELD_PROPS,
	NumericDraftInput,
	NumericUnitLabel,
} from "./workbench-controls.js";
import { DisclosureBlock, IconButton } from "./workbench-primitives.js";

export function ReferenceSection({
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	showList = true,
	store,
	t,
}) {
	const assets = store.referenceImages.assets.value;
	const items = store.referenceImages.items.value;
	const itemsForDisplay = getReferenceImageDisplayItems(items);
	const presets = store.referenceImages.presets.value;
	const previewSessionVisible =
		store.referenceImages.previewSessionVisible.value;
	const selectedAssetId = store.referenceImages.selectedAssetId.value;
	const selectedItemId = store.referenceImages.selectedItemId.value;
	const selectedItemIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const panelPresetId = store.referenceImages.panelPresetId.value;
	const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
	const selectedAsset =
		assets.find(
			(asset) => asset.id === (selectedItem?.assetId ?? selectedAssetId),
		) ?? null;
	const handleReferenceItemClick = (event, itemId, orderedIds) => {
		controller()?.selectReferenceImageItem?.(itemId, {
			additive: event.ctrlKey || event.metaKey,
			toggle: event.ctrlKey || event.metaKey,
			range: event.shiftKey,
			orderedIds,
		});
		if (controller()?.isReferenceImageSelectionActive?.()) {
			controller()?.activateViewportReferenceImageEditModeImplicit?.();
		}
	};

	function getReferenceRowClass({ selected = false, active = false }) {
		const classes = ["scene-asset-row"];
		if (selected) {
			classes.push("scene-asset-row--selected");
		}
		if (active) {
			classes.push("scene-asset-row--active");
		}
		return classes.join(" ");
	}

	return html`
		<${DisclosureBlock}
			icon="image"
			label=${t("section.referenceImages")}
			open=${open}
			summaryMeta=${html`<span class="pill pill--dim">${items.length}</span>`}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<div class="button-row">
				<button
					type="button"
					class=${
						previewSessionVisible
							? "button button--primary button--compact"
							: "button button--compact"
					}
					onClick=${() =>
						controller()?.setReferenceImagePreviewSessionVisible?.(
							!previewSessionVisible,
						)}
				>
					${
						previewSessionVisible
							? t("action.hideReferenceImages")
							: t("action.showReferenceImages")
					}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${t("referenceImage.activePreset")}</span>
					<select
						value=${panelPresetId}
						...${INTERACTIVE_FIELD_PROPS}
						onChange=${(event) =>
							controller()?.setActiveReferenceImagePreset?.(
								event.currentTarget.value,
							)}
					>
						${presets.map(
							(preset) => html`
								<option key=${preset.id} value=${preset.id}>
									${preset.name}
								</option>
							`,
						)}
					</select>
				</label>
				<div class="field field--action">
					<span>${t("referenceImage.activePresetItems", { count: items.length })}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${() => controller()?.duplicateActiveReferenceImagePreset?.()}
					>
						${t("action.duplicateReferencePreset")}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${
					showList &&
					html`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${t("referenceImage.currentPresetSection")}</strong>
								<span class="pill pill--dim">${items.length}</span>
							</div>
							${
								items.length > 0
									? html`
											<div class="scene-asset-list">
												${itemsForDisplay.map(
													(item) => html`
														<article
															class=${getReferenceRowClass({
																selected: selectedItemIds.has(item.id),
																active: item.id === selectedItemId,
															})}
															onClick=${(event) =>
																handleReferenceItemClick(
																	event,
																	item.id,
																	itemsForDisplay.map((entry) => entry.id),
																)}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${item.name}</strong>
																	<span class="scene-asset-row__meta">
																		${item.fileName || t("referenceImage.untitled")} ·
																		${t(`referenceImage.group.${item.group}`)} ·
																		${t("referenceImage.orderLabel", {
																			order: item.order + 1,
																		})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${IconButton}
																	icon=${item.previewVisible ? "eye" : "eye-off"}
																	label=${t(
																		item.previewVisible
																			? "assetVisibility.visible"
																			: "assetVisibility.hidden",
																	)}
																	active=${item.previewVisible}
																	compact=${true}
																	className="scene-asset-row__icon-button"
																	onClick=${(event) => {
																		event.stopPropagation();
																		controller()?.setReferenceImagePreviewVisible?.(
																			item.id,
																			!item.previewVisible,
																		);
																	}}
																/>
																<${IconButton}
																	icon=${item.exportEnabled ? "export" : "slash-circle"}
																	label=${
																		item.exportEnabled
																			? t(
																					"action.excludeReferenceImageFromExport",
																				)
																			: t(
																					"action.includeReferenceImageInExport",
																				)
																	}
																	compact=${true}
																	className="scene-asset-row__icon-button"
																	onClick=${(event) => {
																		event.stopPropagation();
																		controller()?.setReferenceImageExportEnabled?.(
																			item.id,
																			!item.exportEnabled,
																		);
																	}}
																/>
															</div>
														</article>
													`,
												)}
											</div>
										`
									: html`<p class="summary">${t("referenceImage.currentCameraEmpty")}</p>`
							}
						</section>
					`
				}
				${
					selectedItem && selectedAsset
						? html`
								<${DisclosureBlock}
									icon="image"
									label=${selectedItem.name}
									open=${true}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${selectedItem.name} ·
											${selectedAsset.fileName || t("referenceImage.untitled")}
										</p>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageOpacity")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(selectedItem.opacity * 100)}
														controller=${controller}
														historyLabel="reference-image.opacity"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOpacity?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="%" title=${t("unit.percent")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageScale")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(selectedItem.scalePct).toFixed(2)}
														controller=${controller}
														historyLabel="reference-image.scale"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageScalePct?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="%" title=${t("unit.percent")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageOffsetX")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="1"
														value=${Number(selectedItem.offsetPx?.x ?? 0).toFixed(0)}
														controller=${controller}
														historyLabel="reference-image.offset.x"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOffsetPx?.(
																selectedItem.id,
																"x",
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="px" title=${t("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="1"
														value=${Number(selectedItem.offsetPx?.y ?? 0).toFixed(0)}
														controller=${controller}
														historyLabel="reference-image.offset.y"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageOffsetPx?.(
																selectedItem.id,
																"y",
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="px" title=${t("unit.pixel")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageRotation")}</span>
												<div class="numeric-unit">
													<${NumericDraftInput}
														inputMode="decimal"
														step="0.01"
														value=${Number(selectedItem.rotationDeg).toFixed(2)}
														controller=${controller}
														historyLabel="reference-image.rotation"
														onCommit=${(nextValue) =>
															controller()?.setReferenceImageRotationDeg?.(
																selectedItem.id,
																nextValue,
															)}
													/>
													<${NumericUnitLabel} value="deg" title=${t("unit.degree")} />
												</div>
											</label>
											<label class="field">
												<span>${t("field.referenceImageOrder")}</span>
												<${NumericDraftInput}
													inputMode="numeric"
													min="1"
													step="1"
													value=${selectedItem.order + 1}
													controller=${controller}
													historyLabel="reference-image.order"
													onCommit=${(nextValue) =>
														controller()?.setReferenceImageOrder?.(
															selectedItem.id,
															Math.max(0, Number(nextValue) - 1),
														)}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${t("field.referenceImageGroup")}</span>
												<select
													value=${selectedItem.group}
													...${INTERACTIVE_FIELD_PROPS}
													onChange=${(event) =>
														controller()?.setReferenceImageGroup?.(
															selectedItem.id,
															event.currentTarget.value,
														)}
												>
													<option value="back">
														${t("referenceImage.group.back")}
													</option>
													<option value="front">
														${t("referenceImage.group.front")}
													</option>
												</select>
											</label>
										</div>
										<div class="button-row">
											<button
												type="button"
												class=${
													selectedItem.previewVisible
														? "button button--primary button--compact"
														: "button button--compact"
												}
												onClick=${() =>
													controller()?.setReferenceImagePreviewVisible?.(
														selectedItem.id,
														!selectedItem.previewVisible,
													)}
											>
												${
													selectedItem.previewVisible
														? t("action.hideReferenceImage")
														: t("action.showReferenceImage")
												}
											</button>
											<button
												type="button"
												class=${
													selectedItem.exportEnabled
														? "button button--primary button--compact"
														: "button button--compact"
												}
												onClick=${() =>
													controller()?.setReferenceImageExportEnabled?.(
														selectedItem.id,
														!selectedItem.exportEnabled,
													)}
											>
												${
													selectedItem.exportEnabled
														? t("action.excludeReferenceImageFromExport")
														: t("action.includeReferenceImageInExport")
												}
											</button>
										</div>
									</div>
								<//>
							`
						: html`<p class="summary">${t("referenceImage.selectedEmpty")}</p>`
				}
			</div>
		<//>
	`;
}
