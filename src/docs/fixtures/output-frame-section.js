// Panel fixture: the Output Frame (paper size + anchor) disclosure block
// from the Camera tab, in isolation. See section-display-zoom.js for the
// rationale behind mounting real UI components via the browser-only
// registry split.

import { html } from "htm/preact";
import { getAnchorOptions, translate } from "../../i18n.js";
import { OutputFrameSection } from "../../ui/workbench-camera-export-sections.js";
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
export const outputFrameSectionFixture = {
	id: "output-frame-section",
	type: "panel",
	title: "Output Frame section",
	size: { width: 360 },
	mount: ({ lang }) => {
		const store = createMockStore();
		const controller = createMockController();
		const t = (key) => translate(lang, key);
		return html`
			<div class="docs-section-host">
				<style>${STYLE}</style>
				<div class="docs-section-host__card">
					<${OutputFrameSection}
						store=${store}
						controller=${() => controller}
						t=${t}
						anchorOptions=${getAnchorOptions(lang)}
						exportSizeLabel=${store.exportSizeLabel.value}
						widthLabel=${store.widthLabel.value}
						heightLabel=${store.heightLabel.value}
						open=${true}
					/>
				</div>
			</div>
		`;
	},
};
