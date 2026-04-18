import { html } from "htm/preact";
import { useEffect } from "preact/hooks";
import { DEFAULT_LOCALE, translate } from "../i18n.js";
import { AppOverlay } from "./app-overlay.js";
import { DocsAnnotationOverlay } from "./docs-annotation-overlay.js";
import { HelpModal } from "./help/help-modal.js";
import { SidePanel } from "./side-panel.js";
import { ViewportShell } from "./viewport-shell.js";

function isInteractiveTextTarget(target) {
	if (!target || typeof target !== "object") return false;
	const tag = (target.tagName || "").toUpperCase();
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	if (target.isContentEditable) return true;
	return false;
}

export function AppView({ store, controller, refs }) {
	const locale = store.locale.value ?? DEFAULT_LOCALE;
	const t = (key, params) => translate(locale, key, params);

	useEffect(() => {
		const handleKey = (event) => {
			if (event.key === "F1") {
				event.preventDefault();
				controller()?.toggleHelp?.();
				return;
			}
			if (
				event.key === "?" &&
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey &&
				!isInteractiveTextTarget(event.target)
			) {
				event.preventDefault();
				controller()?.openHelp?.();
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [controller]);

	return html`
		<div class="app-shell">
			<${ViewportShell}
				store=${store}
				controller=${controller}
				refs=${refs}
				t=${t}
			/>
			<${SidePanel}
				store=${store}
				controller=${controller}
				locale=${locale}
				t=${t}
				refs=${refs}
			/>
			<${AppOverlay} overlay=${store.overlay.value} />
			<${HelpModal} store=${store} controller=${controller} />
			<${DocsAnnotationOverlay} store=${store} />
		</div>

		<input
			id="asset-input"
			ref=${refs.assetInputRef}
			type="file"
			accept=".ply,.spz,.splat,.ksplat,.zip,.sog,.rad,.glb,.gltf,.ssproj,.png,.jpg,.jpeg,.webp,.psd"
			multiple
			hidden
			onChange=${(event) => controller()?.handleAssetInputChange(event)}
		/>
		<input
			id="reference-image-input"
			ref=${refs.referenceImageInputRef}
			type="file"
			accept=".png,.jpg,.jpeg,.webp,.psd"
			multiple
			hidden
			onChange=${(event) =>
				controller()?.handleReferenceImageInputChange(event)}
		/>
	`;
}
