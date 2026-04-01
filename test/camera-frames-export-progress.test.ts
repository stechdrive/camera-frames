import assert from "node:assert/strict";
import {
	buildExportProgressOverlay,
	getExportPhaseDefaultDetail,
	getExportPhaseDefinitions,
} from "../src/controllers/export/progress.js";

function t(key, params = {}) {
	return `${key}:${JSON.stringify(params)}`;
}

{
	const phases = getExportPhaseDefinitions({
		exportFormat: "psd",
		exportGridOverlay: true,
		hasMasks: true,
		exportModelLayers: true,
		exportSplatLayers: true,
		includeReferenceImages: true,
		t,
	});

	assert.deepEqual(
		phases.map((phase) => phase.id),
		[
			"prepare",
			"beauty",
			"guides",
			"masks",
			"psd-base",
			"model-layers",
			"splat-layers",
			"reference-images",
			"write",
		],
	);
}

assert.equal(
	getExportPhaseDefaultDetail("write", "png", t),
	"overlay.exportPhaseDetailWritePng:{}",
);
assert.equal(
	getExportPhaseDefaultDetail("write", "psd", t),
	"overlay.exportPhaseDetailWritePsd:{}",
);
assert.equal(getExportPhaseDefaultDetail("unknown", "psd", t), "");

{
	const overlay = buildExportProgressOverlay({
		targetDocuments: [
			{ id: "shot-a", name: "Camera A" },
			{ id: "shot-b", name: "Camera B" },
			{ id: "shot-c", name: "Camera C" },
		],
		currentIndex: 1,
		exportFormat: "psd",
		startedAt: 123456,
		phaseState: {
			id: "model-layers",
			activeId: "model-layers",
			label: "Models",
			definitions: [
				{ id: "prepare", label: "Prepare" },
				{ id: "model-layers", label: "Models" },
				{ id: "write", label: "Write" },
			],
			completedIds: new Set(["prepare"]),
		},
		t,
	});

	assert.equal(overlay.source, "export");
	assert.equal(overlay.kind, "progress");
	assert.equal(overlay.phaseLabel, "Models");
	assert.equal(overlay.startedAt, 123456);
	assert.equal(
		overlay.detail,
		'overlay.exportDetailBatch:{"index":2,"count":3,"camera":"Camera B","format":"exportFormat.psd:{}"}',
	);
	assert.deepEqual(
		overlay.phases.map((phase) => phase.status),
		["done", "active", "todo"],
	);
	assert.deepEqual(
		overlay.steps.map((step) => step.status),
		["done", "active", "todo"],
	);
}

{
	const overlay = buildExportProgressOverlay({
		targetDocuments: [{ id: "shot-a", name: "Camera A" }],
		currentIndex: 0,
		exportFormat: "png",
		startedAt: 1,
		phaseState: {
			id: "write",
			activeId: "write",
			label: "Write",
			definitions: [{ id: "write", label: "Write" }],
			completedIds: new Set(),
		},
		t,
	});

	assert.equal(
		overlay.detail,
		'overlay.exportDetailSingle:{"camera":"Camera A","format":"exportFormat.png:{}"}',
	);
	assert.equal(overlay.phaseDetail, "overlay.exportPhaseDetailWritePng:{}");
}

console.log("✅ CAMERA_FRAMES export progress tests passed!");
