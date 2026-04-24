import * as THREE from "three";
import {
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
} from "../../project/document.js";
import { isProjectFileLazyResourceSource } from "../../project/file/lazy-source.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../../project/package-legacy.js";

const SPARK_SPLAT_CORRECTION_QUATERNION = new THREE.Quaternion(1, 0, 0, 0);

function getLegacySplatCorrectionEulerDegrees(fileName) {
	const extension = String(fileName || "")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase()
		.split(".")
		.pop();

	switch (extension) {
		case "spz":
			return [0, 0, 0];
		case "lcc":
			return [90, 0, 180];
		default:
			return [0, 0, 180];
	}
}

function createQuaternionFromEulerDegrees([x, y, z], order = "XYZ") {
	return new THREE.Quaternion().setFromEuler(
		new THREE.Euler(
			THREE.MathUtils.degToRad(x),
			THREE.MathUtils.degToRad(y),
			THREE.MathUtils.degToRad(z),
			order,
		),
	);
}

export function createSceneAssetProjectStateHelpers({
	sceneState,
	captureObjectLocalTransformState,
	applyObjectLocalTransformState,
	clampAssetWorldScale,
	clampAssetTransformValue,
	normalizeWorkingPivotLocal,
	applyAssetWorldScale,
}) {
	function getExtension(value) {
		const raw =
			typeof value === "string"
				? value
				: isProjectFileEmbeddedFileSource(value) ||
						isProjectFilePackedSplatSource(value)
					? value.fileName
					: isProjectFileLazyResourceSource(value)
						? value.fileName
						: isProjectPackageFileSource(value) ||
								isProjectPackagePackedSplatSource(value)
							? value.fileName
							: value.name;
		const clean = raw.split("?")[0].split("#")[0].toLowerCase();
		const lastDot = clean.lastIndexOf(".");
		return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
	}

	function getLegacyState(value) {
		if (
			isProjectPackageFileSource(value) ||
			isProjectPackagePackedSplatSource(value) ||
			isProjectFileEmbeddedFileSource(value) ||
			isProjectFilePackedSplatSource(value) ||
			isProjectFileLazyResourceSource(value)
		) {
			return value.legacyState ?? null;
		}

		return null;
	}

	function getProjectAssetState(value) {
		if (
			isProjectFileEmbeddedFileSource(value) ||
			isProjectFilePackedSplatSource(value) ||
			isProjectFileLazyResourceSource(value)
		) {
			return value.projectAssetState ?? null;
		}

		return null;
	}

	function getLegacySplatCorrectionQuaternion(source) {
		const legacyState = getLegacyState(source);
		if (!legacyState) {
			return SPARK_SPLAT_CORRECTION_QUATERNION.clone();
		}

		const referenceName =
			legacyState.filename ||
			legacyState.packagePath ||
			legacyState.path ||
			source.path ||
			source.fileName;
		return createQuaternionFromEulerDegrees(
			getLegacySplatCorrectionEulerDegrees(referenceName),
		);
	}

	function getDisplayName(value) {
		if (isProjectFilePackedSplatSource(value)) {
			return value.fileName || "meta.json";
		}
		if (isProjectFileEmbeddedFileSource(value)) {
			return value.fileName || value.file?.name || "asset";
		}
		if (isProjectFileLazyResourceSource(value)) {
			return value.fileName || "asset";
		}
		if (isProjectPackagePackedSplatSource(value)) {
			return value.label || value.fileName || value.path || "meta.json";
		}
		if (isProjectPackageFileSource(value)) {
			return value.label || value.fileName || value.path || "asset";
		}

		if (typeof value !== "string") {
			return value.name;
		}

		try {
			const url = new URL(value);
			const name = url.pathname.split("/").pop() || value;
			return decodeURIComponent(name);
		} catch {
			return value;
		}
	}

	async function fetchUrlAsFile(url, fallbackName = "asset.bin") {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status}`);
		}

		const blob = await response.blob();
		let fileName = fallbackName;
		try {
			const parsedUrl = new URL(url);
			fileName = decodeURIComponent(
				parsedUrl.pathname.split("/").pop() || fallbackName,
			);
		} catch {
			fileName = fallbackName;
		}
		return new File([blob], fileName, {
			type: blob.type || undefined,
		});
	}

	function applyProjectAssetState(asset, projectAssetState) {
		if (!asset || !projectAssetState) {
			return;
		}

		asset.label = String(projectAssetState.label ?? asset.label);
		asset.object.name = asset.label;
		asset.worldScale = clampAssetWorldScale(projectAssetState.worldScale);
		asset.unitMode = projectAssetState.unitMode ?? asset.unitMode;
		asset.exportRole =
			projectAssetState.exportRole === "omit" ? "omit" : "beauty";
		asset.maskGroup = String(projectAssetState.maskGroup ?? "").trim();
		asset.workingPivotLocal = normalizeWorkingPivotLocal(
			projectAssetState.workingPivotLocal,
		);
		asset.baseScale.set(
			clampAssetTransformValue(
				projectAssetState.baseScale?.x,
				asset.baseScale.x,
			),
			clampAssetTransformValue(
				projectAssetState.baseScale?.y,
				asset.baseScale.y,
			),
			clampAssetTransformValue(
				projectAssetState.baseScale?.z,
				asset.baseScale.z,
			),
		);
		applyObjectLocalTransformState(
			asset.contentObject,
			projectAssetState.contentTransform,
		);
		asset.object.visible = projectAssetState.visible !== false;
		asset.object.position.set(
			clampAssetTransformValue(
				projectAssetState.transform?.position?.x,
				asset.object.position.x,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.position?.y,
				asset.object.position.y,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.position?.z,
				asset.object.position.z,
			),
		);
		asset.object.quaternion.set(
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.x,
				asset.object.quaternion.x,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.y,
				asset.object.quaternion.y,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.z,
				asset.object.quaternion.z,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.w,
				asset.object.quaternion.w,
			),
		);
		applyAssetWorldScale(asset);
		asset.object.updateMatrixWorld(true);
	}

	function captureProjectSceneState() {
		return (sceneState?.assets ?? []).map((asset, index) => ({
			id: String(asset.id),
			kind: asset.kind,
			label: asset.label,
			source: asset.source,
			transform: {
				position: {
					x: asset.object.position.x,
					y: asset.object.position.y,
					z: asset.object.position.z,
				},
				quaternion: {
					x: asset.object.quaternion.x,
					y: asset.object.quaternion.y,
					z: asset.object.quaternion.z,
					w: asset.object.quaternion.w,
				},
			},
			contentTransform: captureObjectLocalTransformState(asset.contentObject),
			baseScale: {
				x: asset.baseScale.x,
				y: asset.baseScale.y,
				z: asset.baseScale.z,
			},
			worldScale: asset.worldScale,
			unitMode: asset.unitMode,
			visible: asset.object.visible !== false,
			exportRole: asset.exportRole ?? "beauty",
			maskGroup: asset.maskGroup ?? "",
			workingPivotLocal: asset.workingPivotLocal
				? {
						x: asset.workingPivotLocal.x,
						y: asset.workingPivotLocal.y,
						z: asset.workingPivotLocal.z,
					}
				: null,
			legacyState: getLegacyState(asset.source),
			order: index,
		}));
	}

	return {
		getExtension,
		getLegacyState,
		getProjectAssetState,
		getLegacySplatCorrectionQuaternion,
		getDisplayName,
		fetchUrlAsFile,
		applyProjectAssetState,
		captureProjectSceneState,
	};
}
