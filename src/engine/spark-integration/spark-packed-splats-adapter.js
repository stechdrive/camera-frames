function assertSparkPackedSplats(packedSplats) {
	if (!packedSplats || typeof packedSplats !== "object") {
		throw new Error(
			"Spark packed splats contract mismatch: packedSplats is not an object.",
		);
	}
	return packedSplats;
}

function assertSparkPackedSplatMesh(mesh, { requireUpdateVersion = false } = {}) {
	if (!mesh || typeof mesh !== "object") {
		throw new Error(
			"Spark packed splat mesh contract mismatch: mesh is not an object.",
		);
	}
	if (typeof mesh.updateGenerator !== "function") {
		throw new Error(
			"Spark packed splat mesh contract mismatch: mesh.updateGenerator() is required.",
		);
	}
	if (requireUpdateVersion && typeof mesh.updateVersion !== "function") {
		throw new Error(
			"Spark packed splat mesh contract mismatch: mesh.updateVersion() is required.",
		);
	}
	return mesh;
}

export function resetSparkPackedSplatsRuntimeResources(
	packedSplats,
	{ packedArray = null, extra = {}, splatEncoding = null } = {},
) {
	const target = assertSparkPackedSplats(packedSplats);
	target.source?.dispose?.();
	target.target?.dispose?.();
	target.source = null;
	target.target = null;
	target.packedArray =
		packedArray instanceof Uint32Array ? packedArray : target.packedArray;
	target.extra = extra;
	target.splatEncoding = splatEncoding;
	target.needsUpdate = true;
	return target;
}

export function restoreSparkPackedSplatsInPlace(
	packedSplats,
	{
		packedArray = null,
		extra = {},
		splatEncoding = null,
		numSplats = 0,
	} = {},
) {
	const target = assertSparkPackedSplats(packedSplats);
	if (
		!(packedArray instanceof Uint32Array) ||
		!(target.packedArray instanceof Uint32Array) ||
		target.packedArray.length !== packedArray.length
	) {
		return false;
	}
	target.packedArray.set(packedArray);
	const currentExtra =
		target.extra && typeof target.extra === "object" ? { ...target.extra } : {};
	for (const key of ["lodTree", "sh1", "sh2", "sh3"]) {
		const nextArray = extra?.[key];
		const currentArray = currentExtra[key];
		if (!(nextArray instanceof Uint32Array)) {
			delete currentExtra[key];
			continue;
		}
		if (
			currentArray instanceof Uint32Array &&
			currentArray.length === nextArray.length
		) {
			currentArray.set(nextArray);
			currentExtra[key] = currentArray;
			continue;
		}
		currentExtra[key] = new Uint32Array(nextArray);
	}
	if (extra?.radMeta && typeof extra.radMeta === "object") {
		currentExtra.radMeta = JSON.parse(JSON.stringify(extra.radMeta));
	} else {
		currentExtra.radMeta = undefined;
	}
	target.extra = currentExtra;
	target.splatEncoding = splatEncoding;
	target.numSplats =
		Number.isFinite(numSplats) && numSplats >= 0
			? Math.floor(numSplats)
			: target.numSplats;
	target.needsUpdate = true;
	return true;
}

export function reinitializeSparkPackedSplats(
	packedSplats,
	{
		packedArray = null,
		numSplats = 0,
		extra = {},
		splatEncoding = null,
	} = {},
) {
	const target = assertSparkPackedSplats(packedSplats);
	if (typeof target.reinitialize !== "function") {
		throw new Error(
			"Spark packed splats contract mismatch: packedSplats.reinitialize() is required.",
		);
	}
	target.reinitialize({
		packedArray,
		numSplats,
		extra,
		splatEncoding,
		lod: target.lod,
		nonLod: target.nonLod,
	});
	return target;
}

export function disposeSparkPackedSplatsLod(packedSplats) {
	const target = assertSparkPackedSplats(packedSplats);
	target.disposeLodSplats?.();
	target.needsUpdate = true;
	return target;
}

export async function bakeSparkPackedSplatsLod(
	packedSplats,
	{ quality = false } = {},
) {
	const target = assertSparkPackedSplats(packedSplats);
	if (typeof target.createLodSplats !== "function") {
		throw new Error(
			"Spark packed splats contract mismatch: createLodSplats() is required.",
		);
	}
	await target.createLodSplats({ quality: Boolean(quality) });
	target.needsUpdate = true;
	return target;
}

function cloneLodExtraArrays(extra) {
	if (!extra || typeof extra !== "object") {
		return {};
	}
	const sanitized = {};
	for (const key of ["lodTree", "sh1", "sh2", "sh3"]) {
		const array = extra[key];
		if (array instanceof Uint32Array && array.length > 0) {
			sanitized[key] = new Uint32Array(array);
		}
	}
	return sanitized;
}

export function captureSparkPackedSplatsLod(packedSplats) {
	const target = assertSparkPackedSplats(packedSplats);
	const lod = target.lodSplats;
	if (!lod) {
		return null;
	}
	const packedArray =
		lod.packedArray instanceof Uint32Array
			? new Uint32Array(lod.packedArray)
			: null;
	if (!packedArray || packedArray.length === 0) {
		return null;
	}
	return {
		packedArray,
		numSplats: lod.getNumSplats?.() ?? lod.numSplats ?? 0,
		extra: cloneLodExtraArrays(lod.extra),
		splatEncoding:
			lod.splatEncoding && typeof lod.splatEncoding === "object"
				? JSON.parse(JSON.stringify(lod.splatEncoding))
				: null,
	};
}

export function attachPrebuiltLodSplats(
	packedSplats,
	lodSplatsInstance,
) {
	const target = assertSparkPackedSplats(packedSplats);
	target.disposeLodSplats?.();
	if (lodSplatsInstance) {
		target.lodSplats = lodSplatsInstance;
		target.needsUpdate = true;
	}
	return target;
}

export function refreshSparkPackedSplatMesh(
	mesh,
	packedSplats,
	{ updateVersion = false } = {},
) {
	const targetMesh = assertSparkPackedSplatMesh(mesh, {
		requireUpdateVersion: updateVersion,
	});
	const targetPackedSplats = assertSparkPackedSplats(packedSplats);
	targetMesh.numSplats =
		targetPackedSplats.getNumSplats?.() ?? targetPackedSplats.numSplats ?? 0;
	targetMesh.lastSplats = null;
	targetMesh.splats = targetPackedSplats;
	targetMesh.generatorDirty = true;
	targetMesh.updateGenerator();
	if (updateVersion) {
		targetMesh.updateVersion();
	}
	return targetMesh;
}
