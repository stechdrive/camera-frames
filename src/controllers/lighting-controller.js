import * as THREE from "three";
import {
	DEFAULT_MODEL_LIGHT_AZIMUTH_DEG,
	DEFAULT_MODEL_LIGHT_ELEVATION_DEG,
	cloneLightingState,
	createDefaultLightingState,
	lightingStatesEqual,
	normalizeLightingState,
} from "../lighting-model.js";

const KEY_LIGHT_DISTANCE = 8;
const AMBIENT_FILL_UP_DISTANCE = 6;
const AMBIENT_FILL_DOWN_DISTANCE = 5;
const AMBIENT_FILL_UP_FACTOR = 0.18;
const AMBIENT_FILL_DOWN_FACTOR = 0.12;

function degToRad(value) {
	return THREE.MathUtils.degToRad(Number(value) || 0);
}

function buildDirectionPosition(azimuthDeg, elevationDeg, distance) {
	const azimuth = degToRad(azimuthDeg);
	const elevation = degToRad(elevationDeg);
	const cosElevation = Math.cos(elevation);
	return new THREE.Vector3(
		Math.sin(azimuth) * cosElevation * distance,
		Math.sin(elevation) * distance,
		Math.cos(azimuth) * cosElevation * distance,
	);
}

export function createLightingController({
	store,
	scene,
	updateUi,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
}) {
	const rigRoot = new THREE.Group();
	rigRoot.name = "camera-frames-lighting-rig";

	const keyLightTarget = new THREE.Object3D();
	const keyLight = new THREE.DirectionalLight(0xffffff, 1);
	keyLight.name = "camera-frames-model-light";
	keyLight.castShadow = false;
	keyLight.target = keyLightTarget;

	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	ambientLight.name = "camera-frames-ambient-light";

	const ambientFillUpTarget = new THREE.Object3D();
	const ambientFillUp = new THREE.DirectionalLight(0xffffff, 0);
	ambientFillUp.name = "camera-frames-ambient-fill-up";
	ambientFillUp.castShadow = false;
	ambientFillUp.target = ambientFillUpTarget;

	const ambientFillDownTarget = new THREE.Object3D();
	const ambientFillDown = new THREE.DirectionalLight(0xffffff, 0);
	ambientFillDown.name = "camera-frames-ambient-fill-down";
	ambientFillDown.castShadow = false;
	ambientFillDown.target = ambientFillDownTarget;

	rigRoot.add(
		keyLight,
		keyLightTarget,
		ambientLight,
		ambientFillUp,
		ambientFillUpTarget,
		ambientFillDown,
		ambientFillDownTarget,
	);
	scene.add(rigRoot);

	function applyLightingState(
		nextState,
		{ syncStore = true, notifyUi = true } = {},
	) {
		const normalized = normalizeLightingState(nextState);
		const {
			ambient,
			modelLight: { enabled, intensity, azimuthDeg, elevationDeg },
		} = normalized;

		ambientLight.intensity = ambient;

		keyLight.visible = enabled;
		keyLight.intensity = intensity;
		keyLight.position.copy(
			buildDirectionPosition(azimuthDeg, elevationDeg, KEY_LIGHT_DISTANCE),
		);
		keyLightTarget.position.set(0, 0, 0);

		ambientFillUp.intensity = ambient * AMBIENT_FILL_UP_FACTOR;
		ambientFillUp.position.copy(
			buildDirectionPosition(30, 60, AMBIENT_FILL_UP_DISTANCE),
		);
		ambientFillUpTarget.position.set(0, 0, 0);

		ambientFillDown.intensity = ambient * AMBIENT_FILL_DOWN_FACTOR;
		ambientFillDown.position.copy(
			buildDirectionPosition(-30, -50, AMBIENT_FILL_DOWN_DISTANCE),
		);
		ambientFillDownTarget.position.set(0, 0, 0);

		rigRoot.updateMatrixWorld(true);

		if (syncStore) {
			store.lighting.state.value = cloneLightingState(normalized);
		}
		if (notifyUi) {
			updateUi?.();
		}
		return normalized;
	}

	function updateLightingState(label, updateState) {
		const before = store.lighting.state.value;
		const after = normalizeLightingState(
			updateState(cloneLightingState(before)),
		);
		if (lightingStatesEqual(before, after)) {
			return false;
		}
		return runHistoryAction(label, () => {
			applyLightingState(after);
		});
	}

	function setAmbient(value) {
		return updateLightingState("lighting.ambient", (state) => {
			state.ambient = Number(value);
			return state;
		});
	}

	function setModelLightEnabled(value) {
		return updateLightingState("lighting.model.enabled", (state) => {
			state.modelLight.enabled = Boolean(value);
			return state;
		});
	}

	function setModelLightIntensity(value) {
		return updateLightingState("lighting.model.intensity", (state) => {
			state.modelLight.intensity = Number(value);
			return state;
		});
	}

	function setModelLightAzimuthDeg(value) {
		return updateLightingState("lighting.model.azimuth", (state) => {
			state.modelLight.azimuthDeg = Number(value);
			return state;
		});
	}

	function setModelLightElevationDeg(value) {
		return updateLightingState("lighting.model.elevation", (state) => {
			state.modelLight.elevationDeg = Number(value);
			return state;
		});
	}

	function resetModelLightDirection() {
		return updateLightingState("lighting.model.resetDirection", (state) => {
			state.modelLight.azimuthDeg = DEFAULT_MODEL_LIGHT_AZIMUTH_DEG;
			state.modelLight.elevationDeg = DEFAULT_MODEL_LIGHT_ELEVATION_DEG;
			return state;
		});
	}

	function resetLighting() {
		applyLightingState(createDefaultLightingState());
	}

	function captureLightingState() {
		return cloneLightingState(store.lighting.state.value);
	}

	applyLightingState(store.lighting.state.value, {
		syncStore: true,
		notifyUi: false,
	});

	return {
		setAmbient,
		setModelLightEnabled,
		setModelLightIntensity,
		setModelLightAzimuthDeg,
		setModelLightElevationDeg,
		resetModelLightDirection,
		resetLighting,
		applyLightingState,
		captureLightingState,
		dispose() {
			rigRoot.removeFromParent();
		},
	};
}
