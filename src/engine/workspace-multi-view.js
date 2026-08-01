import { Vector4 } from "three";

function toFiniteNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function normalizeDomRect(rect, label) {
	if (!rect || typeof rect !== "object") {
		throw new TypeError(`${label} must be a rectangle-like object.`);
	}

	const left = toFiniteNumber(rect.left, toFiniteNumber(rect.x));
	const top = toFiniteNumber(rect.top, toFiniteNumber(rect.y));
	const width = Math.max(0, toFiniteNumber(rect.width));
	const height = Math.max(0, toFiniteNumber(rect.height));
	const right = Math.max(left, toFiniteNumber(rect.right, left + width));
	const bottom = Math.max(top, toFiniteNumber(rect.bottom, top + height));

	return { left, top, right, bottom };
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function cloneViewportRect(rect) {
	return {
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height,
	};
}

/**
 * Resolve a pane's renderer viewport in CSS pixels.
 *
 * DOM rectangles use a top-left origin while Three.js viewport/scissor values use
 * a bottom-left origin. The pane is intersected with both the workspace shell and
 * the canvas so a partially hidden pane can never address pixels outside the
 * drawing surface.
 */
export function computeWorkspacePaneViewportScissor({
	canvasRect,
	shellRect = canvasRect,
	paneRect,
}) {
	const canvas = normalizeDomRect(canvasRect, "canvasRect");
	const shell = normalizeDomRect(shellRect, "shellRect");
	const pane = normalizeDomRect(paneRect, "paneRect");

	const intersectionLeft = clamp(
		Math.max(canvas.left, shell.left, pane.left),
		canvas.left,
		canvas.right,
	);
	const intersectionRight = clamp(
		Math.min(canvas.right, shell.right, pane.right),
		canvas.left,
		canvas.right,
	);
	const intersectionTop = clamp(
		Math.max(canvas.top, shell.top, pane.top),
		canvas.top,
		canvas.bottom,
	);
	const intersectionBottom = clamp(
		Math.min(canvas.bottom, shell.bottom, pane.bottom),
		canvas.top,
		canvas.bottom,
	);

	const width = Math.max(0, intersectionRight - intersectionLeft);
	const height = Math.max(0, intersectionBottom - intersectionTop);
	const viewport = {
		x: intersectionLeft - canvas.left,
		y: canvas.bottom - intersectionBottom,
		width,
		height,
	};

	return {
		viewport,
		scissor: cloneViewportRect(viewport),
		visible: width > 0 && height > 0,
	};
}

function assertRendererViewportContract(renderer) {
	for (const methodName of [
		"getViewport",
		"setViewport",
		"getScissor",
		"setScissor",
		"getScissorTest",
		"setScissorTest",
		"getDrawingBufferSize",
	]) {
		if (typeof renderer?.[methodName] !== "function") {
			throw new TypeError(`renderer.${methodName} must be a function.`);
		}
	}
}

function normalizeViewportRect(rect, label) {
	if (!rect || typeof rect !== "object") {
		throw new TypeError(`${label} must be a viewport rectangle.`);
	}
	return {
		x: toFiniteNumber(rect.x),
		y: toFiniteNumber(rect.y),
		width: Math.max(0, toFiniteNumber(rect.width)),
		height: Math.max(0, toFiniteNumber(rect.height)),
	};
}

function resolveRendererPixelRatio(renderer, pixelRatio) {
	const requestedRatio = Number(pixelRatio);
	if (Number.isFinite(requestedRatio) && requestedRatio > 0) {
		return requestedRatio;
	}
	const rendererRatio = Number(renderer.getPixelRatio?.());
	return Number.isFinite(rendererRatio) && rendererRatio > 0
		? rendererRatio
		: 1;
}

/**
 * Temporarily scope a WebGLRenderer to one workspace pane.
 *
 * Three.js accepts viewport/scissor values in logical CSS pixels and applies its
 * pixel ratio internally. SparkRenderer, however, asks getDrawingBufferSize() for
 * its renderSize in physical pixels. Overriding that getter during the callback
 * prevents the pane render from inheriting the full-canvas Spark render size.
 * The callback is intentionally synchronous so renderer-global state cannot leak
 * across an animation-frame boundary.
 */
export function withWorkspacePaneRendererState(
	{ renderer, renderRect, pixelRatio },
	callback,
) {
	assertRendererViewportContract(renderer);
	if (typeof callback !== "function") {
		throw new TypeError("callback must be a function.");
	}

	const viewport = normalizeViewportRect(renderRect?.viewport, "viewport");
	const scissor = normalizeViewportRect(
		renderRect?.scissor ?? renderRect?.viewport,
		"scissor",
	);
	const resolvedPixelRatio = resolveRendererPixelRatio(renderer, pixelRatio);
	const drawingBufferSize = {
		width: Math.max(0, Math.floor(viewport.width * resolvedPixelRatio)),
		height: Math.max(0, Math.floor(viewport.height * resolvedPixelRatio)),
	};

	const previousViewport = renderer.getViewport(new Vector4());
	const previousScissor = renderer.getScissor(new Vector4());
	const previousScissorTest = renderer.getScissorTest();
	const previousGetDrawingBufferSize = renderer.getDrawingBufferSize;
	const hadOwnDrawingBufferGetter = Object.hasOwn(
		renderer,
		"getDrawingBufferSize",
	);

	try {
		renderer.setViewport(
			viewport.x,
			viewport.y,
			viewport.width,
			viewport.height,
		);
		renderer.setScissor(scissor.x, scissor.y, scissor.width, scissor.height);
		renderer.setScissorTest(true);
		renderer.getDrawingBufferSize = (target) =>
			target.set(drawingBufferSize.width, drawingBufferSize.height);

		const result = callback({
			viewport: cloneViewportRect(viewport),
			scissor: cloneViewportRect(scissor),
			drawingBufferSize: { ...drawingBufferSize },
			pixelRatio: resolvedPixelRatio,
		});
		if (result && typeof result.then === "function") {
			throw new TypeError(
				"withWorkspacePaneRendererState callback must be synchronous.",
			);
		}
		return result;
	} finally {
		if (hadOwnDrawingBufferGetter) {
			renderer.getDrawingBufferSize = previousGetDrawingBufferSize;
		} else {
			delete renderer.getDrawingBufferSize;
		}
		renderer.setViewport(previousViewport);
		renderer.setScissor(previousScissor);
		renderer.setScissorTest(previousScissorTest);
	}
}

function normalizeViewId(viewId) {
	if (typeof viewId !== "string" || viewId.trim().length === 0) {
		throw new TypeError("viewId must be a non-empty string.");
	}
	return viewId.trim();
}

function copyPrimarySparkOptions(primarySpark) {
	const options = {};
	for (const key of [
		"sortRadial",
		"enableLod",
		"lodSplatScale",
		"autoUpdate",
		"preUpdate",
		"clock",
	]) {
		if (primarySpark && primarySpark[key] !== undefined) {
			options[key] = primarySpark[key];
		}
	}
	return options;
}

function captureSparkLodOwnershipState(spark) {
	return {
		enableLod: typeof spark?.enableLod === "boolean" ? spark.enableLod : null,
		enableDriveLod:
			typeof spark?.enableDriveLod === "boolean" ? spark.enableDriveLod : null,
		enableLodFetching:
			typeof spark?.enableLodFetching === "boolean"
				? spark.enableLodFetching
				: null,
		hasLodWorker: Boolean(spark?.lodWorker),
		hasPager: Boolean(spark?.pager),
		lodInstanceCount:
			spark?.lodInstances instanceof Map ? spark.lodInstances.size : null,
	};
}

function disposeSecondarySparkRenderer(spark) {
	const errors = [];
	const disposeResource = (resource) => {
		if (!resource || typeof resource.dispose !== "function") {
			return;
		}
		try {
			resource.dispose();
		} catch (error) {
			errors.push(error);
		}
	};

	// Secondary renderers borrow the primary renderer's LoD instance textures.
	// Detach those non-owned references before SparkRenderer.dispose() walks its
	// lodInstances map and disposes every texture it finds.
	spark?.lodInstances?.clear?.();
	disposeResource(spark);
	disposeResource(spark?.geometry);
	const materials = Array.isArray(spark?.material)
		? spark.material
		: [spark?.material];
	for (const material of new Set(materials)) {
		disposeResource(material);
	}
	if (errors.length > 0) {
		throw new AggregateError(
			errors,
			"Failed to dispose a workspace Spark renderer.",
		);
	}
}

/**
 * Own additional SparkRenderer instances that share the primary WebGLRenderer.
 *
 * The primary Spark mesh remains the only SparkRenderer added to the scene. An
 * additional instance must NOT be scene.add()-ed: SparkRenderer.render(scene,
 * camera) temporarily installs that instance as SparkRenderer.sparkOverride, so
 * the scene-owned primary mesh renders with the additional instance's independent
 * accumulator and sort ordering. LoD selection has exactly one owner: the primary
 * renderer. Followers borrow its LoD instances and use the primary-managed shared
 * PagedSplats mapping so two cameras cannot race to overwrite it.
 */
export function createWorkspaceSparkRendererManager({
	primarySpark = null,
	renderer = primarySpark?.renderer ?? null,
	SparkRendererImpl = primarySpark?.constructor ?? null,
	sparkOptions = {},
} = {}) {
	if (!renderer || typeof renderer !== "object") {
		throw new TypeError("renderer is required.");
	}
	if (typeof SparkRendererImpl !== "function") {
		throw new TypeError("SparkRendererImpl must be a constructor.");
	}

	const instances = new Map();
	const baseOptions = {
		...copyPrimarySparkOptions(primarySpark),
		...sparkOptions,
	};
	let disposed = false;

	function assertActive() {
		if (disposed) {
			throw new Error("Workspace Spark renderer manager has been disposed.");
		}
	}

	function create(viewId, options = {}) {
		assertActive();
		const key = normalizeViewId(viewId);
		if (instances.has(key)) {
			throw new Error(`Spark renderer already exists for view: ${key}`);
		}

		const spark = new SparkRendererImpl({
			...baseOptions,
			...options,
			enableDriveLod: false,
			enableLodFetching: false,
			renderer,
		});
		instances.set(key, spark);
		return spark;
	}

	function ensure(viewId, options = {}) {
		assertActive();
		const key = normalizeViewId(viewId);
		return instances.get(key) ?? create(key, options);
	}

	function get(viewId) {
		const key = normalizeViewId(viewId);
		return instances.get(key) ?? null;
	}

	function syncPrimaryLodInstances(viewId) {
		assertActive();
		const spark = get(viewId);
		const targetInstances = spark?.lodInstances;
		if (!(targetInstances instanceof Map)) {
			return spark;
		}

		targetInstances.clear();
		const sourceInstances = primarySpark?.lodInstances;
		if (sourceInstances instanceof Map) {
			for (const [mesh, instance] of sourceInstances) {
				targetInstances.set(mesh, instance);
			}
		}
		return spark;
	}

	function getLodOwnershipState() {
		assertActive();
		const primary = captureSparkLodOwnershipState(primarySpark);
		const followers = [...instances].map(([viewId, spark]) => ({
			viewId,
			...captureSparkLodOwnershipState(spark),
		}));
		return {
			primary,
			followers,
			driverCount:
				Number(primary.enableDriveLod === true) +
				followers.filter((entry) => entry.enableDriveLod === true).length,
		};
	}

	function disposeView(viewId) {
		const key = normalizeViewId(viewId);
		const spark = instances.get(key);
		if (!spark) {
			return false;
		}
		instances.delete(key);
		disposeSecondarySparkRenderer(spark);
		return true;
	}

	function clear() {
		assertActive();
		const errors = [];
		for (const spark of instances.values()) {
			try {
				disposeSecondarySparkRenderer(spark);
			} catch (error) {
				errors.push(error);
			}
		}
		instances.clear();
		if (errors.length > 0) {
			throw new AggregateError(
				errors,
				"Failed to dispose workspace Spark renderers.",
			);
		}
	}

	function dispose() {
		if (disposed) {
			return;
		}
		try {
			clear();
		} finally {
			disposed = true;
		}
	}

	return {
		create,
		ensure,
		get,
		syncPrimaryLodInstances,
		getLodOwnershipState,
		disposeView,
		clear,
		dispose,
		get size() {
			return instances.size;
		},
		get disposed() {
			return disposed;
		},
	};
}
