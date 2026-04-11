export function createControllerRuntimeResources({
	viewportCanvas,
	viewportPixelRatio,
	defaultCameraNear,
	defaultCameraFar,
	defaultFpsMoveSpeed,
	defaultPointerSlideSpeed,
	defaultPointerScrollSpeed,
	WebGLRendererImpl,
	SceneImpl,
	ColorImpl,
	GroupImpl,
	PerspectiveCameraImpl,
	OrthographicCameraImpl,
	FpsMovementImpl,
	PointerControlsImpl,
	SparkRendererImpl,
	GLTFLoaderImpl,
	createGuideOverlayImpl,
	srgbColorSpace,
}) {
	const renderer = new WebGLRendererImpl({
		canvas: viewportCanvas,
		antialias: false,
		alpha: false,
	});
	renderer.setPixelRatio(viewportPixelRatio);
	renderer.outputColorSpace = srgbColorSpace;

	const scene = new SceneImpl();
	scene.background = new ColorImpl(0x08111d);

	const spark = new SparkRendererImpl({
		renderer,
		sortRadial: true,
		lodSplatScale: 1.1,
	});
	scene.add(spark);

	const contentRoot = new GroupImpl();
	const splatRoot = new GroupImpl();
	const modelRoot = new GroupImpl();
	contentRoot.add(splatRoot, modelRoot);
	scene.add(contentRoot);

	const guides = new GroupImpl();
	const guideOverlay = createGuideOverlayImpl();
	guides.add(guideOverlay.group);
	scene.add(guides);

	const viewportCamera = new PerspectiveCameraImpl(
		50,
		1,
		defaultCameraNear,
		defaultCameraFar,
	);
	const viewportOrthoCamera = new OrthographicCameraImpl(
		-1,
		1,
		1,
		-1,
		defaultCameraNear,
		defaultCameraFar,
	);
	const shotCameraRegistry = new Map();

	const fpsMovement = new FpsMovementImpl({
		moveSpeed: defaultFpsMoveSpeed,
	});
	const pointerControls = new PointerControlsImpl({
		canvas: renderer.domElement,
		slideSpeed: defaultPointerSlideSpeed,
		scrollSpeed: defaultPointerScrollSpeed,
		moveInertia: 0.01,
		rotateInertia: 0.01,
		reverseSlide: true,
	});
	pointerControls.pointerRollScale = 0.0;

	const loader = new GLTFLoaderImpl();

	return {
		renderer,
		scene,
		spark,
		contentRoot,
		splatRoot,
		modelRoot,
		guides,
		guideOverlay,
		viewportCamera,
		viewportOrthoCamera,
		shotCameraRegistry,
		fpsMovement,
		pointerControls,
		loader,
	};
}
