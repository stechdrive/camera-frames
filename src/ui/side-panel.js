import { html } from "htm/preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { getAnchorOptions } from "../i18n.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import { shouldUseMobileWorkbenchLayout } from "./workbench-layout-mode.js";
import { HeaderMenu, IconButton } from "./workbench-primitives.js";
import {
	ExportSection,
	ExportSettingsSection,
	INSPECTOR_QUICK_SECTION_EXPORT,
	INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS,
	INSPECTOR_QUICK_SECTION_LIGHTING,
	INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
	INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
	INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS,
	INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES,
	INSPECTOR_QUICK_SECTION_SCENE,
	INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
	INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
	INSPECTOR_QUICK_SECTION_TRANSFORM,
	INSPECTOR_TAB_CAMERA,
	INSPECTOR_TAB_EXPORT,
	INSPECTOR_TAB_REFERENCE,
	INSPECTOR_TAB_SCENE,
	InspectorRailSection,
	InspectorTabs,
	LightingSection,
	OutputFrameSection,
	ReferenceManagerSection,
	ReferencePresetSection,
	ReferencePropertiesSection,
	SceneSection,
	SceneWorkspaceSection,
	SelectedSceneAssetInspector,
	ShotCameraPropertiesSection,
	ShotCameraSection,
	ToolRailSection,
	getInspectorQuickSections,
	getInspectorTabs,
} from "./workbench-sections.js";

const INSPECTOR_QUICK_SECTIONS_STORAGE_KEY =
	"camera-frames.inspectorQuickSectionIds";

function loadPinnedQuickSectionIds() {
	if (typeof window === "undefined" || !window.localStorage) {
		return [];
	}
	try {
		const rawValue = window.localStorage.getItem(
			INSPECTOR_QUICK_SECTIONS_STORAGE_KEY,
		);
		if (!rawValue) {
			return [];
		}
		const parsedValue = JSON.parse(rawValue);
		return Array.isArray(parsedValue)
			? parsedValue.filter((value) => typeof value === "string")
			: [];
	} catch {
		return [];
	}
}

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
	const [activeQuickSectionId, setActiveQuickSectionId] = useState(null);
	const [pinnedQuickSectionIds, setPinnedQuickSectionIds] = useState(
		loadPinnedQuickSectionIds,
	);
	const [collapsedInspectorSectionIds, setCollapsedInspectorSectionIds] =
		useState([]);
	const [isMobileWorkbench, setIsMobileWorkbench] = useState(false);
	const [draggedAssetId, setDraggedAssetId] = useState(null);
	const [dragHoverState, setDragHoverState] = useState(null);
	const [toolRailPosition, setToolRailPosition] = useState({ x: 0, y: 0 });
	const [toolRailDragging, setToolRailDragging] = useState(false);
	const toolRailRef = useRef(null);
	const dockedToolRailRef = useRef(null);
	const toolRailDragStateRef = useRef(null);
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const mode = store.mode.value;
	const sceneAssets = store.sceneAssets.value;
	const selectedSceneAsset = store.selectedSceneAsset.value;
	const activeShotCamera = store.workspace.activeShotCamera.value;
	const shotCameraClipMode = store.shotCamera.clippingMode.value;
	const exportFormat = store.shotCamera.exportFormat.value;
	const exportGridOverlay = store.shotCamera.exportGridOverlay.value;
	const exportGridLayerMode = store.shotCamera.exportGridLayerMode.value;
	const exportModelLayers = store.shotCamera.exportModelLayers.value;
	const exportSplatLayers = store.shotCamera.exportSplatLayers.value;
	const fovLabel = store.fovLabel.value;
	const equivalentMmValue = store.equivalentMmValue.value;
	const exportSizeLabel = store.exportSizeLabel.value;
	const widthLabel = store.widthLabel.value;
	const heightLabel = store.heightLabel.value;
	const exportBusy = store.exportBusy.value;
	const exportTarget = store.exportOptions.target.value;
	const exportPresetIds = store.exportOptions.presetIds.value;
	const exportSelectionMissing =
		exportTarget === "selected" && exportPresetIds.length === 0;
	const anchorOptions = getAnchorOptions(locale);
	const workbenchAutoCollapsed = store.workbenchAutoCollapsed.value;
	const inspectorTabs = getInspectorTabs(t);
	const activeInspectorTabDefinition =
		inspectorTabs.find((tab) => tab.id === activeInspectorTab) ??
		inspectorTabs[0];
	const inspectorQuickSections = getInspectorQuickSections(t);
	const inspectorQuickSectionMap = new Map(
		inspectorQuickSections.map((section) => [section.id, section]),
	);
	const activeQuickSectionDefinition =
		(activeQuickSectionId &&
			inspectorQuickSectionMap.get(activeQuickSectionId)) ??
		null;
	const isSectionAvailable = useCallback(() => true, []);
	const pinnedQuickSections = pinnedQuickSectionIds
		.map((sectionId) => inspectorQuickSectionMap.get(sectionId) ?? null)
		.filter(Boolean)
		.filter((section) => isSectionAvailable(section.id));
	const isInspectorSectionOpen = (sectionId) =>
		!collapsedInspectorSectionIds.includes(sectionId);
	const setInspectorSectionOpen = (sectionId, nextOpen) => {
		setCollapsedInspectorSectionIds((currentIds) => {
			if (nextOpen) {
				return currentIds.filter((id) => id !== sectionId);
			}
			return currentIds.includes(sectionId)
				? currentIds
				: [...currentIds, sectionId];
		});
	};
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
		setActiveQuickSectionId(null);
		expandWorkbench();
	};
	const toggleQuickSection = (sectionId) => {
		const section = inspectorQuickSectionMap.get(sectionId);
		if (!section) {
			return;
		}
		setActiveInspectorTab(section.tabId);
		setActiveQuickSectionId((currentSectionId) =>
			currentSectionId === sectionId ? null : sectionId,
		);
	};
	const togglePinnedQuickSection = (sectionId) => {
		setPinnedQuickSectionIds((currentIds) => {
			if (currentIds.includes(sectionId)) {
				return currentIds.filter((id) => id !== sectionId);
			}
			return [...currentIds, sectionId];
		});
	};
	const toggleMobileInspector = (tabId) => {
		openInspectorFull(tabId);
	};
	const isQuickSectionPinned = (sectionId) =>
		pinnedQuickSectionIds.includes(sectionId);
	const getQuickSectionPinButton = (sectionId) => {
		const section = inspectorQuickSectionMap.get(sectionId);
		if (!section) {
			return null;
		}
		const pinned = isQuickSectionPinned(sectionId);
		return html`
			<${IconButton}
				icon="pin"
				label=${
					pinned ? t("action.unpinQuickSection") : t("action.pinQuickSection")
				}
				active=${pinned}
				compact=${true}
				className="section-heading__pin-button"
				tooltip=${{
					title: pinned
						? t("action.unpinQuickSection")
						: t("action.pinQuickSection"),
					description: pinned
						? t("tooltip.unpinQuickSection")
						: t("tooltip.pinQuickSection"),
					placement: "left",
				}}
				onClick=${(event) => {
					event.preventDefault();
					event.stopPropagation();
					togglePinnedQuickSection(sectionId);
					if (pinned && activeQuickSectionId === sectionId) {
						setActiveQuickSectionId(null);
					}
				}}
			/>
		`;
	};
	const projectMenuItems = [
		{
			id: "new-project",
			icon: "plus",
			label: t("menu.newProjectAction"),
			shortcut: "Ctrl+N",
			onClick: () => controller()?.startNewProject(),
		},
		{
			id: "open-files",
			icon: "folder-open",
			label: t("action.openFiles"),
			shortcut: "Ctrl+O",
			onClick: () => controller()?.openFiles(),
		},
		{
			id: "save-project",
			icon: "save",
			label: t("menu.saveWorkingStateAction"),
			shortcut: "Ctrl+S",
			onClick: () => controller()?.saveProject(),
		},
		{
			id: "export-project",
			icon: "package",
			label: t("menu.savePackageAction"),
			shortcut: "Ctrl+Shift+S",
			onClick: () => controller()?.exportProject(),
		},
	];
	const fileMenuChildren = html`
		<div class="workbench-menu__group">
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
					<${WorkbenchIcon} name="link" size=${14} />
				</span>
				<span>${t("action.loadUrl")}</span>
			</button>
		</div>
	`;

	useEffect(() => {
		if (!workbenchCollapsed) {
			setActiveQuickSectionId(null);
		}
		return undefined;
	}, [workbenchCollapsed]);

	useEffect(() => {
		if (
			activeQuickSectionId &&
			(!pinnedQuickSectionIds.includes(activeQuickSectionId) ||
				!isSectionAvailable(activeQuickSectionId))
		) {
			setActiveQuickSectionId(null);
		}
		return undefined;
	}, [activeQuickSectionId, isSectionAvailable, pinnedQuickSectionIds]);

	useEffect(() => {
		if (typeof window === "undefined" || !window.localStorage) {
			return undefined;
		}
		const validSectionIds = new Set(
			inspectorQuickSections.map((section) => section.id),
		);
		const sanitizedSectionIds = pinnedQuickSectionIds.filter((sectionId) =>
			validSectionIds.has(sectionId),
		);
		window.localStorage.setItem(
			INSPECTOR_QUICK_SECTIONS_STORAGE_KEY,
			JSON.stringify(sanitizedSectionIds),
		);
		return undefined;
	}, [inspectorQuickSections, pinnedQuickSectionIds]);

	useEffect(() => {
		if (workbenchCollapsed || isMobileWorkbench) {
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
	}, [isMobileWorkbench, refs, workbenchCollapsed]);

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return undefined;
		}

		const widthQuery = window.matchMedia("(max-width: 1180px)");
		const syncMobileWorkbench = () => {
			setIsMobileWorkbench(
				shouldUseMobileWorkbenchLayout({
					widthMatches: widthQuery.matches,
				}),
			);
		};

		syncMobileWorkbench();
		const addChangeListener = (query, listener) => {
			if (typeof query.addEventListener === "function") {
				query.addEventListener("change", listener);
				return () => query.removeEventListener("change", listener);
			}
			query.addListener(listener);
			return () => query.removeListener(listener);
		};

		const cleanups = [addChangeListener(widthQuery, syncMobileWorkbench)];
		return () => {
			for (const cleanup of cleanups) {
				cleanup();
			}
		};
	}, []);

	const handleToolRailPointerDown = (event) => {
		if (isMobileWorkbench) {
			return;
		}
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
		if (isMobileWorkbench) {
			return;
		}
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
		if (isMobileWorkbench) {
			return;
		}
		const dragState = toolRailDragStateRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		toolRailDragStateRef.current = null;
		setToolRailDragging(false);
	};

	const handleDockedToolRailWheel = (event) => {
		const railElement = dockedToolRailRef.current;
		if (!railElement) {
			return;
		}
		if (railElement.scrollWidth <= railElement.clientWidth + 1) {
			return;
		}
		const horizontalDelta =
			Math.abs(event.deltaX) > Math.abs(event.deltaY)
				? event.deltaX
				: event.deltaY;
		if (!Number.isFinite(horizontalDelta) || horizontalDelta === 0) {
			return;
		}
		railElement.scrollLeft += horizontalDelta;
		event.preventDefault();
	};

	const getTabSectionIds = (tabId) => {
		if (tabId === INSPECTOR_TAB_SCENE) {
			return [
				INSPECTOR_QUICK_SECTION_SCENE,
				INSPECTOR_QUICK_SECTION_LIGHTING,
				INSPECTOR_QUICK_SECTION_TRANSFORM,
			];
		}
		if (tabId === INSPECTOR_TAB_CAMERA) {
			return [
				INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
				INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
				INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
			];
		}
		if (tabId === INSPECTOR_TAB_REFERENCE) {
			return [
				INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS,
				INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
				INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES,
			];
		}
		return [
			INSPECTOR_QUICK_SECTION_EXPORT,
			INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS,
		];
	};

	const renderInspectorSection = (
		sectionId,
		{ quick = false, desktopFull = false } = {},
	) => {
		const pinAction = getQuickSectionPinButton(sectionId);
		const open = isInspectorSectionOpen(sectionId);
		const onToggle = (nextOpen) => setInspectorSectionOpen(sectionId, nextOpen);
		switch (sectionId) {
			case INSPECTOR_QUICK_SECTION_SCENE:
				if (desktopFull) {
					return html`
						<${SceneWorkspaceSection}
							controller=${controller}
							open=${open}
							onToggle=${onToggle}
							sceneAssets=${sceneAssets}
							selectedSceneAsset=${selectedSceneAsset}
							store=${store}
							summaryActions=${pinAction}
							t=${t}
							draggedAssetId=${draggedAssetId}
							setDraggedAssetId=${setDraggedAssetId}
							dragHoverState=${dragHoverState}
							setDragHoverState=${setDragHoverState}
						/>
					`;
				}
				return html`
					<${SceneSection}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						sceneAssets=${sceneAssets}
						selectedSceneAsset=${selectedSceneAsset}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
						draggedAssetId=${draggedAssetId}
						setDraggedAssetId=${setDraggedAssetId}
						dragHoverState=${dragHoverState}
						setDragHoverState=${setDragHoverState}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_LIGHTING:
				return html`
					<${LightingSection}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_TRANSFORM:
				return html`
					<${SelectedSceneAssetInspector}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						sceneAssets=${sceneAssets}
						selectedSceneAsset=${selectedSceneAsset}
						showEmpty=${true}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_SHOT_CAMERA:
				return html`
					<${ShotCameraSection}
						activeShotCamera=${activeShotCamera}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES:
				return html`
					<${ShotCameraPropertiesSection}
						controller=${controller}
						equivalentMmValue=${equivalentMmValue}
						fovLabel=${fovLabel}
						open=${open}
						onToggle=${onToggle}
						shotCameraClipMode=${shotCameraClipMode}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_OUTPUT_FRAME:
				return html`
					<${OutputFrameSection}
						anchorOptions=${anchorOptions}
						controller=${controller}
						exportSizeLabel=${exportSizeLabel}
						open=${open}
						onToggle=${onToggle}
						heightLabel=${heightLabel}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
						widthLabel=${widthLabel}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS:
				return html`
					<${ReferencePresetSection}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER:
				return html`
					<${ReferenceManagerSection}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES:
				return html`
					<${ReferencePropertiesSection}
						controller=${controller}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_EXPORT:
				return html`
					<${ExportSection}
						controller=${controller}
						exportBusy=${exportBusy}
						exportPresetIds=${exportPresetIds}
						exportSelectionMissing=${exportSelectionMissing}
						exportTarget=${exportTarget}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			case INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS:
				return html`
					<${ExportSettingsSection}
						activeShotCamera=${activeShotCamera}
						controller=${controller}
						exportFormat=${exportFormat}
						exportGridLayerMode=${exportGridLayerMode}
						exportGridOverlay=${exportGridOverlay}
						exportModelLayers=${exportModelLayers}
						exportSplatLayers=${exportSplatLayers}
						open=${open}
						onToggle=${onToggle}
						store=${store}
						summaryActions=${pinAction}
						t=${t}
					/>
				`;
			default:
				return null;
		}
	};

	const renderInspectorContent = (tabId, options = null) =>
		options?.desktopFull && tabId === INSPECTOR_TAB_SCENE
			? html`
					<div class="workbench-inspector-split">
						<div class="workbench-inspector-split__top">
							${renderInspectorSection(INSPECTOR_QUICK_SECTION_SCENE, options)}
							${renderInspectorSection(
								INSPECTOR_QUICK_SECTION_LIGHTING,
								options,
							)}
						</div>
						<div class="workbench-inspector-split__bottom">
							${renderInspectorSection(
								INSPECTOR_QUICK_SECTION_TRANSFORM,
								options,
							)}
						</div>
					</div>
				`
			: options?.desktopFull && tabId === INSPECTOR_TAB_CAMERA
				? html`
						<div class="workbench-inspector-split">
							<div class="workbench-inspector-split__top">
								${renderInspectorSection(
									INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
									options,
								)}
								${renderInspectorSection(
									INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
									options,
								)}
							</div>
							<div class="workbench-inspector-split__bottom">
								${renderInspectorSection(
									INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
									options,
								)}
							</div>
						</div>
					`
				: options?.desktopFull && tabId === INSPECTOR_TAB_REFERENCE
					? html`
							<div class="workbench-inspector-split">
								<div class="workbench-inspector-split__top">
									${renderInspectorSection(
										INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS,
										options,
									)}
									${renderInspectorSection(
										INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
										options,
									)}
								</div>
								<div class="workbench-inspector-split__bottom">
									${renderInspectorSection(
										INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES,
										options,
									)}
								</div>
							</div>
						`
					: html`${getTabSectionIds(tabId)
							.map((sectionId) =>
								renderInspectorSection(sectionId, options ?? undefined),
							)
							.filter(Boolean)}`;

	const mobileInspectorDock = html`
		<div class="workbench-tool-rail__divider"></div>
		<div class="workbench-tool-rail__group">
			${inspectorTabs.map(
				(tab) => html`
					<${IconButton}
						key=${tab.id}
						icon=${tab.icon}
						label=${tab.label}
						active=${!workbenchCollapsed && activeInspectorTab === tab.id}
						className="workbench-tool-rail__button"
						tooltip=${{
							title: tab.tooltip?.title ?? tab.label,
							description: tab.tooltip?.description ?? "",
							placement: "top",
						}}
						onClick=${() => toggleMobileInspector(tab.id)}
					/>
				`,
			)}
		</div>
	`;

	if (isMobileWorkbench) {
		return html`
			<div class="workbench-shell workbench-shell--mobile" ref=${refs?.workbenchShellRef}>
				${
					!workbenchCollapsed &&
					html`
						<div
							class="workbench-mobile-backdrop"
							onClick=${() => collapseWorkbench()}
						></div>
					`
				}
				<div class="workbench-mobile-dock">
					<section class="workbench-card workbench-card--mobile-dock">
						<${ToolRailSection}
							controller=${controller}
							mode=${mode}
							menuChildren=${fileMenuChildren}
							projectMenuItems=${projectMenuItems}
							railRef=${dockedToolRailRef}
							railOnWheel=${handleDockedToolRailWheel}
							showQuickMenu=${true}
							store=${store}
							t=${t}
							tooltipPlacement="top"
							menuPanelPlacement="up"
							tailContent=${mobileInspectorDock}
						/>
					</section>
				</div>
				${
					!workbenchCollapsed &&
					html`
						<div
							class="workbench-mobile-drawer-wrap"
							ref=${refs?.workbenchRightColumnRef}
						>
							<section class="workbench-card workbench-card--inspector workbench-card--mobile-drawer">
								<div class="workbench-inspector-header">
									<${InspectorTabs}
										activeTab=${activeInspectorTab}
										setActiveTab=${setActiveInspectorTab}
										t=${t}
									/>
									<button
										type="button"
										class="workbench-inspector-toggle"
										aria-label=${t("action.close")}
										onClick=${collapseWorkbench}
										>
											<${WorkbenchIcon} name="close" size=${14} />
										</button>
									</div>
									<div class="workbench-inspector-stack workbench-inspector-stack--mobile">
										${renderInspectorContent(activeInspectorTab)}
									</div>
							</section>
						</div>
					`
				}
			</div>
		`;
	}

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
										activeQuickSectionId=${activeQuickSectionId}
										activeTab=${activeQuickSectionDefinition?.tabId ?? activeInspectorTab}
										onOpenFullTab=${openInspectorFull}
										onToggleQuickSection=${toggleQuickSection}
										quickSections=${pinnedQuickSections}
										t=${t}
									/>
								</section>
								${
									activeQuickSectionDefinition &&
									html`
										<section class="workbench-card workbench-card--inspector-peek">
											<div class="workbench-inspector-stack workbench-inspector-stack--peek">
												${renderInspectorSection(
													activeQuickSectionDefinition.id,
													{ quick: true },
												)}
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
									<div class="workbench-inspector-tab-title">
										<span class="workbench-inspector-tab-title__icon">
											<${WorkbenchIcon}
												name=${activeInspectorTabDefinition?.icon ?? "scene"}
												size=${13}
											/>
										</span>
										<strong>${activeInspectorTabDefinition?.label ?? ""}</strong>
									</div>
									<div
										class=${
											activeInspectorTab === INSPECTOR_TAB_SCENE ||
											activeInspectorTab === INSPECTOR_TAB_CAMERA
												? "workbench-inspector-stack workbench-inspector-stack--split"
												: "workbench-inspector-stack"
										}
									>
										${renderInspectorContent(activeInspectorTab, {
											desktopFull: true,
										})}
									</div>
								</section>
							`
				}
			</div>
		</div>
	`;
}
