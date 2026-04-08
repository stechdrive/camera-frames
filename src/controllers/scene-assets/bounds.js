import * as THREE from "three";

export function createSceneAssetBoundsController({
	sceneState,
	reportSplatBoundsWarningOnce = () => {},
}) {
	function isFiniteBox(box) {
		if (!box || box.isEmpty()) {
			return false;
		}

		return [
			box.min.x,
			box.min.y,
			box.min.z,
			box.max.x,
			box.max.y,
			box.max.z,
		].every(Number.isFinite);
	}

	function isFiniteVector3(vector) {
		return (
			vector &&
			Number.isFinite(vector.x) &&
			Number.isFinite(vector.y) &&
			Number.isFinite(vector.z)
		);
	}

	function isFiniteQuaternion(quaternion) {
		return (
			quaternion &&
			Number.isFinite(quaternion.x) &&
			Number.isFinite(quaternion.y) &&
			Number.isFinite(quaternion.z) &&
			Number.isFinite(quaternion.w)
		);
	}

	function transformBoxToWorld(box, matrixWorld) {
		if (!isFiniteBox(box)) {
			return null;
		}

		const worldBox = box.clone();
		worldBox.applyMatrix4(matrixWorld);
		return isFiniteBox(worldBox) ? worldBox : null;
	}

	function describeBox(box) {
		if (!box) {
			return null;
		}

		return {
			empty: box.isEmpty(),
			min: {
				x: box.min.x,
				y: box.min.y,
				z: box.min.z,
			},
			max: {
				x: box.max.x,
				y: box.max.y,
				z: box.max.z,
			},
		};
	}

	function getModelAssetBounds(asset) {
		const box = new THREE.Box3().setFromObject(asset.object);
		return isFiniteBox(box) ? box : null;
	}

	function buildSplatLocalBoundsFromIterator(splatMesh, centersOnly = false) {
		if (typeof splatMesh?.forEachSplat !== "function") {
			return null;
		}

		const box = new THREE.Box3();
		const corner = new THREE.Vector3();
		let hasSplats = false;
		const signs = [-1, 1];

		splatMesh.forEachSplat((_index, center, scales, quaternion) => {
			if (!isFiniteVector3(center)) {
				return;
			}

			hasSplats = true;
			if (centersOnly) {
				box.expandByPoint(center);
				return;
			}

			if (!isFiniteVector3(scales) || !isFiniteQuaternion(quaternion)) {
				box.expandByPoint(center);
				return;
			}

			for (const x of signs) {
				for (const y of signs) {
					for (const z of signs) {
						corner.set(x * scales.x, y * scales.y, z * scales.z);
						corner.applyQuaternion(quaternion);
						corner.add(center);
						if (isFiniteVector3(corner)) {
							box.expandByPoint(corner);
						}
					}
				}
			}
		});

		return hasSplats && isFiniteBox(box) ? box : null;
	}

	function buildSplatLocalBoundsFromSource(splatSource, centersOnly = false) {
		return buildSplatLocalBoundsFromIterator(splatSource, centersOnly);
	}

	function quickselect(arr, k, initialLeft = 0, initialRight = arr.length - 1) {
		let lo = initialLeft;
		let hi = initialRight;
		while (lo < hi) {
			const pivot = arr[(lo + hi) >> 1];
			let i = lo;
			let j = hi;
			while (i <= j) {
				while (arr[i] < pivot) i++;
				while (arr[j] > pivot) j--;
				if (i <= j) {
					const tmp = arr[i];
					arr[i] = arr[j];
					arr[j] = tmp;
					i++;
					j--;
				}
			}
			if (k <= j) {
				hi = j;
			} else if (k >= i) {
				lo = i;
			} else {
				break;
			}
		}
		return arr[k];
	}

	function computeTrimmedRange(values, trimFraction = 0.01) {
		if (!Array.isArray(values) || values.length === 0) {
			return null;
		}

		const trimCount =
			values.length >= 256
				? Math.min(
						Math.floor(values.length * trimFraction),
						Math.floor((values.length - 1) / 2),
					)
				: 0;
		const lo = quickselect(values, trimCount);
		const hi = quickselect(values, values.length - 1 - trimCount);
		return { min: lo, max: hi };
	}

	function expandBoxByPadding(box, paddingFactor = 0.05) {
		if (!isFiniteBox(box)) {
			return null;
		}

		const size = box.getSize(new THREE.Vector3());
		const padding = new THREE.Vector3(
			Math.max(size.x * paddingFactor, 0.05),
			Math.max(size.y * paddingFactor, 0.05),
			Math.max(size.z * paddingFactor, 0.05),
		);
		return box.clone().expandByVector(padding);
	}

	function buildSplatFramingBoundsFromSource(
		splatSource,
		{ maxSamples = 32768, trimFraction = 0.01 } = {},
	) {
		if (typeof splatSource?.forEachSplat !== "function") {
			return null;
		}

		const sampleStep = Math.max(
			1,
			Math.ceil((Number(splatSource?.numSplats) || 0) / maxSamples),
		);
		const xs = [];
		const ys = [];
		const zs = [];

		splatSource.forEachSplat((index, center) => {
			if (index % sampleStep !== 0 || !isFiniteVector3(center)) {
				return;
			}
			xs.push(center.x);
			ys.push(center.y);
			zs.push(center.z);
		});

		if (xs.length === 0) {
			return null;
		}

		const xRange = computeTrimmedRange(xs, trimFraction);
		const yRange = computeTrimmedRange(ys, trimFraction);
		const zRange = computeTrimmedRange(zs, trimFraction);
		if (!xRange || !yRange || !zRange) {
			return null;
		}

		const trimmedBox = new THREE.Box3(
			new THREE.Vector3(xRange.min, yRange.min, zRange.min),
			new THREE.Vector3(xRange.max, yRange.max, zRange.max),
		);
		return expandBoxByPadding(trimmedBox);
	}

	function getSplatAssetBounds(asset, centersOnly = false) {
		const splatMesh = asset.disposeTarget;
		const hintedWorldBox = transformBoxToWorld(
			centersOnly ? asset.localCenterBoundsHint : asset.localBoundsHint,
			splatMesh?.matrixWorld ?? asset.object.matrixWorld,
		);
		if (hintedWorldBox) {
			return hintedWorldBox;
		}

		if (typeof splatMesh?.getBoundingBox !== "function") {
			return getModelAssetBounds(asset);
		}

		try {
			asset.object.updateMatrixWorld(true);
			const worldMatrix = splatMesh.matrixWorld;
			if (centersOnly && !asset.localCenterBoundsHint) {
				const framingLocalBox = buildSplatFramingBoundsFromSource(splatMesh);
				const framingWorldBox = transformBoxToWorld(
					framingLocalBox,
					worldMatrix,
				);
				if (framingWorldBox) {
					asset.localCenterBoundsHint = framingLocalBox.clone();
					return framingWorldBox;
				}
			}

			const directLocalBox = splatMesh.getBoundingBox(centersOnly);
			const directWorldBox = transformBoxToWorld(directLocalBox, worldMatrix);
			if (directWorldBox) {
				return directWorldBox;
			}

			const centerLocalBox = centersOnly
				? directLocalBox
				: splatMesh.getBoundingBox(true);
			const directCenterWorldBox = transformBoxToWorld(
				centerLocalBox,
				worldMatrix,
			);
			if (directCenterWorldBox) {
				return directCenterWorldBox;
			}

			const iteratedLocalBox = buildSplatLocalBoundsFromIterator(
				splatMesh,
				centersOnly,
			);
			const iteratedWorldBox = transformBoxToWorld(
				iteratedLocalBox,
				worldMatrix,
			);
			if (iteratedWorldBox) {
				return iteratedWorldBox;
			}

			const iteratedCenterLocalBox = centersOnly
				? iteratedLocalBox
				: buildSplatLocalBoundsFromIterator(splatMesh, true);
			const iteratedCenterWorldBox = transformBoxToWorld(
				iteratedCenterLocalBox,
				worldMatrix,
			);
			if (iteratedCenterWorldBox) {
				return iteratedCenterWorldBox;
			}

			reportSplatBoundsWarningOnce(asset, "splat bounds unavailable", {
				numSplats: splatMesh.numSplats,
				hasPackedSplats: Boolean(splatMesh.packedSplats),
				packedNumSplats: splatMesh.packedSplats?.numSplats ?? null,
				hasExtSplats: Boolean(splatMesh.extSplats),
				extNumSplats: splatMesh.extSplats?.numSplats ?? null,
				directLocalBox: describeBox(directLocalBox),
				centerLocalBox: describeBox(centerLocalBox),
				iteratedLocalBox: describeBox(iteratedLocalBox),
				iteratedCenterLocalBox: describeBox(iteratedCenterLocalBox),
			});

			return getModelAssetBounds(asset);
		} catch {
			reportSplatBoundsWarningOnce(asset, "splat bounds threw", {
				numSplats: splatMesh?.numSplats ?? null,
				hasPackedSplats: Boolean(splatMesh?.packedSplats),
				hasExtSplats: Boolean(splatMesh?.extSplats),
			});
			return getModelAssetBounds(asset);
		}
	}

	function getAssetBounds(asset, { centersOnlyForSplats = false } = {}) {
		if (!asset?.object || asset.object.visible === false) {
			return null;
		}

		return asset.kind === "splat"
			? getSplatAssetBounds(asset, centersOnlyForSplats)
			: getModelAssetBounds(asset);
	}

	function getSceneBounds() {
		const box = new THREE.Box3();
		let hasBounds = false;

		for (const asset of sceneState.assets) {
			const assetBounds = getAssetBounds(asset);
			if (!assetBounds) {
				continue;
			}
			box.union(assetBounds);
			hasBounds = true;
		}

		if (!hasBounds || box.isEmpty()) {
			return null;
		}

		return {
			box,
			size: box.getSize(new THREE.Vector3()),
		};
	}

	function getSceneFramingBounds() {
		const box = new THREE.Box3();
		let hasBounds = false;

		for (const asset of sceneState.assets) {
			const assetBounds = getAssetBounds(asset, {
				centersOnlyForSplats: true,
			});
			if (!assetBounds) {
				continue;
			}
			box.union(assetBounds);
			hasBounds = true;
		}

		if (!hasBounds || box.isEmpty()) {
			return getSceneBounds();
		}

		return {
			box,
			size: box.getSize(new THREE.Vector3()),
		};
	}

	return {
		buildSplatLocalBoundsFromSource,
		buildSplatFramingBoundsFromSource,
		getSceneBounds,
		getSceneFramingBounds,
	};
}
