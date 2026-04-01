import assert from "node:assert/strict";
import { translate } from "../src/i18n.js";
import {
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
	getInspectorQuickSections,
	getInspectorTabs,
} from "../src/ui/workbench-section-ids.js";

const t = (key: string, params?: Record<string, unknown>) =>
	translate("en", key, params);

const tabs = getInspectorTabs(t);
assert.deepEqual(
	tabs.map((tab) => tab.id),
	[
		INSPECTOR_TAB_SCENE,
		INSPECTOR_TAB_CAMERA,
		INSPECTOR_TAB_REFERENCE,
		INSPECTOR_TAB_EXPORT,
	],
);
assert.equal(new Set(tabs.map((tab) => tab.id)).size, tabs.length);
assert.ok(
	tabs.every((tab) => typeof tab.icon === "string" && tab.icon.length > 0),
);

const quickSections = getInspectorQuickSections(t);
assert.deepEqual(
	quickSections.map((section) => section.id),
	[
		INSPECTOR_QUICK_SECTION_SCENE,
		INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
		INSPECTOR_QUICK_SECTION_SHOT_CAMERA_PROPERTIES,
		INSPECTOR_QUICK_SECTION_LIGHTING,
		INSPECTOR_QUICK_SECTION_TRANSFORM,
		INSPECTOR_QUICK_SECTION_OUTPUT_FRAME,
		INSPECTOR_QUICK_SECTION_REFERENCE_PRESETS,
		INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
		INSPECTOR_QUICK_SECTION_REFERENCE_PROPERTIES,
		INSPECTOR_QUICK_SECTION_EXPORT,
		INSPECTOR_QUICK_SECTION_EXPORT_SETTINGS,
	],
);
assert.equal(
	quickSections.find((section) => section.id === INSPECTOR_QUICK_SECTION_SCENE)
		?.tabId,
	INSPECTOR_TAB_SCENE,
);
assert.equal(
	quickSections.find(
		(section) => section.id === INSPECTOR_QUICK_SECTION_SHOT_CAMERA,
	)?.tabId,
	INSPECTOR_TAB_CAMERA,
);
assert.equal(
	quickSections.find(
		(section) => section.id === INSPECTOR_QUICK_SECTION_REFERENCE_MANAGER,
	)?.tabId,
	INSPECTOR_TAB_REFERENCE,
);
assert.equal(
	quickSections.find((section) => section.id === INSPECTOR_QUICK_SECTION_EXPORT)
		?.tabId,
	INSPECTOR_TAB_EXPORT,
);
assert.equal(
	new Set(quickSections.map((section) => section.id)).size,
	quickSections.length,
);
