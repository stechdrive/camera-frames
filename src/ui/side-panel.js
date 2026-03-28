import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { FRAME_MAX_COUNT } from "../constants.js";
import { getAnchorOptions } from "../i18n.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import { HeaderMenu } from "./workbench-primitives.js";
import {
	ExportSection,
	ExportSettingsSection,
	FooterSection,
	FramesSection,
	INSPECTOR_TAB_CAMERA,
	INSPECTOR_TAB_EXPORT,
	INSPECTOR_TAB_SCENE,
	InspectorRailSection,
	InspectorTabs,
	LightingSection,
	OutputFrameSection,
	ReferenceSection,
	SceneSection,
	ShotCameraSection,
	ToolRailSection,
	ViewSettingsSection,
	getInspectorTabs,
} from "./workbench-sections.js";

function clampToolRailPosition({ x, y }, shellElement, railElement) {
	if (!shellElement || !railElement) {
		return { x, y };
	}
	const maxX = Math.max(0, shellElement.clientWidth - railElement.offsetWidth);
	const maxY = Math.max(
		0,
		shellElement.clientHeight - railElement.offsetHeight,
	);
	return {
		x: Math.min(Math.max(0, x), maxX),
		y: Math.min(Math.max(0, y), maxY),
	};
}

export function SidePanel({ store, controller, locale, t, refs }) {
	const [activeInspectorTab, setActiveInspectorTab] =
		useState(INSPECTOR_TAB_CAMERA);
	const [inspectorPeekTab, setInspectorPeekTab] = useState(null);
	const [draggedAssetId, setDraggedAssetId] = useState(null);
	const [dragHoverState, setDragHoverState] = useState(null);
	const [toolRailPosition, setToolRailPosition] = useState({ x: 0, y: 0 });
	const [toolRailDragging, setToolRailDragging] = useState(false);
	const toolRailRef = useRef(null);
	const toolRailDragStateRef = useRef(null);
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const mode = store.mode.value;
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
	const inspectorTabs = getInspectorTabs(t);
	const peekInspectorTabDefinition =
		inspectorTabs.find((tab) => tab.id === inspectorPeekTab) ?? null;
	const collapseWorkbench = () => {
		store.workbenchManualCollapsed.value = true;
		store.workbenchManualExpanded.value = false;
	};
	const expandWorkbench = () => {
		store.workbenchManualCollapsed.value = false;
		store.workbenchManualExpanded.value = workbenchAutoCollapsed;
	};
	const openInspectorFull = (tabId = activeInspectorTab) => {
		if (tabId) {
			setActiveInspectorTab(tabId);
		}
		setInspectorPeekTab(null);
		expandWorkbench();
	};
	const toggleInspectorPeek = (tabId) => {
		setActiveInspectorTab(tabId);
		setInspectorPeekTab((currentTabId) =>
			currentTabId === tabId ? null : tabId,
		);
	};
	const projectMenuItems = [
		{
			id: "open-project",
			icon: "folder-open",
			label: t("action.openProject"),
			onClick: () => controller()?.openProject(),
		},
		{
			id: "open-working-project",
			icon: "folder-open",
			label: t("action.openWorkingProject"),
			onClick: () => controller()?.openWorkingProject(),
		},
		{
			id: "save-project",
			icon: "save",
			label: t("action.saveProject"),
			onClick: () => controller()?.saveProject(),
		},
		{
			id: "export-project",
			icon: "package",
			label: t("action.exportProject"),
			onClick: () => controller()?.exportProject(),
		},
		{
			id: "clear-scene",
			icon: "trash",
			label: t("action.clear"),
			destructive: true,
			onClick: () => controller()?.clearScene(),
		},
	];
	const fileMenuChildren = html`
		<div class="workbench-menu__group">
			<button
				id="open-files"
				type="button"
				class="workbench-menu__item"
				onClick=${() => controller()?.openFiles()}
			>
				<span class="workbench-menu__item-icon">
					<${WorkbenchIcon} name="folder-open" size=${14} />
				</span>
				<span>${t("action.openFiles")}</span>
			</button>
			<div class="workbench-menu__field">
				<label for="header-url-input">${t("field.remoteUrl")}</label>
				<input
					id="header-url-input"
					type="text"
					placeholder="https://.../scene.spz or model.glb"
					value=${store.remoteUrl.value}
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
			</div>
			<button
				id="load-url"
				type="button"
				class="workbench-menu__item"
				onClick=${() => controller()?.loadRemoteUrls()}
			>
				<span class="workbench-menu__item-icon">
					<${WorkbenchIcon} name="folder-open" size=${14} />
				</span>
				<span>${t("action.loadUrl")}</span>
			</button>
		</div>
	`;

	useEffect(() => {
		if (!workbenchCollapsed) {
			setInspectorPeekTab(null);
		}
		return undefined;
	}, [workbenchCollapsed]);

	useEffect(() => {
		if (workbenchCollapsed) {
			return undefined;
		}
		const shellElement = refs?.workbenchShellRef?.current ?? null;
		const railElement = toolRailRef.current;
		if (!shellElement || !railElement) {
			return undefined;
		}
		const syncWithinBounds = () => {
			setToolRailPosition((currentPosition) =>
				clampToolRailPosition(currentPosition, shellElement, railElement),
			);
		};
		syncWithinBounds();
		window.addEventListener("resize", syncWithinBounds);
		return () => {
			window.removeEventListener("resize", syncWithinBounds);
		};
	}, [refs, workbenchCollapsed]);

	const handleToolRailPointerDown = (event) => {
		if (event.button !== 0) {
			return;
		}
		const interactiveTarget =
			event.target instanceof Element ? event.target : null;
		if (
			interactiveTarget?.closest(
				"button, summary, details, input, select, textarea, a, [role='tab']",
			)
		) {
			return;
		}
		const shellElement = refs?.workbenchShellRef?.current ?? null;
		const railElement = toolRailRef.current;
		if (!shellElement || !railElement) {
			return;
		}
		toolRailDragStateRef.current = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: toolRailPosition.x,
			startY: toolRailPosition.y,
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
		setToolRailDragging(true);
	};

	const handleToolRailPointerMove = (event) => {
		const dragState = toolRailDragStateRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}
		const shellElement = refs?.workbenchShellRef?.current ?? null;
		const railElement = toolRailRef.current;
		if (!shellElement || !railElement) {
			return;
		}
		const nextPosition = clampToolRailPosition(
			{
				x: dragState.startX + (event.clientX - dragState.startClientX),
				y: dragState.startY + (event.clientY - dragState.startClientY),
			},
			shellElement,
			railElement,
		);
		setToolRailPosition(nextPosition);
	};

	const finishToolRailDrag = (event) => {
		const dragState = toolRailDragStateRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		toolRailDragStateRef.current = null;
		setToolRailDragging(false);
	};

	const renderInspectorContent = (tabId) => {
		if (tabId === INSPECTOR_TAB_SCENE) {
			return html`
				<${SceneSection}
					controller=${controller}
					sceneAssets=${sceneAssets}
					sceneBadge=${sceneBadge}
					sceneScaleSummary=${sceneScaleSummary}
					sceneSummary=${sceneSummary}
					sceneUnitBadge=${sceneUnitBadge}
					selectedSceneAsset=${selectedSceneAsset}
					store=${store}
					t=${t}
					draggedAssetId=${draggedAssetId}
					setDraggedAssetId=${setDraggedAssetId}
					dragHoverState=${dragHoverState}
					setDragHoverState=${setDragHoverState}
				/>
				<${LightingSection}
					controller=${controller}
					store=${store}
					t=${t}
				/>
			`;
		}
		if (tabId === INSPECTOR_TAB_CAMERA) {
			return html`
				<${ViewSettingsSection}
					controller=${controller}
					mode=${mode}
					selectedSceneAsset=${selectedSceneAsset}
					store=${store}
					t=${t}
					viewportEquivalentMmLabel=${viewportEquivalentMmLabel}
					viewportEquivalentMmValue=${viewportEquivalentMmValue}
					viewportFovLabel=${viewportFovLabel}
				/>
				<${ShotCameraSection}
					activeShotCamera=${activeShotCamera}
					cameraSummary=${cameraSummary}
					controller=${controller}
					equivalentMmLabel=${equivalentMmLabel}
					equivalentMmValue=${equivalentMmValue}
					fovLabel=${fovLabel}
					shotCameraClipMode=${shotCameraClipMode}
					store=${store}
					t=${t}
				/>
				<${OutputFrameSection}
					anchorOptions=${anchorOptions}
					controller=${controller}
					exportSizeLabel=${exportSizeLabel}
					heightLabel=${heightLabel}
					store=${store}
					t=${t}
					widthLabel=${widthLabel}
				/>
				<${ReferenceSection}
					controller=${controller}
					store=${store}
					t=${t}
				/>
				<${FramesSection}
					activeFrameId=${activeFrameId}
					controller=${controller}
					frameCount=${frameCount}
					frameDocuments=${frameDocuments}
					frameLimitReached=${frameLimitReached}
					t=${t}
				/>
			`;
		}
		return html`
			<${ExportSection}
				controller=${controller}
				exportBusy=${exportBusy}
				exportFormatLabel=${exportFormatLabel}
				exportPresetIds=${exportPresetIds}
				exportSelectionMissing=${exportSelectionMissing}
				exportStatusLabel=${exportStatusLabel}
				exportTarget=${exportTarget}
				store=${store}
				t=${t}
			/>
			<${ExportSettingsSection}
				activeShotCamera=${activeShotCamera}
				controller=${controller}
				exportFormat=${exportFormat}
				exportGridLayerMode=${exportGridLayerMode}
				exportGridOverlay=${exportGridOverlay}
				exportModelLayers=${exportModelLayers}
				exportSplatLayers=${exportSplatLayers}
				store=${store}
				t=${t}
			/>
		`;
	};

	return html`
		<div
			class=${
				workbenchCollapsed
					? "workbench-shell workbench-shell--inspector-rail"
					: "workbench-shell"
			}
			ref=${refs?.workbenchShellRef}
		>
			<div
				class="workbench-column workbench-column--left"
				ref=${refs?.workbenchLeftColumnRef}
				style=${{
					left: `${toolRailPosition.x}px`,
					top: `${toolRailPosition.y}px`,
				}}
			>
				<section
					ref=${toolRailRef}
					class=${
						toolRailDragging
							? "workbench-card workbench-card--tool-rail is-dragging"
							: "workbench-card workbench-card--tool-rail"
					}
					onPointerDown=${handleToolRailPointerDown}
					onPointerMove=${handleToolRailPointerMove}
					onPointerUp=${finishToolRailDrag}
					onPointerCancel=${finishToolRailDrag}
				>
					<${ToolRailSection}
						controller=${controller}
						mode=${mode}
						menuChildren=${fileMenuChildren}
						projectMenuItems=${projectMenuItems}
						store=${store}
						t=${t}
					/>
				</section>
			</div>
			<div
				class=${
					workbenchCollapsed
						? "workbench-column workbench-column--right workbench-column--right-collapsed"
						: "workbench-column workbench-column--right"
				}
				ref=${refs?.workbenchRightColumnRef}
			>
				${
					workbenchCollapsed
						? html`
								<section class="workbench-card workbench-card--inspector-rail">
									<${InspectorRailSection}
										activeTab=${inspectorPeekTab ?? activeInspectorTab}
										onTogglePeek=${toggleInspectorPeek}
										t=${t}
									/>
								</section>
								${
									peekInspectorTabDefinition &&
									html`
										<section class="workbench-card workbench-card--inspector-peek">
											<div class="workbench-inspector-peek__header">
												<div class="workbench-inspector-peek__title">
													<span class="workbench-inspector-peek__title-icon">
														<${WorkbenchIcon}
															name=${peekInspectorTabDefinition.icon}
															size=${14}
														/>
													</span>
													<strong>${peekInspectorTabDefinition.label}</strong>
												</div>
												<div class="workbench-inspector-peek__actions">
													<button
														type="button"
														class="workbench-inspector-toggle"
														aria-label=${t("action.expandWorkbench")}
														onClick=${() =>
															openInspectorFull(peekInspectorTabDefinition.id)}
													>
														<${WorkbenchIcon} name="pin" size=${14} />
													</button>
													<button
														type="button"
														class="workbench-inspector-toggle"
														aria-label=${t("action.close")}
														onClick=${() => setInspectorPeekTab(null)}
													>
														<${WorkbenchIcon} name="close" size=${14} />
													</button>
												</div>
											</div>
											<div class="workbench-inspector-stack workbench-inspector-stack--peek">
												${renderInspectorContent(peekInspectorTabDefinition.id)}
											</div>
										</section>
									`
								}
							`
						: html`
								<section class="workbench-card workbench-card--inspector">
									<div class="workbench-inspector-header">
										<${InspectorTabs}
											activeTab=${activeInspectorTab}
											setActiveTab=${setActiveInspectorTab}
											t=${t}
										/>
										<button
											type="button"
											class="workbench-inspector-toggle"
											aria-label=${t("action.collapseWorkbench")}
											onClick=${collapseWorkbench}
										>
											<${WorkbenchIcon} name="chevron-right" size=${14} />
										</button>
									</div>
									<div class="workbench-inspector-stack">
										${renderInspectorContent(activeInspectorTab)}
									</div>
									<${FooterSection} store=${store} />
								</section>
							`
				}
			</div>
		</div>
	`;
}
