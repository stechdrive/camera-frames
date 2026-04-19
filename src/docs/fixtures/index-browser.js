// Browser-only fixture registrations. This module is side-effectful: import
// it (e.g. from docs-app.js) to add fixtures whose implementation pulls real
// UI components — which transitively reach `src/ui/workbench-icons.js` and
// its top-level `import.meta.glob(...)` call. That glob is invalid under a
// plain Node loader, so node-run tests must never import this file.

import { registerFixture } from "./index.js";
import { appLayoutOverviewFixture } from "./app-layout-overview.js";
import { axisGizmoFixture } from "./axis-gizmo.js";
import { cameraModeRenderBoxFixture } from "./camera-mode-render-box.js";
import { confirmNewProjectFixture } from "./confirm-new-project.js";
import { dropHintFixture } from "./drop-hint.js";
import { exportOutputSectionFixture } from "./export-output-section.js";
import { exportProgressFixture } from "./export-progress.js";
import { exportSettingsSectionFixture } from "./export-settings-section.js";
import { firstSceneLoadedFixture } from "./first-scene-loaded.js";
import { measurementOverlayFixture } from "./measurement-overlay.js";
import { multipleFramesFixture } from "./multiple-frames.js";
import { renderBoxCameraModeFixture } from "./render-box-camera-mode.js";
import {
	openMenuFixture,
	remoteUrlInputFixture,
} from "./file-menu.js";
import { inspectorTabsFixture } from "./inspector-tabs.js";
import { outputFrameSectionFixture } from "./output-frame-section.js";
import {
	pieMenuExpandedFixture,
	pieMenuFixture,
} from "./pie-menu.js";
import {
	perSplatBoxToolFixture,
	perSplatBrushPreviewFixture,
	perSplatEditToolbarFixture,
	splatEditToolbarFixture,
} from "./splat-edit-toolbar.js";
import { referenceEditModeFixture } from "./reference-edit-mode.js";
import {
	referenceManagerFixture,
	referencePresetsFixture,
} from "./reference-section.js";
import { sectionDisplayZoomFixture } from "./section-display-zoom.js";
import { shotCameraManagerFixture } from "./shot-camera-manager.js";
import { shotCameraPropertiesFixture } from "./shot-camera-properties.js";
import { toolRailFixture } from "./tool-rail.js";
import { trajectorySplineFixture } from "./trajectory-spline.js";
import { transformGizmoFixture } from "./transform-gizmo.js";

registerFixture(sectionDisplayZoomFixture);
registerFixture(shotCameraPropertiesFixture);
registerFixture(shotCameraManagerFixture);
registerFixture(outputFrameSectionFixture);
registerFixture(exportSettingsSectionFixture);
registerFixture(exportOutputSectionFixture);
registerFixture(exportProgressFixture);
registerFixture(dropHintFixture);
registerFixture(firstSceneLoadedFixture);
registerFixture(axisGizmoFixture);
registerFixture(toolRailFixture);
registerFixture(cameraModeRenderBoxFixture);
registerFixture(multipleFramesFixture);
registerFixture(renderBoxCameraModeFixture);
registerFixture(measurementOverlayFixture);
registerFixture(referencePresetsFixture);
registerFixture(referenceManagerFixture);
registerFixture(confirmNewProjectFixture);
registerFixture(openMenuFixture);
registerFixture(remoteUrlInputFixture);
registerFixture(inspectorTabsFixture);
registerFixture(pieMenuFixture);
registerFixture(pieMenuExpandedFixture);
registerFixture(referenceEditModeFixture);
registerFixture(splatEditToolbarFixture);
registerFixture(perSplatBrushPreviewFixture);
registerFixture(perSplatBoxToolFixture);
registerFixture(perSplatEditToolbarFixture);
registerFixture(trajectorySplineFixture);
registerFixture(transformGizmoFixture);
registerFixture(appLayoutOverviewFixture);
