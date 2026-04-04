import { html } from "htm/preact";
import { useRef } from "preact/hooks";
import {
	computeReferenceMultiSelectionSessionRotationDelta,
	computeReferenceMultiSelectionSessionScaleFactor,
	computeReferenceMultiSelectionTargetOffsetDelta,
	computeReferenceMultiSelectionTargetRotationDelta,
	computeReferenceMultiSelectionTargetScaleFactor,
} from "./reference-multi-selection-input.js";
import { NumericDraftInput } from "./workbench-controls.js";
import { DisclosureBlock, IconButton } from "./workbench-primitives.js";

function ReferencePropertyInlineField({
	prefix,
	id,
	value,
	controller,
	historyLabel,
	onCommit,
	onScrubDelta = null,
	onScrubStart = null,
	onScrubEnd = null,
	onInteractStart = null,
	onEditStart = null,
	onEditEnd = null,
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
					disabled=${disabled}
					formatDisplayValue=${formatDisplayValue}
					onScrubDelta=${onScrubDelta}
					onScrubStart=${onScrubStart}
					onScrubEnd=${onScrubEnd}
					onInteractStart=${onInteractStart}
					onEditStart=${onEditStart}
					onEditEnd=${onEditEnd}
					scrubStartValue=${scrubStartValue}
					onCommit=${onCommit}
				/>
			</div>
		</div>
	`;
}

export function ReferencePropertiesSection({
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	const items = store.referenceImages.items.value;
	const selectedItemId = store.referenceImages.selectedItemId.value;
	const selectedItemIds = store.referenceImages.selectedItemIds.value ?? [];
	const selectedItemIdSet = new Set(selectedItemIds);
	const selectedItems = items.filter((item) => selectedItemIdSet.has(item.id));
	const selectionCount = selectedItems.length;
	const selectedItem =
		selectedItems.find((item) => item.id === selectedItemId) ??
		selectedItems[0] ??
		null;
	const selectedItemLogicalBounds =
		selectedItem && selectionCount === 1
			? (controller()?.getReferenceImageLogicalBounds?.(selectedItem.id) ??
				null)
			: null;
	const multiSelectionScrubBaselineRef = useRef({
		rotationDeltaDeg: 0,
		scaleDeltaPercent: 0,
	});

	const renderContent = (content) => html`
		<${DisclosureBlock}
			icon="image"
			label=${t("section.referenceProperties")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--selection-dock"
		>
			${content}
		<//>
	`;

	if (!selectedItem || selectionCount === 0) {
		return renderContent(html`
			<div class="reference-properties-panel">
				<div class="camera-property-inline-row camera-property-inline-row--no-label">
					<div class="camera-property-inline-row__content camera-property-inline-row__content--pair">
						<${ReferencePropertyInlineField}
							prefix=${t("field.referenceImageOpacity")}
							id="reference-opacity-empty"
							value=""
							controller=${controller}
							historyLabel="reference-image.opacity"
							disabled=${true}
						/>
						<${ReferencePropertyInlineField}
							prefix=${t("field.assetScale")}
							id="reference-scale-empty"
							value=""
							controller=${controller}
							historyLabel="reference-image.scale"
							disabled=${true}
						/>
					</div>
				</div>
				<div class="camera-property-inline-row camera-property-inline-row--no-label">
					<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
						<${ReferencePropertyInlineField}
							prefix="X"
							id="reference-offset-x-empty"
							value=""
							controller=${controller}
							historyLabel="reference-image.offset.x"
							disabled=${true}
						/>
						<${ReferencePropertyInlineField}
							prefix="Y"
							id="reference-offset-y-empty"
							value=""
							controller=${controller}
							historyLabel="reference-image.offset.y"
							disabled=${true}
						/>
						<${ReferencePropertyInlineField}
							prefix=${t("field.assetRotation")}
							id="reference-rotation-empty"
							value=""
							controller=${controller}
							historyLabel="reference-image.rotation"
							disabled=${true}
						/>
					</div>
				</div>
			</div>
		`);
	}

	function formatDeltaInputValue(value) {
		if (!Number.isFinite(value)) {
			return "--";
		}
		return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}`;
	}

	function normalizeDeltaDegrees(value) {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) {
			return 0;
		}
		const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
		return wrapped === -180 ? 180 : wrapped;
	}

	function handleMultiSelectionScrubStart() {
		controller()?.beginSelectedReferenceImageInspectorTransformSession?.();
	}

	function handleMultiSelectionScrubEnd() {
		controller()?.endSelectedReferenceImageInspectorTransformSession?.();
	}

	function ensureReferenceInspectorOverlayVisible() {
		controller()?.activateViewportReferenceImageEditModeImplicit?.();
		controller()?.ensureReferenceImageEditingSelection?.();
	}

	if (selectionCount > 1) {
		const multiSelectionState =
			controller()?.getSelectedReferenceImageInspectorState?.() ?? null;
		const sharedOpacityPercent =
			multiSelectionState?.sharedOpacityPercent ?? null;
		const averageOpacityPercent =
			multiSelectionState?.averageOpacityPercent ??
			(selectedItems.length > 0
				? Math.round(
						selectedItems.reduce(
							(sum, item) => sum + Math.round(Number(item.opacity ?? 1) * 100),
							0,
						) / selectedItems.length,
					)
				: 100);
		const currentScaleDeltaPct = multiSelectionState?.scaleDeltaPercent ?? null;
		const currentOffsetX = multiSelectionState?.offsetXDelta ?? null;
		const currentOffsetY = multiSelectionState?.offsetYDelta ?? null;
		const currentRotation = Number.isFinite(
			multiSelectionState?.rotationDeltaDeg,
		)
			? normalizeDeltaDegrees(multiSelectionState.rotationDeltaDeg)
			: null;
		const handleCurrentMultiSelectionScrubStart = () => {
			multiSelectionScrubBaselineRef.current = {
				rotationDeltaDeg: Number.isFinite(currentRotation)
					? currentRotation
					: 0,
				scaleDeltaPercent: Number.isFinite(currentScaleDeltaPct)
					? Number(currentScaleDeltaPct)
					: 0,
			};
			handleMultiSelectionScrubStart();
		};
		const handleCurrentMultiSelectionDirectInputStart = () => {
			multiSelectionScrubBaselineRef.current = {
				rotationDeltaDeg: Number.isFinite(currentRotation)
					? currentRotation
					: 0,
				scaleDeltaPercent: Number.isFinite(currentScaleDeltaPct)
					? Number(currentScaleDeltaPct)
					: 0,
			};
			controller()?.beginSelectedReferenceImageInspectorTransformSession?.();
		};
		const handleCurrentMultiSelectionDirectInputEnd = () => {
			controller()?.endSelectedReferenceImageInspectorTransformSession?.();
		};
		const getLatestMultiSelectionSession = () =>
			controller()?.getSelectedReferenceImageInspectorState?.()?.session ??
			multiSelectionState?.session ??
			null;
		const applyMultiSelectionScaleDeltaPercent = (nextDeltaPercent) => {
			const numericValue = Number(nextDeltaPercent);
			if (!Number.isFinite(numericValue)) {
				return;
			}
			const scrubBaselineDeltaPct = Number.isFinite(
				multiSelectionScrubBaselineRef.current.scaleDeltaPercent,
			)
				? multiSelectionScrubBaselineRef.current.scaleDeltaPercent
				: 0;
			const nextScaleFactor = Math.max(0.01, 1 + numericValue / 100);
			const selectionSession = getLatestMultiSelectionSession();
			if (selectionSession) {
				controller()?.applySelectedReferenceImagesScaleFromSession?.(
					selectionSession,
					nextScaleFactor / Math.max(0.01, 1 + scrubBaselineDeltaPct / 100),
				);
				return;
			}
			const currentDeltaPct = Number.isFinite(currentScaleDeltaPct)
				? Number(currentScaleDeltaPct)
				: 0;
			const currentScaleFactor = Math.max(0.01, 1 + currentDeltaPct / 100);
			controller()?.scaleSelectedReferenceImagesByFactor?.(
				nextScaleFactor / currentScaleFactor,
			);
		};
		const commitMultiSelectionScaleDeltaPercent = (nextDeltaPercent) => {
			const numericValue = Number(nextDeltaPercent);
			if (!Number.isFinite(numericValue)) {
				return;
			}
			const inputBaselineDeltaPct = Number.isFinite(
				multiSelectionScrubBaselineRef.current.scaleDeltaPercent,
			)
				? multiSelectionScrubBaselineRef.current.scaleDeltaPercent
				: 0;
			const selectionSession = getLatestMultiSelectionSession();
			if (selectionSession) {
				const relativeScaleFactor =
					computeReferenceMultiSelectionSessionScaleFactor(
						inputBaselineDeltaPct,
						numericValue,
					);
				if (relativeScaleFactor) {
					controller()?.applySelectedReferenceImagesScaleFromSession?.(
						selectionSession,
						relativeScaleFactor,
					);
				}
				return;
			}
			const incrementalScaleFactor =
				computeReferenceMultiSelectionTargetScaleFactor(
					currentScaleDeltaPct,
					numericValue,
				);
			if (!incrementalScaleFactor) {
				return;
			}
			controller()?.scaleSelectedReferenceImagesByFactor?.(
				incrementalScaleFactor,
			);
		};
		const applyMultiSelectionRotationDeltaDeg = (nextDeltaDegrees) => {
			const numericValue = Number(nextDeltaDegrees);
			if (!Number.isFinite(numericValue)) {
				return;
			}
			const normalizedDeltaDeg = normalizeDeltaDegrees(numericValue);
			const scrubBaselineRotationDeg = Number.isFinite(
				multiSelectionScrubBaselineRef.current.rotationDeltaDeg,
			)
				? multiSelectionScrubBaselineRef.current.rotationDeltaDeg
				: 0;
			const selectionSession = getLatestMultiSelectionSession();
			if (selectionSession) {
				controller()?.applySelectedReferenceImagesRotationFromSession?.(
					selectionSession,
					normalizeDeltaDegrees(normalizedDeltaDeg - scrubBaselineRotationDeg),
				);
				return;
			}
			const currentRotationDeltaDeg = Number.isFinite(currentRotation)
				? currentRotation
				: 0;
			const incrementalDeltaDeg = normalizeDeltaDegrees(
				normalizedDeltaDeg - currentRotationDeltaDeg,
			);
			if (Math.abs(incrementalDeltaDeg) <= 1e-8) {
				return;
			}
			controller()?.offsetSelectedReferenceImagesRotationDeg?.(
				incrementalDeltaDeg,
			);
		};
		const commitMultiSelectionRotationDeltaDeg = (nextDeltaDegrees) => {
			const numericValue = Number(nextDeltaDegrees);
			if (!Number.isFinite(numericValue)) {
				return;
			}
			const normalizedTargetDeltaDeg = normalizeDeltaDegrees(numericValue);
			const inputBaselineRotationDeg = Number.isFinite(
				multiSelectionScrubBaselineRef.current.rotationDeltaDeg,
			)
				? multiSelectionScrubBaselineRef.current.rotationDeltaDeg
				: 0;
			const selectionSession = getLatestMultiSelectionSession();
			if (selectionSession) {
				const relativeRotationDeltaDeg =
					computeReferenceMultiSelectionSessionRotationDelta(
						inputBaselineRotationDeg,
						normalizedTargetDeltaDeg,
					);
				if (relativeRotationDeltaDeg) {
					controller()?.applySelectedReferenceImagesRotationFromSession?.(
						selectionSession,
						relativeRotationDeltaDeg,
					);
				}
				return;
			}
			const incrementalDeltaDeg =
				computeReferenceMultiSelectionTargetRotationDelta(
					currentRotation,
					normalizedTargetDeltaDeg,
				);
			if (!incrementalDeltaDeg) {
				return;
			}
			controller()?.offsetSelectedReferenceImagesRotationDeg?.(
				incrementalDeltaDeg,
			);
		};

		return renderContent(html`
			<div class="reference-properties-panel">
				<p class="summary"
					>${t("selection.multipleReferenceImagesTitle", {
						count: selectionCount,
					})}</p
				>
				<div class="camera-property-inline-row camera-property-inline-row--no-label">
					<div class="camera-property-inline-row__content camera-property-inline-row__content--pair">
						<${ReferencePropertyInlineField}
							prefix=${t("field.referenceImageOpacity")}
							id="reference-opacity-multi"
							value=${Number.isFinite(sharedOpacityPercent) ? sharedOpacityPercent : "--"}
							scrubStartValue=${
								Number.isFinite(sharedOpacityPercent)
									? sharedOpacityPercent
									: averageOpacityPercent
							}
							controller=${controller}
							historyLabel="reference-image.opacity"
							min="0"
							max="100"
							step="1"
							onScrubDelta=${(_deltaValue, nextValue) =>
								controller()?.setSelectedReferenceImagesOpacity?.(nextValue)}
							onCommit=${(nextValue) =>
								controller()?.setSelectedReferenceImagesOpacity?.(nextValue)}
							onScrubStart=${handleCurrentMultiSelectionScrubStart}
							onScrubEnd=${handleMultiSelectionScrubEnd}
							onInteractStart=${ensureReferenceInspectorOverlayVisible}
						/>
						<${ReferencePropertyInlineField}
							prefix=${t("field.assetScale")}
							id="reference-scale-multi"
							value=${
								Number.isFinite(currentScaleDeltaPct)
									? formatDeltaInputValue(Number(currentScaleDeltaPct))
									: "--"
							}
							scrubStartValue=${
								Number.isFinite(currentScaleDeltaPct)
									? Number(currentScaleDeltaPct)
									: 0
							}
							controller=${controller}
							historyLabel="reference-image.scale"
							step="0.01"
							onScrubDelta=${(_deltaValue, nextValue) =>
								applyMultiSelectionScaleDeltaPercent(nextValue)}
							onScrubStart=${handleCurrentMultiSelectionScrubStart}
							onScrubEnd=${handleMultiSelectionScrubEnd}
							onInteractStart=${ensureReferenceInspectorOverlayVisible}
							onEditStart=${handleCurrentMultiSelectionDirectInputStart}
							onEditEnd=${handleCurrentMultiSelectionDirectInputEnd}
							onCommit=${(nextValue) => {
								const numericValue = Number(nextValue);
								if (!Number.isFinite(numericValue)) {
									return;
								}
								const currentDeltaPct = Number.isFinite(currentScaleDeltaPct)
									? Number(currentScaleDeltaPct)
									: 0;
								if (Math.abs(numericValue - currentDeltaPct) <= 1e-8) {
									return;
								}
								commitMultiSelectionScaleDeltaPercent(numericValue);
							}}
						/>
					</div>
				</div>
				<div class="camera-property-inline-row camera-property-inline-row--no-label">
					<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
						<${ReferencePropertyInlineField}
							prefix="X"
							id="reference-offset-x-multi"
							value=${formatDeltaInputValue(currentOffsetX)}
							scrubStartValue=${Number.isFinite(currentOffsetX) ? currentOffsetX : 0}
							controller=${controller}
							historyLabel="reference-image.offset.x"
							step="1"
							onScrubDelta=${(deltaValue) =>
								controller()?.offsetSelectedReferenceImagesPosition?.(
									"x",
									deltaValue,
								)}
							onScrubStart=${handleCurrentMultiSelectionScrubStart}
							onScrubEnd=${handleMultiSelectionScrubEnd}
							onInteractStart=${ensureReferenceInspectorOverlayVisible}
							onEditStart=${handleCurrentMultiSelectionDirectInputStart}
							onEditEnd=${handleCurrentMultiSelectionDirectInputEnd}
							onCommit=${(nextValue) => {
								const numericValue = Number(nextValue);
								if (!Number.isFinite(numericValue)) {
									return;
								}
								const incrementalDelta =
									computeReferenceMultiSelectionTargetOffsetDelta(
										currentOffsetX,
										numericValue,
									);
								if (!incrementalDelta) {
									return;
								}
								controller()?.offsetSelectedReferenceImagesPosition?.(
									"x",
									incrementalDelta,
								);
							}}
						/>
						<${ReferencePropertyInlineField}
							prefix="Y"
							id="reference-offset-y-multi"
							value=${formatDeltaInputValue(currentOffsetY)}
							scrubStartValue=${Number.isFinite(currentOffsetY) ? currentOffsetY : 0}
							controller=${controller}
							historyLabel="reference-image.offset.y"
							step="1"
							onScrubDelta=${(deltaValue) =>
								controller()?.offsetSelectedReferenceImagesPosition?.(
									"y",
									deltaValue,
								)}
							onScrubStart=${handleCurrentMultiSelectionScrubStart}
							onScrubEnd=${handleMultiSelectionScrubEnd}
							onInteractStart=${ensureReferenceInspectorOverlayVisible}
							onEditStart=${handleCurrentMultiSelectionDirectInputStart}
							onEditEnd=${handleCurrentMultiSelectionDirectInputEnd}
							onCommit=${(nextValue) => {
								const numericValue = Number(nextValue);
								if (!Number.isFinite(numericValue)) {
									return;
								}
								const incrementalDelta =
									computeReferenceMultiSelectionTargetOffsetDelta(
										currentOffsetY,
										numericValue,
									);
								if (!incrementalDelta) {
									return;
								}
								controller()?.offsetSelectedReferenceImagesPosition?.(
									"y",
									incrementalDelta,
								);
							}}
						/>
						<${ReferencePropertyInlineField}
							prefix=${t("field.assetRotation")}
							id="reference-rotation-multi"
							value=${formatDeltaInputValue(currentRotation)}
							scrubStartValue=${Number.isFinite(currentRotation) ? currentRotation : 0}
							controller=${controller}
							historyLabel="reference-image.rotation"
							step="0.01"
							onScrubDelta=${(_deltaValue, nextValue) =>
								applyMultiSelectionRotationDeltaDeg(nextValue)}
							onScrubStart=${handleCurrentMultiSelectionScrubStart}
							onScrubEnd=${handleMultiSelectionScrubEnd}
							onInteractStart=${ensureReferenceInspectorOverlayVisible}
							onEditStart=${handleCurrentMultiSelectionDirectInputStart}
							onEditEnd=${handleCurrentMultiSelectionDirectInputEnd}
							onCommit=${(nextValue) => {
								const numericValue = Number(nextValue);
								if (!Number.isFinite(numericValue)) {
									return;
								}
								if (
									Math.abs(
										numericValue -
											(Number.isFinite(currentRotation) ? currentRotation : 0),
									) <= 1e-8
								) {
									return;
								}
								commitMultiSelectionRotationDeltaDeg(numericValue);
							}}
						/>
					</div>
				</div>
			</div>
		`);
	}

	return renderContent(html`
		<div class="reference-properties-panel">
			<p class="summary">${selectedItem.name}</p>
			<div class="camera-property-inline-row camera-property-inline-row--no-label">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--pair">
					<${ReferencePropertyInlineField}
						prefix=${t("field.referenceImageOpacity")}
						id="reference-opacity"
						value=${Math.round(selectedItem.opacity * 100)}
						controller=${controller}
						historyLabel="reference-image.opacity"
						min="0"
						max="100"
						step="1"
						onInteractStart=${ensureReferenceInspectorOverlayVisible}
						onCommit=${(nextValue) =>
							controller()?.setReferenceImageOpacity?.(
								selectedItem.id,
								nextValue,
							)}
					/>
					<${ReferencePropertyInlineField}
						prefix=${t("field.assetScale")}
						id="reference-scale"
						value=${Number(selectedItem.scalePct).toFixed(2)}
						controller=${controller}
						historyLabel="reference-image.scale"
						min="0.1"
						step="0.01"
						onInteractStart=${ensureReferenceInspectorOverlayVisible}
						onCommit=${(nextValue) =>
							controller()?.setReferenceImageScalePct?.(
								selectedItem.id,
								nextValue,
							)}
					/>
				</div>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--no-label">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${ReferencePropertyInlineField}
						prefix="X"
						id="reference-offset-x"
						value=${Number(selectedItemLogicalBounds?.left ?? 0).toFixed(0)}
						controller=${controller}
						historyLabel="reference-image.offset.x"
						step="1"
						onInteractStart=${ensureReferenceInspectorOverlayVisible}
						onScrubDelta=${(deltaValue) =>
							controller()?.offsetReferenceImageBoundsPosition?.(
								selectedItem.id,
								"x",
								deltaValue,
							)}
						onCommit=${(nextValue) =>
							controller()?.setReferenceImageBoundsPosition?.(
								selectedItem.id,
								"x",
								nextValue,
							)}
					/>
					<${ReferencePropertyInlineField}
						prefix="Y"
						id="reference-offset-y"
						value=${Number(selectedItemLogicalBounds?.top ?? 0).toFixed(0)}
						controller=${controller}
						historyLabel="reference-image.offset.y"
						step="1"
						onInteractStart=${ensureReferenceInspectorOverlayVisible}
						onScrubDelta=${(deltaValue) =>
							controller()?.offsetReferenceImageBoundsPosition?.(
								selectedItem.id,
								"y",
								deltaValue,
							)}
						onCommit=${(nextValue) =>
							controller()?.setReferenceImageBoundsPosition?.(
								selectedItem.id,
								"y",
								nextValue,
							)}
					/>
					<${ReferencePropertyInlineField}
						prefix=${t("field.assetRotation")}
						id="reference-rotation"
						value=${Number(selectedItem.rotationDeg).toFixed(2)}
						controller=${controller}
						historyLabel="reference-image.rotation"
						step="0.01"
						onInteractStart=${ensureReferenceInspectorOverlayVisible}
						onCommit=${(nextValue) =>
							controller()?.setReferenceImageRotationDeg?.(
								selectedItem.id,
								nextValue,
							)}
					/>
				</div>
			</div>
		</div>
	`);
}

export function SelectedSceneAssetInspector({
	controller,
	sceneAssets = [],
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	showEmpty = false,
	store,
	t,
}) {
	const selectedSceneAssetIds = store?.selectedSceneAssetIds?.value ?? [];
	const selectedSceneAssets = selectedSceneAssetIds
		.map((assetId) => sceneAssets.find((asset) => asset.id === assetId) ?? null)
		.filter(Boolean);
	const selectionCount = selectedSceneAssets.length;
	const selectionSignature = selectedSceneAssetIds.join("|");
	const selectionBaselineRef = useRef({
		signature: "",
		assets: new Map(),
	});

	if (selectionBaselineRef.current.signature !== selectionSignature) {
		selectionBaselineRef.current = {
			signature: selectionSignature,
			assets: new Map(
				selectedSceneAssets.map((asset) => [
					asset.id,
					{
						position: {
							x: Number(asset.position?.x ?? 0),
							y: Number(asset.position?.y ?? 0),
							z: Number(asset.position?.z ?? 0),
						},
						rotationDegrees: {
							x: Number(asset.rotationDegrees?.x ?? 0),
							y: Number(asset.rotationDegrees?.y ?? 0),
							z: Number(asset.rotationDegrees?.z ?? 0),
						},
						worldScale: Number(asset.worldScale ?? 1),
					},
				]),
			),
		};
	}
	const selectionBaseline = selectionBaselineRef.current;
	const axisKeys = ["x", "y", "z"];
	const transformSectionTitle = t("section.selectedSceneObject");
	const targetAsset = selectedSceneAsset ?? selectedSceneAssets[0] ?? null;

	const renderAxisInput = ({
		axis,
		value,
		step = "0.01",
		controller,
		historyLabel,
		onCommit,
		onScrubDelta = null,
		disabled = false,
	}) => html`
		<div class="field transform-axis-slot">
			<${NumericDraftInput}
				inputMode="decimal"
				step=${step}
				value=${value}
				placeholder=${axis.toUpperCase()}
				controller=${controller}
				disabled=${disabled}
				historyLabel=${historyLabel}
				onCommit=${onCommit}
				onScrubDelta=${onScrubDelta}
			/>
		</div>
	`;

	function renderTransformContent(content) {
		return html`
			<${DisclosureBlock}
				icon="move"
				label=${transformSectionTitle}
				open=${open}
				summaryActions=${summaryActions}
				onToggle=${onToggle}
				className="panel-disclosure--selection-dock"
			>
				${content}
			<//>
		`;
	}

	if (selectionCount === 0 && !selectedSceneAsset) {
		if (!showEmpty) {
			return null;
		}
		return renderTransformContent(html`
			<div class="transform-inspector">
				<div class="transform-row transform-row--single">
					<span class="transform-row__label">${t("field.assetScale")}</span>
					<div class="field transform-row__value">
						<${NumericDraftInput} value="" disabled=${true} />
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetPosition")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: "",
								disabled: true,
							}),
						)}
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetRotation")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) =>
							renderAxisInput({
								axis,
								value: "",
								disabled: true,
							}),
						)}
					</div>
				</div>
			</div>
		`);
	}

	function formatDeltaInputValue(value) {
		if (!Number.isFinite(value)) {
			return "--";
		}
		return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}`;
	}

	function normalizeDeltaDegrees(value) {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) {
			return 0;
		}
		const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
		return wrapped === -180 ? 180 : wrapped;
	}

	function getSharedSelectionDelta(getValue, { normalize = null } = {}) {
		let sharedValue = null;
		for (const asset of selectedSceneAssets) {
			const baselineAsset = selectionBaseline.assets.get(asset.id);
			if (!baselineAsset) {
				return null;
			}
			let nextValue = getValue(asset, baselineAsset);
			if (normalize) {
				nextValue = normalize(nextValue);
			}
			if (!Number.isFinite(nextValue)) {
				return null;
			}
			if (sharedValue === null) {
				sharedValue = nextValue;
				continue;
			}
			if (Math.abs(sharedValue - nextValue) > 1e-4) {
				return null;
			}
		}
		return sharedValue;
	}

	if (selectionCount > 1) {
		const kindLabels = [
			...new Set(
				selectedSceneAssets.map((asset) =>
					t(asset.kindLabelKey ?? "assetKind.model"),
				),
			),
		];
		const currentScaleFactor = getSharedSelectionDelta(
			(asset, baselineAsset) =>
				Number(asset.worldScale ?? 1) / Number(baselineAsset.worldScale ?? 1),
		);

		return renderTransformContent(html`
			<p class="summary"
				>${t("selection.multipleSceneAssetsTitle", {
					count: selectionCount,
				})}
				${kindLabels.length ? ` / ${kindLabels.join(" / ")}` : ""}</p
			>
			<div class="transform-inspector">
				<div class="transform-row transform-row--single">
					<span class="transform-row__label">${t("field.assetScale")}</span>
					<div class="field transform-row__value">
						<${NumericDraftInput}
							inputMode="decimal"
							step="0.25"
							value=${
								Number.isFinite(currentScaleFactor)
									? formatDeltaInputValue(
											(Number(currentScaleFactor) - 1) * 100,
										)
									: "--"
							}
							scrubStartValue=${
								Number.isFinite(currentScaleFactor)
									? (Number(currentScaleFactor) - 1) * 100
									: 0
							}
							controller=${controller}
							historyLabel="asset.scale"
							onScrubDelta=${(deltaValue) => {
								const scaleDelta = deltaValue / 100;
								controller()?.scaleSelectedSceneAssetsByFactor?.(
									Math.max(0.01, 1 + scaleDelta),
								);
							}}
							onCommit=${(nextValue) => {
								const numericValue = Number(nextValue);
								if (
									!Number.isFinite(numericValue) ||
									Math.abs(numericValue) <= 1e-8
								) {
									return;
								}
								const currentFactor = Number.isFinite(currentScaleFactor)
									? currentScaleFactor
									: 1;
								const targetScaleFactor = Math.max(
									0.01,
									1 + numericValue / 100,
								);
								controller()?.scaleSelectedSceneAssetsByFactor?.(
									Math.max(0.01, targetScaleFactor / currentFactor),
								);
							}}
						/>
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetPosition")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) => {
							const currentDelta = getSharedSelectionDelta(
								(asset, baselineAsset) =>
									Number(asset.position?.[axis] ?? 0) -
									Number(baselineAsset.position?.[axis] ?? 0),
							);
							return renderAxisInput({
								axis,
								value: formatDeltaInputValue(currentDelta),
								step: "0.01",
								controller,
								historyLabel: "asset.position",
								onScrubDelta: (deltaValue) => {
									controller()?.offsetSelectedSceneAssetsPosition?.(
										axis,
										deltaValue,
									);
								},
								onCommit: (nextValue) => {
									const numericValue = Number(nextValue);
									if (
										!Number.isFinite(numericValue) ||
										Math.abs(numericValue) <= 1e-8
									) {
										return;
									}
									const currentValue = Number.isFinite(currentDelta)
										? currentDelta
										: 0;
									controller()?.offsetSelectedSceneAssetsPosition?.(
										axis,
										numericValue - currentValue,
									);
								},
							});
						})}
					</div>
				</div>
				<div class="transform-row">
					<span class="transform-row__label">${t("field.assetRotation")}</span>
					<div class="transform-row__axes">
						${axisKeys.map((axis) => {
							const currentDelta = getSharedSelectionDelta(
								(asset, baselineAsset) =>
									Number(asset.rotationDegrees?.[axis] ?? 0) -
									Number(baselineAsset.rotationDegrees?.[axis] ?? 0),
								{ normalize: normalizeDeltaDegrees },
							);
							return renderAxisInput({
								axis,
								value: formatDeltaInputValue(currentDelta),
								step: "0.15",
								controller,
								historyLabel: "asset.rotation",
								onScrubDelta: (deltaValue) => {
									controller()?.offsetSelectedSceneAssetsRotationDegrees?.(
										axis,
										deltaValue,
									);
								},
								onCommit: (nextValue) => {
									const numericValue = Number(nextValue);
									if (
										!Number.isFinite(numericValue) ||
										Math.abs(numericValue) <= 1e-8
									) {
										return;
									}
									const currentValue = Number.isFinite(currentDelta)
										? currentDelta
										: 0;
									controller()?.offsetSelectedSceneAssetsRotationDegrees?.(
										axis,
										numericValue - currentValue,
									);
								},
							});
						})}
					</div>
				</div>
			</div>
		`);
	}

	if (!targetAsset) {
		return null;
	}

	return renderTransformContent(html`
		<div class="transform-selection-header">
			<p class="summary transform-selection-header__summary">${targetAsset.label}</p>
			<${IconButton}
				icon="apply-transform"
				label=${t("action.applyAssetTransform")}
				compact=${true}
				className="transform-selection-header__action"
				iconSize=${17}
				iconStrokeWidth=${2.4}
				onClick=${() => controller()?.applyAssetTransform?.(targetAsset.id)}
				tooltip=${{
					title: t("action.applyAssetTransform"),
					placement: "left",
				}}
			/>
		</div>
		<div class="transform-inspector">
			<div class="transform-row transform-row--single">
				<span class="transform-row__label">${t("field.assetScale")}</span>
				<div class="field transform-row__value">
					<${NumericDraftInput}
						inputMode="decimal"
						min="0.01"
						step="0.01"
						value=${Number(targetAsset.worldScale).toFixed(2)}
						controller=${controller}
						historyLabel="asset.scale"
						onCommit=${(nextValue) =>
							controller()?.setAssetWorldScale(targetAsset.id, nextValue)}
					/>
				</div>
			</div>
			<div class="transform-row">
				<span class="transform-row__label">${t("field.assetPosition")}</span>
				<div class="transform-row__axes">
					${axisKeys.map((axis) =>
						renderAxisInput({
							axis,
							value: Number(targetAsset.position[axis]).toFixed(2),
							step: "0.01",
							controller,
							historyLabel: `asset.position.${axis}`,
							onCommit: (nextValue) =>
								controller()?.setAssetPosition(targetAsset.id, axis, nextValue),
						}),
					)}
				</div>
			</div>
			<div class="transform-row">
				<span class="transform-row__label">${t("field.assetRotation")}</span>
				<div class="transform-row__axes">
					${axisKeys.map((axis) =>
						renderAxisInput({
							axis,
							value: Number(targetAsset.rotationDegrees[axis]).toFixed(2),
							step: "0.01",
							controller,
							historyLabel: `asset.rotation.${axis}`,
							onCommit: (nextValue) =>
								controller()?.setAssetRotationDegrees(
									targetAsset.id,
									axis,
									nextValue,
								),
						}),
					)}
				</div>
			</div>
		</div>
	`);
}
