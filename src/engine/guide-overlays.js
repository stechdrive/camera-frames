import * as THREE from "three";

export const GUIDE_GRID_LAYER_MODE_BOTTOM = "bottom";
export const GUIDE_GRID_LAYER_MODE_OVERLAY = "overlay";

const GRID_VERTEX_SHADER = /* glsl */ `
	varying vec3 vWorldNear;
	varying vec3 vWorldFar;

	uniform mat4 uViewProjectionInverse;

	void main() {
		vec2 clipPosition = position.xy;
		vec4 nearPoint = uViewProjectionInverse * vec4(clipPosition, -1.0, 1.0);
		vec4 farPoint = uViewProjectionInverse * vec4(clipPosition, 1.0, 1.0);

		vWorldNear = nearPoint.xyz / nearPoint.w;
		vWorldFar = farPoint.xyz / farPoint.w;
		gl_Position = vec4(clipPosition, 0.0, 1.0);
	}
`;

const GRID_FRAGMENT_SHADER = /* glsl */ `
	varying vec3 vWorldNear;
	varying vec3 vWorldFar;

	uniform vec3 uViewPosition;

	bool intersectGroundPlane(in vec3 origin, in vec3 direction, out float t) {
		float denominator = direction.y;
		if (abs(denominator) < 1e-6) {
			return false;
		}

		float hitT = -origin.y / denominator;
		if (hitT < 0.0) {
			return false;
		}

		t = hitT;
		return true;
	}

	float pristineGrid(in vec2 uv, in vec2 ddx, in vec2 ddy, in vec2 lineWidth) {
		vec2 uvDerivative = vec2(
			length(vec2(ddx.x, ddy.x)),
			length(vec2(ddx.y, ddy.y))
		);
		bvec2 invertLine = bvec2(lineWidth.x > 0.5, lineWidth.y > 0.5);
		vec2 targetWidth = vec2(
			invertLine.x ? 1.0 - lineWidth.x : lineWidth.x,
			invertLine.y ? 1.0 - lineWidth.y : lineWidth.y
		);
		vec2 drawWidth = clamp(targetWidth, uvDerivative, vec2(0.5));
		vec2 lineAA = uvDerivative * 1.5;
		vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
		gridUV.x = invertLine.x ? gridUV.x : 1.0 - gridUV.x;
		gridUV.y = invertLine.y ? gridUV.y : 1.0 - gridUV.y;
		vec2 grid = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);

		grid *= clamp(targetWidth / drawWidth, 0.0, 1.0);
		grid = mix(grid, targetWidth, clamp(uvDerivative * 2.0 - 1.0, 0.0, 1.0));
		grid.x = invertLine.x ? 1.0 - grid.x : grid.x;
		grid.y = invertLine.y ? 1.0 - grid.y : grid.y;

		return mix(grid.x, 1.0, grid.y);
	}

	void main() {
		vec3 rayOrigin = vWorldNear;
		vec3 rayDirection = normalize(vWorldFar - vWorldNear);
		float hitT = 0.0;
		if (!intersectGroundPlane(rayOrigin, rayDirection, hitT)) {
			discard;
		}

		vec3 worldPosition = rayOrigin + rayDirection * hitT;
		vec2 planePosition = worldPosition.xz;
		vec2 planeDdx = dFdx(planePosition);
		vec2 planeDdy = dFdy(planePosition);
		float epsilon = 1.0 / 255.0;

		float fade = 1.0 - smoothstep(400.0, 1000.0, length(worldPosition - uViewPosition));
		if (fade < epsilon) {
			discard;
		}

		float axisFalloff = 1.0 - smoothstep(200.0, 400.0, length(planePosition));
		float axisWidth = 0.10;
		float halfWidth = axisWidth * 0.5;
		vec2 derivative = vec2(
			length(vec2(planeDdx.x, planeDdy.x)),
			length(vec2(planeDdx.y, planeDdy.y))
		);
		float axisAAx = derivative.x * 1.5;
		float axisAAz = derivative.y * 1.5;
		float xAxisAlpha = 1.0 - smoothstep(halfWidth - axisAAz, halfWidth + axisAAz, abs(planePosition.y));
		float zAxisAlpha = 1.0 - smoothstep(halfWidth - axisAAx, halfWidth + axisAAx, abs(planePosition.x));
		float axisAlpha = max(xAxisAlpha, zAxisAlpha) * fade * axisFalloff * 1.2;
		if (axisAlpha > epsilon) {
			vec3 axisColor = vec3(1.0);
			if (xAxisAlpha > 0.0 && zAxisAlpha <= 0.0) {
				axisColor = vec3(0.95, 0.28, 0.28);
			} else if (zAxisAlpha > 0.0 && xAxisAlpha <= 0.0) {
				axisColor = vec3(0.22, 0.52, 0.98);
			}
			gl_FragColor = vec4(axisColor, axisAlpha * 0.76);
			return;
		}

		vec2 levelPosition = planePosition * 0.1;
		float levelSize = 2.0 / 1000.0;
		float levelAlpha = pristineGrid(levelPosition, planeDdx * 0.1, planeDdy * 0.1, vec2(levelSize)) * fade * 1.15;
		levelAlpha = min(levelAlpha, 1.0);
		if (levelAlpha > epsilon) {
			gl_FragColor = vec4(vec3(0.86), levelAlpha);
			return;
		}

		levelPosition = planePosition;
		levelSize = 1.0 / 100.0;
		levelAlpha = pristineGrid(levelPosition, planeDdx, planeDdy, vec2(levelSize)) * fade;
		levelAlpha = min(levelAlpha, 1.0);
		if (levelAlpha > epsilon) {
			gl_FragColor = vec4(vec3(0.56), levelAlpha * 0.95);
			return;
		}

		levelPosition = planePosition * 10.0;
		levelSize = 1.0 / 100.0;
		levelAlpha = pristineGrid(levelPosition, planeDdx * 10.0, planeDdy * 10.0, vec2(levelSize)) * fade;
		levelAlpha = min(levelAlpha, 1.0);
		if (levelAlpha > epsilon) {
			gl_FragColor = vec4(vec3(0.40), levelAlpha * 0.72);
			return;
		}

		discard;
	}
`;

const EYE_LEVEL_VERTEX_SHADER = /* glsl */ `
	varying vec3 vWorldNear;
	varying vec3 vWorldFar;

	uniform mat4 uViewProjectionInverse;

	void main() {
		vec2 clipPosition = position.xy;
		vec4 nearPoint = uViewProjectionInverse * vec4(clipPosition, -1.0, 1.0);
		vec4 farPoint = uViewProjectionInverse * vec4(clipPosition, 1.0, 1.0);

		vWorldNear = nearPoint.xyz / nearPoint.w;
		vWorldFar = farPoint.xyz / farPoint.w;
		gl_Position = vec4(clipPosition, 0.0, 1.0);
	}
`;

const EYE_LEVEL_FRAGMENT_SHADER = /* glsl */ `
	varying vec3 vWorldNear;
	varying vec3 vWorldFar;

	uniform vec4 uColor;
	uniform float uLineWidthPx;
	uniform float uGlowWidthPx;
	uniform float uGlowAlpha;
	uniform float uIsPerspective;

	void main() {
		if (uIsPerspective < 0.5) {
			discard;
		}

		vec3 rayDirection = normalize(vWorldFar - vWorldNear);
		float distanceFromHorizon = abs(rayDirection.y);
		float pixelWidth = max(fwidth(rayDirection.y), 1e-6);
		float core = 1.0 - smoothstep(0.0, uLineWidthPx * pixelWidth, distanceFromHorizon);
		float glow = 1.0 - smoothstep(0.0, uGlowWidthPx * pixelWidth, distanceFromHorizon);
		float alpha = max(core, glow * uGlowAlpha);
		if (alpha <= 0.0) {
			discard;
		}

		gl_FragColor = vec4(uColor.rgb, uColor.a * alpha);
	}
`;

function updateCommonOverlayUniforms(camera, uniforms) {
	camera.updateMatrixWorld();
	uniforms.uViewProjectionInverse.value.multiplyMatrices(
		camera.matrixWorld,
		camera.projectionMatrixInverse,
	);
	if (uniforms.uViewPosition) {
		uniforms.uViewPosition.value.setFromMatrixPosition(camera.matrixWorld);
	}
	if (uniforms.uIsPerspective) {
		uniforms.uIsPerspective.value = camera.isPerspectiveCamera ? 1 : 0;
	}
}

function createFullscreenOverlayMesh(material, renderOrder = 0) {
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
	mesh.frustumCulled = false;
	mesh.renderOrder = renderOrder;
	return mesh;
}

function createInfiniteGridMesh() {
	const uniforms = {
		uViewProjectionInverse: { value: new THREE.Matrix4() },
		uViewPosition: { value: new THREE.Vector3() },
	};
	const material = new THREE.ShaderMaterial({
		name: "InfiniteGridOverlayMaterial",
		uniforms,
		vertexShader: GRID_VERTEX_SHADER,
		fragmentShader: GRID_FRAGMENT_SHADER,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		toneMapped: false,
		blending: THREE.NormalBlending,
		extensions: {
			derivatives: true,
		},
	});
	const mesh = createFullscreenOverlayMesh(material);
	mesh.onBeforeRender = (_renderer, _scene, camera) => {
		updateCommonOverlayUniforms(camera, uniforms);
	};
	return mesh;
}

function createEyeLevelMesh() {
	const uniforms = {
		uViewProjectionInverse: { value: new THREE.Matrix4() },
		uColor: { value: new THREE.Vector4(1, 1, 1, 0.92) },
		uLineWidthPx: { value: 1.2 },
		uGlowWidthPx: { value: 4.0 },
		uGlowAlpha: { value: 0.34 },
		uIsPerspective: { value: 1 },
	};
	const material = new THREE.ShaderMaterial({
		name: "EyeLevelOverlayMaterial",
		uniforms,
		vertexShader: EYE_LEVEL_VERTEX_SHADER,
		fragmentShader: EYE_LEVEL_FRAGMENT_SHADER,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		toneMapped: false,
		blending: THREE.NormalBlending,
		extensions: {
			derivatives: true,
		},
	});
	const mesh = createFullscreenOverlayMesh(material);
	mesh.onBeforeRender = (_renderer, _scene, camera) => {
		updateCommonOverlayUniforms(camera, uniforms);
	};
	return mesh;
}

function normalizeGridLayerMode(value) {
	return value === GUIDE_GRID_LAYER_MODE_OVERLAY
		? GUIDE_GRID_LAYER_MODE_OVERLAY
		: GUIDE_GRID_LAYER_MODE_BOTTOM;
}

export function createGuideOverlay() {
	const group = new THREE.Group();
	group.name = "GuideOverlay";

	const backgroundScene = new THREE.Scene();
	const overlayScene = new THREE.Scene();

	const backgroundGrid = createInfiniteGridMesh();
	backgroundGrid.name = "InfiniteGridBackground";
	const overlayGrid = createInfiniteGridMesh();
	overlayGrid.name = "InfiniteGridOverlay";
	const eyeLevel = createEyeLevelMesh();
	eyeLevel.name = "EyeLevelOverlay";

	backgroundScene.add(backgroundGrid);
	overlayScene.add(overlayGrid, eyeLevel);

	function captureState() {
		return {
			gridVisible: backgroundGrid.visible || overlayGrid.visible,
			eyeLevelVisible: eyeLevel.visible,
			gridLayerMode: backgroundGrid.visible
				? GUIDE_GRID_LAYER_MODE_BOTTOM
				: GUIDE_GRID_LAYER_MODE_OVERLAY,
		};
	}

	function applyState(nextState = {}) {
		const gridVisible = nextState.gridVisible !== false;
		const eyeLevelVisible = nextState.eyeLevelVisible !== false;
		const gridLayerMode = normalizeGridLayerMode(nextState.gridLayerMode);
		backgroundGrid.visible =
			gridVisible && gridLayerMode === GUIDE_GRID_LAYER_MODE_BOTTOM;
		overlayGrid.visible =
			gridVisible && gridLayerMode === GUIDE_GRID_LAYER_MODE_OVERLAY;
		eyeLevel.visible = eyeLevelVisible;
		group.visible =
			backgroundGrid.visible || overlayGrid.visible || eyeLevel.visible;
	}

	function renderBackground(renderer, camera) {
		if (!backgroundGrid.visible) {
			return;
		}
		renderer.render(backgroundScene, camera);
	}

	function renderOverlay(renderer, camera) {
		if (!overlayGrid.visible && !eyeLevel.visible) {
			return;
		}
		renderer.render(overlayScene, camera);
	}

	applyState({
		gridVisible: true,
		eyeLevelVisible: true,
		gridLayerMode: GUIDE_GRID_LAYER_MODE_BOTTOM,
	});

	return {
		group,
		captureState,
		applyState,
		renderBackground,
		renderOverlay,
		dispose() {
			for (const overlaySceneEntry of [backgroundScene, overlayScene]) {
				overlaySceneEntry.traverse((node) => {
					node.geometry?.dispose?.();
					if (Array.isArray(node.material)) {
						for (const material of node.material) {
							material.dispose?.();
						}
					} else {
						node.material?.dispose?.();
					}
				});
			}
		},
	};
}
