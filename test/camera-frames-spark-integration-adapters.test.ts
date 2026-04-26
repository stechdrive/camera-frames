import assert from "node:assert/strict";
import {
	assignSparkExportBufferState,
	captureSparkExportBufferOutputs,
	captureSparkExportBufferState,
} from "../src/engine/spark-integration/spark-export-buffer-state.js";
import * as SparkSymbols from "../src/engine/spark-integration/spark-symbols.js";

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
	attachPrebuiltLodSplats,
	bakeSparkPackedSplatsLod,
	captureSparkPackedSplatsLod,
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
	assert.equal(
		getSparkSplatMeshColorBufferArray(mesh),
		previousSplatRgba.array,
	);
	assert.equal(
		setSparkSplatMeshColorBuffer(mesh, nextSplatRgba),
		previousSplatRgba,
	);
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
		raycastIndices: {
			numSplats: 1,
			indices: new Uint32Array([0]),
		},
		context: {
			splats: null,
			numSplats: { value: 0 },
			enableLod: { value: true },
		},
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
	assert.equal(mesh.raycastIndices, undefined);
	assert.equal(mesh.splats, packedSplats);
	assert.equal(mesh.context.splats, packedSplats);
	assert.equal(mesh.context.numSplats.value, 1);
	assert.equal(mesh.context.enableLod.value, false);
	assert.equal(mesh.generatorDirty, true);
	assert.equal(mesh.updateGeneratorCalls, 1);
	assert.equal(mesh.updateVersionCalls, 1);

	assert.throws(() => reinitializeSparkPackedSplats({}, {}), /reinitialize/);
}

{
	// bakeSparkPackedSplatsLod must call createLodSplats with the requested
	// quality and surface needsUpdate so the renderer picks up the new LoD.
	const bakeCalls: Array<{ quality: boolean }> = [];
	const packedSplats = {
		createLodSplats: async ({ quality = false } = {}) => {
			bakeCalls.push({ quality });
		},
		needsUpdate: false,
	};
	await bakeSparkPackedSplatsLod(packedSplats, { quality: true });
	assert.equal(bakeCalls.length, 1);
	assert.equal(bakeCalls[0].quality, true);
	assert.equal(packedSplats.needsUpdate, true);

	await assert.rejects(
		async () => bakeSparkPackedSplatsLod({}, { quality: false }),
		/createLodSplats/,
	);
}

{
	// captureSparkPackedSplatsLod returns null when no lodSplats is attached
	// and otherwise returns a defensively-cloned bundle suitable for ssproj save.
	const withoutLod = {};
	assert.equal(captureSparkPackedSplatsLod(withoutLod), null);

	const withEmptyLod = {
		lodSplats: {
			packedArray: new Uint32Array(0),
		},
	};
	assert.equal(
		captureSparkPackedSplatsLod(withEmptyLod),
		null,
		"empty packedArray should be treated as no-op capture",
	);

	const lodSplats = {
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: {
			lodTree: new Uint32Array([10, 11]),
			sh1: new Uint32Array([20]),
			// Non-Uint32Array / non-whitelisted keys must be dropped.
			unrelated: new Uint8Array([99]),
		},
		splatEncoding: { rgbMin: 0, rgbMax: 1 },
	};
	const target = { lodSplats };
	const captured = captureSparkPackedSplatsLod(target);
	assert.ok(captured, "capture should return a bundle");
	assert.deepEqual(Array.from(captured.packedArray), [1, 2, 3, 4]);
	// Must be a copy, not a reference
	captured.packedArray[0] = 999;
	assert.equal(
		lodSplats.packedArray[0],
		1,
		"captured packedArray must be a defensive copy",
	);
	assert.equal(captured.numSplats, 1);
	assert.deepEqual(Object.keys(captured.extra).sort(), ["lodTree", "sh1"]);
	assert.deepEqual(Array.from(captured.extra.lodTree), [10, 11]);
	assert.deepEqual(Array.from(captured.extra.sh1), [20]);
	captured.extra.lodTree[0] = 999;
	assert.equal(
		lodSplats.extra.lodTree[0],
		10,
		"captured extra.lodTree must be a defensive copy",
	);
	assert.deepEqual(captured.splatEncoding, { rgbMin: 0, rgbMax: 1 });
	assert.notEqual(
		captured.splatEncoding,
		lodSplats.splatEncoding,
		"captured splatEncoding must be a defensive clone",
	);
}

{
	// attachPrebuiltLodSplats replaces any current lodSplats and asks the
	// renderer to refresh the next frame.
	const packedSplats = {
		lodSplats: null,
		needsUpdate: false,
		disposeLodSplatsCalls: 0,
		disposeLodSplats() {
			this.disposeLodSplatsCalls += 1;
			this.lodSplats = null;
		},
	};
	const prebuilt = { tag: "prebuilt-lod" };
	attachPrebuiltLodSplats(packedSplats, prebuilt);
	assert.equal(packedSplats.disposeLodSplatsCalls, 1);
	assert.equal(packedSplats.lodSplats, prebuilt);
	assert.equal(packedSplats.needsUpdate, true);

	// Calling with null keeps the previous state disposed but leaves lodSplats
	// cleared so the default runtime path can rebuild it.
	attachPrebuiltLodSplats(packedSplats, null);
	assert.equal(packedSplats.disposeLodSplatsCalls, 2);
	assert.equal(packedSplats.lodSplats, null);
}

console.log("✅ CAMERA_FRAMES spark integration adapter tests passed!");
