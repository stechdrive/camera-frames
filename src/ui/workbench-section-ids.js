export const INSPECTOR_TAB_SCENE = "scene";
export const INSPECTOR_TAB_CAMERA = "camera";
export const INSPECTOR_TAB_REFERENCE = "reference";
export const INSPECTOR_TAB_EXPORT = "export";
export const INSPECTOR_QUICK_SECTION_SCENE = "scene-main";
export const INSPECTOR_QUICK_SECTION_TRANSFORM = "scene-transform";
export const INSPECTOR_QUICK_SECTION_SHOT_CAMERA = "shot-camera";
export const INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES =
	"shot-camera-properties";
export const INSPECTOR_QUICK_SECTION_DISPLAY_ZOOM = "display-zoom";
export const INSPECTOR_QUICK_SECTION_VIEW = "view-settings";
export const INSPECTOR_QUICK_SECTION_LIGHTING = "lighting";
export const INSPECTOR_QUICK_SECTION_OUTPUT_FRAME = "output-frame";
export const INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS = "reference-presets";
export const INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER = "reference-manager";
export const INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES =
	"reference-properties";
export const INSPECTOR_QUICK_SECTION_EXPORT = "export-output";
export const INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS = "export-settings";
export const INSPECTOR_BROWSER_SCENE = "scene";
export const INSPECTOR_BROWSER_REFERENCE = "reference";

export function getInspectorTabs(t) {
	return [
		{
			id: INSPECTOR_TAB_SCENE,
			label: t("section.scene"),
			icon: "scene",
			tooltip: {
				title: t("section.scene"),
				description: t("tooltip.tabScene"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCamera"),
			icon: "camera-dslr",
			tooltip: {
				title: t("section.shotCamera"),
				description: t("tooltip.tabCamera"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_REFERENCE,
			label: t("section.referenceImages"),
			icon: "image",
			tooltip: {
				title: t("section.referenceImages"),
				description: t("tooltip.tabReference"),
				placement: "bottom",
			},
		},
		{
			id: INSPECTOR_TAB_EXPORT,
			label: t("section.export"),
			icon: "export-tab",
			tooltip: {
				title: t("section.export"),
				description: t("tooltip.tabExport"),
				placement: "bottom",
			},
		},
	];
}

export function getInspectorQuickSections(t) {
	return [
		{
			id: INSPECTOR_QUICK_SECTION_SCENE,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.sceneManager"),
			icon: "scene",
		},
		{
			id: INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCameraManager"),
			icon: "camera",
		},
		{
			id: INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.shotCameraProperties"),
			icon: "camera-property",
		},
		{
			id: INSPECTOR_QUICK_SECTION_LIGHTING,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.lighting"),
			icon: "light",
		},
		{
			id: INSPECTOR_QUICK_SECTION_TRANSFORM,
			tabId: INSPECTOR_TAB_SCENE,
			label: t("section.selectedSceneObject"),
			icon: "move",
		},
		{
			id: INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
			tabId: INSPECTOR_TAB_CAMERA,
			label: t("section.outputFrame"),
			icon: "render-box",
		},
		{
			id: INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS,
			tabId: INSPECTOR_TAB_REFERENCE,
			label: t("section.referencePresets"),
			icon: "image",
		},
		{
			id: INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
			tabId: INSPECTOR_TAB_REFERENCE,
			label: t("section.referenceManager"),
			icon: "reference-tool",
		},
		{
			id: INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES,
			tabId: INSPECTOR_TAB_REFERENCE,
			label: t("section.referenceProperties"),
			icon: "reference-tool",
		},
		{
			id: INSPECTOR_QUICK_SECTION_EXPORT,
			tabId: INSPECTOR_TAB_EXPORT,
			label: t("section.output"),
			icon: "export-tab",
		},
		{
			id: INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS,
			tabId: INSPECTOR_TAB_EXPORT,
			label: t("section.exportSettings"),
			icon: "export-tab",
		},
	];
}
