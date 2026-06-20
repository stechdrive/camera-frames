import assert from "node:assert/strict";
import { shouldShowCompositionGuideLayer } from "../src/ui/composition-guide-layer.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../src/workspace-model.js";

assert.equal(
	shouldShowCompositionGuideLayer({
		mode: WORKSPACE_PANE_CAMERA,
		enabled: true,
	}),
	true,
);
assert.equal(
	shouldShowCompositionGuideLayer({
		mode: WORKSPACE_PANE_CAMERA,
		enabled: false,
	}),
	false,
);
assert.equal(
	shouldShowCompositionGuideLayer({
		mode: WORKSPACE_PANE_VIEWPORT,
		enabled: true,
	}),
	false,
);

console.log("✅ CAMERA_FRAMES composition guide layer tests passed!");
