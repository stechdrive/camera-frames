import assert from "node:assert/strict";
import { buildZipArchiveBytes } from "../src/project-archive.js";
import {
	extractProjectPackageAssets,
	isImportableProjectPackageAssetPath,
	isProjectPackageFileSource,
	isProjectPackagePackedSplatPath,
	isProjectPackagePackedSplatSource,
	isProjectPackageSource,
	isSupportedProjectPackageAssetPath,
	resolveProjectPackageAssetPaths,
} from "../src/project/package-legacy.js";

const textEncoder = new TextEncoder();

function jsonBytes(value) {
	return textEncoder.encode(JSON.stringify(value));
}

assert.equal(isProjectPackageSource("example.ssproj"), true);
assert.equal(isProjectPackageSource("https://example.com/test.ssproj"), true);
assert.equal(isProjectPackageSource("example.zip"), false);

assert.equal(isSupportedProjectPackageAssetPath("splats/test.ply"), true);
assert.equal(isSupportedProjectPackageAssetPath("models/scene.GLB"), true);
assert.equal(isSupportedProjectPackageAssetPath("refs/guide.png"), false);
assert.equal(isProjectPackagePackedSplatPath("splats/meta.json"), true);
assert.equal(isImportableProjectPackageAssetPath("splats/meta.json"), true);

{
	const archivePaths = [
		"document.json",
		"splats/meta.json",
		"splats/means.bin",
		"splats/sh0.bin",
		"splats/scales.bin",
		"splats/quats.bin",
		"Models/Layout.GLB",
		"refs/guide.png",
	];
	const documentState = {
		splats: [{ filename: "splats/meta.json" }],
		models: [{ filename: "models/layout.glb" }],
	};

	assert.deepEqual(
		resolveProjectPackageAssetPaths(documentState, archivePaths),
		["splats/meta.json", "Models/Layout.GLB"],
	);
}

{
	const archivePaths = [
		"document.json",
		"refs/guide.png",
		"splats/meta.json",
		"splats/means.bin",
		"models/set.glb",
	];

	assert.deepEqual(resolveProjectPackageAssetPaths(null, archivePaths), [
		"splats/meta.json",
		"models/set.glb",
	]);
}

{
	const archivePaths = [
		"document.json",
		"splats/meta.json",
		"splats/means.bin",
		"splats/scales.bin",
		"splats/quats.bin",
		"splats/sh0.bin",
		"models/set.glb",
	];
	const documentState = {
		splats: [{ filename: "splats/legacy.sog" }],
		models: [{ filename: "models/set.glb" }],
	};

	assert.deepEqual(
		resolveProjectPackageAssetPaths(documentState, archivePaths).sort(),
		["models/set.glb", "splats/meta.json"],
	);
}

{
	const archive = await buildZipArchiveBytes({
		"document.json": jsonBytes({
			splats: [{ filename: "splats/meta.json" }],
			models: [{ filename: "models/set.glb" }],
		}),
		"splats/meta.json": jsonBytes({
			means: { files: ["means.bin"] },
			scales: { files: ["scales.bin"] },
			quats: { files: ["quats.bin"] },
			sh0: { files: ["sh0.bin"] },
		}),
		"splats/means.bin": new Uint8Array([1]),
		"splats/scales.bin": new Uint8Array([2]),
		"splats/quats.bin": new Uint8Array([3]),
		"splats/sh0.bin": new Uint8Array([4]),
		"models/set.glb": new Uint8Array([5, 6, 7]),
	});

	const result = await extractProjectPackageAssets(
		new File([archive], "legacy.ssproj"),
	);
	assert.deepEqual(result.assetPaths, ["splats/meta.json", "models/set.glb"]);
	assert.equal(result.files.length, 2);
	assert.equal(isProjectPackagePackedSplatSource(result.files[0]), true);
	assert.equal(result.files[0].path, "splats/meta.json");
	assert.equal(result.files[0].legacyState.filename, "splats/meta.json");
	assert.deepEqual(Object.keys(result.files[0].extraFiles).sort(), [
		"means.bin",
		"quats.bin",
		"scales.bin",
		"sh0.bin",
		"splats/means.bin",
		"splats/quats.bin",
		"splats/scales.bin",
		"splats/sh0.bin",
	]);
	assert.equal(isProjectPackageFileSource(result.files[1]), true);
	assert.equal(result.files[1].file.name, "set.glb");
	assert.equal(result.files[1].legacyState.filename, "models/set.glb");
	assert.deepEqual(result.importState, {
		camera: null,
		cameraFrames: null,
	});
}

{
	const archive = await buildZipArchiveBytes({
		"document.json": jsonBytes({
			models: [
				{
					filename: "layout.glb",
					transform: {
						position: [1, 2, 3],
						rotation: [0, 0, 0, 1],
						scale: [2, 2, 2],
					},
				},
			],
		}),
		"models/layout.glb": new Uint8Array([1, 2, 3]),
	});

	const result = await extractProjectPackageAssets(
		new File([archive], "legacy-leaf-match.ssproj"),
	);
	assert.equal(result.files.length, 1);
	assert.equal(isProjectPackageFileSource(result.files[0]), true);
	assert.deepEqual(result.files[0].legacyState?.transform?.scale, [2, 2, 2]);
}

{
	const archive = await buildZipArchiveBytes({
		"document.json": jsonBytes({
			splats: [
				{
					position: [17.5, -4.65, 0],
					rotation: [0, 0, 1, 0],
					scale: [3.6, 3.6, 3.6],
				},
			],
		}),
		"splat_0.ply": new Uint8Array([1, 2, 3]),
	});

	const result = await extractProjectPackageAssets(
		new File([archive], "legacy-raw-splat.ssproj"),
	);
	assert.equal(result.files.length, 1);
	assert.equal(isProjectPackageFileSource(result.files[0]), true);
	assert.equal(result.files[0].legacyState?.filename, "splat_0.ply");
	assert.equal(result.files[0].legacyState?.assetId, "legacy-splat-0");
	assert.equal(result.files[0].legacyState?.legacyTransformBakedInAsset, true);
}
