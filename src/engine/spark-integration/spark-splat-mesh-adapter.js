const SPLAT_COUNT_SOURCES = ["splats", "packedSplats", "extSplats"];

function assertSparkSplatMesh(mesh, { requireGenerator = false } = {}) {
	if (!mesh || typeof mesh !== "object") {
		throw new Error("Spark splat mesh contract mismatch: mesh is not an object.");
	}
	if (requireGenerator && typeof mesh.updateGenerator !== "function") {
		throw new Error(
			"Spark splat mesh contract mismatch: mesh.updateGenerator() is required.",
		);
	}
	return mesh;
}

export function getSparkSplatMeshCount(mesh) {
	for (const fieldName of SPLAT_COUNT_SOURCES) {
		const count =
			mesh?.[fieldName]?.getNumSplats?.() ??
			mesh?.[fieldName]?.numSplats ??
			null;
		if (Number.isFinite(count)) {
			return Number(count);
		}
	}
	return 0;
}

export function getSparkSplatMeshColorBufferArray(mesh) {
	return mesh?.splatRgba?.array;
}

export function setSparkSplatMeshColorBuffer(mesh, splatRgba) {
	const targetMesh = assertSparkSplatMesh(mesh, { requireGenerator: true });
	const previousSplatRgba = targetMesh.splatRgba ?? null;
	targetMesh.splatRgba = splatRgba ?? null;
	targetMesh.updateGenerator();
	return previousSplatRgba;
}

export function restoreSparkSplatMeshColorBuffer(mesh, previousSplatRgba = null) {
	const targetMesh = assertSparkSplatMesh(mesh, { requireGenerator: true });
	targetMesh.splatRgba = previousSplatRgba ?? null;
	targetMesh.updateGenerator();
	return targetMesh;
}

export function enableSparkSplatMeshWorldToView(mesh) {
	const targetMesh = assertSparkSplatMesh(mesh);
	targetMesh.enableWorldToView = true;
	return targetMesh;
}
