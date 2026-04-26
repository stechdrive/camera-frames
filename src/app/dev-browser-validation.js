import * as THREE from "three";

const RESULT_NODE_ID = "cf-dev-browser-validation-result";

function createCheck(name, ok, details = {}) {
	return {
		name,
		ok: Boolean(ok),
		details,
	};
}

function createErrorDetails(error) {
	return {
		message: error?.message ?? String(error),
		stack: error?.stack ?? null,
	};
}

function getAssetNumSplats(asset) {
	const packedSplats = asset?.disposeTarget?.packedSplats;
	return (
		packedSplats?.getNumSplats?.() ??
		packedSplats?.numSplats ??
		asset?.source?.numSplats ??
		null
	);
}

export function summarizeSceneAssetForDevValidation(asset) {
	const mesh = asset?.disposeTarget ?? null;
	const packedSplats = mesh?.packedSplats ?? null;
	return {
		id: asset?.id ?? null,
		label: asset?.label ?? null,
		kind: asset?.kind ?? null,
		hasPaged: Boolean(mesh?.paged),
		hasPackedSplats: Boolean(packedSplats),
		hasRadRuntime: Boolean(asset?.radBundleRuntime),
		sourceHasRad: Boolean(asset?.source?.radBundle),
		sourceDeferredFullData: Boolean(asset?.source?.deferredFullData),
		enableLod: mesh?.enableLod ?? null,
		numSplats: getAssetNumSplats(asset),
		packedArrayLength: packedSplats?.packedArray?.length ?? null,
		lodSplats: Boolean(packedSplats?.lodSplats),
	};
}

function getSceneAssets(controller) {
	const assets = controller?.__debugGetSceneAssets?.();
	return Array.isArray(assets) ? assets : [];
}

function pickRadBackedAsset(assets, requestedIndex = null) {
	const radAssets = assets.filter(
		(asset) => asset?.kind === "splat" && asset?.source?.radBundle?.root,
	);
	if (radAssets.length === 0) {
		return null;
	}
	if (Number.isFinite(requestedIndex)) {
		return radAssets[Math.max(0, Math.floor(requestedIndex))] ?? radAssets[0];
	}
	return radAssets[0];
}

function getWorldPosition(asset) {
	return asset?.object?.getWorldPosition?.(new THREE.Vector3()) ?? null;
}

async function maybeAwait(value) {
	if (value && typeof value.then === "function") {
		return await value;
	}
	return value;
}

export async function runRadSsprojDevValidation({
	controller,
	projectUrl,
	assetIndex = 0,
} = {}) {
	const startedAt = performance.now();
	const checks = [];
	const observations = {
		projectUrl,
		startedAt: new Date().toISOString(),
	};

	function check(name, ok, details = {}) {
		const entry = createCheck(name, ok, details);
		checks.push(entry);
		return entry;
	}

	try {
		if (!controller) {
			throw new Error("CAMERA_FRAMES controller is unavailable.");
		}
		if (!projectUrl) {
			throw new Error("Missing projectUrl for dev validation.");
		}
		if (typeof controller.openProjectSource !== "function") {
			throw new Error("controller.openProjectSource is unavailable.");
		}

		await maybeAwait(
			controller.openProjectSource(projectUrl, { skipReplaceConfirm: true }),
		);

		const assetsAfterOpen = getSceneAssets(controller);
		const openSummary = assetsAfterOpen.map(
			summarizeSceneAssetForDevValidation,
		);
		observations.assetsAfterOpen = openSummary;
		check("project-opened-assets", assetsAfterOpen.length > 0, {
			count: assetsAfterOpen.length,
		});
		check(
			"rad-backed-paged-assets",
			openSummary.some(
				(asset) =>
					asset.kind === "splat" &&
					asset.hasPaged &&
					asset.hasRadRuntime &&
					asset.sourceHasRad &&
					asset.sourceDeferredFullData,
			),
			{ assets: openSummary },
		);

		const radAsset = pickRadBackedAsset(assetsAfterOpen, assetIndex);
		if (!radAsset) {
			throw new Error("No RAD-backed splat asset was loaded.");
		}
		observations.selectedRadAssetBefore =
			summarizeSceneAssetForDevValidation(radAsset);

		const pagedBefore = radAsset.disposeTarget?.paged;
		const runtimeBefore = radAsset.radBundleRuntime;
		const sourceBefore = radAsset.source;
		const radBundleBefore = radAsset.source?.radBundle;
		const enableLodBefore = radAsset.disposeTarget?.enableLod;
		const startPosition = getWorldPosition(radAsset) ?? new THREE.Vector3();
		const nextPosition = startPosition
			.clone()
			.add(new THREE.Vector3(0.05, 0, 0));
		await maybeAwait(
			controller.setAssetTransform(radAsset.id, {
				worldPosition: nextPosition,
			}),
		);
		const positionAfterTransform =
			getWorldPosition(radAsset) ?? new THREE.Vector3();
		observations.objectTransform = {
			before: observations.selectedRadAssetBefore,
			after: summarizeSceneAssetForDevValidation(radAsset),
			worldPosition: positionAfterTransform.toArray(),
		};
		check(
			"object-transform-keeps-rad-streaming",
			radAsset.disposeTarget?.paged === pagedBefore &&
				radAsset.radBundleRuntime === runtimeBefore &&
				radAsset.source === sourceBefore &&
				radAsset.source?.radBundle === radBundleBefore &&
				radAsset.disposeTarget?.enableLod === enableLodBefore &&
				positionAfterTransform.distanceTo(nextPosition) < 1e-6,
			observations.objectTransform,
		);

		await maybeAwait(controller.selectSceneAsset?.(radAsset.id));
		await maybeAwait(controller.setSplatEditMode?.(true, { silent: true }));
		observations.afterSplatEditMode =
			summarizeSceneAssetForDevValidation(radAsset);
		check(
			"splat-edit-materializes-full-data",
			!radAsset.disposeTarget?.paged &&
				Boolean(radAsset.disposeTarget?.packedSplats) &&
				!radAsset.radBundleRuntime &&
				!radAsset.source?.radBundle &&
				!radAsset.source?.deferredFullData,
			observations.afterSplatEditMode,
		);

		await maybeAwait(controller.setSplatEditMode?.(false, { silent: true }));
	} catch (error) {
		check("dev-validation-error", false, createErrorDetails(error));
	}

	const result = {
		ok: checks.every((entry) => entry.ok),
		checks,
		observations,
		durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
	};
	return result;
}

function ensureResultNode() {
	let node = document.getElementById(RESULT_NODE_ID);
	if (node) {
		return node;
	}
	node = document.createElement("pre");
	node.id = RESULT_NODE_ID;
	node.dataset.testid = RESULT_NODE_ID;
	node.style.cssText = [
		"position:fixed",
		"z-index:2147483647",
		"left:12px",
		"right:12px",
		"bottom:12px",
		"max-height:45vh",
		"overflow:auto",
		"padding:12px",
		"border:1px solid rgba(148, 163, 184, 0.55)",
		"border-radius:8px",
		"background:rgba(15, 23, 42, 0.96)",
		"color:#e5e7eb",
		"font:12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace",
		"white-space:pre-wrap",
		"pointer-events:auto",
	].join(";");
	document.body.appendChild(node);
	return node;
}

function writeResult(value) {
	const node = ensureResultNode();
	node.textContent = JSON.stringify(value, null, 2);
	node.dataset.ok = value?.ok === true ? "true" : "false";
	return node;
}

function getDevValidationParams() {
	const params = new URLSearchParams(window.location.search);
	const mode = params.get("cfDevValidation") || params.get("cfValidate");
	if (!mode) {
		return null;
	}
	return {
		mode,
		projectUrl: params.get("projectUrl") || params.get("cfProjectUrl") || "",
		assetIndex: Number(params.get("assetIndex") ?? 0),
	};
}

export function installDevBrowserValidation({ controller }) {
	async function run(options = {}) {
		writeResult({
			ok: false,
			running: true,
			mode: options.mode ?? "rad-ssproj",
			projectUrl: options.projectUrl ?? "",
			startedAt: new Date().toISOString(),
		});
		const result = await runRadSsprojDevValidation({
			controller,
			projectUrl: options.projectUrl,
			assetIndex: options.assetIndex,
		});
		writeResult(result);
		return result;
	}

	globalThis.__CF_BROWSER_VALIDATE__ = {
		run,
		runRadSsproj: (options = {}) =>
			run({
				...options,
				mode: "rad-ssproj",
			}),
	};

	const params = getDevValidationParams();
	if (params?.mode === "rad-ssproj") {
		queueMicrotask(() => {
			void run(params);
		});
	}
}
