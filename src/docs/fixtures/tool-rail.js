// Panel fixture: the floating tool rail (File menu trigger + tools +
// transform / pivot / splat-edit / measurement / zoom / undo-redo) in
// isolation. Mounts the real ToolRailSection component against a mock
// store with camera mode active so the rail shows its full toolset.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { ToolRailSection } from "../../ui/workbench-rail-sections.js";
import { createMockController } from "../mock/controller.js";
import { createMockStore } from "../mock/store.js";

const STYLE = `
.docs-rail-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-rail-host__card {
	width: 64px;
	padding: 12px 8px;
	background: #10161e;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 14px;
}
`;

/** @type {import("../types").Fixture} */
export const toolRailFixture = {
	id: "tool-rail",
	type: "panel",
	title: "Viewport tool rail",
	mount: ({ lang }) => {
		const store = createMockStore();
		const controller = createMockController();
		const t = (key, params) => translate(lang, key, params);
		return html`
			<div class="docs-rail-host">
				<style>${STYLE}</style>
				<div class="docs-rail-host__card">
					<${ToolRailSection}
						store=${store}
						controller=${() => controller}
						t=${t}
						mode="camera"
						projectMenuItems=${[
							{
								id: "new-project",
								icon: "plus",
								label: t("menu.newProjectAction"),
								shortcut: "Ctrl+N",
							},
							{
								id: "open-files",
								icon: "folder-open",
								label: t("action.openFiles"),
								shortcut: "Ctrl+O",
							},
							{
								id: "save-project",
								icon: "save",
								label: t("menu.saveWorkingStateAction"),
								shortcut: "Ctrl+S",
							},
							{
								id: "export-project",
								icon: "package",
								label: t("menu.savePackageAction"),
								shortcut: "Ctrl+Shift+S",
							},
						]}
						showQuickMenu=${true}
					/>
				</div>
			</div>
		`;
	},
};
