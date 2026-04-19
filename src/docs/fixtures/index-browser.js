// Browser-only fixture registrations. This module is side-effectful: import
// it (e.g. from docs-app.js) to add fixtures whose implementation pulls real
// UI components — which transitively reach `src/ui/workbench-icons.js` and
// its top-level `import.meta.glob(...)` call. That glob is invalid under a
// plain Node loader, so node-run tests must never import this file.

import { registerFixture } from "./index.js";
import { sectionDisplayZoomFixture } from "./section-display-zoom.js";
import { shotCameraPropertiesFixture } from "./shot-camera-properties.js";

registerFixture(sectionDisplayZoomFixture);
registerFixture(shotCameraPropertiesFixture);
