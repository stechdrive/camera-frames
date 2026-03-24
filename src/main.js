import { html, render } from "htm/preact";
import { useEffect, useRef } from "preact/hooks";
import { createCameraFramesController } from "./controller.js";
import { DEFAULT_LOCALE, translate } from "./i18n.js";
import { createCameraFramesStore } from "./store.js";
import { AppView } from "./ui/app-view.js";

function CameraFramesApp() {
	const storeRef = useRef(null);
	if (!storeRef.current) {
		storeRef.current = createCameraFramesStore();
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

render(html`<${CameraFramesApp} />`, root);
