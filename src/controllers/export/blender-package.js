import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import {
	ANIMATION_TARGET_SCENE_ASSET,
	ANIMATION_TARGET_SHOT_CAMERA,
	getActiveAnimationClip,
	sampleNumberTrack,
} from "../../animation/animation-model.js";
import { DEFAULT_CAMERA_FAR, DEFAULT_CAMERA_NEAR } from "../../constants.js";
import {
	composeCameraQuaternionFromPoseAngles,
	decomposeCameraPoseAngles,
} from "../../engine/camera-pose.js";
import {
	applyLensShiftToFrustumExtents,
	getBaseFrustumExtents,
	getTargetFrustumExtents,
} from "../../engine/projection.js";
import {
	applyRenderBoxOffsetCorrection,
	getReferenceImageRenderBoxAnchor,
	resolveReferenceImageItemsForShot,
} from "../../reference-image-model.js";
import {
	createBlenderBuildScript,
	createBlenderLauncher,
	createBlenderPackageReadme,
} from "./blender-script.js";

const CAMERA_AXIS_LOCAL = new THREE.Vector3(0, 0, -1);
const SH_C0 = 0.28209479177387814;
const TEXT_ENCODER = new TextEncoder();

function toTextBytes(value) {
	return TEXT_ENCODER.encode(String(value ?? ""));
}

function sanitizeFileStem(value, fallback = "camera-frames") {
	const withoutControlCharacters = Array.from(String(value ?? ""))
		.filter((character) => character.charCodeAt(0) >= 32)
		.join("");
	const sanitized = withoutControlCharacters
		.normalize("NFKC")
		.replace(/[<>:"/\\|?*]/g, "-")
		.replace(/\s+/g, " ")
		.replace(/[.\s]+$/g, "")
		.trim();
	return sanitized || fallback;
}

function removeKnownAssetExtension(value) {
	return String(value ?? "").replace(
		/\.(?:glb|gltf|fbx|obj|ply|splat|ksplat|spz|sog|rad)$/i,
		"",
	);
}

function normalizeNumber(value, fallback = 0) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeQuaternion(value = null) {
	const quaternion = new THREE.Quaternion(
		normalizeNumber(value?.x),
		normalizeNumber(value?.y),
		normalizeNumber(value?.z),
		normalizeNumber(value?.w, 1),
	);
	return quaternion.lengthSq() > 1e-12
		? quaternion.normalize()
		: new THREE.Quaternion();
}

function createTransform({
	position = null,
	quaternion = null,
	scale = null,
} = {}) {
	return {
		position: {
			x: normalizeNumber(position?.x),
			y: normalizeNumber(position?.y),
			z: normalizeNumber(position?.z),
		},
		quaternion: {
			x: normalizeNumber(quaternion?.x),
			y: normalizeNumber(quaternion?.y),
			z: normalizeNumber(quaternion?.z),
			w: normalizeNumber(quaternion?.w, 1),
		},
		scale: {
			x: normalizeNumber(scale?.x, 1),
			y: normalizeNumber(scale?.y, 1),
			z: normalizeNumber(scale?.z, 1),
		},
	};
}

function getAssetTransform(assetState) {
	const worldScale = normalizeNumber(assetState?.worldScale, 1);
	return createTransform({
		position: assetState?.transform?.position,
		quaternion: assetState?.transform?.quaternion,
		scale: {
			x: normalizeNumber(assetState?.baseScale?.x, 1) * worldScale,
			y: normalizeNumber(assetState?.baseScale?.y, 1) * worldScale,
			z: normalizeNumber(assetState?.baseScale?.z, 1) * worldScale,
		},
	});
}

function combineTransforms(parentTransform, childTransform) {
	const parentMatrix = new THREE.Matrix4().compose(
		new THREE.Vector3(
			parentTransform.position.x,
			parentTransform.position.y,
			parentTransform.position.z,
		),
		normalizeQuaternion(parentTransform.quaternion),
		new THREE.Vector3(
			parentTransform.scale.x,
			parentTransform.scale.y,
			parentTransform.scale.z,
		),
	);
	const childMatrix = new THREE.Matrix4().compose(
		new THREE.Vector3(
			childTransform.position.x,
			childTransform.position.y,
			childTransform.position.z,
		),
		normalizeQuaternion(childTransform.quaternion),
		new THREE.Vector3(
			childTransform.scale.x,
			childTransform.scale.y,
			childTransform.scale.z,
		),
	);
	const position = new THREE.Vector3();
	const quaternion = new THREE.Quaternion();
	const scale = new THREE.Vector3();
	parentMatrix.multiply(childMatrix).decompose(position, quaternion, scale);
	return createTransform({ position, quaternion, scale });
}

function getSplatAssetTransform(assetState) {
	return combineTransforms(
		getAssetTransform(assetState),
		createTransform({
			position: assetState?.contentTransform?.position,
			quaternion: assetState?.contentTransform?.quaternion,
			scale: assetState?.contentTransform?.scale,
		}),
	);
}

function getTrack(binding, path) {
	return binding?.tracks?.find((candidate) => candidate?.path === path) ?? null;
}

function sampleBinding(binding, path, frame, baseValue) {
	const track = getTrack(binding, path);
	return track ? sampleNumberTrack(track, frame, baseValue) : baseValue;
}

function resolveAnimationRange(animation) {
	const clip = getActiveAnimationClip(animation);
	const startFrame = Math.round(
		normalizeNumber(clip?.playbackStartFrame, clip?.startFrame ?? 1),
	);
	const fallbackEnd =
		Math.round(normalizeNumber(clip?.startFrame, 1)) +
		Math.max(1, Math.round(normalizeNumber(clip?.durationFrames, 1))) -
		1;
	const endFrame = Math.max(
		startFrame,
		Math.round(normalizeNumber(clip?.playbackEndFrame, fallbackEnd)),
	);
	return {
		clip,
		startFrame,
		endFrame,
		fps: Math.max(1, Math.round(normalizeNumber(clip?.fps, 24))),
	};
}

function findBinding(animationRange, targetKind, targetId) {
	return (
		animationRange.clip?.bindings?.find(
			(binding) =>
				binding?.target?.kind === targetKind &&
				String(binding?.target?.id) === String(targetId),
		) ?? null
	);
}

function getFrustum(documentState, near, lens = null) {
	const baseFovX = normalizeNumber(
		lens?.baseFovX,
		documentState?.lens?.baseFovX ?? 50,
	);
	const shiftX = normalizeNumber(
		lens?.shiftX,
		documentState?.lens?.shiftX ?? 0,
	);
	const shiftY = normalizeNumber(
		lens?.shiftY,
		documentState?.lens?.shiftY ?? 0,
	);
	const widthScale = normalizeNumber(documentState?.outputFrame?.widthScale, 1);
	const heightScale = normalizeNumber(
		documentState?.outputFrame?.heightScale,
		1,
	);
	const centerX = normalizeNumber(
		documentState?.outputFrame?.centerX ??
			documentState?.outputFrame?.viewportCenterX,
		0.5,
	);
	const centerY = normalizeNumber(
		documentState?.outputFrame?.centerY ??
			documentState?.outputFrame?.viewportCenterY,
		0.5,
	);
	const baseFrustum = getBaseFrustumExtents({
		near,
		horizontalFovDegrees: baseFovX,
	});
	const targetFrustum = getTargetFrustumExtents({
		near,
		horizontalFovDegrees: baseFovX,
		widthScale,
		heightScale,
		centerX,
		centerY,
	});
	return applyLensShiftToFrustumExtents({
		frustum: targetFrustum,
		baseFrustum,
		shiftX,
		shiftY,
	});
}

function buildCameraAnimation({
	documentState,
	binding,
	animationRange,
	near,
	far,
}) {
	if (!binding) {
		return [];
	}
	const baseQuaternion = normalizeQuaternion(documentState?.pose?.quaternion);
	const baseAngles = decomposeCameraPoseAngles({
		quaternion: baseQuaternion,
		axisLocal: CAMERA_AXIS_LOCAL,
	});
	const basePosition = documentState?.pose?.position ?? {};
	const samples = [];
	for (
		let frame = animationRange.startFrame;
		frame <= animationRange.endFrame;
		frame += 1
	) {
		const angles = {
			yawDeg: sampleBinding(
				binding,
				"transform.rotation.yawDeg",
				frame,
				baseAngles.yawDeg,
			),
			pitchDeg: sampleBinding(
				binding,
				"transform.rotation.pitchDeg",
				frame,
				baseAngles.pitchDeg,
			),
			rollDeg: sampleBinding(
				binding,
				"transform.rotation.rollDeg",
				frame,
				baseAngles.rollDeg,
			),
		};
		const quaternion = composeCameraQuaternionFromPoseAngles({
			axisLocal: CAMERA_AXIS_LOCAL,
			...angles,
		});
		const lens = {
			baseFovX: sampleBinding(
				binding,
				"lens.baseFovX",
				frame,
				documentState?.lens?.baseFovX ?? 50,
			),
			shiftX: sampleBinding(
				binding,
				"lens.shiftX",
				frame,
				documentState?.lens?.shiftX ?? 0,
			),
			shiftY: sampleBinding(
				binding,
				"lens.shiftY",
				frame,
				documentState?.lens?.shiftY ?? 0,
			),
		};
		samples.push({
			frame,
			near,
			far,
			frustum: getFrustum(documentState, near, lens),
			transform: createTransform({
				position: {
					x: sampleBinding(
						binding,
						"transform.position.x",
						frame,
						basePosition.x,
					),
					y: sampleBinding(
						binding,
						"transform.position.y",
						frame,
						basePosition.y,
					),
					z: sampleBinding(
						binding,
						"transform.position.z",
						frame,
						basePosition.z,
					),
				},
				quaternion,
			}),
		});
	}
	return samples;
}

function buildAssetAnimation({
	assetState,
	binding,
	animationRange,
	includeContentTransform = false,
}) {
	if (!binding) {
		return [];
	}
	const baseTransform = getAssetTransform(assetState);
	const baseQuaternion = normalizeQuaternion(assetState?.transform?.quaternion);
	const baseEuler = new THREE.Euler().setFromQuaternion(baseQuaternion, "XYZ");
	const baseScale = normalizeNumber(assetState?.worldScale, 1);
	const samples = [];
	for (
		let frame = animationRange.startFrame;
		frame <= animationRange.endFrame;
		frame += 1
	) {
		const worldScale = sampleBinding(
			binding,
			"transform.worldScale",
			frame,
			baseScale,
		);
		const quaternion = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(
				THREE.MathUtils.degToRad(
					sampleBinding(
						binding,
						"transform.rotation.xDeg",
						frame,
						THREE.MathUtils.radToDeg(baseEuler.x),
					),
				),
				THREE.MathUtils.degToRad(
					sampleBinding(
						binding,
						"transform.rotation.yDeg",
						frame,
						THREE.MathUtils.radToDeg(baseEuler.y),
					),
				),
				THREE.MathUtils.degToRad(
					sampleBinding(
						binding,
						"transform.rotation.zDeg",
						frame,
						THREE.MathUtils.radToDeg(baseEuler.z),
					),
				),
				"XYZ",
			),
		);
		const wrapperTransform = createTransform({
			position: {
				x: sampleBinding(
					binding,
					"transform.position.x",
					frame,
					baseTransform.position.x,
				),
				y: sampleBinding(
					binding,
					"transform.position.y",
					frame,
					baseTransform.position.y,
				),
				z: sampleBinding(
					binding,
					"transform.position.z",
					frame,
					baseTransform.position.z,
				),
			},
			quaternion,
			scale: {
				x: normalizeNumber(assetState?.baseScale?.x, 1) * worldScale,
				y: normalizeNumber(assetState?.baseScale?.y, 1) * worldScale,
				z: normalizeNumber(assetState?.baseScale?.z, 1) * worldScale,
			},
		});
		samples.push({
			frame,
			transform: includeContentTransform
				? combineTransforms(
						wrapperTransform,
						createTransform({
							position: assetState?.contentTransform?.position,
							quaternion: assetState?.contentTransform?.quaternion,
							scale: assetState?.contentTransform?.scale,
						}),
					)
				: wrapperTransform,
		});
	}
	return samples;
}

function exportThreeObjectToGlb(object, Exporter = GLTFExporter) {
	return new Promise((resolve, reject) => {
		const exporter = new Exporter();
		exporter.parse(
			object,
			(result) => {
				if (result instanceof ArrayBuffer) {
					resolve(new Uint8Array(result));
					return;
				}
				reject(new Error("GLTFExporter did not return a binary GLB."));
			},
			reject,
			{
				binary: true,
				onlyVisible: false,
				trs: true,
			},
		);
	});
}

function clampUnitOpen(value) {
	return Math.min(1 - 1e-6, Math.max(1e-6, normalizeNumber(value, 1)));
}

export async function buildSplatGlbBytes(
	packedSplats,
	{
		ColumnClass = null,
		DataTableClass = null,
		MemoryFileSystemClass = null,
		writeGlbFn = null,
	} = {},
) {
	if (
		!ColumnClass ||
		!DataTableClass ||
		!MemoryFileSystemClass ||
		!writeGlbFn
	) {
		const splatTransform = await import("@playcanvas/splat-transform");
		ColumnClass ??= splatTransform.Column;
		DataTableClass ??= splatTransform.DataTable;
		MemoryFileSystemClass ??= splatTransform.MemoryFileSystem;
		writeGlbFn ??= splatTransform.writeGlb;
	}
	const count = Math.max(
		0,
		Math.round(
			normalizeNumber(
				packedSplats?.getNumSplats?.(),
				packedSplats?.numSplats ?? 0,
			),
		),
	);
	if (count === 0 || typeof packedSplats?.forEachSplat !== "function") {
		throw new Error("3DGS asset has no exportable Gaussian data.");
	}
	const columns = Object.fromEntries(
		[
			"x",
			"y",
			"z",
			"scale_0",
			"scale_1",
			"scale_2",
			"f_dc_0",
			"f_dc_1",
			"f_dc_2",
			"opacity",
			"rot_0",
			"rot_1",
			"rot_2",
			"rot_3",
		].map((name) => [name, new Float32Array(count)]),
	);
	packedSplats.forEachSplat(
		(index, center, scales, quaternion, opacity, color) => {
			if (index < 0 || index >= count) {
				return;
			}
			columns.x[index] = normalizeNumber(center?.x);
			columns.y[index] = normalizeNumber(center?.y);
			columns.z[index] = normalizeNumber(center?.z);
			columns.scale_0[index] = Math.log(
				Math.max(1e-8, normalizeNumber(scales?.x, 1e-8)),
			);
			columns.scale_1[index] = Math.log(
				Math.max(1e-8, normalizeNumber(scales?.y, 1e-8)),
			);
			columns.scale_2[index] = Math.log(
				Math.max(1e-8, normalizeNumber(scales?.z, 1e-8)),
			);
			columns.f_dc_0[index] = (normalizeNumber(color?.r, 0.5) - 0.5) / SH_C0;
			columns.f_dc_1[index] = (normalizeNumber(color?.g, 0.5) - 0.5) / SH_C0;
			columns.f_dc_2[index] = (normalizeNumber(color?.b, 0.5) - 0.5) / SH_C0;
			const alpha = clampUnitOpen(opacity);
			columns.opacity[index] = Math.log(alpha / (1 - alpha));
			columns.rot_0[index] = normalizeNumber(quaternion?.w, 1);
			columns.rot_1[index] = normalizeNumber(quaternion?.x);
			columns.rot_2[index] = normalizeNumber(quaternion?.y);
			columns.rot_3[index] = normalizeNumber(quaternion?.z);
		},
	);
	const dataTable = new DataTableClass(
		Object.entries(columns).map(([name, data]) => new ColumnClass(name, data)),
	);
	const memoryFileSystem = new MemoryFileSystemClass();
	await writeGlbFn(
		{
			filename: "splat.glb",
			dataTable,
		},
		memoryFileSystem,
	);
	const bytes = memoryFileSystem.results.get("splat.glb");
	if (!(bytes instanceof Uint8Array)) {
		throw new Error("KHR_gaussian_splatting GLB generation failed.");
	}
	return bytes;
}

function createReferenceFilePath(asset) {
	const fileName = sanitizeFileStem(
		asset?.sourceMeta?.filename ?? asset?.label,
		"reference",
	);
	const dotIndex = fileName.lastIndexOf(".");
	const stem = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
	const extension = dotIndex > 0 ? fileName.slice(dotIndex) : ".bin";
	return `references/${sanitizeFileStem(asset?.id, "reference")}-${stem}${extension}`;
}

function buildCameraReferences({
	referenceDocument,
	documentState,
	output,
	includeReferenceImages,
	referenceEntries,
	referencePaths,
}) {
	if (!includeReferenceImages || !referenceDocument) {
		return [];
	}
	const resolved = resolveReferenceImageItemsForShot(
		referenceDocument,
		documentState?.referenceImages ?? null,
	);
	if (!resolved.preset) {
		return [];
	}
	const renderBoxAnchor = getReferenceImageRenderBoxAnchor(
		documentState?.outputFrame?.anchor ?? "center",
	);
	const references = [];
	for (const item of resolved.items.filter(
		(candidate) => candidate.exportEnabled !== false,
	)) {
		const asset = resolved.assetsById.get(item.assetId);
		const sourceFile = asset?.source?.file;
		if (!(sourceFile instanceof Blob) || !asset?.sourceMeta) {
			continue;
		}
		let path = referencePaths.get(asset.id);
		if (!path) {
			path = createReferenceFilePath(asset);
			referencePaths.set(asset.id, path);
			referenceEntries.push({ path, data: sourceFile });
		}
		const effectiveOffset = applyRenderBoxOffsetCorrection(
			item.offsetPx,
			item.anchor,
			resolved.preset.baseRenderBox,
			{ w: output.width, h: output.height },
			renderBoxAnchor,
			resolved.override?.renderBoxCorrection ?? null,
		);
		const anchorPoint = {
			x: output.width * item.anchor.ax - effectiveOffset.x,
			y: output.height * item.anchor.ay - effectiveOffset.y,
		};
		references.push({
			id: item.id,
			name: item.name,
			path,
			group: item.group,
			order: item.order,
			opacity: item.opacity,
			rotationDeg: item.rotationDeg,
			anchor: item.anchor,
			anchorPoint,
			width: asset.sourceMeta.appliedSize.w * (item.scalePct / 100),
			height: asset.sourceMeta.appliedSize.h * (item.scalePct / 100),
		});
	}
	return references;
}

export async function buildBlenderPackageEntries({
	projectName,
	targetDocuments,
	projectSnapshot,
	sceneAssets,
	shotCameraRegistry,
	getOutputSizeState,
	includeReferenceImages = true,
	GLTFExporterClass = GLTFExporter,
	buildSplatGlb = buildSplatGlbBytes,
	appVersion = "0.0.0",
} = {}) {
	const safeProjectName = sanitizeFileStem(projectName, "camera-frames");
	const blendFile = `${safeProjectName}.blend`;
	const entries = [];
	const referenceEntries = [];
	const referencePaths = new Map();
	const animationRange = resolveAnimationRange(projectSnapshot?.animation);
	const projectAssets = projectSnapshot?.scene?.assets ?? [];
	const runtimeAssetsById = new Map(
		(sceneAssets ?? []).map((asset) => [String(asset.id), asset]),
	);
	const manifestAssets = [];

	for (const [index, assetState] of projectAssets.entries()) {
		if (assetState?.exportRole === "omit") {
			continue;
		}
		const runtimeAsset = runtimeAssetsById.get(String(assetState?.id));
		if (!runtimeAsset) {
			continue;
		}
		const fileStem = `${String(index + 1).padStart(3, "0")}-${sanitizeFileStem(
			removeKnownAssetExtension(assetState?.label),
			assetState?.kind === "splat" ? "splat" : "model",
		)}`;
		const path =
			assetState?.kind === "splat"
				? `splats/${fileStem}.glb`
				: `geometry/${fileStem}.glb`;
		let data;
		let splatCount = null;
		if (assetState?.kind === "splat") {
			const packedSplats = runtimeAsset?.disposeTarget?.packedSplats;
			data = await buildSplatGlb(packedSplats);
			splatCount =
				packedSplats?.getNumSplats?.() ?? packedSplats?.numSplats ?? 0;
		} else {
			data = await exportThreeObjectToGlb(
				runtimeAsset.contentObject ?? runtimeAsset.object,
				GLTFExporterClass,
			);
		}
		entries.push({ path, data });
		const binding = findBinding(
			animationRange,
			ANIMATION_TARGET_SCENE_ASSET,
			assetState.id,
		);
		manifestAssets.push({
			id: String(assetState.id),
			kind: assetState.kind === "splat" ? "splat" : "model",
			name: assetState.label,
			path,
			visible: assetState.visible !== false,
			exportRole: assetState.exportRole ?? "beauty",
			maskGroup: assetState.maskGroup ?? "",
			transform:
				assetState.kind === "splat"
					? getSplatAssetTransform(assetState)
					: getAssetTransform(assetState),
			animation: buildAssetAnimation({
				assetState,
				binding,
				animationRange,
				includeContentTransform: assetState.kind === "splat",
			}),
			...(assetState.kind === "splat"
				? {
						extension: "KHR_gaussian_splatting",
						splatCount,
						shBands: 0,
						fidelity: "runtime-packed-dc",
					}
				: {}),
		});
	}

	const cameras = [];
	for (const documentState of targetDocuments ?? []) {
		const snapshotCamera =
			projectSnapshot?.shotCameras?.find(
				(candidate) => String(candidate?.id) === String(documentState?.id),
			) ?? null;
		const cameraDocument = {
			...documentState,
			pose: snapshotCamera?.pose ?? documentState?.pose ?? null,
		};
		const camera = shotCameraRegistry?.get(documentState.id)?.camera ?? null;
		const near = normalizeNumber(
			camera?.near,
			cameraDocument?.clipping?.near ?? DEFAULT_CAMERA_NEAR,
		);
		const far = normalizeNumber(
			camera?.far,
			cameraDocument?.clipping?.far ?? DEFAULT_CAMERA_FAR,
		);
		const outputSize = getOutputSizeState?.(documentState) ?? {
			width: 1920,
			height: 1080,
		};
		const output = {
			width: Math.max(1, Math.round(normalizeNumber(outputSize.width, 1920))),
			height: Math.max(1, Math.round(normalizeNumber(outputSize.height, 1080))),
		};
		const binding = findBinding(
			animationRange,
			ANIMATION_TARGET_SHOT_CAMERA,
			documentState.id,
		);
		cameras.push({
			id: String(documentState.id),
			name: documentState.name,
			output,
			near,
			far,
			frustum: getFrustum(cameraDocument, near),
			transform: createTransform({
				position: cameraDocument?.pose?.position,
				quaternion: cameraDocument?.pose?.quaternion,
			}),
			references: buildCameraReferences({
				referenceDocument: projectSnapshot?.scene?.referenceImages,
				documentState: cameraDocument,
				output,
				includeReferenceImages,
				referenceEntries,
				referencePaths,
			}),
			animation: buildCameraAnimation({
				documentState: cameraDocument,
				binding,
				animationRange,
				near,
				far,
			}),
		});
	}

	entries.push(...referenceEntries);
	const manifest = {
		schema: "camera_frames_blender_package",
		version: 1,
		generator: {
			name: "CAMERA_FRAMES",
			version: appVersion,
		},
		projectName: safeProjectName,
		blendFile,
		coordinateSystem: {
			source: "right-handed Y-up",
			target: "right-handed Z-up",
		},
		assets: manifestAssets,
		cameras,
		lighting: projectSnapshot?.scene?.lighting ?? {},
		animation: {
			enabled: projectSnapshot?.animation?.enabled === true,
			fps: animationRange.fps,
			startFrame: animationRange.startFrame,
			endFrame: animationRange.endFrame,
		},
	};
	entries.push(
		{
			path: "manifest.json",
			data: toTextBytes(JSON.stringify(manifest, null, 2)),
		},
		{
			path: "build_blend.py",
			data: toTextBytes(createBlenderBuildScript()),
		},
		{
			path: "open_in_blender.cmd",
			data: toTextBytes(createBlenderLauncher({ blendFile })),
		},
		{
			path: "README.txt",
			data: toTextBytes(
				createBlenderPackageReadme({
					appVersion,
					blendFile,
				}),
			),
		},
	);
	return {
		filename: `${safeProjectName}-blender.zip`,
		manifest,
		entries,
	};
}
