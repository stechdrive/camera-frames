// Panel fixture: the Export tab's "Output" disclosure block (target
// selector + Download Output button + include-reference-images toggle)
// in isolation. Reuses the real ExportSection component.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { ExportSection } from "../../ui/workbench-camera-export-sections.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

const STYLE = `
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`;

/** @type {import("../types").Fixture} */
export const exportOutputSectionFixture = {
	id: "export-output-section",
	type: "panel",
	title: "Export Output section",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore();
		const controller = createMockController();
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${ExportSection}
						store=${store}
						controller=${() => controller}
						t=${t}
						exportBusy=${false}
						exportPresetIds=${[]}
						exportSelectionMissing=${false}
						exportTarget="current"
						open=${true}
					/>
				</div>
			</div>
		`;
	},
};
