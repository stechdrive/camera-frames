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
