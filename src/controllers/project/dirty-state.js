import {
	getProjectSourceStableKey,
	normalizeProjectDocument,
} from "../../project/document.js";

function serializeProjectSourceForDirty(source) {
	if (!source || typeof source !== "object") {
		return null;
	}

	return {
		sourceType: source.sourceType ?? null,
		kind: source.kind ?? null,
		fileName: source.fileName ?? source.file?.name ?? source.name ?? null,
		path: source.path ?? null,
		url: source.url ?? null,
		resourceId: source.resource?.id ?? source.resourceId ?? null,
		resourcePath: source.resource?.path ?? null,
		stableKey: getProjectSourceStableKey(source) ?? null,
	};
}

function buildProjectDirtyPayload(projectSnapshot) {
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	return {
		workspace: normalizedProject.workspace,
		shotCameras: normalizedProject.shotCameras,
		scene: {
			assets: normalizedProject.scene.assets.map((asset) => ({
				...asset,
				source: serializeProjectSourceForDirty(asset.source),
			})),
			lighting: normalizedProject.scene.lighting,
			referenceImages: normalizedProject.scene.referenceImages,
		},
	};
}

export function createProjectDirtyStateController({
	captureProjectState,
	getCurrentPackageFingerprint = () => "",
	getCurrentProjectName = () => "",
	getProjectFileHandle = () => null,
}) {
	let currentDirtySignature = "";
	let currentPackageDirtySignature = "";
	const dirtySignatureCache = new WeakMap();

	function getProjectDirtySignature(projectSnapshot = captureProjectState()) {
		const canCache =
			projectSnapshot !== null && typeof projectSnapshot === "object";
		if (canCache) {
			const cached = dirtySignatureCache.get(projectSnapshot);
			if (cached !== undefined) {
				return cached;
			}
		}
		const signature = JSON.stringify(buildProjectDirtyPayload(projectSnapshot));
		if (canCache) {
			dirtySignatureCache.set(projectSnapshot, signature);
		}
		return signature;
	}

	function clearDirtyBaselines() {
		currentDirtySignature = "";
		currentPackageDirtySignature = "";
	}

	function markCurrentProjectClean(projectSnapshot = captureProjectState()) {
		currentDirtySignature = getProjectDirtySignature(projectSnapshot);
	}

	function markCurrentPackageClean(projectSnapshot = captureProjectState()) {
		currentPackageDirtySignature = getProjectDirtySignature(projectSnapshot);
	}

	function isProjectDirty(projectSnapshot = captureProjectState()) {
		const nextSignature = getProjectDirtySignature(projectSnapshot);
		if (!currentDirtySignature) {
			currentDirtySignature = nextSignature;
			return false;
		}
		return nextSignature !== currentDirtySignature;
	}

	function isPackageDirty(projectSnapshot = captureProjectState()) {
		if (!String(getCurrentPackageFingerprint?.() ?? "").trim()) {
			return true;
		}
		const nextSignature = getProjectDirtySignature(projectSnapshot);
		if (!currentPackageDirtySignature) {
			currentPackageDirtySignature = nextSignature;
			return false;
		}
		return nextSignature !== currentPackageDirtySignature;
	}

	function hasMeaningfulProjectContent(
		projectSnapshot = captureProjectState(),
	) {
		const normalizedProject = normalizeProjectDocument(projectSnapshot);
		const referenceImages = normalizedProject.scene?.referenceImages ?? null;
		const referenceImageCount =
			(referenceImages?.assets?.length ?? 0) +
			(referenceImages?.presets?.reduce(
				(total, preset) => total + (preset?.items?.length ?? 0),
				0,
			) ?? 0);
		return (
			normalizedProject.scene.assets.length > 0 ||
			referenceImageCount > 0 ||
			normalizedProject.shotCameras.length > 1 ||
			Boolean(String(getCurrentProjectName?.() ?? "").trim()) ||
			Boolean(getProjectFileHandle?.())
		);
	}

	function shouldWarnBeforeUnload(projectSnapshot = captureProjectState()) {
		if (isProjectDirty(projectSnapshot)) {
			return true;
		}
		return (
			hasMeaningfulProjectContent(projectSnapshot) &&
			isPackageDirty(projectSnapshot)
		);
	}

	return {
		clearDirtyBaselines,
		getProjectDirtySignature,
		markCurrentProjectClean,
		markCurrentPackageClean,
		isProjectDirty,
		isPackageDirty,
		hasMeaningfulProjectContent,
		shouldWarnBeforeUnload,
	};
}
