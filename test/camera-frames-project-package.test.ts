import assert from "node:assert/strict";
import {
	isProjectPackageSource,
	isSupportedProjectPackageAssetPath,
	resolveProjectPackageAssetPaths,
} from "../src/project-package.js";

assert.equal(isProjectPackageSource("example.ssproj"), true);
assert.equal(isProjectPackageSource("https://example.com/test.ssproj"), true);
assert.equal(isProjectPackageSource("example.zip"), false);

assert.equal(isSupportedProjectPackageAssetPath("splats/test.ply"), true);
assert.equal(isSupportedProjectPackageAssetPath("models/scene.GLB"), true);
assert.equal(isSupportedProjectPackageAssetPath("refs/guide.png"), false);

{
	const archivePaths = [
		"document.json",
		"Splats/Scene.PLY",
		"Models/Layout.GLB",
		"refs/guide.png",
		"splats/alt.sog",
	];
	const documentState = {
		splats: [{ filename: "splats/scene.ply" }],
		models: [{ filename: "models/layout.glb" }],
	};

	assert.deepEqual(
		resolveProjectPackageAssetPaths(documentState, archivePaths),
		["Splats/Scene.PLY", "Models/Layout.GLB"],
	);
}

{
	const archivePaths = [
		"document.json",
		"refs/guide.png",
		"splats/shot.sog",
		"models/set.glb",
	];

	assert.deepEqual(resolveProjectPackageAssetPaths(null, archivePaths), [
		"splats/shot.sog",
		"models/set.glb",
	]);
}
