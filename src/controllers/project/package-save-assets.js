import {
	createProjectFilePackedSplatSource,
	isProjectFilePackedSplatSource,
	sha256Hex,
} from "../../project/document.js";
import {
	buildPackageProgressOverlay,
	waitForOverlayFrame,
} from "./overlays.js";

function toUint8ArrayView(value) {
	if (value instanceof Uint8Array) {
		return value;
	}
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	}
	return new Uint8Array();
}

async function hashBinaryView(value) {
	const bytes = toUint8ArrayView(value);
	return bytes.byteLength > 0 ? await sha256Hex(bytes) : null;
}

async function buildPackedSplatSourceFingerprint(packedSplats) {
	const extraArrayHashes = {};
	for (const [key, value] of Object.entries(packedSplats?.extra ?? {})) {
		if (key === "radMeta") {
			continue;
		}
		const hash = await hashBinaryView(value);
		if (hash) {
			extraArrayHashes[key] = hash;
		}
	}
	return {
		numSplats: packedSplats?.getNumSplats?.() ?? packedSplats?.numSplats ?? 0,
		packedArraySha256: await hashBinaryView(packedSplats?.packedArray),
		extraArraysSha256: extraArrayHashes,
	};
}

function serializeBox3(box) {
	if (!box?.isBox3 || box.isEmpty?.()) {
		return null;
	}
	return {
		min: { x: box.min.x, y: box.min.y, z: box.min.z },
		max: { x: box.max.x, y: box.max.y, z: box.max.z },
	};
}

function normalizeRadBundleChunk(entry, index) {
	const bytes = toUint8ArrayView(entry?.bytes ?? entry?.data);
	const blob = entry?.blob instanceof Blob ? entry.blob : null;
	if (bytes.byteLength === 0 && !blob) {
		return null;
	}
	return {
		name: String(entry?.name || `lod-${index + 1}.radc`),
		bytes: bytes.byteLength > 0 ? bytes : undefined,
		blob: blob ?? undefined,
		size:
			Number.isFinite(entry?.size) && entry.size >= 0
				? Math.floor(entry.size)
				: bytes.byteLength || blob?.size || 0,
		sha256: typeof entry?.sha256 === "string" ? entry.sha256 : null,
	};
}

async function ensureRadEntrySha256(entry) {
	if (!entry || typeof entry.sha256 === "string") {
		return entry;
	}
	if (entry.bytes instanceof Uint8Array && entry.bytes.byteLength > 0) {
		entry.sha256 = await sha256Hex(entry.bytes);
		return entry;
	}
	if (entry.blob instanceof Blob && entry.blob.size > 0) {
		entry.sha256 = await sha256Hex(
			new Uint8Array(await entry.blob.arrayBuffer()),
		);
	}
	return entry;
}

function normalizeLodSplatsForRadBuild(lodSplats) {
	if (!lodSplats || typeof lodSplats !== "object") {
		return null;
	}
	const packedArray =
		lodSplats.packedArray instanceof Uint32Array
			? lodSplats.packedArray
			: null;
	if (!packedArray || packedArray.length === 0) {
		return null;
	}
	return {
		packedArray,
		numSplats: Number.isFinite(lodSplats.numSplats)
			? Math.max(0, Math.floor(lodSplats.numSplats))
			: Math.floor(packedArray.length / 4),
		extra: lodSplats.extra ?? {},
		splatEncoding: lodSplats.splatEncoding ?? null,
	};
}

export function createProjectPackageSaveAssetsController({
	assetController,
	setOverlay,
	t,
	bakeSparkPackedSplatsLodImpl,
	captureSparkPackedSplatsLodImpl,
	supportsSparkRadBundleBuildImpl,
	buildSparkRadBundleFromPackedSplatsImpl,
}) {
	function getSceneSplatAssetsForBake() {
		const assets = assetController?.getSceneAssets?.() ?? [];
		return assets.filter(
			(asset) =>
				asset?.kind === "splat" && asset?.disposeTarget?.packedSplats != null,
		);
	}

	function getAssetBakedQuality(asset) {
		const value = asset?.source?.lodSplats?.bakedQuality;
		return value === "quality" || value === "quick" ? value : null;
	}

	function getSceneBakedLodState() {
		const splats = getSceneSplatAssetsForBake();
		if (splats.length === 0) {
			return {
				hasAnyBaked: false,
				hasAnyQuality: false,
				hasAnyQuick: false,
				maxBakedQuality: null,
				bakedCount: 0,
				qualityCount: 0,
				quickCount: 0,
				splatCount: 0,
			};
		}
		let qualityCount = 0;
		let quickCount = 0;
		for (const asset of splats) {
			const q = getAssetBakedQuality(asset);
			if (q === "quality") qualityCount += 1;
			else if (q === "quick") quickCount += 1;
		}
		const bakedCount = qualityCount + quickCount;
		return {
			hasAnyBaked: bakedCount > 0,
			hasAnyQuality: qualityCount > 0,
			hasAnyQuick: quickCount > 0,
			maxBakedQuality:
				qualityCount > 0 ? "quality" : quickCount > 0 ? "quick" : null,
			bakedCount,
			qualityCount,
			quickCount,
			splatCount: splats.length,
		};
	}

	function attachBakedLodSplatsToAssetSource(asset, capture, metadata) {
		if (!asset || !capture) {
			return false;
		}
		const lodSplatsEntry = {
			...capture,
			bakedAt: metadata?.bakedAt ?? new Date().toISOString(),
			bakedQuality: metadata?.bakedQuality ?? "quick",
		};
		if (isProjectFilePackedSplatSource(asset.source)) {
			asset.source = createProjectFilePackedSplatSource({
				fileName: asset.source.fileName,
				inputBytes: asset.source.inputBytes ?? new Uint8Array(),
				extraFiles: asset.source.extraFiles ?? {},
				fileType: asset.source.fileType ?? null,
				packedArray: asset.source.packedArray ?? new Uint32Array(),
				numSplats: asset.source.numSplats ?? 0,
				extra: asset.source.extra ?? {},
				splatEncoding: asset.source.splatEncoding ?? null,
				lodSplats: lodSplatsEntry,
				projectAssetState: asset.source.projectAssetState ?? null,
				legacyState: asset.source.legacyState ?? null,
				resource: asset.source.resource ?? null,
				radBundle: null,
				skipClone: true,
			});
			return true;
		}
		// Untouched embedded file source (PLY/SPZ): promote to packed-splat source
		// so the serializer writes the baked LoD beside the runtime packedArray.
		const packedSplats = asset.disposeTarget?.packedSplats ?? null;
		if (!packedSplats) {
			return false;
		}
		asset.source = createProjectFilePackedSplatSource({
			fileName:
				asset.source?.fileName ??
				asset.source?.file?.name ??
				`${asset.label ?? "baked"}.rawsplat`,
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: asset.source?.fileType ?? null,
			packedArray: packedSplats.packedArray ?? new Uint32Array(),
			numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
			extra: packedSplats.extra ?? {},
			splatEncoding: packedSplats.splatEncoding ?? null,
			lodSplats: lodSplatsEntry,
			projectAssetState: asset.source?.projectAssetState ?? null,
			legacyState: asset.source?.legacyState ?? null,
			resource: null,
			radBundle: null,
			skipClone: true,
		});
		return true;
	}

	async function attachRadBundleToAssetSource(
		asset,
		radBuildResult,
		{ quality = false } = {},
	) {
		if (!asset || !isProjectFilePackedSplatSource(asset.source)) {
			return false;
		}
		const rootBytes = toUint8ArrayView(
			radBuildResult?.rootBytes ?? radBuildResult?.root?.bytes,
		);
		const rootBlob =
			radBuildResult?.root?.blob instanceof Blob
				? radBuildResult.root.blob
				: null;
		if (rootBytes.byteLength === 0 && !rootBlob) {
			return false;
		}
		const metadata = radBuildResult?.metadata ?? {};
		const chunks = (radBuildResult?.chunks ?? [])
			.map(normalizeRadBundleChunk)
			.filter(Boolean);
		for (const chunk of chunks) {
			await ensureRadEntrySha256(chunk);
		}
		const sourceFingerprint =
			metadata.sourceFingerprint ??
			(await buildPackedSplatSourceFingerprint(
				asset.disposeTarget?.packedSplats,
			));
		const root = await ensureRadEntrySha256({
			name: String(
				radBuildResult?.root?.name ||
					metadata.rootName ||
					`${asset.source.fileName}.lod.rad`,
			),
			bytes: rootBytes.byteLength > 0 ? rootBytes : undefined,
			blob: rootBlob ?? undefined,
			size:
				Number.isFinite(radBuildResult?.root?.size) &&
				radBuildResult.root.size >= 0
					? Math.floor(radBuildResult.root.size)
					: rootBytes.byteLength || rootBlob?.size || 0,
			sha256:
				typeof radBuildResult?.root?.sha256 === "string"
					? radBuildResult.root.sha256
					: null,
		});
		const radBundle = {
			kind: "spark-rad-bundle",
			version: 1,
			root,
			chunks,
			sourceFingerprint,
			bounds: metadata.bounds ?? {
				local: serializeBox3(asset.localBoundsHint),
				center: serializeBox3(asset.localCenterBoundsHint),
			},
			sparkVersion:
				typeof metadata.sparkVersion === "string"
					? metadata.sparkVersion
					: "2.0.0",
			build: {
				...(metadata.build && typeof metadata.build === "object"
					? metadata.build
					: {}),
				mode: "quality",
				chunked: chunks.length > 0,
				quality: Boolean(quality),
			},
		};
		asset.source = createProjectFilePackedSplatSource({
			...asset.source,
			radBundle,
			skipClone: true,
		});
		return true;
	}

	function resolvePackageRadBuildStageLabel(stage) {
		if (!stage) {
			return "";
		}
		const key = `overlay.packageRadBuildStage.${stage}`;
		const label = t(key);
		return label === key ? String(stage) : label;
	}

	async function buildRadBundleForPackageSave(
		asset,
		{ quality = false, lodSplats = null, onProgress = null } = {},
	) {
		if (!supportsSparkRadBundleBuildImpl()) {
			return false;
		}
		const packedSplats = asset?.disposeTarget?.packedSplats;
		if (!packedSplats || !isProjectFilePackedSplatSource(asset?.source)) {
			return false;
		}
		const bounds = {
			local: serializeBox3(asset.localBoundsHint),
			center: serializeBox3(asset.localCenterBoundsHint),
		};
		const result = await buildSparkRadBundleFromPackedSplatsImpl(
			{
				fileName: asset.source.fileName || asset.label || "asset",
				packedArray: packedSplats.packedArray ?? new Uint32Array(),
				extraArrays: packedSplats.extra ?? {},
				splatEncoding: packedSplats.splatEncoding ?? null,
				numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
				bounds,
				quality: Boolean(quality),
				lodSplats: normalizeLodSplatsForRadBuild(
					lodSplats ?? asset.source?.lodSplats,
				),
			},
			{
				onProgress,
			},
		);
		return await attachRadBundleToAssetSource(asset, result, { quality });
	}

	async function bakeAllSplatLodsForPackageSave({
		quality = false,
		startedAt = Date.now(),
	} = {}) {
		const assets = getSceneSplatAssetsForBake();
		const total = assets.length;
		if (total === 0) {
			return;
		}
		const bakedAt = new Date().toISOString();
		const bakedQuality = quality ? "quality" : "quick";
		const canBuildRadBundle = supportsSparkRadBundleBuildImpl();
		for (let index = 0; index < total; index += 1) {
			const asset = assets[index];
			const assetLabel = asset.label || asset?.source?.fileName || "3DGS";
			const existingQuality = getAssetBakedQuality(asset);
			// Smart skip: already baked at the requested quality and the source
			// still carries a matching lodSplats bundle (edits clear it via the
			// default-null path in createProjectFilePackedSplatSource).
			if (
				existingQuality === bakedQuality &&
				asset.source?.lodSplats?.packedArray?.length &&
				(!canBuildRadBundle || asset.source?.radBundle?.root)
			) {
				continue;
			}
			let capture =
				existingQuality === bakedQuality
					? normalizeLodSplatsForRadBuild(asset.source?.lodSplats)
					: null;
			const packedSplats = asset?.disposeTarget?.packedSplats;
			if (!packedSplats) {
				continue;
			}
			if (!capture) {
				setOverlay(
					buildPackageProgressOverlay(
						t,
						"collect-state",
						t("overlay.packageDetailBakeLod", {
							name: assetLabel,
							index: index + 1,
							total,
						}),
						{ startedAt },
					),
				);
				await waitForOverlayFrame();
				await bakeSparkPackedSplatsLodImpl(packedSplats, { quality });
				capture = captureSparkPackedSplatsLodImpl(packedSplats);
				if (capture) {
					attachBakedLodSplatsToAssetSource(asset, capture, {
						bakedAt,
						bakedQuality,
					});
				}
			}
			if (!canBuildRadBundle) {
				continue;
			}
			try {
				setOverlay(
					buildPackageProgressOverlay(
						t,
						"collect-state",
						t("overlay.packageDetailBuildRad", {
							name: assetLabel,
							index: index + 1,
							total,
						}),
						{ startedAt },
					),
				);
				await waitForOverlayFrame();
				await buildRadBundleForPackageSave(asset, {
					quality,
					lodSplats: capture,
					onProgress: async (progress) => {
						const stage = resolvePackageRadBuildStageLabel(progress?.stage);
						setOverlay(
							buildPackageProgressOverlay(
								t,
								"collect-state",
								t("overlay.packageDetailBuildRadStage", {
									name: assetLabel,
									index: index + 1,
									total,
									stage,
								}),
								{ startedAt },
							),
						);
						await waitForOverlayFrame();
					},
				});
			} catch (error) {
				console.warn(
					`[camera-frames] RAD bundle generation failed for "${assetLabel}". Quality save will continue without RAD for this asset.`,
					error,
				);
				setOverlay(
					buildPackageProgressOverlay(
						t,
						"collect-state",
						t("overlay.packageDetailBuildRadFailed", {
							name: assetLabel,
							message: error?.message ?? String(error),
						}),
						{ startedAt },
					),
				);
				await waitForOverlayFrame();
			}
		}
	}

	return {
		getSceneBakedLodState,
		bakeAllSplatLodsForPackageSave,
	};
}
