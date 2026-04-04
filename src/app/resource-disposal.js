export function disposeMaterial(material) {
	if (!material) {
		return;
	}

	for (const value of Object.values(material)) {
		if (value && typeof value === "object" && value.isTexture) {
			value.dispose();
		}
	}

	material.dispose();
}

export function disposeObject(root) {
	root.traverse((node) => {
		if (node.geometry) {
			node.geometry.dispose();
		}

		if (Array.isArray(node.material)) {
			node.material.forEach(disposeMaterial);
		} else if (node.material) {
			disposeMaterial(node.material);
		}
	});
}
