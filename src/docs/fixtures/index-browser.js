// Browser-only fixture registrations. This module is side-effectful: import
// it (e.g. from docs-app.js) to add fixtures whose implementation pulls real
// UI components — which transitively reach `src/ui/workbench-icons.js` and
// its top-level `import.meta.glob(...)` call. That glob is invalid under a
// plain Node loader, so node-run tests must never import this file.

import { registerFixture } from "./index.js";
import { confirmNewProjectFixture } from "./confirm-new-project.js";
import { exportOutputSectionFixture } from "./export-output-section.js";
import { exportProgressFixture } from "./export-progress.js";
import { exportSettingsSectionFixture } from "./export-settings-section.js";
import {
	openMenuFixture,
	remoteUrlInputFixture,
} from "./file-menu.js";
import { inspectorTabsFixture } from "./inspector-tabs.js";
import { outputFrameSectionFixture } from "./output-frame-section.js";
import { pieMenuFixture } from "./pie-menu.js";
import {
	perSplatBoxToolFixture,
	perSplatBrushPreviewFixture,
	splatEditToolbarFixture,
} from "./splat-edit-toolbar.js";
import {
	referenceManagerFixture,
	referencePresetsFixture,
} from "./reference-section.js";
import { sectionDisplayZoomFixture } from "./section-display-zoom.js";
import { shotCameraManagerFixture } from "./shot-camera-manager.js";
import { shotCameraPropertiesFixture } from "./shot-camera-properties.js";

registerFixture(sectionDisplayZoomFixture);
registerFixture(shotCameraPropertiesFixture);
registerFixture(shotCameraManagerFixture);
registerFixture(outputFrameSectionFixture);
registerFixture(exportSettingsSectionFixture);
registerFixture(exportOutputSectionFixture);
registerFixture(exportProgressFixture);
registerFixture(referencePresetsFixture);
registerFixture(referenceManagerFixture);
registerFixture(confirmNewProjectFixture);
registerFixture(openMenuFixture);
registerFixture(remoteUrlInputFixture);
registerFixture(inspectorTabsFixture);
registerFixture(pieMenuFixture);
registerFixture(splatEditToolbarFixture);
registerFixture(perSplatBrushPreviewFixture);
registerFixture(perSplatBoxToolFixture);
