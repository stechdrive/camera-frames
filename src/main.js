import { html, render } from "htm/preact";
import { useEffect, useRef } from "preact/hooks";
import {
	BUILD_INFO,
	clearActiveRuntimeInfo,
	createRuntimeInfo,
} from "./build-info.js";
import { createCameraFramesController } from "./controller.js";
import { DEFAULT_LOCALE, translate } from "./i18n.js";
import { createCameraFramesStore } from "./store.js";
import { AppView } from "./ui/app-view.js";

function CameraFramesApp({ runtimeInfo }) {
	const storeRef = useRef(null);
	if (!storeRef.current) {
		storeRef.current = createCameraFramesStore(runtimeInfo);
	}
	const store = storeRef.current;

	const controllerRef = useRef(null);
	const viewportCanvasRef = useRef(null);
	const viewportShellRef = useRef(null);
	const renderBoxRef = useRef(null);
	const frameOverlayCanvasRef = useRef(null);
	const renderBoxMetaRef = useRef(null);
	const anchorDotRef = useRef(null);
	const dropHintRef = useRef(null);
	const assetInputRef = useRef(null);

	useEffect(() => {
		controllerRef.current = createCameraFramesController(
			{
				viewportCanvas: viewportCanvasRef.current,
				viewportShell: viewportShellRef.current,
				renderBox: renderBoxRef.current,
				frameOverlayCanvas: frameOverlayCanvasRef.current,
				renderBoxMeta: renderBoxMetaRef.current,
				anchorDot: anchorDotRef.current,
				dropHint: dropHintRef.current,
				assetInput: assetInputRef.current,
			},
			store,
		);

		return () => {
			controllerRef.current?.dispose?.();
			controllerRef.current = null;
		};
	}, [store]);

	const controller = () => controllerRef.current;
	const refs = {
		viewportCanvasRef,
		viewportShellRef,
		renderBoxRef,
		frameOverlayCanvasRef,
		renderBoxMetaRef,
		anchorDotRef,
		dropHintRef,
		assetInputRef,
	};

	return html`<${AppView} store=${store} controller=${controller} refs=${refs} />`;
}

const root = document.getElementById("app-root");
if (!root) {
	throw new Error(translate(DEFAULT_LOCALE, "error.missingRoot"));
}

function mountApp(runtimeInfo) {
	globalThis.__CAMERA_FRAMES_RUNTIME__ = runtimeInfo;
	console.info("[CAMERA_FRAMES] boot", {
		version: BUILD_INFO.version,
		commit: BUILD_INFO.commit,
		runtimeId: runtimeInfo.id,
	});
	render(html`<${CameraFramesApp} runtimeInfo=${runtimeInfo} />`, root);
}

function unmountApp(runtimeInfo) {
	console.info("[CAMERA_FRAMES] dispose", {
		version: BUILD_INFO.version,
		commit: BUILD_INFO.commit,
		runtimeId: runtimeInfo.id,
	});
	render(null, root);
	if (globalThis.__CAMERA_FRAMES_RUNTIME__?.id === runtimeInfo.id) {
		globalThis.__CAMERA_FRAMES_RUNTIME__ = undefined;
	}
	clearActiveRuntimeInfo(runtimeInfo.id);
}

const runtimeInfo = createRuntimeInfo();
mountApp(runtimeInfo);

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		unmountApp(runtimeInfo);
	});
}
