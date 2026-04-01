import assert from "node:assert/strict";
import * as THREE from "three";
import { createViewportToolDragOperations } from "../src/controllers/viewport-tool/drag-operations.js";
import { getNdcFromPointer } from "../src/controllers/viewport-tool/gizmo-geometry.js";

function createHarness() {
	const calls = {
		setAssetTransform: [],
		setAssetWorkingPivotWorld: [],
		applySelectedAssetTransforms: [],
	};
	const asset = {
		id: 1,
		worldScale: 1,
		object: new THREE.Group(),
	};
	asset.object.position.set(0, 0, 0);
	asset.object.scale.set(1, 1, 1);
	asset.object.updateMatrixWorld(true);

	const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);

	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const viewportRect = { left: 0, top: 0, width: 100, height: 100 };
	const dragOperations = createViewportToolDragOperations({
		assetController: {
			getAssetWorkingPivotLocal: () => new THREE.Vector3(0, 0, 0),
			setAssetTransform: (assetId, nextTransform, options) => {
				calls.setAssetTransform.push({ assetId, nextTransform, options });
			},
			setAssetWorkingPivotWorld: (assetId, nextPivotWorld, options) => {
				calls.setAssetWorkingPivotWorld.push({
					assetId,
					nextPivotWorld,
					options,
				});
			},
		},
		getSelectedTransformPivotWorld: () => new THREE.Vector3(0, 0, 0),
		createTransformAssetSnapshot: (selectedAsset) => ({
			assetId: selectedAsset.id,
			startWorldPosition: selectedAsset.object.getWorldPosition(
				new THREE.Vector3(),
			),
			startWorldQuaternion: selectedAsset.object.getWorldQuaternion(
				new THREE.Quaternion(),
			),
			startWorldScale: selectedAsset.worldScale,
			startObjectScale: selectedAsset.object.scale.clone(),
			startPivotLocal: new THREE.Vector3(0, 0, 0),
			startPivotWorld: new THREE.Vector3(0, 0, 0),
		}),
		getSelectedTransformAssets: () => [asset],
		getTransformBasisWorld: () => ({
			x: new THREE.Vector3(1, 0, 0),
			y: new THREE.Vector3(0, 1, 0),
			z: new THREE.Vector3(0, 0, 1),
		}),
		getMoveAxisPlaneNormal: () => new THREE.Vector3(0, 0, 1),
		getPointerRay: (event, nextCamera, nextViewportRect) => {
			getNdcFromPointer(event, nextViewportRect, pointerNdc);
			raycaster.setFromCamera(pointerNdc, nextCamera);
			return raycaster.ray;
		},
		applySelectedAssetTransforms: (
			selectedAssets,
			buildTransform,
			historyLabel,
		) => {
			calls.applySelectedAssetTransforms.push({
				selectedAssets,
				historyLabel,
				transforms: selectedAssets.map((selectedAsset) =>
					buildTransform(selectedAsset),
				),
			});
		},
	});

	return {
		asset,
		camera,
		viewportRect,
		calls,
		dragOperations,
	};
}

{
	const harness = createHarness();
	const dragState = harness.dragOperations.beginDragState({
		handleName: "move-x",
		asset: harness.asset,
		camera: harness.camera,
		event: {
			clientX: 50,
			clientY: 50,
			pointerId: 7,
		},
		viewportRect: harness.viewportRect,
		transformSpace: "world",
		pivotEditMode: false,
	});

	assert.equal(dragState?.mode, "move-axis");
	assert.equal(dragState?.pointerId, 7);
	assert.ok(dragState?.axisWorld.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-9);
	assert.ok(
		dragState?.startPoint.distanceTo(new THREE.Vector3(0, 0, 0)) < 1e-9,
	);
	assert.equal(dragState?.selectedAssets.length, 1);
}

{
	const harness = createHarness();
	harness.dragOperations.applyDrag(
		{
			mode: "move-axis",
			assetId: 1,
			startWorldPosition: new THREE.Vector3(0, 0, 0),
			startPivotWorld: new THREE.Vector3(0, 0, 0),
			startPoint: new THREE.Vector3(0, 0, 0),
			axisWorld: new THREE.Vector3(1, 0, 0),
			planeNormal: new THREE.Vector3(0, 0, 1),
			selectedAssets: [],
			pivotEditMode: false,
		},
		new THREE.Ray(new THREE.Vector3(2, 0, 10), new THREE.Vector3(0, 0, -1)),
		{ clientX: 0, clientY: 0 },
	);

	assert.equal(harness.calls.setAssetTransform.length, 1);
	assert.equal(harness.calls.setAssetTransform[0].assetId, 1);
	assert.deepEqual(
		harness.calls.setAssetTransform[0].nextTransform.worldPosition.toArray(),
		[2, 0, 0],
	);
	assert.deepEqual(harness.calls.setAssetTransform[0].options, {
		historyLabel: "asset.transform",
	});
}

{
	const harness = createHarness();
	harness.dragOperations.applyDrag(
		{
			mode: "move-axis",
			assetId: 1,
			startWorldPosition: new THREE.Vector3(0, 0, 0),
			startPivotWorld: new THREE.Vector3(0, 0, 0),
			startPoint: new THREE.Vector3(0, 0, 0),
			axisWorld: new THREE.Vector3(1, 0, 0),
			planeNormal: new THREE.Vector3(0, 0, 1),
			selectedAssets: [
				{
					assetId: 1,
					startWorldPosition: new THREE.Vector3(1, 0, 0),
				},
				{
					assetId: 2,
					startWorldPosition: new THREE.Vector3(3, 0, 0),
				},
			],
			pivotEditMode: false,
		},
		new THREE.Ray(new THREE.Vector3(2, 0, 10), new THREE.Vector3(0, 0, -1)),
		{ clientX: 0, clientY: 0 },
	);

	assert.equal(harness.calls.applySelectedAssetTransforms.length, 1);
	assert.equal(
		harness.calls.applySelectedAssetTransforms[0].historyLabel,
		"asset.transform",
	);
	assert.deepEqual(
		harness.calls.applySelectedAssetTransforms[0].transforms.map((entry) =>
			entry.worldPosition.toArray(),
		),
		[
			[3, 0, 0],
			[5, 0, 0],
		],
	);
}

{
	const harness = createHarness();
	harness.dragOperations.applyDrag(
		{
			mode: "move-axis",
			assetId: 1,
			startWorldPosition: new THREE.Vector3(0, 0, 0),
			startPivotWorld: new THREE.Vector3(0, 0, 0),
			startPoint: new THREE.Vector3(0, 0, 0),
			axisWorld: new THREE.Vector3(1, 0, 0),
			planeNormal: new THREE.Vector3(0, 0, 1),
			selectedAssets: [],
			pivotEditMode: true,
		},
		new THREE.Ray(new THREE.Vector3(2, 0, 10), new THREE.Vector3(0, 0, -1)),
		{ clientX: 0, clientY: 0 },
	);

	assert.equal(harness.calls.setAssetWorkingPivotWorld.length, 1);
	assert.equal(harness.calls.setAssetWorkingPivotWorld[0].assetId, 1);
	assert.deepEqual(
		harness.calls.setAssetWorkingPivotWorld[0].nextPivotWorld.toArray(),
		[2, 0, 0],
	);
	assert.deepEqual(harness.calls.setAssetWorkingPivotWorld[0].options, {
		historyLabel: "asset.pivot",
	});
}

console.log("✅ CAMERA_FRAMES viewport tool drag operations tests passed!");
