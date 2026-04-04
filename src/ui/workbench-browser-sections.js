import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { getReferenceImageDisplayItems } from "../reference-image-model.js";
import {
	getSceneAssetById,
	getSceneAssetDragSelectionIds,
	getSceneAssetDropPosition,
	getSceneAssetDropTargetKindIndex,
} from "./scene-asset-drag.js";
import { TextDraftInput, stopUiEvent } from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import { DisclosureBlock, IconButton } from "./workbench-primitives.js";
import {
	INSPECTOR_BROWSER_REFERENCE,
	INSPECTOR_BROWSER_SCENE,
} from "./workbench-section-ids.js";

function ShotCameraManagerList({
	activeShotCamera,
	controller,
	shotCameras,
	t,
}) {
	const canDeleteShotCamera =
		shotCameras.length > 1 && Boolean(activeShotCamera);

	return html`
		<div class="shot-camera-manager">
			<div class="button-row shot-camera-manager__actions">
				<${IconButton}
					id="new-shot-camera"
					icon="plus"
					label=${t("action.newShotCamera")}
					onClick=${() => controller()?.createShotCamera()}
				/>
				<${IconButton}
					id="duplicate-shot-camera"
					icon="duplicate"
					label=${t("action.duplicateShotCamera")}
					disabled=${!activeShotCamera}
					onClick=${() => controller()?.duplicateActiveShotCamera()}
				/>
				<${IconButton}
					id="delete-shot-camera"
					icon="trash"
					label=${t("action.deleteShotCamera")}
					disabled=${!canDeleteShotCamera}
					onClick=${() => controller()?.deleteActiveShotCamera?.()}
				/>
			</div>
			<div class="shot-camera-manager__list scene-asset-list scene-asset-list--compact">
				${shotCameras.map(
					(shotCamera) => html`
						<article
							key=${shotCamera.id}
							class=${
								shotCamera.id === activeShotCamera?.id
									? "scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active"
									: "scene-asset-row scene-asset-row--compact"
							}
							onClick=${() => controller()?.selectShotCamera(shotCamera.id)}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									${
										shotCamera.id === activeShotCamera?.id
											? html`
												<div class="field shot-camera-manager__inline-name-field">
													<${TextDraftInput}
														id=${`shot-camera-name-${shotCamera.id}`}
														class="shot-camera-manager__inline-name-input"
														placeholder=${t("field.shotCameraName")}
														selectOnFocus=${true}
														value=${shotCamera.name}
														onCommit=${(nextValue) =>
															controller()?.setShotCameraName(nextValue)}
													/>
												</div>
											`
											: html`<strong>${shotCamera.name}</strong>`
									}
								</div>
							</div>
						</article>
					`,
				)}
			</div>
		</div>
	`;
}

export function InspectorBrowserSection({
	activeBrowserSectionId,
	controller,
	draggedAssetId = null,
	dragHoverState = null,
	onSelectBrowserSection,
	sceneAssets = [],
	selectedSceneAsset = null,
	setDraggedAssetId = () => {},
	setDragHoverState = () => {},
	store,
	t,
}) {
	const browserSections = [
		{
			id: INSPECTOR_BROWSER_SCENE,
			label: t("section.scene"),
			icon: "scene",
		},
		{
			id: INSPECTOR_BROWSER_REFERENCE,
			label: t("section.referenceImages"),
			icon: "image",
		},
	];

	return html`
		<section class="panel-section panel-section--browser">
			<div class="inspector-browser">
				<div class="inspector-browser__tabs" role="tablist">
					${browserSections.map(
						(section) => html`
							<button
								key=${section.id}
								type="button"
								role="tab"
								class=${
									activeBrowserSectionId === section.id
										? "inspector-browser__tab is-active"
										: "inspector-browser__tab"
								}
								aria-selected=${activeBrowserSectionId === section.id}
								onClick=${() => onSelectBrowserSection?.(section.id)}
							>
								<${WorkbenchIcon} name=${section.icon} size=${13} />
								<span>${section.label}</span>
							</button>
						`,
					)}
				</div>
				<div class="inspector-browser__body">
					${
						activeBrowserSectionId === INSPECTOR_BROWSER_REFERENCE
							? html`
									<${ReferenceBrowserSection}
										controller=${controller}
										store=${store}
										t=${t}
									/>
								`
							: html`
									<${SceneBrowserSection}
										controller=${controller}
										draggedAssetId=${draggedAssetId}
										dragHoverState=${dragHoverState}
										sceneAssets=${sceneAssets}
										selectedSceneAsset=${selectedSceneAsset}
										setDraggedAssetId=${setDraggedAssetId}
										setDragHoverState=${setDragHoverState}
										store=${store}
										t=${t}
									/>
								`
					}
				</div>
			</div>
		</section>
	`;
}

export function SceneBrowserSection({
	controller,
	draggedAssetId = null,
	dragHoverState = null,
	sceneAssets,
	selectedSceneAsset,
	setDraggedAssetId,
	setDragHoverState,
	store,
	t,
}) {
	const sceneAssetSections = [
		{
			kind: "model",
			label: t("assetKind.model"),
			assets: sceneAssets.filter((asset) => asset.kind === "model"),
		},
		{
			kind: "splat",
			label: t("assetKind.splat"),
			assets: sceneAssets.filter((asset) => asset.kind === "splat"),
		},
	];
	const selectedSceneAssetIdList = store.selectedSceneAssetIds.value ?? [];
	const selectedSceneAssetIds = new Set(selectedSceneAssetIdList);
	const getSceneAssetRowClass = (asset) => {
		const classes = ["scene-asset-row", "scene-asset-row--compact"];
		if (selectedSceneAssetIds.has(asset.id)) {
			classes.push("scene-asset-row--selected");
		}
		if (asset.id === selectedSceneAsset?.id) {
			classes.push("scene-asset-row--active");
		}
		if (dragHoverState?.assetId === asset.id) {
			classes.push(
				dragHoverState.position === "before"
					? "scene-asset-row--drop-before"
					: "scene-asset-row--drop-after",
			);
		}
		return classes.join(" ");
	};
	const renderSceneAssetTitle = (asset) =>
		asset.id === selectedSceneAsset?.id
			? html`
					<div class="field scene-asset-row__inline-name-field">
						<${TextDraftInput}
							id=${`scene-asset-name-${asset.id}`}
							class="scene-asset-row__inline-name-input"
							placeholder=${asset.label}
							selectOnFocus=${true}
							value=${asset.label}
							maxLength="128"
							onCommit=${(nextValue) =>
								controller()?.setAssetLabel?.(asset.id, nextValue)}
						/>
					</div>
				`
			: html`<strong>${asset.label}</strong>`;

	return html`
		<div class="browser-list">
			${sceneAssetSections.map(
				(section) => html`
					<section key=${section.kind} class="browser-group">
						<div class="browser-group__heading">
							<strong>${section.label}</strong>
							<span class="pill pill--dim">${section.assets.length}</span>
						</div>
						<div class="scene-asset-list scene-asset-list--compact">
							${
								section.assets.length === 0
									? html`<div class="scene-asset-list__placeholder"></div>`
									: section.assets.map(
											(asset) => html`
									<article
										class=${getSceneAssetRowClass(asset)}
										draggable="true"
										onClick=${(event) =>
											controller()?.selectSceneAsset(asset.id, {
												additive: event.ctrlKey || event.metaKey,
												toggle: event.ctrlKey || event.metaKey,
												range: event.shiftKey,
												orderedIds: sceneAssets.map((entry) => entry.id),
											})}
										onDragStart=${(event) => {
											setDraggedAssetId(asset.id);
											setDragHoverState(null);
											event.dataTransfer.effectAllowed = "move";
											event.dataTransfer.setData(
												"text/plain",
												String(asset.id),
											);
										}}
										onDragOver=${(event) => {
											const draggedAsset = getSceneAssetById(
												sceneAssets,
												draggedAssetId ??
													Number(event.dataTransfer.getData("text/plain")),
											);
											const draggedSelectionIds = getSceneAssetDragSelectionIds(
												sceneAssets,
												selectedSceneAssetIdList,
												draggedAsset?.id,
											);
											if (draggedSelectionIds.includes(asset.id)) {
												return;
											}
											if (draggedAsset?.kind !== asset.kind) {
												return;
											}
											event.preventDefault();
											event.dataTransfer.dropEffect = "move";
											setDragHoverState({
												assetId: asset.id,
												position: getSceneAssetDropPosition(event),
											});
										}}
										onDragLeave=${() => {
											if (dragHoverState?.assetId === asset.id) {
												setDragHoverState(null);
											}
										}}
										onDrop=${(event) => {
											event.preventDefault();
											const draggedId =
												draggedAssetId ??
												Number(event.dataTransfer.getData("text/plain"));
											const draggedAsset = getSceneAssetById(
												sceneAssets,
												draggedId,
											);
											const draggedSelectionIds = getSceneAssetDragSelectionIds(
												sceneAssets,
												selectedSceneAssetIdList,
												draggedId,
											);
											const dropPosition = getSceneAssetDropPosition(event);
											if (
												!Number.isFinite(draggedId) ||
												draggedId === asset.id ||
												draggedSelectionIds.includes(asset.id) ||
												draggedAsset?.kind !== asset.kind
											) {
												setDraggedAssetId(null);
												setDragHoverState(null);
												return;
											}
											const targetKindIndex = getSceneAssetDropTargetKindIndex(
												draggedAsset,
												asset,
												dropPosition,
											);
											if (targetKindIndex !== null) {
												controller()?.moveAssetToIndex(
													draggedId,
													targetKindIndex,
												);
											}
											setDraggedAssetId(null);
											setDragHoverState(null);
										}}
										onDragEnd=${() => {
											setDraggedAssetId(null);
											setDragHoverState(null);
										}}
									>
										<div class="scene-asset-row__main">
											<span class="scene-asset-row__handle" aria-hidden="true">
												<${WorkbenchIcon} name="grip" size=${12} strokeWidth=${0} />
											</span>
											<div class="scene-asset-row__title-group">
												${renderSceneAssetTitle(asset)}
											</div>
										</div>
										<div class="scene-asset-row__toolbar">
											<${IconButton}
												icon=${asset.visible ? "eye" : "eye-off"}
												label=${t(
													asset.visible
														? "assetVisibility.visible"
														: "assetVisibility.hidden",
												)}
												active=${asset.visible}
												compact=${true}
												className="scene-asset-row__icon-button"
												onClick=${(event) => {
													event.stopPropagation();
													controller()?.selectSceneAsset(asset.id);
													controller()?.setAssetVisibility(
														asset.id,
														!asset.visible,
													);
												}}
											/>
										</div>
									</article>
								`,
										)
							}
						</div>
					</section>
				`,
			)}
		</div>
	`;
}

export function ReferenceBrowserSection({ controller, store, t }) {
	const items = getReferenceImageDisplayItems(
		store.referenceImages.items.value,
	);
	const selectedItemIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const selectedItemId = store.referenceImages.selectedItemId.value;
	const handleReferenceItemClick = (event, itemId, orderedIds) => {
		controller()?.selectReferenceImageItem?.(itemId, {
			additive: event.ctrlKey || event.metaKey,
			toggle: event.ctrlKey || event.metaKey,
			range: event.shiftKey,
			orderedIds,
		});
		if (controller()?.isReferenceImageSelectionActive?.()) {
			controller()?.setViewportReferenceImageEditMode?.(true);
		}
	};

	if (items.length === 0) {
		return null;
	}

	return html`
		<div class="browser-list">
			<div class="scene-asset-list scene-asset-list--compact">
				${items.map(
					(item) => html`
						<article
							key=${item.id}
							class=${
								item.id === selectedItemId
									? selectedItemIds.has(item.id)
										? "scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active"
										: "scene-asset-row scene-asset-row--compact scene-asset-row--active"
									: selectedItemIds.has(item.id)
										? "scene-asset-row scene-asset-row--compact scene-asset-row--selected"
										: "scene-asset-row scene-asset-row--compact"
							}
							onClick=${(event) =>
								handleReferenceItemClick(
									event,
									item.id,
									items.map((entry) => entry.id),
								)}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									<strong>${item.name}</strong>
								</div>
							</div>
							<div class="scene-asset-row__toolbar">
								<span
									class=${
										item.group === "front"
											? "browser-marker browser-marker--front"
											: "browser-marker browser-marker--back"
									}
									title=${t(`referenceImage.group.${item.group}`)}
								></span>
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
											? t("action.excludeReferenceImageFromExport")
											: t("action.includeReferenceImageInExport")
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
		</div>
	`;
}

function ReferencePresetPicker({ activePreset, controller, presets, t }) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const canRename = Boolean(activePreset) && !activePreset.isBlank;

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		const handlePointerDown = (event) => {
			if (!rootRef.current?.contains?.(event.target)) {
				setOpen(false);
			}
		};
		window.addEventListener("pointerdown", handlePointerDown);
		return () => {
			window.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [open]);

	return html`
		<div class="reference-preset-picker" ref=${rootRef}>
			<div class="reference-preset-picker__control">
				<div class="field reference-preset-picker__field">
					<${TextDraftInput}
						id="reference-preset-name"
						class="reference-preset-picker__input"
						placeholder=${t("field.referencePresetName")}
						selectOnFocus=${canRename}
						disabled=${!canRename}
						value=${activePreset?.name ?? ""}
						onCommit=${(nextValue) =>
							controller()?.setActiveReferenceImagePresetName?.(nextValue)}
					/>
				</div>
				<button
					type="button"
					class=${
						open
							? "reference-preset-picker__toggle is-open"
							: "reference-preset-picker__toggle"
					}
					onPointerDown=${(event) => {
						stopUiEvent(event);
						event.preventDefault();
					}}
					onClick=${(event) => {
						stopUiEvent(event);
						event.preventDefault();
						setOpen((current) => !current);
					}}
					aria-label=${t("referenceImage.activePreset")}
					aria-expanded=${open}
				>
					<${WorkbenchIcon} name="chevron-right" size=${12} />
				</button>
			</div>
			${
				open &&
				html`
					<div class="reference-preset-picker__menu">
						${presets.map(
							(preset) => html`
								<button
									key=${preset.id}
									type="button"
									class=${
										preset.id === activePreset?.id
											? "reference-preset-picker__option is-active"
											: "reference-preset-picker__option"
									}
									onPointerDown=${(event) => {
										stopUiEvent(event);
										event.preventDefault();
									}}
									onClick=${(event) => {
										stopUiEvent(event);
										event.preventDefault();
										controller()?.setActiveReferenceImagePreset?.(preset.id);
										setOpen(false);
									}}
								>
									<span>${preset.name}</span>
									${
										preset.isBlank
											? html`<span class="pill pill--dim">${t(
													"referenceImage.blankPreset",
												)}</span>`
											: null
									}
								</button>
							`,
						)}
					</div>
				`
			}
		</div>
	`;
}

export function ReferencePresetSection({
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	const presets = store.referenceImages.presets.value;
	const activePresetId = store.referenceImages.panelPresetId.value;
	const activePreset =
		presets.find((preset) => preset.id === activePresetId) ??
		presets[0] ??
		null;
	const canDeletePreset =
		Boolean(activePreset) &&
		activePreset.isBlank !== true &&
		presets.length > 1;

	return html`
		<${DisclosureBlock}
			icon="image"
			label=${t("section.referencePresets")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<div class="reference-preset-section">
				<div class="reference-preset-section__row">
					<${ReferencePresetPicker}
						activePreset=${activePreset}
						controller=${controller}
						presets=${presets}
						t=${t}
					/>
				</div>
				<div class="button-row reference-preset-section__actions">
					<${IconButton}
						id="duplicate-reference-preset"
						icon="duplicate"
						label=${t("action.duplicateReferencePreset")}
						onClick=${() =>
							controller()?.duplicateActiveReferenceImagePreset?.()}
					/>
					<${IconButton}
						id="delete-reference-preset"
						icon="trash"
						label=${t("action.deleteReferencePreset")}
						disabled=${!canDeletePreset}
						onClick=${() => controller()?.deleteActiveReferenceImagePreset?.()}
					/>
				</div>
			</div>
		<//>
	`;
}

export function ReferenceManagerSection({
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	const items = store.referenceImages.items.value;
	const itemsForDisplay = getReferenceImageDisplayItems(items);
	const selectedItemIds = new Set(
		store.referenceImages.selectedItemIds.value ?? [],
	);
	const selectedItems = itemsForDisplay.filter((item) =>
		selectedItemIds.has(item.id),
	);
	const selectedItemId = store.referenceImages.selectedItemId.value;
	const referenceGroups = [
		{
			group: "front",
			label: t("referenceImage.group.front"),
			items: getReferenceImageDisplayItems(items, "front"),
		},
		{
			group: "back",
			label: t("referenceImage.group.back"),
			items: getReferenceImageDisplayItems(items, "back"),
		},
	];
	const [draggedItemId, setDraggedItemId] = useState(null);
	const [dragHoverState, setDragHoverState] = useState(null);
	const canDeleteItems = selectedItems.length > 0;
	const previewSessionVisible =
		store.referenceImages.previewSessionVisible.value !== false;
	const allSelectedPreviewVisible =
		selectedItems.length > 0 &&
		selectedItems.every((item) => item.previewVisible !== false);
	const allSelectedExportEnabled =
		selectedItems.length > 0 &&
		selectedItems.every((item) => item.exportEnabled !== false);
	const resolvedSummaryActions = html`
		<${IconButton}
			id="toggle-reference-preview-session"
			icon=${previewSessionVisible ? "reference-preview-on" : "reference-preview-off"}
			label=${
				previewSessionVisible
					? t("action.hideReferenceImages")
					: t("action.showReferenceImages")
			}
			active=${previewSessionVisible && items.length > 0}
			compact=${true}
			disabled=${items.length === 0}
			tooltip=${{
				title: previewSessionVisible
					? t("action.hideReferenceImages")
					: t("action.showReferenceImages"),
				description: t("tooltip.referencePreviewSessionVisible"),
				shortcut: "R",
				placement: "left",
			}}
			onClick=${() =>
				controller()?.setReferenceImagePreviewSessionVisible?.(
					!previewSessionVisible,
				)}
		/>
		${summaryActions && html`${summaryActions}`}
	`;

	function getRowClass(itemId) {
		const classes = ["scene-asset-row", "scene-asset-row--compact"];
		if (selectedItemIds.has(itemId)) {
			classes.push("scene-asset-row--selected");
		}
		if (itemId === selectedItemId) {
			classes.push("scene-asset-row--active");
		}
		if (dragHoverState?.itemId === itemId) {
			classes.push(
				dragHoverState.position === "before"
					? "scene-asset-row--drop-before"
					: "scene-asset-row--drop-after",
			);
		}
		return classes.join(" ");
	}

	function getDropPosition(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
	}

	function handleReferenceItemClick(event, itemId, orderedIds) {
		controller()?.selectReferenceImageItem?.(itemId, {
			additive: event.ctrlKey || event.metaKey,
			toggle: event.ctrlKey || event.metaKey,
			range: event.shiftKey,
			orderedIds,
		});
		if (controller()?.isReferenceImageSelectionActive?.()) {
			controller()?.setViewportReferenceImageEditMode?.(true);
		}
	}

	return html`
		<${DisclosureBlock}
			icon="reference-tool"
			label=${t("section.referenceManager")}
			open=${open}
			summaryActions=${resolvedSummaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<div class="button-row reference-manager__actions">
					<${IconButton}
						id="toggle-selected-reference-preview"
						icon=${allSelectedPreviewVisible ? "eye-off" : "eye"}
						label=${
							allSelectedPreviewVisible
								? t("action.hideSelectedReferenceImages")
								: t("action.showSelectedReferenceImages")
						}
						disabled=${!selectedItems.length}
						onClick=${() =>
							controller()?.setSelectedReferenceImagesPreviewVisible?.(
								!allSelectedPreviewVisible,
							)}
					/>
					<${IconButton}
						id="toggle-selected-reference-export"
						icon=${allSelectedExportEnabled ? "slash-circle" : "export"}
						label=${
							allSelectedExportEnabled
								? t("action.excludeSelectedReferenceImagesFromExport")
								: t("action.includeSelectedReferenceImagesInExport")
						}
						disabled=${!selectedItems.length}
						onClick=${() =>
							controller()?.setSelectedReferenceImagesExportEnabled?.(
								!allSelectedExportEnabled,
							)}
					/>
					<${IconButton}
						id="delete-selected-reference-images"
						icon="trash"
						label=${t("action.deleteSelectedReferenceImages")}
						disabled=${!canDeleteItems}
						onClick=${() => controller()?.deleteSelectedReferenceImageItems?.()}
					/>
				</div>
				<div class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
						${
							itemsForDisplay.length > 0
								? html`
										<div class="browser-list">
											${referenceGroups.map(
												(section) => html`
													<section key=${section.group} class="browser-group">
														<div class="browser-group__heading">
															<strong>${section.label}</strong>
															<span class="pill pill--dim"
																>${section.items.length}</span
															>
														</div>
														<div class="scene-asset-list scene-asset-list--compact">
															${
																section.items.length === 0
																	? html`<div class="scene-asset-list__placeholder"></div>`
																	: section.items.map(
																			(item) => html`
													<article
														key=${item.id}
														class=${getRowClass(item.id)}
														onClick=${(event) =>
															handleReferenceItemClick(
																event,
																item.id,
																itemsForDisplay.map((entry) => entry.id),
															)}
														onDragOver=${(event) => {
															event.preventDefault();
															event.dataTransfer.dropEffect = "move";
															setDragHoverState({
																itemId: item.id,
																position: getDropPosition(event),
															});
														}}
														onDragLeave=${() => {
															if (dragHoverState?.itemId === item.id) {
																setDragHoverState(null);
															}
														}}
														onDrop=${(event) => {
															event.preventDefault();
															const draggedId =
																draggedItemId ??
																String(
																	event.dataTransfer.getData("text/plain"),
																).trim();
															const dropPosition = getDropPosition(event);
															if (!draggedId || draggedId === item.id) {
																setDraggedItemId(null);
																setDragHoverState(null);
																return;
															}
															controller()?.moveReferenceImageToDisplayTarget?.(
																draggedId,
																item.id,
																dropPosition,
																itemsForDisplay.map((entry) => entry.id),
															);
															setDraggedItemId(null);
															setDragHoverState(null);
														}}
														onDragEnd=${() => {
															setDraggedItemId(null);
															setDragHoverState(null);
														}}
													>
														<div
															class="scene-asset-row__main"
															draggable="true"
															onDragStart=${(event) => {
																setDraggedItemId(item.id);
																setDragHoverState(null);
																event.dataTransfer.effectAllowed = "move";
																event.dataTransfer.setData(
																	"text/plain",
																	String(item.id),
																);
															}}
															onDragEnd=${() => {
																setDraggedItemId(null);
																setDragHoverState(null);
															}}
														>
															<span class="scene-asset-row__handle" aria-hidden="true">
																<${WorkbenchIcon}
																	name="grip"
																	size=${12}
																	strokeWidth=${0}
																/>
															</span>
															<div class="scene-asset-row__title-group">
																<strong>${item.name}</strong>
															</div>
														</div>
														<div class="scene-asset-row__toolbar">
															<button
																type="button"
																class=${
																	item.group === "front"
																		? "reference-group-chip reference-group-chip--front"
																		: "reference-group-chip reference-group-chip--back"
																}
																title=${t(`referenceImage.group.${item.group}`)}
																onClick=${(event) => {
																	event.stopPropagation();
																	controller()?.setReferenceImageGroup?.(
																		item.id,
																		item.group === "front" ? "back" : "front",
																	);
																}}
															>
																${t(`referenceImage.groupShort.${item.group}`)}
															</button>
															<${IconButton}
																icon=${item.previewVisible ? "eye" : "eye-off"}
																label=${t(
																	item.previewVisible
																		? "action.hideReferenceImage"
																		: "action.showReferenceImage",
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
																		: t("action.includeReferenceImageInExport")
																}
																active=${item.exportEnabled}
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
																		)
															}
														</div>
													</section>
												`,
											)}
										</div>
									`
								: html`
										<div class="scene-workspace-pane__placeholder">
											<div class="scene-asset-list__placeholder"></div>
										</div>
									`
						}
					</div>
				</div>
			</div>
		<//>
	`;
}

export function ShotCameraSection({
	activeShotCamera,
	controller,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
}) {
	return html`
		<${DisclosureBlock}
			icon="camera"
			label=${t("section.shotCameraManager")}
			open=${open}
			summaryActions=${summaryActions}
			onToggle=${onToggle}
		>
			<${ShotCameraManagerList}
				activeShotCamera=${activeShotCamera}
				controller=${controller}
				shotCameras=${store.workspace.shotCameras.value}
				t=${t}
			/>
		<//>
	`;
}
