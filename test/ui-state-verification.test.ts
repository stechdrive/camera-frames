import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const source = readFileSync(
	join(process.cwd(), "test", "ui-state-verification.js"),
	"utf8",
);

function signal<T>(value: T) {
	return { value };
}

function createSmokeStore() {
	return {
		workspace: {
			activeShotCameraId: signal("shot-camera-1"),
			activeShotCamera: signal({ name: "Camera 1" }),
			shotCameras: signal([{}, {}, {}]),
		},
		baseFovX: signal(60.849),
		shotCamera: {
			clippingMode: signal("auto"),
			near: signal(0.1),
			exportName: signal("cf-%cam"),
			exportFormat: signal("psd"),
			exportGridOverlay: signal(true),
			exportModelLayers: signal(true),
			exportSplatLayers: signal(true),
		},
		renderBox: {
			widthScale: signal(1),
			heightScale: signal(1),
			viewZoom: signal(0.96),
			anchor: signal("center"),
		},
		frames: {
			count: signal(1),
			activeId: signal("frame-1"),
			active: signal({ name: "FRAME A" }),
			maskMode: signal("off"),
			maskShape: signal("bounds"),
			trajectoryMode: signal("line"),
			trajectoryExportSource: signal("none"),
			trajectoryNodesByFrameId: signal({}),
		},
	};
}

const sandbox = {
	__CF_TEST__: {
		store: createSmokeStore(),
		controller: {},
	},
};

vm.runInNewContext(source, sandbox, {
	filename: "test/ui-state-verification.js",
});

assert.equal(typeof sandbox.__cfLoadProject, "function");
assert.equal(typeof sandbox.__cfVerifyState, "function");
assert.equal(typeof sandbox.__cfReadProjectSummary, "function");
assert.equal(typeof sandbox.__cfRunProjectSmoke, "function");
assert.equal(typeof sandbox.__CF_EXPECTED, "object");

const result = sandbox.__cfVerifyState(sandbox.__CF_EXPECTED);
assert.equal(result.fail, 0);
assert.ok(result.pass > 0);

const summary = JSON.parse(JSON.stringify(sandbox.__cfReadProjectSummary()));
assert.deepEqual(summary, {
	activeShotCameraId: "shot-camera-1",
	activeShotCameraName: "Camera 1",
	shotCameraCount: 3,
	frameCount: 1,
	activeFrameId: "frame-1",
	activeFrameName: "FRAME A",
	exportFormat: "psd",
	outputFrame: {
		widthScale: 1,
		heightScale: 1,
		viewZoom: 0.96,
		anchor: "center",
	},
});
