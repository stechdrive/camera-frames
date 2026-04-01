import * as THREE from "three";

function buildBakedContentTransformState(wrapper, contentObject) {
	if (!wrapper || !contentObject) {
		return null;
	}

	wrapper.updateMatrixWorld(true);
	contentObject.updateMatrixWorld(true);
	const bakedLocalMatrix = new THREE.Matrix4().multiplyMatrices(
		wrapper.matrix.clone(),
		contentObject.matrix.clone(),
	);
	const position = new THREE.Vector3();
	const quaternion = new THREE.Quaternion();
	const scale = new THREE.Vector3();
	bakedLocalMatrix.decompose(position, quaternion, scale);
	return {
		position: { x: position.x, y: position.y, z: position.z },
		quaternion: {
			x: quaternion.x,
			y: quaternion.y,
			z: quaternion.z,
			w: quaternion.w,
		},
		scale: { x: scale.x, y: scale.y, z: scale.z },
	};
}

export function createSceneAssetTransformController({
	getSceneAsset,
	getSelectedSceneAssets,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	updateUi = () => {},
	setStatus = () => {},
	t = (key) => key,
	formatAssetWorldScale = (value) => String(value),
	applyAssetWorldScale,
	applyObjectLocalTransformState,
}) {
	function clampAssetWorldScale(value) {
		return Math.max(0.01, Number(value) || 1);
	}

	function clampAssetTransformValue(value, fallback = 0) {
		const nextValue = Number(value);
		return Number.isFinite(nextValue) ? nextValue : fallback;
	}

	function normalizeWorkingPivotLocal(value) {
		if (!value || typeof value !== "object") {
			return null;
		}

		const nextPivot = new THREE.Vector3(
			clampAssetTransformValue(value.x, 0),
			clampAssetTransformValue(value.y, 0),
			clampAssetTransformValue(value.z, 0),
		);
		return nextPivot.lengthSq() <= 1e-8 ? null : nextPivot;
	}

	function getAssetWorkingPivotLocal(assetIdOrAsset) {
		const asset =
			typeof assetIdOrAsset === "object" && assetIdOrAsset
				? assetIdOrAsset
				: getSceneAsset(assetIdOrAsset);
		if (!asset) {
			return null;
		}
		return asset.workingPivotLocal?.clone() ?? new THREE.Vector3(0, 0, 0);
	}

	function getAssetWorkingPivotWorld(assetIdOrAsset) {
		const asset =
			typeof assetIdOrAsset === "object" && assetIdOrAsset
				? assetIdOrAsset
				: getSceneAsset(assetIdOrAsset);
		if (!asset) {
			return null;
		}

		const pivotLocal = getAssetWorkingPivotLocal(asset);
		return asset.object.localToWorld(pivotLocal);
	}

	function setAssetWorkingPivotWorld(
		assetId,
		nextWorldPosition,
		{ historyLabel = "asset.pivot" } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset || !nextWorldPosition) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			const nextLocalPivot = asset.object.worldToLocal(
				nextWorldPosition.clone(),
			);
			asset.workingPivotLocal = normalizeWorkingPivotLocal(nextLocalPivot);
		});
		updateUi();
	}

	function resetAssetWorkingPivot(assetId) {
		const asset = getSceneAsset(assetId);
		if (!asset || !asset.workingPivotLocal) {
			return;
		}

		runHistoryAction?.("asset.pivot", () => {
			asset.workingPivotLocal = null;
		});
		updateUi();
	}

	function setAssetWorldScale(assetId, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.("asset.scale", () => {
			asset.worldScale = clampAssetWorldScale(nextValue);
			applyAssetWorldScale(asset);
		});
		updateUi();
		setStatus(
			t("status.assetScaleUpdated", {
				name: asset.label,
				scale: formatAssetWorldScale(asset.worldScale),
			}),
		);
	}

	function applyAssetTransformWorld(
		asset,
		{ worldPosition = null, worldQuaternion = null, worldScale = null } = {},
	) {
		if (!asset) {
			return;
		}

		if (worldScale !== null && worldScale !== undefined) {
			asset.worldScale = clampAssetWorldScale(worldScale);
			applyAssetWorldScale(asset);
		}

		if (worldPosition) {
			const nextLocalPosition = worldPosition.clone();
			asset.object.parent?.worldToLocal(nextLocalPosition);
			asset.object.position.copy(nextLocalPosition);
		}

		if (worldQuaternion) {
			const nextLocalQuaternion = worldQuaternion.clone();
			if (asset.object.parent) {
				const parentWorldQuaternion = asset.object.parent.getWorldQuaternion(
					new THREE.Quaternion(),
				);
				nextLocalQuaternion.premultiply(parentWorldQuaternion.invert());
			}
			asset.object.quaternion.copy(nextLocalQuaternion);
		}

		asset.object.updateMatrixWorld(true);
	}

	function setAssetTransform(
		assetId,
		{ worldPosition = null, worldQuaternion = null, worldScale = null } = {},
		{ historyLabel = "asset.transform", updateStatus = false } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			applyAssetTransformWorld(asset, {
				worldPosition,
				worldQuaternion,
				worldScale,
			});
		});

		updateUi();
		if (updateStatus) {
			setStatus(
				t("status.assetTransformUpdated", {
					name: asset.label,
				}),
			);
		}
	}

	function setAssetsTransformBulk(
		entries,
		{ historyLabel = "asset.transform", updateStatus = false } = {},
	) {
		if (!Array.isArray(entries) || entries.length === 0) {
			return;
		}

		const normalizedEntries = entries
			.map((entry) => {
				const asset = getSceneAsset(entry?.assetId);
				if (!asset) {
					return null;
				}
				return {
					asset,
					worldPosition: entry.worldPosition ?? null,
					worldQuaternion: entry.worldQuaternion ?? null,
					worldScale: entry.worldScale ?? null,
				};
			})
			.filter(Boolean);

		if (normalizedEntries.length === 0) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			for (const entry of normalizedEntries) {
				applyAssetTransformWorld(entry.asset, entry);
			}
		});

		updateUi();
		if (updateStatus) {
			setStatus(
				t("status.assetTransformUpdated", {
					name:
						normalizedEntries.length === 1
							? normalizedEntries[0].asset.label
							: `${normalizedEntries.length} assets`,
				}),
			);
		}
	}

	function resetAssetWorldScale(assetId) {
		setAssetWorldScale(assetId, 1);
	}

	function resetSelectedSceneAssetsWorldScale() {
		const selectedAssets = getSelectedSceneAssets();
		if (selectedAssets.length === 0) {
			return;
		}

		runHistoryAction?.("asset.scale", () => {
			for (const asset of selectedAssets) {
				asset.worldScale = 1;
				applyAssetWorldScale(asset);
			}
		});
		updateUi();
	}

	function setAssetPosition(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		runHistoryAction?.("asset.position", () => {
			asset.object.position[axis] = clampAssetTransformValue(
				nextValue,
				asset.object.position[axis],
			);
			asset.object.updateMatrixWorld(true);
		});
		updateUi();
	}

	function offsetSelectedSceneAssetsPosition(axis, deltaValue) {
		if (!["x", "y", "z"].includes(axis)) {
			return;
		}

		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return;
		}

		const selectedAssets = getSelectedSceneAssets();
		if (selectedAssets.length === 0) {
			return;
		}

		runHistoryAction?.("asset.position", () => {
			for (const asset of selectedAssets) {
				asset.object.position[axis] = clampAssetTransformValue(
					asset.object.position[axis] + numericDelta,
					asset.object.position[axis],
				);
				asset.object.updateMatrixWorld(true);
			}
		});
		updateUi();
	}

	function setAssetRotationDegrees(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		runHistoryAction?.("asset.rotation", () => {
			asset.object.rotation[axis] = THREE.MathUtils.degToRad(
				clampAssetTransformValue(
					nextValue,
					THREE.MathUtils.radToDeg(asset.object.rotation[axis]),
				),
			);
			asset.object.updateMatrixWorld(true);
		});
		updateUi();
	}

	function offsetSelectedSceneAssetsRotationDegrees(axis, deltaValue) {
		if (!["x", "y", "z"].includes(axis)) {
			return;
		}

		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return;
		}

		const selectedAssets = getSelectedSceneAssets();
		if (selectedAssets.length === 0) {
			return;
		}

		runHistoryAction?.("asset.rotation", () => {
			for (const asset of selectedAssets) {
				asset.object.rotation[axis] += THREE.MathUtils.degToRad(numericDelta);
				asset.object.updateMatrixWorld(true);
			}
		});
		updateUi();
	}

	function applyAssetTransform(assetId) {
		const asset = getSceneAsset(assetId);
		if (
			!asset ||
			!asset.contentObject ||
			asset.contentObject === asset.object
		) {
			return;
		}

		runHistoryAction?.("asset.apply-transform", () => {
			const pivotWorld = getAssetWorkingPivotWorld(asset)?.clone() ?? null;
			const bakedContentTransform = buildBakedContentTransformState(
				asset.object,
				asset.contentObject,
			);
			if (!bakedContentTransform) {
				return;
			}

			applyObjectLocalTransformState(
				asset.contentObject,
				bakedContentTransform,
			);
			asset.baseScale.set(1, 1, 1);
			asset.worldScale = 1;
			asset.object.position.set(0, 0, 0);
			asset.object.quaternion.identity();
			applyAssetWorldScale(asset);
			asset.object.updateMatrixWorld(true);

			if (pivotWorld) {
				const nextLocalPivot = asset.object.worldToLocal(pivotWorld);
				asset.workingPivotLocal = normalizeWorkingPivotLocal(nextLocalPivot);
			}
		});

		updateUi();
		setStatus(
			t("status.assetTransformApplied", {
				name: asset.label,
			}),
		);
	}

	function scaleSelectedSceneAssetsByFactor(scaleFactor) {
		const numericScaleFactor = Number(scaleFactor);
		if (
			!Number.isFinite(numericScaleFactor) ||
			numericScaleFactor <= 0 ||
			Math.abs(numericScaleFactor - 1) <= 1e-8
		) {
			return;
		}

		const selectedAssets = getSelectedSceneAssets();
		if (selectedAssets.length === 0) {
			return;
		}

		runHistoryAction?.("asset.scale", () => {
			for (const asset of selectedAssets) {
				asset.worldScale = clampAssetWorldScale(
					asset.worldScale * numericScaleFactor,
				);
				applyAssetWorldScale(asset);
			}
		});
		updateUi();
	}

	return {
		clampAssetWorldScale,
		clampAssetTransformValue,
		normalizeWorkingPivotLocal,
		getAssetWorkingPivotLocal,
		getAssetWorkingPivotWorld,
		setAssetWorkingPivotWorld,
		resetAssetWorkingPivot,
		setAssetWorldScale,
		setAssetTransform,
		applyAssetTransformWorld,
		setAssetsTransformBulk,
		resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale,
		setAssetPosition,
		offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees,
		applyAssetTransform,
		scaleSelectedSceneAssetsByFactor,
	};
}
