import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_MANIFEST_PATH,
} from "../../project/document.js";

export function buildPackageProgressOverlay(
	t,
	phase,
	detail = "",
	{ startedAt = 0 } = {},
) {
	const steps = [
		{
			id: "collect-state",
			label: t("overlay.packagePhaseCollect"),
		},
		{
			id: "resolve-assets",
			label: t("overlay.packagePhaseResolve"),
		},
		{
			id: "compress-splats",
			label: t("overlay.packagePhaseCompress"),
		},
		{
			id: "write-package",
			label: t("overlay.packagePhaseWrite"),
		},
	];
	const phaseIndex = steps.findIndex((step) => step.id === phase);

	return {
		kind: "progress",
		title: t("overlay.packageSaveTitle"),
		message: t("overlay.packageSaveMessage"),
		detail,
		startedAt,
		steps: steps.map((step, index) => ({
			label: step.label,
			status:
				index < phaseIndex
					? "done"
					: index === phaseIndex
						? "active"
						: "pending",
		})),
	};
}

export function buildImportProgressOverlay(
	t,
	step,
	detail = "",
	{ startedAt = 0, detailTiming = null } = {},
) {
	const steps = [
		{ key: "verify", label: t("overlay.importPhaseVerify") },
		{ key: "expand", label: t("overlay.importPhaseExpand") },
		{ key: "load", label: t("overlay.importPhaseLoad") },
		{ key: "apply", label: t("overlay.importPhaseApply") },
	];
	const activeIndex = steps.findIndex((entry) => entry.key === step);
	return {
		kind: "progress",
		title: t("overlay.importTitle"),
		message: t("overlay.importMessage"),
		detail,
		startedAt,
		detailTiming,
		steps: steps.map((entry, index) => ({
			label: entry.label,
			status:
				index < activeIndex
					? "done"
					: index === activeIndex
						? "active"
						: "pending",
		})),
	};
}

export function buildImportProgressDetail(
	t,
	{
		stage = "",
		index = 0,
		total = 0,
		assetLabel = "",
		fileLabel = "",
		fileCount = 0,
		referenceTotal = 0,
		resourceType = "",
		bytesCopied = 0,
		totalBytes = 0,
		percent = null,
	} = {},
) {
	const normalizedAssetLabel = String(assetLabel ?? "").trim();
	const normalizedFileLabel = String(fileLabel ?? "").trim();
	const formatBytes = (bytes) => {
		const value = Number(bytes);
		if (!Number.isFinite(value) || value <= 0) {
			return "0 B";
		}
		const units = ["B", "KiB", "MiB", "GiB"];
		let unitIndex = 0;
		let nextValue = value;
		while (nextValue >= 1024 && unitIndex < units.length - 1) {
			nextValue /= 1024;
			unitIndex += 1;
		}
		return `${nextValue >= 10 || unitIndex === 0 ? nextValue.toFixed(0) : nextValue.toFixed(1)} ${units[unitIndex]}`;
	};
	if (stage === "inspect-archive") {
		return t("overlay.importDetailInspectProjectArchive");
	}
	if (stage === "open-archive") {
		return t("overlay.importDetailOpenProjectArchive");
	}
	if (stage === "prepare-local-project-source") {
		return t("overlay.importDetailPrepareLocalProjectSource");
	}
	if (stage === "copy-local-project-source") {
		if (Number.isFinite(percent)) {
			return t("overlay.importDetailCopyLocalProjectSourceProgress", {
				copied: formatBytes(bytesCopied),
				total: formatBytes(totalBytes),
				percent,
			});
		}
		return t("overlay.importDetailCopyLocalProjectSource");
	}
	if (stage === "complete-local-project-source") {
		return t("overlay.importDetailCompleteLocalProjectSource");
	}
	if (stage === "warn-local-project-source") {
		return t("overlay.importDetailWarnLocalProjectSource");
	}
	if (stage === "read-manifest") {
		return t("overlay.importDetailReadProjectManifest", {
			file: fileLabel || PROJECT_MANIFEST_PATH,
		});
	}
	if (stage === "read-project-document") {
		return t("overlay.importDetailReadProjectDocument", {
			file: fileLabel || PROJECT_DOCUMENT_PATH,
		});
	}
	if (stage === "scan-project-assets") {
		return t("overlay.importDetailScanProjectAssets", {
			count: total,
			referenceCount: referenceTotal,
		});
	}
	if (stage === "extract-project-asset") {
		if (
			normalizedAssetLabel &&
			normalizedFileLabel &&
			normalizedAssetLabel !== normalizedFileLabel
		) {
			return t("overlay.importDetailExpandProjectAssetWithFile", {
				index,
				count: total,
				name: normalizedAssetLabel,
				file: normalizedFileLabel,
			});
		}
		return t("overlay.importDetailExpandProjectAsset", {
			index,
			count: total,
			name: normalizedAssetLabel || normalizedFileLabel,
		});
	}
	if (
		stage === "extract-project-asset-file" ||
		stage === "extract-project-asset-packed-splat" ||
		stage === "extract-project-asset-raw-splat"
	) {
		const stageKey =
			stage === "extract-project-asset-file"
				? "overlay.importProjectAssetExtractStage.file"
				: stage === "extract-project-asset-packed-splat"
					? "overlay.importProjectAssetExtractStage.packedSplat"
					: "overlay.importProjectAssetExtractStage.rawSplat";
		return t("overlay.importDetailExtractProjectAssetData", {
			index,
			count: total,
			name: normalizedAssetLabel || normalizedFileLabel,
			file: normalizedFileLabel,
			fileCount,
			stage: t(stageKey),
			resourceType,
		});
	}
	if (stage === "extract-project-asset-complete") {
		return t("overlay.importDetailExpandProjectAssetComplete", {
			index,
			count: total,
		});
	}
	if (stage === "extract-reference-image") {
		return t("overlay.importDetailExtractReferenceImage", {
			index,
			count: total,
			name: normalizedAssetLabel || normalizedFileLabel,
			file: normalizedFileLabel,
		});
	}
	if (stage === "expand-complete") {
		return t("overlay.importDetailExpandComplete", {
			count: total,
			referenceCount: referenceTotal,
		});
	}
	return "";
}

export function buildPackageErrorOverlay(t, error) {
	const detail = String(
		error?.stack ??
			error?.message ??
			error ??
			t("overlay.packageSaveErrorMessage"),
	).trim();
	return {
		kind: "error",
		title: t("overlay.packageSaveErrorTitle"),
		message: t("overlay.packageSaveErrorMessage"),
		detail,
		detailLabel: t("overlay.errorDetails"),
		actions: [
			{
				label: t("action.close"),
				primary: true,
				onClick: () => {},
			},
		],
	};
}

export async function waitForOverlayFrame() {
	if (typeof globalThis.requestAnimationFrame === "function") {
		await new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
		return;
	}
	await new Promise((resolve) => setTimeout(resolve, 0));
}

export function buildPackageProgressDetail(
	t,
	{
		phase,
		stage = "",
		index = 0,
		total = 0,
		assetLabel = "",
		fileLabel = "",
		message = "",
		percent = null,
	} = {},
) {
	const normalizedAssetLabel = String(assetLabel ?? "").trim();
	const normalizedFileLabel = String(fileLabel ?? "").trim();
	const assetDetail =
		total && (normalizedAssetLabel || normalizedFileLabel)
			? normalizedAssetLabel &&
				normalizedFileLabel &&
				normalizedAssetLabel !== normalizedFileLabel
				? t("overlay.packageDetailAssetWithFile", {
						index,
						total,
						name: normalizedAssetLabel,
						file: normalizedFileLabel,
					})
				: t("overlay.packageDetailAsset", {
						index,
						total,
						name: normalizedAssetLabel || normalizedFileLabel,
					})
			: "";
	const stageKey =
		phase === "compress-splats"
			? `overlay.packageCompressStage.${stage}`
			: phase === "write-package"
				? `overlay.packageWriteStage.${stage}`
				: `overlay.packageResolveStage.${stage}`;
	const stageDetail = message
		? percent == null
			? message
			: `${message} (${Math.max(0, Math.min(100, Math.round(percent)))}%)`
		: stage
			? t(stageKey)
			: "";
	const resolvedStageDetail = stageDetail !== stageKey ? stageDetail : "";
	if (assetDetail && resolvedStageDetail) {
		return `${assetDetail} · ${resolvedStageDetail}`;
	}
	return assetDetail || resolvedStageDetail;
}
