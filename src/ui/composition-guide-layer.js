import { html } from "htm/preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import {
	buildCompositionGuideLines,
	resolveCompositionGuideTarget,
} from "../engine/composition-guides.js";
import { WORKSPACE_PANE_CAMERA } from "../workspace-model.js";

export function shouldShowCompositionGuideLayer({ mode, enabled } = {}) {
	return mode === WORKSPACE_PANE_CAMERA && Boolean(enabled);
}

function getTargetScreenSize(target, exportWidth, exportHeight, layerSize) {
	const screenWidth = Number(layerSize?.width ?? 0);
	const screenHeight = Number(layerSize?.height ?? 0);
	return {
		width:
			Number.isFinite(screenWidth) && screenWidth > 0
				? (target.width / Math.max(exportWidth, 1e-6)) * screenWidth
				: 0,
		height:
			Number.isFinite(screenHeight) && screenHeight > 0
				? (target.height / Math.max(exportHeight, 1e-6)) * screenHeight
				: 0,
	};
}

function CompositionGuideLayerSurface({
	exportHeight,
	exportWidth,
	guideState,
	target,
}) {
	const layerRef = useRef(null);
	const [layerSize, setLayerSize] = useState({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const layer = layerRef.current;
		if (!layer) {
			return undefined;
		}
		const syncLayerSize = () => {
			setLayerSize({
				width: layer.clientWidth,
				height: layer.clientHeight,
			});
		};
		syncLayerSize();
		if (typeof ResizeObserver === "function") {
			const observer = new ResizeObserver(syncLayerSize);
			observer.observe(layer);
			return () => observer.disconnect();
		}
		window.addEventListener("resize", syncLayerSize);
		return () => window.removeEventListener("resize", syncLayerSize);
	}, []);

	const targetScreenSize = getTargetScreenSize(
		target,
		exportWidth,
		exportHeight,
		layerSize,
	);
	const { lines } = buildCompositionGuideLines({
		target,
		pattern: guideState.pattern,
		screenWidth: targetScreenSize.width,
		screenHeight: targetScreenSize.height,
	});
	const centerX = target.left + target.width * 0.5;
	const centerY = target.top + target.height * 0.5;
	const transform = `translate(${centerX} ${centerY}) rotate(${target.rotationDeg})`;

	return html`
		<div
			ref=${layerRef}
			class="composition-guide-layer"
			data-guide-scope=${guideState.scope}
			data-guide-pattern=${guideState.pattern}
			aria-hidden="true"
		>
			<svg
				class="composition-guide-layer__svg"
				viewBox=${`0 0 ${exportWidth} ${exportHeight}`}
				preserveAspectRatio="none"
			>
				<g class="composition-guide-layer__target" transform=${transform}>
					<rect
						class="composition-guide-layer__outline"
						x=${-target.width * 0.5}
						y=${-target.height * 0.5}
						width=${target.width}
						height=${target.height}
					></rect>
					${lines.map(
						(line, index) => html`
							<line
								key=${`${line.axis}-${index}`}
								class=${[
									"composition-guide-layer__line",
									line.weight === "major"
										? "composition-guide-layer__line--major"
										: "",
								]
									.filter(Boolean)
									.join(" ")}
								x1=${line.x1}
								y1=${line.y1}
								x2=${line.x2}
								y2=${line.y2}
							></line>
						`,
					)}
				</g>
			</svg>
		</div>
	`;
}

export function CompositionGuideLayer({ store }) {
	const mode = store.mode.value;
	const guideState = store.shotCamera.compositionGuide.value;
	const exportWidth = store.exportWidth.value;
	const exportHeight = store.exportHeight.value;
	const frames = store.frames.documents.value;
	const target = resolveCompositionGuideTarget({
		scope: guideState.scope,
		frames,
		activeFrameId: store.frames.activeId.value,
		selectedFrameIds: store.frames.selectedIds.value ?? [],
		frameSelectionActive: store.frames.selectionActive.value,
		exportWidth,
		exportHeight,
	});

	if (
		!shouldShowCompositionGuideLayer({
			mode,
			enabled: guideState.enabled,
		}) ||
		!target
	) {
		return null;
	}

	return html`
		<${CompositionGuideLayerSurface}
			exportHeight=${exportHeight}
			exportWidth=${exportWidth}
			guideState=${guideState}
			target=${target}
		/>
	`;
}
