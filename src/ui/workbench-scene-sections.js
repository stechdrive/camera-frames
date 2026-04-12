import { html } from "htm/preact";
import { groupSceneAssetsByKind } from "../engine/scene-asset-order.js";
import {
	getSceneAssetById,
	getSceneAssetDragSelectionIds,
	getSceneAssetDropPosition,
	getSceneAssetDropTargetKindIndex,
} from "./scene-asset-drag.js";
import { SceneBrowserSection } from "./workbench-browser-sections.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	DisclosureBlock,
	IconButton,
	SectionHeading,
} from "./workbench-primitives.js";

function renderSceneManagerSummaryActions({
	controller,
	sceneAssets,
	store,
	summaryActions,
	t,
}) {
	const selectedSceneAssetIds = new Set(
		store.selectedSceneAssetIds.value ?? [],
	);
	const canDuplicateSelectedSceneAssets = (sceneAssets ?? []).some(
		(asset) =>
			selectedSceneAssetIds.has(asset.id) &&
			(asset.kind === "model" || asset.kind === "splat"),
	);
	const canDeleteSelectedSceneAssets = selectedSceneAssetIds.size > 0;
	if (
		!canDuplicateSelectedSceneAssets &&
		!canDeleteSelectedSceneAssets &&
		!summaryActions
	) {
		return null;
	}
	return html`
		${
			canDuplicateSelectedSceneAssets &&
			html`
				<${IconButton}
					icon="duplicate"
					label=${t("action.duplicateSelectedSceneAssets")}
					disabled=${!canDuplicateSelectedSceneAssets}
					compact=${true}
					onClick=${() => void controller()?.duplicateSelectedSceneAssets?.()}
				/>
			`
		}
		${
			canDeleteSelectedSceneAssets &&
			html`
				<${IconButton}
					icon="trash"
					label=${t("action.deleteSelectedSceneAssets")}
					disabled=${!canDeleteSelectedSceneAssets}
					compact=${true}
					onClick=${() => controller()?.deleteSelectedSceneAssets?.()}
				/>
			`
		}
		${summaryActions}
	`;
}

export function SceneWorkspaceSection({
	controller,
	sceneAssets,
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	const resolvedSummaryActions = renderSceneManagerSummaryActions({
		controller,
		sceneAssets,
		store,
		summaryActions,
		t,
	});
	return html`
		<${DisclosureBlock}
			icon="scene"
			label=${t("section.sceneManager")}
			open=${open}
			summaryActions=${resolvedSummaryActions}
			onToggle=${onToggle}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<section class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
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
					</div>
				</section>
			</div>
		<//>
	`;
}

export function SceneSection({
	controller,
	sceneAssets,
	selectedSceneAsset,
	open = true,
	summaryActions = null,
	onToggle = null,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	const resolvedSummaryActions = renderSceneManagerSummaryActions({
		controller,
		sceneAssets,
		store,
		summaryActions,
		t,
	});
	const groupedSceneAssets = groupSceneAssetsByKind(sceneAssets);
	const sceneAssetSections = [
		{
			kind: "model",
			kindLabelKey: "assetKind.model",
			assets:
				groupedSceneAssets.find((section) => section.kind === "model")
					?.assets ?? [],
		},
		{
			kind: "splat",
			kindLabelKey: "assetKind.splat",
			assets:
				groupedSceneAssets.find((section) => section.kind === "splat")
					?.assets ?? [],
		},
		...groupedSceneAssets
			.filter((section) => !["model", "splat"].includes(section.kind))
			.map((section) => ({
				...section,
				kindLabelKey:
					section.assets[0]?.kindLabelKey ?? `assetKind.${section.kind}`,
			})),
	];
	const selectedSceneAssetIdList = store.selectedSceneAssetIds.value ?? [];
	const selectedSceneAssetIds = new Set(selectedSceneAssetIdList);
	const getSceneAssetRowClass = (asset) => {
		const classes = ["scene-asset-row"];
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
	return html`
		<${DisclosureBlock}
			icon="scene"
			label=${t("section.sceneManager")}
			open=${open}
			summaryActions=${resolvedSummaryActions}
			onToggle=${onToggle}
		>
			<div class="scene-asset-section-list">
				${sceneAssetSections.map(
					(section) => html`
						<section class="scene-asset-section">
							<${SectionHeading} title=${t(section.kindLabelKey)}>
								<span class="pill pill--dim">${section.assets.length}</span>
							<//>
							<div
								class=${
									section.assets.length > 0
										? "scene-asset-list"
										: "scene-asset-list scene-asset-list--empty"
								}
							>
								${section.assets.map(
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
												const draggedSelectionIds =
													getSceneAssetDragSelectionIds(
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
												const draggedSelectionIds =
													getSceneAssetDragSelectionIds(
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
												const targetKindIndex =
													getSceneAssetDropTargetKindIndex(
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
													<strong>${asset.label}</strong>
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
								)}
							</div>
						</section>
					`,
				)}
			</div>
		<//>
	`;
}
