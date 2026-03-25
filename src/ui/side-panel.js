import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import {
	getBuildCommitLabel,
	getBuildVersionLabel,
	getCodeStampLabel,
} from "../build-info.js";
import {
	FRAME_MAX_COUNT,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "../constants.js";
import {
	MAX_STANDARD_FRAME_EQUIVALENT_MM,
	MIN_STANDARD_FRAME_EQUIVALENT_MM,
	clampStandardFrameEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	snapStandardFrameEquivalentMm,
} from "../engine/camera-lens.js";
import { groupSceneAssetsByKind } from "../engine/scene-asset-order.js";
import { formatAssetWorldScale } from "../engine/scene-units.js";
import { getAnchorOptions } from "../i18n.js";

const INSPECTOR_TAB_CAMERA = "camera";
const INSPECTOR_TAB_EXPORT = "export";

function stopUiEvent(event) {
	event.stopPropagation();
}

function stopUiWheelEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}

function isHistoryShortcutEvent(event) {
	const hasHistoryModifier = event.ctrlKey || event.metaKey;
	return hasHistoryModifier && (event.code === "KeyZ" || event.code === "KeyY");
}

function stopUiEventUnlessHistoryShortcut(event) {
	if (isHistoryShortcutEvent(event)) {
		return;
	}
	stopUiEvent(event);
}

const INTERACTIVE_FIELD_PROPS = {
	onPointerDown: stopUiEvent,
	onClick: stopUiEvent,
	onWheel: stopUiWheelEvent,
	onKeyDown: stopUiEventUnlessHistoryShortcut,
};

function NumericDraftInput({
	value,
	inputMode = "decimal",
	onCommit,
	...props
}) {
	const formattedValue = String(value);
	const [draftValue, setDraftValue] = useState(formattedValue);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!isEditing) {
			setDraftValue(formattedValue);
		}
	}, [formattedValue, isEditing]);

	function resetDraft() {
		setDraftValue(formattedValue);
		setIsEditing(false);
	}

	function commitDraft(nextRawValue) {
		const nextValue = String(nextRawValue ?? "").trim();
		if (nextValue === "") {
			resetDraft();
			return;
		}
		onCommit?.(nextValue);
		setIsEditing(false);
	}

	return html`
		<input
			...${props}
			type="number"
			inputMode=${inputMode}
			data-draft-editing=${isEditing ? "true" : "false"}
			value=${isEditing ? draftValue : formattedValue}
			onFocus=${(event) => {
				stopUiEvent(event);
				setIsEditing(true);
				setDraftValue(String(event.currentTarget.value ?? formattedValue));
			}}
			onInput=${(event) => {
				stopUiEvent(event);
				setIsEditing(true);
				setDraftValue(event.currentTarget.value);
			}}
			onBlur=${(event) => {
				commitDraft(event.currentTarget.value);
			}}
			onChange=${(event) => {
				commitDraft(event.currentTarget.value);
			}}
			onPointerDown=${stopUiEvent}
			onClick=${stopUiEvent}
			onWheel=${stopUiWheelEvent}
			onKeyDown=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (event.key === "Enter") {
					event.preventDefault();
					commitDraft(event.currentTarget.value);
					event.currentTarget.blur();
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					resetDraft();
					event.currentTarget.blur();
				}
			}}
		/>
	`;
}

function HistoryRangeInput({
	controller,
	historyLabel,
	onLiveChange,
	...props
}) {
	const [transactionActive, setTransactionActive] = useState(false);

	function beginTransaction(event) {
		stopUiEvent(event);
		if (transactionActive) {
			return;
		}
		controller?.()?.beginHistoryTransaction?.(historyLabel);
		setTransactionActive(true);
	}

	function commitTransaction() {
		if (!transactionActive) {
			return;
		}
		controller?.()?.commitHistoryTransaction?.(historyLabel);
		setTransactionActive(false);
	}

	function cancelTransaction() {
		if (!transactionActive) {
			return;
		}
		controller?.()?.cancelHistoryTransaction?.();
		setTransactionActive(false);
	}

	return html`
		<input
			...${props}
			type="range"
			data-history-scope="app"
			onPointerDown=${(event) => {
				beginTransaction(event);
			}}
			onInput=${(event) => {
				if (!transactionActive) {
					beginTransaction(event);
				} else {
					stopUiEvent(event);
				}
				onLiveChange?.(event);
			}}
			onChange=${(event) => {
				if (!transactionActive) {
					beginTransaction(event);
				} else {
					stopUiEvent(event);
				}
				onLiveChange?.(event);
				commitTransaction();
			}}
			onPointerUp=${(event) => {
				stopUiEvent(event);
				commitTransaction();
			}}
			onPointerCancel=${(event) => {
				stopUiEvent(event);
				cancelTransaction();
			}}
			onBlur=${() => {
				commitTransaction();
			}}
			onKeyDown=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (
					[
						"ArrowLeft",
						"ArrowRight",
						"ArrowUp",
						"ArrowDown",
						"Home",
						"End",
						"PageUp",
						"PageDown",
					].includes(event.key)
				) {
					beginTransaction(event);
				}
			}}
			onKeyUp=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (
					[
						"ArrowLeft",
						"ArrowRight",
						"ArrowUp",
						"ArrowDown",
						"Home",
						"End",
						"PageUp",
						"PageDown",
					].includes(event.key)
				) {
					commitTransaction();
				}
			}}
			onWheel=${stopUiWheelEvent}
		/>
	`;
}

function applyStandardFrameEquivalentMm(
	setBaseFov,
	nextValue,
	{ snap = false } = {},
) {
	const numericValue = Number(nextValue);
	if (!Number.isFinite(numericValue)) {
		return;
	}

	const normalizedValue = snap
		? snapStandardFrameEquivalentMm(numericValue)
		: clampStandardFrameEquivalentMm(Math.round(numericValue));
	setBaseFov?.(
		getBaseHorizontalFovDegreesForStandardFrameEquivalentMm(normalizedValue),
	);
}

function renderHeader({
	t,
	compact = false,
	collapsed = false,
	onToggleCollapse,
}) {
	const buildVersionLabel = getBuildVersionLabel();
	const buildCommitLabel = getBuildCommitLabel();
	const codeStampLabel = getCodeStampLabel();

	return html`
		<header class=${compact ? "panel-header panel-header--compact" : "panel-header"}>
			<div class="panel-header__title-row">
				<h1>CAMERA_FRAMES</h1>
				<button
					type="button"
					class="workbench-collapse-toggle"
					aria-label=${
						collapsed
							? t("action.expandWorkbench")
							: t("action.collapseWorkbench")
					}
					onClick=${onToggleCollapse}
				>
					${collapsed ? ">" : "<"}
				</button>
			</div>
			<div class="build-meta build-meta--header">
				<span class="pill pill--dim">${buildVersionLabel}</span>
				${buildCommitLabel && html`<code class="build-commit">${buildCommitLabel}</code>`}
				${codeStampLabel && html`<code class="build-commit">${codeStampLabel}</code>`}
			</div>
		</header>
	`;
}

function renderViewSection({
	controller,
	mode,
	modeLabel,
	selectedSceneAsset,
	store,
	t,
	viewportEquivalentMmLabel,
	viewportEquivalentMmValue,
	viewportFovLabel,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.view")}</h2>
				<span id="mode-pill" class="pill">${modeLabel}</span>
			</div>
			<div class="button-row">
				<button
					id="mode-camera"
					class=${mode === "camera" ? "button button--primary" : "button"}
					type="button"
					onClick=${() => controller()?.setMode("camera")}
				>
					${t("mode.camera")}
				</button>
				<button
					id="mode-viewport"
					class=${mode === "viewport" ? "button button--primary" : "button"}
					type="button"
					onClick=${() => controller()?.setMode("viewport")}
				>
					${t("mode.viewport")}
				</button>
			</div>
			${
				mode === "camera" &&
				html`
					<label class="field field--range">
						<span>${t("field.cameraViewZoom")}</span>
						<div class="range-row">
							<${HistoryRangeInput}
								id="view-zoom"
								min=${MIN_CAMERA_VIEW_ZOOM_PCT}
								max=${MAX_CAMERA_VIEW_ZOOM_PCT}
								step="1"
								value=${Math.round(store.renderBox.viewZoom.value * 100)}
								controller=${controller}
								historyLabel="output-frame.zoom"
								onLiveChange=${(event) =>
									controller()?.setViewZoomPercent(event.currentTarget.value)}
							/>
							<output id="view-zoom-value">${store.zoomLabel.value}</output>
						</div>
					</label>
				`
			}
			${
				mode === "viewport" &&
				html`
					<label class="field field--range">
						<span>${t("field.viewportEquivalentMm")}</span>
						<div class="range-row">
							<${HistoryRangeInput}
								id="viewport-fov-mm"
								min=${MIN_STANDARD_FRAME_EQUIVALENT_MM}
								max=${MAX_STANDARD_FRAME_EQUIVALENT_MM}
								step="1"
								value=${viewportEquivalentMmValue}
								controller=${controller}
								historyLabel="viewport.lens"
								onLiveChange=${(event) =>
									applyStandardFrameEquivalentMm(
										(nextValue) => controller()?.setViewportBaseFovX(nextValue),
										event.currentTarget.value,
										{
											snap: true,
										},
									)}
							/>
							<div class="numeric-unit">
								<${NumericDraftInput}
									id="viewport-fov-mm-input"
									inputMode="numeric"
									min=${MIN_STANDARD_FRAME_EQUIVALENT_MM}
									max=${MAX_STANDARD_FRAME_EQUIVALENT_MM}
									step="1"
									value=${viewportEquivalentMmValue}
									onCommit=${(nextValue) =>
										applyStandardFrameEquivalentMm(
											(nextBaseFov) =>
												controller()?.setViewportBaseFovX(nextBaseFov),
											nextValue,
										)}
								/>
								<span>mm</span>
							</div>
						</div>
						<p class="summary">
							${t("field.viewportFov")} · ${viewportFovLabel} (${viewportEquivalentMmLabel})
						</p>
					</label>
					${html`
							<div class="field">
								<span>${t("field.transformMode")}</span>
								<div class="button-row">
									<button
										type="button"
										class=${
											store.viewportSelectMode.value
												? "button button--primary button--compact"
												: "button button--compact"
										}
										onClick=${() => controller()?.setViewportSelectMode(true)}
									>
										${t("transformMode.select")}
									</button>
									<button
										type="button"
										class=${
											!store.viewportSelectMode.value &&
											!store.viewportPivotEditMode.value
												? "button button--primary button--compact"
												: "button button--compact"
										}
										onClick=${() => {
											controller()?.setViewportSelectMode(false);
											controller()?.setViewportPivotEditMode(false);
										}}
									>
										${t("transformMode.transform")}
									</button>
									<button
										type="button"
										disabled=${!selectedSceneAsset}
										class=${
											store.viewportPivotEditMode.value
												? "button button--primary button--compact"
												: "button button--compact"
										}
										onClick=${() =>
											controller()?.setViewportPivotEditMode(true)}
									>
										${t("transformMode.pivot")}
									</button>
								</div>
							</div>
						`}
					${
						selectedSceneAsset &&
						!store.viewportSelectMode.value &&
						html`
							<div class="field">
								<span>${t("field.transformSpace")}</span>
								<div class="button-row">
									<button
										type="button"
										class=${
											store.viewportTransformSpace.value === "world"
												? "button button--primary button--compact"
												: "button button--compact"
										}
										onClick=${() =>
											controller()?.setViewportTransformSpace("world")}
									>
										${t("transformSpace.world")}
									</button>
									<button
										type="button"
										class=${
											store.viewportTransformSpace.value === "local"
												? "button button--primary button--compact"
												: "button button--compact"
										}
										onClick=${() =>
											controller()?.setViewportTransformSpace("local")}
									>
										${t("transformSpace.local")}
									</button>
								</div>
							</div>
							<div class="field">
								<div class="button-row">
									<button
										type="button"
										class="button button--compact"
										disabled=${!selectedSceneAsset.hasWorkingPivot}
										onClick=${() =>
											controller()?.resetSelectedAssetWorkingPivot()}
									>
										${t("action.resetPivot")}
									</button>
								</div>
							</div>
						`
					}
				`
			}
		</section>
	`;
}

function renderSceneSection({
	controller,
	sceneAssets,
	sceneBadge,
	sceneScaleSummary,
	sceneSummary,
	sceneUnitBadge,
	selectedSceneAsset,
	store,
	t,
	draggedAssetId,
	setDraggedAssetId,
	dragHoverState,
	setDragHoverState,
}) {
	const sceneAssetSections = groupSceneAssetsByKind(sceneAssets);
	const selectedSceneAssetIds = new Set(store.selectedSceneAssetIds.value);
	const getSceneAssetById = (assetId) =>
		sceneAssets.find((asset) => asset.id === assetId) ?? null;
	const getDropPosition = (event) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
	};
	const getDropTargetKindIndex = (draggedAsset, targetAsset, position) => {
		if (
			!draggedAsset ||
			!targetAsset ||
			draggedAsset.kind !== targetAsset.kind
		) {
			return null;
		}
		const currentKindIndex = draggedAsset.kindOrderIndex - 1;
		const targetKindIndex = targetAsset.kindOrderIndex - 1;
		if (position === "before") {
			return currentKindIndex < targetKindIndex
				? targetKindIndex - 1
				: targetKindIndex;
		}
		return currentKindIndex < targetKindIndex
			? targetKindIndex
			: targetKindIndex + 1;
	};
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
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.scene")}</h2>
				<div class="pill-row">
					<span id="scene-unit-pill" class="pill pill--dim">${sceneUnitBadge}</span>
					<span id="scene-badge" class="pill pill--dim">${sceneBadge}</span>
				</div>
			</div>
			<div class="button-row">
				<button
					id="open-files"
					class="button button--primary"
					type="button"
					onClick=${() => controller()?.openFiles()}
				>
					${t("action.openFiles")}
				</button>
				<button
					id="clear-scene"
					class="button"
					type="button"
					onClick=${() => controller()?.clearScene()}
				>
					${t("action.clear")}
				</button>
			</div>
			<label class="field">
				<span>${t("field.remoteUrl")}</span>
				<input
					id="url-input"
					type="text"
					placeholder="https://.../scene.spz or model.glb"
					value=${store.remoteUrl.value}
					...${INTERACTIVE_FIELD_PROPS}
					onInput=${(event) => {
						store.remoteUrl.value = event.currentTarget.value;
					}}
					onKeyDown=${(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							controller()?.loadRemoteUrls();
						}
					}}
				/>
			</label>
			<button
				id="load-url"
				class="button button--wide"
				type="button"
				onClick=${() => controller()?.loadRemoteUrls()}
			>
				${t("action.loadUrl")}
			</button>
			<p id="scene-summary" class="summary">${sceneSummary}</p>
			<p id="scene-scale-summary" class="summary">${sceneScaleSummary}</p>
			${
				sceneAssets.length > 0 &&
				html`
					<div class="scene-asset-section-list">
						${sceneAssetSections.map(
							(section) => html`
								<section class="scene-asset-section">
									<div class="section-heading scene-asset-section__heading">
										<h2>${t(section.assets[0].kindLabelKey)}</h2>
										<span class="pill pill--dim">${section.assets.length}</span>
									</div>
									<div class="scene-asset-list">
										${section.assets.map(
											(asset) => html`
												<article
													class=${getSceneAssetRowClass(asset)}
													draggable="true"
													onClick=${(event) =>
														controller()?.selectSceneAsset(asset.id, {
															additive:
																event.shiftKey ||
																event.ctrlKey ||
																event.metaKey,
															toggle:
																event.shiftKey ||
																event.ctrlKey ||
																event.metaKey,
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
															draggedAssetId ??
																Number(
																	event.dataTransfer.getData("text/plain"),
																),
														);
														if (draggedAsset?.kind !== asset.kind) {
															return;
														}
														event.preventDefault();
														event.dataTransfer.dropEffect = "move";
														setDragHoverState({
															assetId: asset.id,
															position: getDropPosition(event),
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
														const draggedAsset = getSceneAssetById(draggedId);
														const dropPosition = getDropPosition(event);
														if (
															!Number.isFinite(draggedId) ||
															draggedId === asset.id ||
															draggedAsset?.kind !== asset.kind
														) {
															setDraggedAssetId(null);
															setDragHoverState(null);
															return;
														}
														const targetKindIndex = getDropTargetKindIndex(
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
														<span class="scene-asset-row__handle">≡</span>
														<div class="scene-asset-row__title-group">
															<strong>${asset.label}</strong>
															<span class="scene-asset-row__meta">
																#${asset.kindOrderIndex} ·
																${formatAssetWorldScale(asset.worldScale)}
															</span>
														</div>
													</div>
													<div class="scene-asset-row__toolbar">
														<button
															class="button button--compact"
															type="button"
															onClick=${(event) => {
																event.stopPropagation();
																controller()?.selectSceneAsset(asset.id);
																controller()?.setAssetVisibility(
																	asset.id,
																	!asset.visible,
																);
															}}
														>
															${
																asset.visible
																	? t("action.hideAsset")
																	: t("action.showAsset")
															}
														</button>
													</div>
												</article>
											`,
										)}
									</div>
								</section>
							`,
						)}
					</div>
				`
			}
			${
				selectedSceneAsset &&
				html`
					<section class="scene-asset-inspector">
						<div class="section-heading">
							<h2>${selectedSceneAsset.label}</h2>
							<span class="pill pill--dim">${t(selectedSceneAsset.kindLabelKey)}</span>
						</div>
						<div class="button-row">
							<button
								class="button button--compact"
								type="button"
								onClick=${() =>
									controller()?.setAssetVisibility(
										selectedSceneAsset.id,
										!selectedSceneAsset.visible,
									)}
							>
								${
									selectedSceneAsset.visible
										? t("action.hideAsset")
										: t("action.showAsset")
								}
							</button>
							<button
								class="button button--compact"
								type="button"
								onClick=${() =>
									controller()?.resetAssetWorldScale(selectedSceneAsset.id)}
							>
								${t("action.resetScale")}
							</button>
						</div>
						<label class="field">
							<span>${t("field.assetScale")}</span>
							<${NumericDraftInput}
								inputMode="decimal"
								min="0.01"
								step="0.01"
								value=${Number(selectedSceneAsset.worldScale).toFixed(2)}
								onCommit=${(nextValue) =>
									controller()?.setAssetWorldScale(
										selectedSceneAsset.id,
										nextValue,
									)}
							/>
						</label>
						<div class="triple-field-row">
							<label class="field">
								<span>${t("field.assetPosition")} X</span>
								<${NumericDraftInput}
									inputMode="decimal"
									step="0.01"
									value=${Number(selectedSceneAsset.position.x).toFixed(2)}
									onCommit=${(nextValue) =>
										controller()?.setAssetPosition(
											selectedSceneAsset.id,
											"x",
											nextValue,
										)}
								/>
							</label>
							<label class="field">
								<span>${t("field.assetPosition")} Y</span>
								<${NumericDraftInput}
									inputMode="decimal"
									step="0.01"
									value=${Number(selectedSceneAsset.position.y).toFixed(2)}
									onCommit=${(nextValue) =>
										controller()?.setAssetPosition(
											selectedSceneAsset.id,
											"y",
											nextValue,
										)}
								/>
							</label>
							<label class="field">
								<span>${t("field.assetPosition")} Z</span>
								<${NumericDraftInput}
									inputMode="decimal"
									step="0.01"
									value=${Number(selectedSceneAsset.position.z).toFixed(2)}
									onCommit=${(nextValue) =>
										controller()?.setAssetPosition(
											selectedSceneAsset.id,
											"z",
											nextValue,
										)}
								/>
							</label>
						</div>
						<div class="triple-field-row">
							<label class="field">
								<span>${t("field.assetRotation")} X</span>
								<${NumericDraftInput}
									inputMode="numeric"
									step="1"
									value=${Number(selectedSceneAsset.rotationDegrees.x).toFixed(0)}
									onCommit=${(nextValue) =>
										controller()?.setAssetRotationDegrees(
											selectedSceneAsset.id,
											"x",
											nextValue,
										)}
								/>
							</label>
							<label class="field">
								<span>${t("field.assetRotation")} Y</span>
								<${NumericDraftInput}
									inputMode="numeric"
									step="1"
									value=${Number(selectedSceneAsset.rotationDegrees.y).toFixed(0)}
									onCommit=${(nextValue) =>
										controller()?.setAssetRotationDegrees(
											selectedSceneAsset.id,
											"y",
											nextValue,
										)}
								/>
							</label>
							<label class="field">
								<span>${t("field.assetRotation")} Z</span>
								<${NumericDraftInput}
									inputMode="numeric"
									step="1"
									value=${Number(selectedSceneAsset.rotationDegrees.z).toFixed(0)}
									onCommit=${(nextValue) =>
										controller()?.setAssetRotationDegrees(
											selectedSceneAsset.id,
											"z",
											nextValue,
										)}
								/>
							</label>
						</div>
					</section>
				`
			}
		</section>
	`;
}

function renderShotCameraSection({
	activeShotCamera,
	cameraSummary,
	controller,
	equivalentMmLabel,
	equivalentMmValue,
	fovLabel,
	shotCameraClipMode,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.shotCamera")}</h2>
				<div class="pill-row">
					<span class="pill pill--dim">${t("badge.horizontalFov")}</span>
					<span class="pill pill--dim">${t("badge.clipRange")}</span>
				</div>
			</div>
			<label class="field">
				<span>${t("field.activeShotCamera")}</span>
				<select
					id="active-shot-camera"
					value=${store.workspace.activeShotCameraId.value}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.selectShotCamera(event.currentTarget.value)}
				>
					${store.workspace.shotCameras.value.map(
						(shotCamera) => html`
							<option value=${shotCamera.id}>${shotCamera.name}</option>
						`,
					)}
				</select>
			</label>
			<div class="button-row">
				<button
					id="new-shot-camera"
					class="button"
					type="button"
					onClick=${() => controller()?.createShotCamera()}
				>
					${t("action.newShotCamera")}
				</button>
				<button
					id="duplicate-shot-camera"
					class="button"
					type="button"
					onClick=${() => controller()?.duplicateActiveShotCamera()}
				>
					${t("action.duplicateShotCamera")}
				</button>
			</div>
			<label class="field field--range">
				<span>${t("field.shotCameraEquivalentMm")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="fov-mm"
						min=${MIN_STANDARD_FRAME_EQUIVALENT_MM}
						max=${MAX_STANDARD_FRAME_EQUIVALENT_MM}
						step="1"
						value=${equivalentMmValue}
						controller=${controller}
						historyLabel="camera.lens"
						onLiveChange=${(event) =>
							applyStandardFrameEquivalentMm(
								(nextValue) => controller()?.setBaseFovX(nextValue),
								event.currentTarget.value,
								{
									snap: true,
								},
							)}
					/>
					<div class="numeric-unit">
						<${NumericDraftInput}
							id="fov-mm-input"
							inputMode="numeric"
							min=${MIN_STANDARD_FRAME_EQUIVALENT_MM}
							max=${MAX_STANDARD_FRAME_EQUIVALENT_MM}
							step="1"
							value=${equivalentMmValue}
							onCommit=${(nextValue) =>
								applyStandardFrameEquivalentMm(
									(nextBaseFov) => controller()?.setBaseFovX(nextBaseFov),
									nextValue,
								)}
						/>
						<span>mm</span>
					</div>
				</div>
				<p class="summary">${t("field.shotCameraFov")} · ${fovLabel} (${equivalentMmLabel})</p>
			</label>
			<label class="field">
				<span>${t("field.shotCameraClipMode")}</span>
				<select
					id="shot-camera-clip-mode"
					value=${shotCameraClipMode}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setShotCameraClippingMode(event.currentTarget.value)}
				>
					<option value="auto">${t("clipMode.auto")}</option>
					<option value="manual">${t("clipMode.manual")}</option>
				</select>
			</label>
				<div class="split-field-row">
					<label class="field">
						<span>${t("field.shotCameraNear")}</span>
					<${NumericDraftInput}
						id="shot-camera-near"
						inputMode="decimal"
						min="0.1"
						step="0.1"
						value=${Number(store.shotCamera.near.value).toFixed(2)}
						onCommit=${(nextValue) =>
							controller()?.setShotCameraNear(nextValue)}
					/>
					</label>
					<label class="field">
						<span>${t("field.shotCameraFar")}</span>
					<${NumericDraftInput}
						id="shot-camera-far"
						inputMode="decimal"
						min="0.1"
						step="0.1"
						value=${Number(store.shotCamera.far.value).toFixed(2)}
						disabled=${shotCameraClipMode !== "manual"}
						onCommit=${(nextValue) => controller()?.setShotCameraFar(nextValue)}
					/>
					</label>
				</div>
			<div class="button-row">
				<button
					id="copy-viewport-to-shot"
					class="button"
					type="button"
					onClick=${() => controller()?.copyViewportToShotCamera()}
				>
					${t("action.viewportToShot")}
				</button>
				<button
					id="copy-shot-to-viewport"
					class="button"
					type="button"
					onClick=${() => controller()?.copyShotCameraToViewport()}
				>
					${t("action.shotToViewport")}
				</button>
				<button
					id="reset-active-view"
					class="button"
					type="button"
					onClick=${() => controller()?.resetActiveView()}
				>
					${t("action.resetActive")}
				</button>
			</div>
			<p id="camera-summary" class="summary">${cameraSummary}</p>
		</section>
	`;
}

function renderExportSettingsSection({
	activeShotCamera,
	controller,
	exportFormat,
	exportGridLayerMode,
	exportGridOverlay,
	exportModelLayers,
	exportSplatLayers,
	store,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.exportSettings")}</h2>
				<span class="pill pill--dim">${t(`exportFormat.${exportFormat}`)}</span>
			</div>
			<label class="field">
				<span>${t("field.shotCameraExportName")}</span>
				<input
					id="shot-camera-export-name"
					type="text"
					placeholder=${activeShotCamera?.name ?? "Camera"}
					value=${store.shotCamera.exportName.value}
					...${INTERACTIVE_FIELD_PROPS}
					onInput=${(event) =>
						controller()?.setShotCameraExportName(event.currentTarget.value)}
				/>
			</label>
			<label class="field">
				<span>${t("field.exportFormat")}</span>
				<select
					id="shot-camera-export-format"
					value=${exportFormat}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setShotCameraExportFormat(event.currentTarget.value)}
				>
					<option value="png">${t("exportFormat.png")}</option>
					<option value="psd">${t("exportFormat.psd")}</option>
				</select>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-grid-overlay"
					type="checkbox"
					checked=${exportGridOverlay}
					onChange=${(event) =>
						controller()?.setShotCameraExportGridOverlay(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportGridOverlay")}</span>
			</label>
			<label class="field">
				<span>${t("field.exportGridLayerMode")}</span>
				<select
					id="shot-camera-export-grid-layer-mode"
					value=${exportGridLayerMode}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setShotCameraExportGridLayerMode(
							event.currentTarget.value,
						)}
				>
					<option value="bottom">${t("gridLayerMode.bottom")}</option>
					<option value="overlay">${t("gridLayerMode.overlay")}</option>
				</select>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-model-layers"
					type="checkbox"
					checked=${exportModelLayers}
					disabled=${exportFormat !== "psd"}
					onChange=${(event) =>
						controller()?.setShotCameraExportModelLayers(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportModelLayers")}</span>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-splat-layers"
					type="checkbox"
					checked=${exportSplatLayers}
					disabled=${exportFormat !== "psd" || !exportModelLayers}
					onChange=${(event) =>
						controller()?.setShotCameraExportSplatLayers(
							event.currentTarget.checked,
						)}
				/>
				<span>${t("field.exportSplatLayers")}</span>
			</label>
		</section>
	`;
}

function renderFramesSection({
	activeFrameId,
	controller,
	frameCount,
	frameDocuments,
	frameLimitReached,
	t,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.frames")}</h2>
				<span class="pill pill--dim">${frameCount} / ${FRAME_MAX_COUNT}</span>
			</div>
			${
				frameDocuments.length > 0
					? html`
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
						<div class="button-row">
							<button
								id="new-frame"
								class="button"
								type="button"
								disabled=${frameLimitReached}
								onClick=${() => controller()?.createFrame()}
							>
								${t("action.newFrame")}
							</button>
							<button
								id="duplicate-frame"
								class="button"
								type="button"
								disabled=${frameLimitReached}
								onClick=${() => controller()?.duplicateActiveFrame()}
							>
								${t("action.duplicateFrame")}
							</button>
							<button
								id="delete-frame"
								class="button"
								type="button"
								onClick=${() => controller()?.deleteActiveFrame()}
							>
								${t("action.deleteFrame")}
							</button>
						</div>
					`
					: html`
						<div class="button-row">
							<button
								id="new-frame"
								class="button"
								type="button"
								onClick=${() => controller()?.createFrame()}
							>
								${t("action.newFrame")}
							</button>
						</div>
					`
			}
		</section>
	`;
}

function renderOutputFrameSection({
	anchorOptions,
	controller,
	exportSizeLabel,
	heightLabel,
	store,
	t,
	widthLabel,
}) {
	return html`
		<section class="panel-section">
			<div class="section-heading">
				<h2>${t("section.outputFrame")}</h2>
				<span id="export-size-pill" class="pill pill--dim">${exportSizeLabel}</span>
			</div>
			<label class="field field--range">
				<span>${t("field.outputFrameWidth")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="box-width"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_WIDTH_PCT}
						step="1"
						value=${Math.round(store.renderBox.widthScale.value * 100)}
						controller=${controller}
						historyLabel="output-frame.width"
						onLiveChange=${(event) =>
							controller()?.setBoxWidthPercent(event.currentTarget.value)}
					/>
					<output id="box-width-value">${widthLabel}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${t("field.outputFrameHeight")}</span>
				<div class="range-row">
					<${HistoryRangeInput}
						id="box-height"
						min=${MIN_OUTPUT_FRAME_SCALE_PCT}
						max=${MAX_OUTPUT_FRAME_HEIGHT_PCT}
						step="1"
						value=${Math.round(store.renderBox.heightScale.value * 100)}
						controller=${controller}
						historyLabel="output-frame.height"
						onLiveChange=${(event) =>
							controller()?.setBoxHeightPercent(event.currentTarget.value)}
					/>
					<output id="box-height-value">${heightLabel}</output>
				</div>
			</label>
			<label class="field">
				<span>${t("field.anchor")}</span>
				<select
					id="anchor-select"
					value=${store.renderBox.anchor.value}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) => controller()?.setAnchor(event.currentTarget.value)}
				>
					${anchorOptions.map(
						(option) =>
							html`<option value=${option.value}>${option.label}</option>`,
					)}
				</select>
			</label>
		</section>
	`;
}

function renderExportSection({
	controller,
	exportBusy,
	exportFormatLabel,
	exportPresetIds,
	exportSelectionMissing,
	exportStatusLabel,
	exportTarget,
	store,
	t,
}) {
	const exportStatusClass =
		exportBusy || exportStatusLabel !== t("export.idle")
			? "pill"
			: "pill pill--dim";

	return html`
		<section class="panel-section panel-section--preview">
			<div class="section-heading">
				<h2>${t("section.export")}</h2>
				<span id="export-status-pill" class=${exportStatusClass}>
					${exportStatusLabel}
				</span>
			</div>
			<label class="field">
				<span>${t("field.exportTarget")}</span>
				<select
					id="export-target"
					value=${exportTarget}
					...${INTERACTIVE_FIELD_PROPS}
					onChange=${(event) =>
						controller()?.setExportTarget(event.currentTarget.value)}
				>
					<option value="current">${t("exportTarget.current")}</option>
					<option value="all">${t("exportTarget.all")}</option>
					<option value="selected">${t("exportTarget.selected")}</option>
				</select>
			</label>
			${
				exportTarget === "selected" &&
				html`
					<div class="export-selection-list">
						${store.workspace.shotCameras.value.map(
							(shotCamera) => html`
								<label class="export-selection-item">
									<input
										type="checkbox"
										checked=${exportPresetIds.includes(shotCamera.id)}
										onChange=${() =>
											controller()?.toggleExportPreset(shotCamera.id)}
									/>
									<span class="export-selection-item__name">${shotCamera.name}</span>
									<span class="export-selection-item__meta">
										${
											shotCamera.exportSettings?.exportName?.trim() ||
											shotCamera.name
										}
									</span>
								</label>
							`,
						)}
					</div>
				`
			}
			<div class="button-row">
				<button
					id="download-output"
					class="button button--primary"
					type="button"
					disabled=${exportBusy || exportSelectionMissing}
					onClick=${() => controller()?.downloadOutput()}
					>
						${t("action.downloadOutput")}
					</button>
				</div>
			<p id="export-summary" class="summary">
				${exportFormatLabel} · ${store.exportSummary.value}
			</p>
		</section>
	`;
}

function renderFooter({ store }) {
	return html`
		<footer class="panel-footer">
			<p id="status-line" class="status-line">${store.statusLine.value}</p>
		</footer>
	`;
}

function renderInspectorTabs({ activeTab, setActiveTab, t }) {
	const tabs = [
		{ id: INSPECTOR_TAB_CAMERA, label: t("section.shotCamera") },
		{ id: INSPECTOR_TAB_EXPORT, label: t("section.export") },
	];

	return html`
		<div class="workbench-tabs" role="tablist" aria-label=${t("section.export")}>
			${tabs.map(
				(tab) => html`
					<button
						type="button"
						role="tab"
						aria-selected=${activeTab === tab.id}
						class=${
							activeTab === tab.id
								? "workbench-tab workbench-tab--active"
								: "workbench-tab"
						}
						onClick=${() => setActiveTab(tab.id)}
					>
						${tab.label}
					</button>
				`,
			)}
		</div>
	`;
}

export function SidePanel({ store, controller, locale, t, refs }) {
	const [activeInspectorTab, setActiveInspectorTab] =
		useState(INSPECTOR_TAB_CAMERA);
	const [draggedAssetId, setDraggedAssetId] = useState(null);
	const [dragHoverState, setDragHoverState] = useState(null);
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const mode = store.mode.value;
	const modeLabel = store.modeLabel.value;
	const sceneUnitBadge = store.sceneUnitBadge.value;
	const sceneBadge = store.sceneBadge.value;
	const sceneSummary = store.sceneSummary.value;
	const sceneScaleSummary = store.sceneScaleSummary.value;
	const sceneAssets = store.sceneAssets.value;
	const selectedSceneAsset = store.selectedSceneAsset.value;
	const activeShotCamera = store.workspace.activeShotCamera.value;
	const shotCameraClipMode = store.shotCamera.clippingMode.value;
	const exportFormat = store.shotCamera.exportFormat.value;
	const exportGridOverlay = store.shotCamera.exportGridOverlay.value;
	const exportGridLayerMode = store.shotCamera.exportGridLayerMode.value;
	const exportModelLayers = store.shotCamera.exportModelLayers.value;
	const exportSplatLayers = store.shotCamera.exportSplatLayers.value;
	const cameraSummary = store.cameraSummary.value;
	const fovLabel = store.fovLabel.value;
	const equivalentMmValue = store.equivalentMmValue.value;
	const equivalentMmLabel = store.equivalentMmLabel.value;
	const viewportFovLabel = store.viewportFovLabel.value;
	const viewportEquivalentMmValue = store.viewportEquivalentMmValue.value;
	const viewportEquivalentMmLabel = store.viewportEquivalentMmLabel.value;
	const frameDocuments = store.frames.documents.value;
	const activeFrameId = store.frames.activeId.value;
	const frameCount = store.frames.count.value;
	const frameLimitReached = frameCount >= FRAME_MAX_COUNT;
	const exportSizeLabel = store.exportSizeLabel.value;
	const widthLabel = store.widthLabel.value;
	const heightLabel = store.heightLabel.value;
	const exportBusy = store.exportBusy.value;
	const exportStatusLabel = store.exportStatusLabel.value;
	const exportTarget = store.exportOptions.target.value;
	const exportPresetIds = store.exportOptions.presetIds.value;
	const exportFormatLabel =
		exportTarget === "current"
			? t(`exportFormat.${exportFormat}`)
			: t("field.exportFormat");
	const exportSelectionMissing =
		exportTarget === "selected" && exportPresetIds.length === 0;
	const anchorOptions = getAnchorOptions(locale);
	const workbenchAutoCollapsed = store.workbenchAutoCollapsed.value;
	const collapseWorkbench = () => {
		store.workbenchManualCollapsed.value = true;
		store.workbenchManualExpanded.value = false;
	};
	const expandWorkbench = () => {
		store.workbenchManualCollapsed.value = false;
		store.workbenchManualExpanded.value = workbenchAutoCollapsed;
	};
	const toggleWorkbenchCollapsed = () => {
		if (workbenchCollapsed) {
			expandWorkbench();
			return;
		}
		collapseWorkbench();
	};

	if (workbenchCollapsed) {
		return html`
			<div class="workbench-collapse-chip-wrap">
				<button
					type="button"
					class="workbench-collapse-chip"
					aria-label=${t("action.expandWorkbench")}
					onClick=${toggleWorkbenchCollapsed}
				>
					<span class="workbench-collapse-chip__title">CAMERA_FRAMES</span>
					<span class="workbench-collapse-chip__icon">></span>
				</button>
			</div>
		`;
	}

	return html`
		<div class="workbench-shell" ref=${refs?.workbenchShellRef}>
			<div
				class="workbench-column workbench-column--left"
				ref=${refs?.workbenchLeftColumnRef}
			>
				<section class="workbench-card workbench-card--topbar">
					${renderHeader({
						t,
						compact: true,
						collapsed: false,
						onToggleCollapse: toggleWorkbenchCollapsed,
					})}
					${renderViewSection({
						controller,
						mode,
						modeLabel,
						selectedSceneAsset,
						store,
						t,
						viewportEquivalentMmLabel,
						viewportEquivalentMmValue,
						viewportFovLabel,
					})}
					${renderFooter({ store })}
				</section>
				<section class="workbench-card workbench-card--scene">
					${renderSceneSection({
						controller,
						sceneAssets,
						sceneBadge,
						sceneScaleSummary,
						sceneSummary,
						sceneUnitBadge,
						selectedSceneAsset,
						store,
						t,
						draggedAssetId,
						setDraggedAssetId,
						dragHoverState,
						setDragHoverState,
					})}
				</section>
			</div>
			<div
				class="workbench-column workbench-column--right"
				ref=${refs?.workbenchRightColumnRef}
			>
				<section class="workbench-card workbench-card--inspector">
					${renderInspectorTabs({
						activeTab: activeInspectorTab,
						setActiveTab: setActiveInspectorTab,
						t,
					})}
					<div class="workbench-inspector-stack">
						${
							activeInspectorTab === INSPECTOR_TAB_CAMERA &&
							html`
								${renderShotCameraSection({
									activeShotCamera,
									cameraSummary,
									controller,
									equivalentMmLabel,
									equivalentMmValue,
									fovLabel,
									shotCameraClipMode,
									store,
									t,
								})}
								${renderOutputFrameSection({
									anchorOptions,
									controller,
									exportSizeLabel,
									heightLabel,
									store,
									t,
									widthLabel,
								})}
								${renderFramesSection({
									activeFrameId,
									controller,
									frameCount,
									frameDocuments,
									frameLimitReached,
									t,
								})}
							`
						}
						${
							activeInspectorTab === INSPECTOR_TAB_EXPORT &&
							html`
								${renderExportSettingsSection({
									activeShotCamera,
									controller,
									exportFormat,
									exportGridLayerMode,
									exportGridOverlay,
									exportModelLayers,
									exportSplatLayers,
									store,
									t,
								})}
								${renderExportSection({
									controller,
									exportBusy,
									exportFormatLabel,
									exportPresetIds,
									exportSelectionMissing,
									exportStatusLabel,
									exportTarget,
									store,
									t,
								})}
							`
						}
					</div>
				</section>
			</div>
		</div>
	`;
}
