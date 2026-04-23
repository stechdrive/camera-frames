import * as THREE from "three";
import {
	debugSplatPerf,
	isSplatPerfDebugEnabled,
} from "../../debug/splat-perf-debug.js";
import { fromHalf } from "../../engine/spark-integration/spark-symbols.js";
import {
	getAssetIdKey,
	getSplatAssetTotalCount,
	getSplatAssetWorldMatrix,
	getSplatPackedSource,
} from "./asset-accessors.js";
import {
	MAX_BRUSH_GRID_CELL_SIZE,
	MAX_BRUSH_GRID_QUERY_CELLS,
	MIN_BRUSH_GRID_CELL_SIZE,
	MIN_BRUSH_INDEX_SPLAT_COUNT,
} from "./pure-utils.js";

export function createBrushSpatialIndex({ pointInSplatEditBox }) {
	const brushSpatialIndexByAssetId = new Map();
	const tempBrushBoundsSize = new THREE.Vector3();
	const tempBrushQueryStart = new THREE.Vector3();
	const tempBrushQueryEnd = new THREE.Vector3();
	const tempBrushQueryBounds = new THREE.Box3();
	const tempDirection = new THREE.Vector3();
	const tempWorldPoint = new THREE.Vector3();

	function invalidateBrushSpatialIndex(assetOrAssetId) {
		const rawAssetId = assetOrAssetId?.id ?? assetOrAssetId;
		if (rawAssetId === null || rawAssetId === undefined) {
			return false;
		}
		const assetIdKey = getAssetIdKey(rawAssetId);
		return brushSpatialIndexByAssetId.delete(assetIdKey);
	}

	function clearBrushSpatialIndices() {
		brushSpatialIndexByAssetId.clear();
	}

	function matrixElementsMatch(cachedElements, nextElements) {
		if (
			!Array.isArray(cachedElements) ||
			!nextElements ||
			cachedElements.length !== 16
		) {
			return false;
		}
		const epsilon = 1e-6;
		for (let index = 0; index < 16; index += 1) {
			const cached = cachedElements[index];
			const next = nextElements[index];
			if (!Number.isFinite(cached) || !Number.isFinite(next)) {
				return false;
			}
			const scale = Math.max(Math.abs(cached), Math.abs(next), 1);
			if (Math.abs(cached - next) > epsilon * scale) {
				return false;
			}
		}
		return true;
	}

	function estimateBrushSpatialIndexCellSize(worldBounds, splatCount) {
		if (!worldBounds || worldBounds.isEmpty()) {
			return Math.max(MIN_BRUSH_GRID_CELL_SIZE, 1);
		}
		const boundsSize = worldBounds.getSize(tempBrushBoundsSize);
		const extents = [boundsSize.x, boundsSize.y, boundsSize.z].filter(
			(axisLength) => Number.isFinite(axisLength) && axisLength > 1e-4,
		);
		let spacingEstimate = Math.max(MIN_BRUSH_GRID_CELL_SIZE, 1);
		if (extents.length > 0 && splatCount > 1) {
			const measure = extents.reduce(
				(product, axisLength) => product * axisLength,
				1,
			);
			if (measure > 0) {
				spacingEstimate =
					extents.length === 1
						? measure / splatCount
						: extents.length === 2
							? Math.sqrt(measure / splatCount)
							: Math.cbrt(measure / splatCount);
			}
		}
		return Math.min(
			MAX_BRUSH_GRID_CELL_SIZE,
			Math.max(MIN_BRUSH_GRID_CELL_SIZE, spacingEstimate * 2),
		);
	}

	function getBrushGridCellKey(x, y, z, inverseCellSize) {
		return `${Math.floor(x * inverseCellSize)},${Math.floor(y * inverseCellSize)},${Math.floor(z * inverseCellSize)}`;
	}

	function ensureBrushSpatialIndex(asset) {
		const splatMesh = asset?.disposeTarget;
		if (!asset?.id || !splatMesh) {
			return null;
		}
		const packedSplats = getSplatPackedSource(asset);
		const packedArray = packedSplats?.packedArray ?? null;
		const totalCount = Number.isFinite(packedSplats?.numSplats)
			? packedSplats.numSplats
			: getSplatAssetTotalCount(asset);
		if (totalCount < MIN_BRUSH_INDEX_SPLAT_COUNT) {
			invalidateBrushSpatialIndex(asset);
			return null;
		}
		const worldMatrix = getSplatAssetWorldMatrix(asset);
		if (!worldMatrix?.elements) {
			return null;
		}
		const assetIdKey = getAssetIdKey(asset.id);
		const existingEntry = brushSpatialIndexByAssetId.get(assetIdKey);
		if (
			existingEntry?.mesh === splatMesh &&
			existingEntry.totalCount === totalCount &&
			existingEntry.packedArray === packedArray &&
			matrixElementsMatch(
				existingEntry.worldMatrixElements,
				worldMatrix.elements,
			)
		) {
			return existingEntry;
		}

		const perfEnabled = isSplatPerfDebugEnabled();
		const perfStart = perfEnabled ? performance.now() : 0;
		const worldPoints = new Float32Array(totalCount * 3);
		const worldBounds = new THREE.Box3();
		let hasBounds = false;
		if (packedArray && totalCount > 0) {
			const me = worldMatrix.elements;
			for (let index = 0; index < totalCount; index += 1) {
				const packedOffset = index * 4;
				const word1 = packedArray[packedOffset + 1];
				const word2 = packedArray[packedOffset + 2];
				const lx = fromHalf(word1 & 0xffff);
				const ly = fromHalf(word1 >>> 16);
				const lz = fromHalf(word2 & 0xffff);
				const pointOffset = index * 3;
				const wx = me[0] * lx + me[4] * ly + me[8] * lz + me[12];
				const wy = me[1] * lx + me[5] * ly + me[9] * lz + me[13];
				const wz = me[2] * lx + me[6] * ly + me[10] * lz + me[14];
				worldPoints[pointOffset] = wx;
				worldPoints[pointOffset + 1] = wy;
				worldPoints[pointOffset + 2] = wz;
				tempWorldPoint.set(wx, wy, wz);
				worldBounds.expandByPoint(tempWorldPoint);
				hasBounds = true;
			}
		} else if (typeof splatMesh?.forEachSplat === "function") {
			splatMesh.forEachSplat((index, center) => {
				tempWorldPoint.copy(center);
				tempWorldPoint.applyMatrix4(worldMatrix);
				const pointOffset = index * 3;
				worldPoints[pointOffset] = tempWorldPoint.x;
				worldPoints[pointOffset + 1] = tempWorldPoint.y;
				worldPoints[pointOffset + 2] = tempWorldPoint.z;
				worldBounds.expandByPoint(tempWorldPoint);
				hasBounds = true;
			});
		}
		if (!hasBounds || worldBounds.isEmpty()) {
			brushSpatialIndexByAssetId.delete(assetIdKey);
			return null;
		}

		const cellSize = estimateBrushSpatialIndexCellSize(worldBounds, totalCount);
		const inverseCellSize = 1 / cellSize;
		const cells = new Map();
		for (let index = 0; index < totalCount; index += 1) {
			const pointOffset = index * 3;
			const cellKey = getBrushGridCellKey(
				worldPoints[pointOffset],
				worldPoints[pointOffset + 1],
				worldPoints[pointOffset + 2],
				inverseCellSize,
			);
			let cell = cells.get(cellKey);
			if (!cell) {
				cell = [];
				cells.set(cellKey, cell);
			}
			cell.push(index);
		}

		const nextEntry = {
			mesh: splatMesh,
			packedArray,
			totalCount,
			cellSize,
			inverseCellSize,
			worldBounds,
			worldPoints,
			cells,
			worldMatrixElements: Array.from(worldMatrix.elements),
		};
		brushSpatialIndexByAssetId.set(assetIdKey, nextEntry);
		if (perfEnabled) {
			debugSplatPerf("grid-init", {
				assetId: asset.id ?? null,
				totalCount,
				cellCount: cells.size,
				cellSize: Number(cellSize.toFixed(4)),
				elapsedMs: Number((performance.now() - perfStart).toFixed(2)),
			});
		}
		return nextEntry;
	}

	function getBrushIndexQueryCandidates(
		indexEntry,
		{
			hitX,
			hitY,
			hitZ,
			dirX,
			dirY,
			dirZ,
			maxAxialDistance,
			brushRadius,
			isThrough,
		},
	) {
		const worldBounds = indexEntry?.worldBounds;
		if (!worldBounds || worldBounds.isEmpty()) {
			return null;
		}
		let axialMin = Number.POSITIVE_INFINITY;
		let axialMax = Number.NEGATIVE_INFINITY;
		for (const cornerX of [worldBounds.min.x, worldBounds.max.x]) {
			for (const cornerY of [worldBounds.min.y, worldBounds.max.y]) {
				for (const cornerZ of [worldBounds.min.z, worldBounds.max.z]) {
					const axial =
						(cornerX - hitX) * dirX +
						(cornerY - hitY) * dirY +
						(cornerZ - hitZ) * dirZ;
					axialMin = Math.min(axialMin, axial);
					axialMax = Math.max(axialMax, axial);
				}
			}
		}
		if (!Number.isFinite(axialMin) || !Number.isFinite(axialMax)) {
			return null;
		}
		const queryAxialMin = isThrough ? axialMin : Math.max(-1e-4, axialMin, 0);
		const queryAxialMax = isThrough
			? axialMax
			: Math.min(maxAxialDistance, axialMax);
		if (queryAxialMax < queryAxialMin) {
			return [];
		}
		tempBrushQueryStart
			.set(hitX, hitY, hitZ)
			.addScaledVector(tempDirection.set(dirX, dirY, dirZ), queryAxialMin);
		tempBrushQueryEnd
			.set(hitX, hitY, hitZ)
			.addScaledVector(tempDirection.set(dirX, dirY, dirZ), queryAxialMax);
		tempBrushQueryBounds.makeEmpty();
		tempBrushQueryBounds.expandByPoint(tempBrushQueryStart);
		tempBrushQueryBounds.expandByPoint(tempBrushQueryEnd);
		tempBrushQueryBounds.expandByScalar(brushRadius);
		const minCellX = Math.floor(
			tempBrushQueryBounds.min.x * indexEntry.inverseCellSize,
		);
		const maxCellX = Math.floor(
			tempBrushQueryBounds.max.x * indexEntry.inverseCellSize,
		);
		const minCellY = Math.floor(
			tempBrushQueryBounds.min.y * indexEntry.inverseCellSize,
		);
		const maxCellY = Math.floor(
			tempBrushQueryBounds.max.y * indexEntry.inverseCellSize,
		);
		const minCellZ = Math.floor(
			tempBrushQueryBounds.min.z * indexEntry.inverseCellSize,
		);
		const maxCellZ = Math.floor(
			tempBrushQueryBounds.max.z * indexEntry.inverseCellSize,
		);
		const queryCellCount =
			(maxCellX - minCellX + 1) *
			(maxCellY - minCellY + 1) *
			(maxCellZ - minCellZ + 1);
		if (
			!Number.isFinite(queryCellCount) ||
			queryCellCount <= 0 ||
			queryCellCount > MAX_BRUSH_GRID_QUERY_CELLS
		) {
			return null;
		}
		const candidateIndices = [];
		for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
			for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
				for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
					const cellIndices = indexEntry.cells.get(
						`${cellX},${cellY},${cellZ}`,
					);
					if (cellIndices?.length) {
						candidateIndices.push(...cellIndices);
					}
				}
			}
		}
		return candidateIndices;
	}

	function brushPointMatchesCylinder(
		worldX,
		worldY,
		worldZ,
		{
			hitX,
			hitY,
			hitZ,
			dirX,
			dirY,
			dirZ,
			brushRadiusSq,
			maxAxialDistance,
			isThrough,
		},
	) {
		const vx = worldX - hitX;
		const vy = worldY - hitY;
		const vz = worldZ - hitZ;
		const axial = vx * dirX + vy * dirY + vz * dirZ;
		if (!isThrough && (axial < -1e-4 || axial > maxAxialDistance)) {
			return false;
		}
		const px = vx - dirX * axial;
		const py = vy - dirY * axial;
		const pz = vz - dirZ * axial;
		return px * px + py * py + pz * pz <= brushRadiusSq;
	}

	function applyBrushHitToSpatialIndex(
		indexEntry,
		nextSelection,
		brushOptions,
		subtract,
		touched = null,
	) {
		const candidateIndices = getBrushIndexQueryCandidates(
			indexEntry,
			brushOptions,
		);
		let changedCount = 0;
		if (Array.isArray(candidateIndices)) {
			for (const index of candidateIndices) {
				if (!subtract && nextSelection.has(index)) {
					continue;
				}
				const pointOffset = index * 3;
				if (
					!brushPointMatchesCylinder(
						indexEntry.worldPoints[pointOffset],
						indexEntry.worldPoints[pointOffset + 1],
						indexEntry.worldPoints[pointOffset + 2],
						brushOptions,
					)
				) {
					continue;
				}
				if (subtract) {
					if (nextSelection.delete(index)) {
						changedCount += 1;
						touched?.add(index);
					}
				} else {
					nextSelection.add(index);
					changedCount += 1;
					touched?.add(index);
				}
			}
			return changedCount;
		}
		for (let index = 0; index < indexEntry.totalCount; index += 1) {
			if (!subtract && nextSelection.has(index)) {
				continue;
			}
			const pointOffset = index * 3;
			if (
				!brushPointMatchesCylinder(
					indexEntry.worldPoints[pointOffset],
					indexEntry.worldPoints[pointOffset + 1],
					indexEntry.worldPoints[pointOffset + 2],
					brushOptions,
				)
			) {
				continue;
			}
			if (subtract) {
				if (nextSelection.delete(index)) {
					changedCount += 1;
					touched?.add(index);
				}
			} else {
				nextSelection.add(index);
				changedCount += 1;
				touched?.add(index);
			}
		}
		return changedCount;
	}

	function findReusableBrushSpatialIndex(asset, worldMatrix) {
		if (!asset?.id) {
			return null;
		}
		const assetIdKey = getAssetIdKey(asset.id);
		const existingEntry = brushSpatialIndexByAssetId.get(assetIdKey);
		if (!existingEntry) {
			return null;
		}
		const splatMesh = asset.disposeTarget;
		if (existingEntry.mesh !== splatMesh) {
			return null;
		}
		const packedArray = getSplatPackedSource(asset)?.packedArray ?? null;
		if (existingEntry.packedArray !== packedArray) {
			return null;
		}
		if (
			!worldMatrix?.elements ||
			!matrixElementsMatch(
				existingEntry.worldMatrixElements,
				worldMatrix.elements,
			)
		) {
			return null;
		}
		return existingEntry;
	}

	function getBoxIndexQueryCandidates(indexEntry, boxVolume) {
		const bounds = boxVolume?.bounds;
		if (!bounds || bounds.isEmpty()) {
			return null;
		}
		const { inverseCellSize } = indexEntry;
		if (!Number.isFinite(inverseCellSize) || inverseCellSize <= 0) {
			return null;
		}
		const minCellX = Math.floor(bounds.min.x * inverseCellSize);
		const maxCellX = Math.floor(bounds.max.x * inverseCellSize);
		const minCellY = Math.floor(bounds.min.y * inverseCellSize);
		const maxCellY = Math.floor(bounds.max.y * inverseCellSize);
		const minCellZ = Math.floor(bounds.min.z * inverseCellSize);
		const maxCellZ = Math.floor(bounds.max.z * inverseCellSize);
		const queryCellCount =
			(maxCellX - minCellX + 1) *
			(maxCellY - minCellY + 1) *
			(maxCellZ - minCellZ + 1);
		if (
			!Number.isFinite(queryCellCount) ||
			queryCellCount <= 0 ||
			queryCellCount > MAX_BRUSH_GRID_QUERY_CELLS
		) {
			return null;
		}
		const candidateIndices = [];
		for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
			for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
				for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
					const cellIndices = indexEntry.cells.get(
						`${cellX},${cellY},${cellZ}`,
					);
					if (cellIndices?.length) {
						candidateIndices.push(...cellIndices);
					}
				}
			}
		}
		return candidateIndices;
	}

	function applyBoxSelectionToSpatialIndex(
		indexEntry,
		boxVolume,
		nextSelection,
		subtract,
		touched = null,
	) {
		const candidateIndices = getBoxIndexQueryCandidates(indexEntry, boxVolume);
		if (!Array.isArray(candidateIndices)) {
			return null;
		}
		let changedCount = 0;
		for (const index of candidateIndices) {
			if (!subtract && nextSelection.has(index)) {
				continue;
			}
			const pointOffset = index * 3;
			tempWorldPoint.set(
				indexEntry.worldPoints[pointOffset],
				indexEntry.worldPoints[pointOffset + 1],
				indexEntry.worldPoints[pointOffset + 2],
			);
			if (!pointInSplatEditBox(tempWorldPoint, boxVolume)) {
				continue;
			}
			if (subtract) {
				if (nextSelection.delete(index)) {
					changedCount += 1;
					touched?.add(index);
				}
			} else {
				const sizeBefore = nextSelection.size;
				nextSelection.add(index);
				if (nextSelection.size !== sizeBefore) {
					changedCount += 1;
					touched?.add(index);
				}
			}
		}
		return changedCount;
	}

	return {
		invalidateBrushSpatialIndex,
		clearBrushSpatialIndices,
		ensureBrushSpatialIndex,
		findReusableBrushSpatialIndex,
		getBrushIndexQueryCandidates,
		brushPointMatchesCylinder,
		applyBrushHitToSpatialIndex,
		getBoxIndexQueryCandidates,
		applyBoxSelectionToSpatialIndex,
	};
}
