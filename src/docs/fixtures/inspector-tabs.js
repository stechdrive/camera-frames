// Panel fixture: the Inspector's 4-tab strip (Scene / Camera / Reference /
// Export) with the Camera tab marked active. The legacy "inspector-tabs"
// scenario captured the whole right-column inspector, but chapter 02 body
// only introduces the tabs themselves above the tab reference table — the
// tab strip in isolation is the correct chunk for that role.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { InspectorTabs } from "../../ui/workbench-rail-sections.js";

const STYLE = `
.docs-tabs-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-tabs-host__card {
	padding: 12px 16px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`;

/** @type {import("../types").Fixture} */
export const inspectorTabsFixture = {
	id: "inspector-tabs",
	type: "panel",
	title: "Inspector tabs (Camera active)",
	mount: ({ lang }) => {
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-tabs-host">
				<style>${STYLE}</style>
				<div class="docs-tabs-host__card">
					<${InspectorTabs}
						activeTab="camera"
						setActiveTab=${() => {}}
						t=${t}
					/>
				</div>
			</div>
		`;
	},
};
