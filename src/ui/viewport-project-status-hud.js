import { html } from "htm/preact";
import {
	VIEWPORT_LOD_SCALE_MAX,
	VIEWPORT_LOD_SCALE_MIN,
	VIEWPORT_LOD_SCALE_STEP,
} from "../constants.js";
import { getProjectStatusDisplay } from "./project-status.js";
import { formatViewportLodScaleLabel } from "./viewport-lod-scale.js";
import {
	INTERACTIVE_FIELD_PROPS,
	stopUiEvent,
	stopUiWheelEvent,
} from "./workbench-controls.js";
import { TooltipBubble } from "./workbench-primitives.js";

export function ViewportProjectStatusHud({ store, controller, t }) {
	const { projectDisplayName, projectDirty, showProjectPackageDirty } =
		getProjectStatusDisplay(store, t);
	const viewportLodScale = store.viewportLod.effectiveScale.value;
	const viewportLodScaleLabel = formatViewportLodScaleLabel(viewportLodScale);
	const handleViewportLodScaleInput = (event) => {
		controller()?.setViewportLodScale?.(event.currentTarget.value);
	};

	return html`
		<div
			class="viewport-project-status"
			onPointerDown=${stopUiEvent}
			onClick=${stopUiEvent}
			onWheel=${stopUiWheelEvent}
		>
			<label class="viewport-lod-scale viewport-lod-scale--tooltip">
				<span class="viewport-lod-scale__label">
					${t("viewportLodScale.label")}
				</span>
				<input
					...${INTERACTIVE_FIELD_PROPS}
					class="viewport-lod-scale__range"
					type="range"
					min=${VIEWPORT_LOD_SCALE_MIN}
					max=${VIEWPORT_LOD_SCALE_MAX}
					step=${VIEWPORT_LOD_SCALE_STEP}
					value=${viewportLodScale}
					aria-label=${t("viewportLodScale.ariaLabel")}
					onInput=${handleViewportLodScaleInput}
				/>
				<span class="viewport-lod-scale__value">${viewportLodScaleLabel}</span>
				<${TooltipBubble}
					title=${t("viewportLodScale.tooltipTitle")}
					description=${t("viewportLodScale.tooltipDescription")}
					placement="bottom"
				/>
			</label>
			<span class="viewport-project-status__separator" aria-hidden="true"></span>
			<span class="viewport-project-status__name">${projectDisplayName}</span>
			${
				projectDirty &&
				html`
					<span class="viewport-project-status__badge">*</span>
				`
			}
			${
				showProjectPackageDirty &&
				html`
					<span
						class="viewport-project-status__badge viewport-project-status__badge--package"
					>
						PKG
					</span>
				`
			}
		</div>
	`;
}
