export function getPackageSaveOptionValue(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

export async function notifyPackageProgress(onProgress, payload) {
	if (typeof onProgress !== "function") {
		return;
	}
	await onProgress(payload);
}

export async function notifyProjectReadProgress(onProgress, payload) {
	if (typeof onProgress !== "function") {
		return;
	}
	await onProgress(payload);
}

export function reportSplatTransformProgress(
	onProgress,
	progress,
	text,
	percent = 0,
) {
	if (!progress) {
		return;
	}
	void notifyPackageProgress(onProgress, {
		...progress,
		stage: "worker-progress",
		message: text,
		percent,
	});
}

export function reportExplicitSplatStage(
	onProgress,
	progress,
	text,
	percent = 0,
) {
	reportSplatTransformProgress(onProgress, progress, text, percent);
}
