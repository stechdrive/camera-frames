import assert from "node:assert/strict";
import {
	disposeMaterial,
	disposeObject,
} from "../src/app/resource-disposal.js";

{
	let textureDisposed = 0;
	let materialDisposed = 0;
	const texture = {
		isTexture: true,
		dispose() {
			textureDisposed += 1;
		},
	};
	const material = {
		map: texture,
		dispose() {
			materialDisposed += 1;
		},
	};

	disposeMaterial(material);

	assert.equal(textureDisposed, 1);
	assert.equal(materialDisposed, 1);
}

{
	let geometryDisposed = 0;
	let materialDisposed = 0;
	let arrayMaterialDisposed = 0;
	const root = {
		traverse(visitor) {
			visitor({
				geometry: {
					dispose() {
						geometryDisposed += 1;
					},
				},
				material: {
					dispose() {
						materialDisposed += 1;
					},
				},
			});
			visitor({
				material: [
					{
						dispose() {
							arrayMaterialDisposed += 1;
						},
					},
					{
						dispose() {
							arrayMaterialDisposed += 1;
						},
					},
				],
			});
		},
	};

	disposeObject(root);

	assert.equal(geometryDisposed, 1);
	assert.equal(materialDisposed, 1);
	assert.equal(arrayMaterialDisposed, 2);
}

console.log("✅ CAMERA_FRAMES resource disposal tests passed!");
