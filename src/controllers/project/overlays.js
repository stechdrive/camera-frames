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

export function buildImportProgressOverlay(t, step, detail = "") {
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
	{ stage = "", index = 0, total = 0, assetLabel = "", fileLabel = "" } = {},
) {
	if (stage === "inspect-archive") {
		return t("overlay.importDetailInspectProjectArchive");
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
	if (stage === "extract-project-asset") {
		if (assetLabel && fileLabel && assetLabel !== fileLabel) {
			return t("overlay.importDetailExpandProjectAssetWithFile", {
				index,
				count: total,
				name: assetLabel,
				file: fileLabel,
			});
		}
		return t("overlay.importDetailExpandProjectAsset", {
			index,
			count: total,
			name: assetLabel || fileLabel,
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
