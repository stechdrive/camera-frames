import * as THREE from "three";

const DEFAULT_COLOR = 0x8fd7ff;

function isFiniteVector3Like(value) {
	return (
		value &&
		Number.isFinite(value.x) &&
		Number.isFinite(value.y) &&
		Number.isFinite(value.z)
	);
}

export function createSplatEditSceneHelper() {
	const group = new THREE.Group();
	group.name = "splat-edit-helper";

	const box = new THREE.Box3(
		new THREE.Vector3(-0.5, -0.5, -0.5),
		new THREE.Vector3(0.5, 0.5, 0.5),
	);
	const boxHelper = new THREE.Box3Helper(box, DEFAULT_COLOR);
	if (boxHelper.material) {
		boxHelper.material.transparent = true;
		boxHelper.material.opacity = 0.92;
		boxHelper.material.depthTest = false;
		boxHelper.material.depthWrite = false;
		boxHelper.material.toneMapped = false;
	}
	boxHelper.visible = false;
	group.add(boxHelper);

	function sync({ visible = false, center = null, size = null } = {}) {
		if (
			!visible ||
			!isFiniteVector3Like(center) ||
			!isFiniteVector3Like(size)
		) {
			boxHelper.visible = false;
			return;
		}
		const halfSize = new THREE.Vector3(
			Math.max(Number(size.x) || 0, 0.001) * 0.5,
			Math.max(Number(size.y) || 0, 0.001) * 0.5,
			Math.max(Number(size.z) || 0, 0.001) * 0.5,
		);
		box.min.copy(center).sub(halfSize);
		box.max.copy(center).add(halfSize);
		boxHelper.updateMatrixWorld(true);
		boxHelper.visible = true;
	}

	function clear() {
		boxHelper.visible = false;
	}

	function dispose() {
		group.remove(boxHelper);
		boxHelper.geometry?.dispose?.();
		boxHelper.material?.dispose?.();
	}

	return {
		group,
		sync,
		clear,
		dispose,
	};
}
