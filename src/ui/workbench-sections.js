import { html } from "htm/preact";
import {
	getBuildCommitLabel,
	getBuildVersionLabel,
	getCodeStampLabel,
} from "../build-info.js";
import {
	InspectorBrowserSection,
	ReferenceBrowserSection,
	ReferenceManagerSection,
	ReferencePresetSection,
	SceneBrowserSection,
	ShotCameraSection,
} from "./workbench-browser-sections.js";
import {
	DisplayZoomSection,
	ExportSection,
	ExportSettingsSection,
	OutputFrameSection,
	ShotCameraPropertiesSection,
	ViewSettingsSection,
} from "./workbench-camera-export-sections.js";
import { INTERACTIVE_FIELD_PROPS } from "./workbench-controls.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import {
	FramesSection,
	LightingSection,
} from "./workbench-lighting-frame-sections.js";
import { HeaderMenu, HeaderWordmark } from "./workbench-primitives.js";
import {
	ReferencePropertiesSection,
	SelectedSceneAssetInspector,
} from "./workbench-property-sections.js";
import { ReferenceSection } from "./workbench-reference-sections.js";
import {
	SceneSection,
	SceneWorkspaceSection,
} from "./workbench-scene-sections.js";
import {
	INSPECTOR_BROWSER_REFERENCE,
	INSPECTOR_BROWSER_SCENE,
	INSPECTOR_QUICK_SECTION_DISPLAY_ZOOM,
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
	INSPECTOR_QUICK_SECTION_VIEW,
	INSPECTOR_TAB_CAMERA,
	INSPECTOR_TAB_EXPORT,
	INSPECTOR_TAB_REFERENCE,
	INSPECTOR_TAB_SCENE,
} from "./workbench-section-ids.js";
export {
	INSPECTOR_BROWSER_REFERENCE,
	INSPECTOR_BROWSER_SCENE,
	INSPECTOR_QUICK_SECTION_DISPLAY_ZOOM,
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
	INSPECTOR_QUICK_SECTION_VIEW,
	INSPECTOR_TAB_CAMERA,
	INSPECTOR_TAB_EXPORT,
	INSPECTOR_TAB_REFERENCE,
	INSPECTOR_TAB_SCENE,
	getInspectorQuickSections,
	getInspectorTabs,
} from "./workbench-section-ids.js";
export {
	InspectorRailSection,
	InspectorTabs,
	ToolRailSection,
} from "./workbench-rail-sections.js";
export {
	InspectorBrowserSection,
	ReferenceBrowserSection,
	ReferenceManagerSection,
	ReferencePresetSection,
	SceneBrowserSection,
	ShotCameraSection,
} from "./workbench-browser-sections.js";
export {
	DisplayZoomSection,
	ExportSection,
	ExportSettingsSection,
	OutputFrameSection,
	ShotCameraPropertiesSection,
	ViewSettingsSection,
} from "./workbench-camera-export-sections.js";
export {
	ReferencePropertiesSection,
	SelectedSceneAssetInspector,
} from "./workbench-property-sections.js";
export {
	FramesSection,
	LightingSection,
} from "./workbench-lighting-frame-sections.js";
export { ReferenceSection } from "./workbench-reference-sections.js";
export {
	SceneSection,
	SceneWorkspaceSection,
} from "./workbench-scene-sections.js";

export function WorkbenchHeader({
	t,
	compact = false,
	collapsed = false,
	onToggleCollapse,
	projectMenuItems = [],
	menuChildren = null,
	remoteUrl = "",
	onRemoteUrlInput,
	onLoadRemoteUrls,
	onOpenFiles,
}) {
	const buildVersionLabel = getBuildVersionLabel();
	const buildCommitLabel = getBuildCommitLabel();
	const codeStampLabel = getCodeStampLabel();

	return html`
		<header class=${compact ? "panel-header panel-header--compact" : "panel-header"}>
			<div class="panel-header__title-row">
				<div class="panel-header__title-main">
					<${HeaderMenu}
						label=${t("section.file")}
						items=${projectMenuItems}
					>
						${
							menuChildren ??
							html`
								<div class="workbench-menu__group">
									<button
										id="open-files"
										type="button"
										class="workbench-menu__item"
										onClick=${() => onOpenFiles?.()}
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
											value=${remoteUrl}
											...${INTERACTIVE_FIELD_PROPS}
											onInput=${(event) =>
												onRemoteUrlInput?.(event.currentTarget.value)}
											onKeyDown=${(event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													onLoadRemoteUrls?.();
												}
											}}
										/>
									</div>
									<button
										id="load-url"
										type="button"
										class="workbench-menu__item"
										onClick=${() => onLoadRemoteUrls?.()}
									>
										<span class="workbench-menu__item-icon">
											<${WorkbenchIcon} name="folder-open" size=${14} />
										</span>
										<span>${t("action.loadUrl")}</span>
									</button>
								</div>
							`
						}
					<//>
					<${HeaderWordmark} title="CAMERA_FRAMES" compact=${compact} />
				</div>
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
					<${WorkbenchIcon}
						name=${collapsed ? "chevron-right" : "chevron-left"}
						size=${14}
					/>
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
