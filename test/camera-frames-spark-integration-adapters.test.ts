import assert from "node:assert/strict";
import * as SparkSymbols from "../src/engine/spark-integration/spark-symbols.js";
import {
	assignSparkExportBufferState,
	captureSparkExportBufferOutputs,
	captureSparkExportBufferState,
} from "../src/engine/spark-integration/spark-export-buffer-state.js";

{
	// Contract: spark-symbols.js must re-export every Spark symbol consumed by
	// the app so a Spark patch only requires auditing one file. Adding a new
	// Spark import elsewhere is a regression — surface it here.
	const REQUIRED_SYMBOLS = [
		"FpsMovement",
		"PointerControls",
		"SparkRenderer",
		"SplatMesh",
		"flipPixels",
		"PackedSplats",
		"unpackSplats",
		"fromHalf",
		"PlyReader",
		"SpzReader",
		"RgbaArray",
		"dyno",
	];
	for (const symbolName of REQUIRED_SYMBOLS) {
		assert.ok(
			SparkSymbols[symbolName] !== undefined,
			`spark-symbols.js must re-export ${symbolName}`,
		);
	}
	assert.equal(
		typeof SparkSymbols.fromHalf,
		"function",
		"fromHalf should remain a function (data half-float decoder)",
	);
	assert.equal(
		typeof SparkSymbols.flipPixels,
		"function",
		"flipPixels should remain a function (export pixel flipper)",
	);
	assert.equal(
		typeof SparkSymbols.dyno,
		"object",
		"dyno should remain an object (dyno node namespace)",
	);
	assert.equal(
		typeof SparkSymbols.FpsMovement,
		"function",
		"FpsMovement should remain a class/constructor",
	);
	assert.equal(
		typeof SparkSymbols.SplatMesh,
		"function",
		"SplatMesh should remain a class/constructor",
	);
}
import {
	disposeSparkPackedSplatsLod,
	refreshSparkPackedSplatMesh,
	reinitializeSparkPackedSplats,
	resetSparkPackedSplatsRuntimeResources,
	restoreSparkPackedSplatsInPlace,
} from "../src/engine/spark-integration/spark-packed-splats-adapter.js";
import {
	enableSparkSplatMeshWorldToView,
	getSparkSplatMeshColorBufferArray,
	getSparkSplatMeshCount,
	restoreSparkSplatMeshColorBuffer,
	setSparkSplatMeshColorBuffer,
} from "../src/engine/spark-integration/spark-splat-mesh-adapter.js";

{
	const sourceSpark = {
		target: "target-a",
		backTarget: "back-a",
		superXY: 2,
		superPixels: new Uint8Array([1, 2]),
		targetPixels: new Uint8Array([3, 4]),
		encodeLinear: false,
	};

	assert.deepEqual(captureSparkExportBufferState(sourceSpark), {
		target: "target-a",
		backTarget: "back-a",
		superXY: 2,
		superPixels: sourceSpark.superPixels,
		targetPixels: sourceSpark.targetPixels,
		encodeLinear: false,
	});

	assignSparkExportBufferState(sourceSpark, {
		target: "target-b",
		backTarget: undefined,
		superXY: 4,
		superPixels: null,
		targetPixels: new Uint8Array([9]),
		encodeLinear: true,
	});

	assert.equal(sourceSpark.target, "target-b");
	assert.equal(sourceSpark.backTarget, undefined);
	assert.equal(sourceSpark.superXY, 4);
	assert.equal(sourceSpark.superPixels, null);
	assert.deepEqual(captureSparkExportBufferOutputs(sourceSpark), {
		superPixels: null,
		targetPixels: sourceSpark.targetPixels,
	});

	assert.deepEqual(captureSparkExportBufferState({}), {
		target: null,
		backTarget: undefined,
		superXY: 1,
		superPixels: null,
		targetPixels: null,
		encodeLinear: false,
	});
}

{
	const previousSplatRgba = { array: new Uint8Array([1, 2, 3, 4]) };
	const nextSplatRgba = { array: new Uint8Array([5, 6, 7, 8]) };
	const mesh = {
		packedSplats: {
			getNumSplats() {
				return 2;
			},
		},
		splatRgba: previousSplatRgba,
		updateGeneratorCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
	};

	assert.equal(getSparkSplatMeshCount(mesh), 2);
	assert.equal(getSparkSplatMeshColorBufferArray(mesh), previousSplatRgba.array);
	assert.equal(setSparkSplatMeshColorBuffer(mesh, nextSplatRgba), previousSplatRgba);
	assert.equal(mesh.splatRgba, nextSplatRgba);
	assert.equal(mesh.updateGeneratorCalls, 1);

	restoreSparkSplatMeshColorBuffer(mesh, previousSplatRgba);
	assert.equal(mesh.splatRgba, previousSplatRgba);
	assert.equal(mesh.updateGeneratorCalls, 2);

	enableSparkSplatMeshWorldToView(mesh);
	assert.equal(mesh.enableWorldToView, true);

	assert.throws(
		() => setSparkSplatMeshColorBuffer({}, nextSplatRgba),
		/updateGenerator/,
	);
}

{
	const source = {
		disposeCalls: 0,
		dispose() {
			this.disposeCalls += 1;
		},
	};
	const target = {
		disposeCalls: 0,
		dispose() {
			this.disposeCalls += 1;
		},
	};
	const packedSplats = {
		source,
		target,
		packedArray: new Uint32Array([1, 2, 3, 4]),
		extra: { lodTree: new Uint32Array([5, 6, 7]) },
		splatEncoding: { mode: "before" },
		numSplats: 1,
		needsUpdate: false,
		lod: true,
		nonLod: false,
		disposeLodSplatsCalls: 0,
		disposeLodSplats() {
			this.disposeLodSplatsCalls += 1;
		},
		reinitializeCalls: [],
		reinitialize(options) {
			this.reinitializeCalls.push(options);
			this.packedArray = options.packedArray;
			this.numSplats = options.numSplats;
			this.extra = options.extra;
			this.splatEncoding = options.splatEncoding;
		},
		getNumSplats() {
			return this.numSplats;
		},
	};
	const mesh = {
		updateGeneratorCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
		updateVersionCalls: 0,
		updateVersion() {
			this.updateVersionCalls += 1;
		},
	};

	const restoredInPlace = restoreSparkPackedSplatsInPlace(packedSplats, {
		packedArray: new Uint32Array([9, 10, 11, 12]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([13, 14, 15]) },
		splatEncoding: { mode: "after" },
	});
	assert.equal(restoredInPlace, true);
	assert.deepEqual(Array.from(packedSplats.packedArray), [9, 10, 11, 12]);
	assert.deepEqual(Array.from(packedSplats.extra.lodTree), [13, 14, 15]);

	resetSparkPackedSplatsRuntimeResources(packedSplats, {
		packedArray: new Uint32Array([21, 22, 23, 24]),
		extra: { lodTree: new Uint32Array([31, 32, 33]) },
		splatEncoding: { mode: "reset" },
	});
	assert.equal(source.disposeCalls, 1);
	assert.equal(target.disposeCalls, 1);
	assert.equal(packedSplats.source, null);
	assert.equal(packedSplats.target, null);
	assert.deepEqual(Array.from(packedSplats.packedArray), [21, 22, 23, 24]);

	reinitializeSparkPackedSplats(packedSplats, {
		packedArray: new Uint32Array([41, 42, 43, 44]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([51, 52, 53]) },
		splatEncoding: { mode: "reinit" },
	});
	assert.equal(packedSplats.reinitializeCalls.length, 1);

	disposeSparkPackedSplatsLod(packedSplats);
	assert.equal(packedSplats.disposeLodSplatsCalls, 1);

	refreshSparkPackedSplatMesh(mesh, packedSplats, { updateVersion: true });
	assert.equal(mesh.numSplats, 1);
	assert.equal(mesh.splats, packedSplats);
	assert.equal(mesh.generatorDirty, true);
	assert.equal(mesh.updateGeneratorCalls, 1);
	assert.equal(mesh.updateVersionCalls, 1);

	assert.throws(
		() => reinitializeSparkPackedSplats({}, {}),
		/reinitialize/,
	);
}

console.log("✅ CAMERA_FRAMES spark integration adapter tests passed!");
