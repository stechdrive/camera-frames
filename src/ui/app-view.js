import { html } from "htm/preact";
import { DEFAULT_LOCALE, translate } from "../i18n.js";
import { AppOverlay } from "./app-overlay.js";
import { SidePanel } from "./side-panel.js";
import { ViewportShell } from "./viewport-shell.js";

export function AppView({ store, controller, refs }) {
	const locale = store.locale.value ?? DEFAULT_LOCALE;
	const t = (key, params) => translate(locale, key, params);

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
		</div>

		<input
			id="asset-input"
			ref=${refs.assetInputRef}
			type="file"
			accept=".ply,.spz,.splat,.ksplat,.zip,.sog,.rad,.glb,.gltf,.ssproj"
			multiple
			hidden
			onChange=${(event) => controller()?.handleAssetInputChange(event)}
		/>
	`;
}
