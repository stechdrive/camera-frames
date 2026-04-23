import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildLegacyProjectImport } from "../src/importers/legacy-ssproj.js";
import { readCameraFramesProject } from "../src/project/file/index.js";
import { extractProjectPackageAssets } from "../src/project/package-legacy.js";

/*
 * .ssproj snapshot test
 *
 * Purpose: auto-generate golden JSON on first run, then assert
 * against it on every subsequent run. This guards the full
 * import / parse pipeline for both legacy and current formats
 * during module-splitting refactors.
 *
 * To update a snapshot: delete the JSON file in
 * .local/cf-test/snapshots/ and re-run.
 *
 * Skips gracefully if .local/cf-test/ test fixtures are absent.
 */

const TEST_DATA_DIR = resolve(".", ".local", "cf-test");
const SNAPSHOT_DIR = resolve(TEST_DATA_DIR, "snapshots");

function snapshotPath(name: string) {
	return resolve(SNAPSHOT_DIR, `${name}.snapshot.json`);
}

function hasTestData() {
	return existsSync(TEST_DATA_DIR);
}

function round(value: number, decimals = 8) {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

function serializeVector(v: { x: number; y: number; z: number }) {
	return { x: round(v.x), y: round(v.y), z: round(v.z) };
}

function serializeQuaternion(q: {
	x: number;
	y: number;
	z: number;
	w: number;
}) {
	return { x: round(q.x), y: round(q.y), z: round(q.z), w: round(q.w) };
}

function assertSnapshot(name: string, actual: unknown) {
	const filePath = snapshotPath(name);
	const serialized = JSON.stringify(actual, null, 2);

	if (!existsSync(filePath)) {
		mkdirSync(SNAPSHOT_DIR, { recursive: true });
		writeFileSync(filePath, serialized, "utf-8");
		console.log(`  [snapshot created] ${name} — verify and re-run`);
		return;
	}

	const expected = JSON.parse(readFileSync(filePath, "utf-8"));
	try {
		assert.deepEqual(actual, expected);
		console.log(`  [snapshot match] ${name}`);
	} catch (err) {
		writeFileSync(
			resolve(SNAPSHOT_DIR, `${name}.actual.json`),
			serialized,
			"utf-8",
		);
		throw new Error(
			`Snapshot mismatch for "${name}". Actual written to ${name}.actual.json. Delete ${name}.snapshot.json to accept new baseline.\n${err instanceof Error ? err.message : String(err)}`,
		);
	}
}

// ================================================================
// LEGACY .ssproj — full import pipeline snapshot
// ================================================================

if (!hasTestData()) {
	console.log(
		"  [skipped] .local/cf-test not found — ssproj snapshot tests skipped",
	);
} else {
	const legacyPath = resolve(TEST_DATA_DIR, "legacy.ssproj");

	if (existsSync(legacyPath)) {
		const legacyBuffer = readFileSync(legacyPath);
		const legacyFile = new File([legacyBuffer], "legacy.ssproj");

		// ---- extractProjectPackageAssets ----
		const extracted = await extractProjectPackageAssets(legacyFile);

		const extractedSnapshot = {
			packageName: extracted.packageName,
			assetPaths: extracted.assetPaths,
			fileCount: extracted.files.length,
			fileMeta: extracted.files.map(
				(f: {
					sourceType: string;
					kind: string;
					fileName: string;
					path: string;
				}) => ({
					sourceType: f.sourceType,
					kind: f.kind,
					fileName: f.fileName,
					path: f.path,
				}),
			),
			hasImportState: extracted.importState !== null,
			hasCameraState: extracted.importState?.camera !== null,
			hasCameraFramesState: extracted.importState?.cameraFrames !== null,
		};

		assertSnapshot("legacy-extracted", extractedSnapshot);

		// ---- buildLegacyProjectImport ----
		const legacyImport = buildLegacyProjectImport({
			cameraFramesState: extracted.importState?.cameraFrames,
			sceneRadius: 5,
		});

		assert.ok(legacyImport, "buildLegacyProjectImport must return non-null");

		const importSnapshot = {
			activeShotCameraId: legacyImport.activeShotCameraId,
			shotCount: legacyImport.shots.length,
			shots: legacyImport.shots.map(
				(shot: {
					document: {
						id: string;
						name: string;
						lens: { baseFovX: number };
						clipping: object;
						outputFrame: object;
						exportSettings: object;
						frames: Array<{ id: string; name: string }>;
						activeFrameId: string;
						frameMask: {
							mode: string;
							preferredMode: string;
							opacityPct: number;
							selectedIds: string[];
							shape: string;
							trajectoryMode: string;
							trajectoryExportSource: string;
							trajectory: {
								nodesByFrameId: Record<string, unknown>;
							};
						};
					};
					transform: {
						position: { x: number; y: number; z: number };
						quaternion: {
							x: number;
							y: number;
							z: number;
							w: number;
						};
					};
				}) => ({
					id: shot.document.id,
					name: shot.document.name,
					lens: { baseFovX: shot.document.lens.baseFovX },
					clipping: shot.document.clipping,
					outputFrame: shot.document.outputFrame,
					exportSettings: shot.document.exportSettings,
					frameCount: shot.document.frames.length,
					frames: shot.document.frames.map((f) => ({
						id: f.id,
						name: f.name,
					})),
					activeFrameId: shot.document.activeFrameId,
					frameMask: {
						mode: shot.document.frameMask.mode,
						preferredMode: shot.document.frameMask.preferredMode,
						opacityPct: shot.document.frameMask.opacityPct,
						selectedIds: shot.document.frameMask.selectedIds,
						shape: shot.document.frameMask.shape,
						trajectoryMode: shot.document.frameMask.trajectoryMode,
						trajectoryExportSource:
							shot.document.frameMask.trajectoryExportSource,
						trajectoryNodeCount: Object.keys(
							shot.document.frameMask.trajectory?.nodesByFrameId ?? {},
						).length,
					},
					transform: {
						position: serializeVector(shot.transform.position),
						quaternion: serializeQuaternion(shot.transform.quaternion),
					},
				}),
			),
		};

		assertSnapshot("legacy-import", importSnapshot);

		console.log("  legacy.ssproj snapshot tests passed!");
	} else {
		console.log("  [skipped] legacy.ssproj not found");
	}

	// ================================================================
	// CURRENT .ssproj — v3 format parse pipeline snapshot
	// ================================================================

	const currentPath = resolve(TEST_DATA_DIR, "cf-test.ssproj");

	if (existsSync(currentPath)) {
		const currentBuffer = readFileSync(currentPath);
		const currentFile = new File([currentBuffer], "cf-test.ssproj");

		const parsed = await readCameraFramesProject(currentFile);

		// ---- manifest snapshot ----
		const manifestSnapshot = {
			format: parsed.manifest.format,
			version: parsed.manifest.version,
			features: parsed.manifest.features,
			storageMode: parsed.manifest.storageMode,
		};

		assertSnapshot("current-manifest", manifestSnapshot);

		// ---- project structure snapshot ----
		const project = parsed.project;
		const projectSnapshot = {
			schema: project.schema,
			version: project.version,
			projectId: project.projectId,
			workspace: {
				activeShotCameraId: project.workspace.activeShotCameraId,
			},
			resourceCount: Object.keys(project.resources).length,
			resourceSummary: Object.fromEntries(
				Object.entries(project.resources).map(
					([id, res]: [
						string,
						{ type: string; assetKind: string; originalName?: string },
					]) => [
						id,
						{
							type: res.type,
							assetKind: res.assetKind,
							originalName: res.originalName ?? null,
						},
					],
				),
			),
			sceneAssetCount: project.scene.assets.length,
			sceneAssets: project.scene.assets.map(
				(a: {
					id: string;
					kind: string;
					label: string;
					visible: boolean;
					exportRole: string;
				}) => ({
					id: a.id,
					kind: a.kind,
					label: a.label,
					visible: a.visible,
					exportRole: a.exportRole,
				}),
			),
			shotCameraCount: project.shotCameras.length,
			shotCameras: project.shotCameras.map(
				(cam: {
					id: string;
					name: string;
					lens: { baseFovX: number };
					clipping: object;
					outputFrame: object;
					exportSettings: object;
					frames: Array<{ id: string; name: string }>;
					activeFrameId: string;
					frameMask: {
						mode: string;
						preferredMode: string;
						opacityPct: number;
						selectedIds: string[];
						shape: string;
						trajectoryMode: string;
						trajectoryExportSource: string;
						trajectory: {
							nodesByFrameId: Record<
								string,
								{
									mode?: string;
									in?: { x: number; y: number };
									out?: { x: number; y: number };
								}
							>;
						};
					};
					pose: {
						position: { x: number; y: number; z: number };
						quaternion: {
							x: number;
							y: number;
							z: number;
							w: number;
						};
					};
				}) => ({
					id: cam.id,
					name: cam.name,
					lens: { baseFovX: round(cam.lens.baseFovX) },
					clipping: cam.clipping,
					outputFrame: cam.outputFrame,
					exportSettings: cam.exportSettings,
					frameCount: cam.frames.length,
					frames: cam.frames.map((f) => ({ id: f.id, name: f.name })),
					activeFrameId: cam.activeFrameId,
					frameMask: {
						mode: cam.frameMask.mode,
						preferredMode: cam.frameMask.preferredMode,
						opacityPct: cam.frameMask.opacityPct,
						selectedIds: cam.frameMask.selectedIds,
						shape: cam.frameMask.shape,
						trajectoryMode: cam.frameMask.trajectoryMode,
						trajectoryExportSource: cam.frameMask.trajectoryExportSource,
						trajectoryNodes: Object.fromEntries(
							Object.entries(
								cam.frameMask.trajectory?.nodesByFrameId ?? {},
							).map(([frameId, node]) => [
								frameId,
								{
									...(node.mode ? { mode: node.mode } : {}),
									...(node.in
										? { in: { x: round(node.in.x), y: round(node.in.y) } }
										: {}),
									...(node.out
										? { out: { x: round(node.out.x), y: round(node.out.y) } }
										: {}),
								},
							]),
						),
					},
					pose: {
						position: serializeVector(cam.pose.position),
						quaternion: serializeQuaternion(cam.pose.quaternion),
					},
				}),
			),
			assetEntryCount: parsed.assetEntries.length,
		};

		assertSnapshot("current-project", projectSnapshot);

		console.log("  cf-test.ssproj snapshot tests passed!");
	} else {
		console.log("  [skipped] cf-test.ssproj not found");
	}
}

console.log("ssproj snapshot tests completed!");
