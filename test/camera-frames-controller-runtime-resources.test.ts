import assert from "node:assert/strict";
import { createControllerRuntimeResources } from "../src/app/controller-runtime-resources.js";

class FakeRenderer {
	constructor(options) {
		this.options = options;
		this.domElement = { id: "canvas" };
		this.pixelRatio = null;
		this.outputColorSpace = null;
	}
	setPixelRatio(value) {
		this.pixelRatio = value;
	}
}

class FakeScene {
	constructor() {
		this.added = [];
		this.background = null;
	}
	add(node) {
		this.added.push(node);
	}
}

class FakeColor {
	constructor(value) {
		this.value = value;
	}
}

class FakeGroup {
	constructor() {
		this.children = [];
	}
	add(...children) {
		this.children.push(...children);
	}
}

class FakePerspectiveCamera {
	constructor(...args) {
		this.args = args;
	}
}

class FakeOrthographicCamera {
	constructor(...args) {
		this.args = args;
	}
}

class FakeFpsMovement {
	constructor(options) {
		this.options = options;
	}
}

class FakePointerControls {
	constructor(options) {
		this.options = options;
		this.pointerRollScale = 1;
	}
}

class FakeSparkRenderer {
	constructor(options) {
		this.options = options;
	}
	driveLod(options) {
		this.lastDriveLodOptions = options;
		return options.camera;
	}
}

class FakeGLTFLoader {}

{
	const resources = createControllerRuntimeResources({
		viewportCanvas: { id: "viewport" },
		viewportPixelRatio: 2,
		defaultCameraNear: 0.1,
		defaultCameraFar: 1000,
		defaultFpsMoveSpeed: 4,
		defaultPointerSlideSpeed: 0.5,
		defaultPointerScrollSpeed: 0.25,
		WebGLRendererImpl: FakeRenderer,
		SceneImpl: FakeScene,
		ColorImpl: FakeColor,
		GroupImpl: FakeGroup,
		PerspectiveCameraImpl: FakePerspectiveCamera,
		OrthographicCameraImpl: FakeOrthographicCamera,
		FpsMovementImpl: FakeFpsMovement,
		PointerControlsImpl: FakePointerControls,
		SparkRendererImpl: FakeSparkRenderer,
		GLTFLoaderImpl: FakeGLTFLoader,
		createGuideOverlayImpl: () => ({ group: { id: "guide-group" } }),
		srgbColorSpace: "srgb",
	});

	assert.equal(resources.renderer.options.canvas.id, "viewport");
	assert.equal(resources.renderer.pixelRatio, 2);
	assert.equal(resources.renderer.outputColorSpace, "srgb");
	assert.equal(resources.scene.background.value, 0x08111d);
	assert.equal(resources.spark.options.renderer, resources.renderer);
	assert.equal(resources.spark.__cameraFramesOrthoLodPatched, true);
	assert.equal(resources.contentRoot.children.length, 2);
	assert.equal(resources.guides.children[0].id, "guide-group");
	assert.deepEqual(resources.viewportCamera.args, [50, 1, 0.1, 1000]);
	assert.deepEqual(
		resources.viewportOrthoCamera.args,
		[-1, 1, 1, -1, 0.1, 1000],
	);
	assert.equal(resources.fpsMovement.options.moveSpeed, 4);
	assert.equal(resources.pointerControls.options.canvas.id, "canvas");
	assert.equal(resources.pointerControls.pointerRollScale, 0);
	assert.ok(resources.loader instanceof FakeGLTFLoader);
	assert.equal(resources.shotCameraRegistry.size, 0);
}

console.log("✅ CAMERA_FRAMES controller runtime resources tests passed!");
