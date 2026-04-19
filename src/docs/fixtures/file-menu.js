// Two fixtures sharing the Tool Rail File menu's open panel. The real
// WorkbenchMenu component renders the panel via createPortal(document.body)
// with position:fixed — both of those place the panel outside .docs-stage's
// capture bounds and can't be overridden from fixture CSS. So these
// fixtures build the panel DOM inline using the same CSS classes (from
// styles/workbench.css) and real WorkbenchIcon + translate() calls. If the
// underlying class names or icon ids drift, the broken refs surface either
// at build time (icon names validated in registry tests) or visually.

import { html } from "htm/preact";
import { translate } from "../../i18n.js";
import { WorkbenchIcon } from "../../ui/workbench-icons.js";

const STYLE = `
.docs-menu-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
/* Force the normally position:fixed panel back into the fixture bounds so
 * the capture crops cleanly. */
.docs-menu-host .workbench-menu__panel {
	position: relative !important;
	left: auto !important;
	top: auto !important;
	visibility: visible !important;
	min-width: 320px;
}
.docs-menu-host__focus-ring #header-url-input {
	outline: 2px solid var(--accent-warm, #f6a524);
	outline-offset: 2px;
}
`;

const MENU_ITEMS = [
	{ icon: "plus", labelKey: "menu.newProjectAction", shortcut: "Ctrl+N" },
	{ icon: "folder-open", labelKey: "action.openFiles", shortcut: "Ctrl+O" },
	{ icon: "save", labelKey: "menu.saveWorkingStateAction", shortcut: "Ctrl+S" },
	{
		icon: "package",
		labelKey: "menu.savePackageAction",
		shortcut: "Ctrl+Shift+S",
	},
];

function renderFileMenuPanel({ lang, urlValue = "", focusRing = false }) {
	const t = (key) => translate(lang, key);
	return html`
		<div class=${`docs-menu-host${focusRing ? " docs-menu-host__focus-ring" : ""}`}>
			<style>${STYLE}</style>
			<div class="workbench-menu is-open">
				<div class="workbench-menu__panel" role="menu">
					<div class="workbench-menu__group">
						<div class="workbench-menu__field">
							<label for="header-url-input">${t("field.remoteUrl")}</label>
							<input
								id="header-url-input"
								type="text"
								placeholder="https://.../scene.spz or model.glb"
								value=${urlValue}
							/>
						</div>
						<button type="button" class="workbench-menu__item">
							<span class="workbench-menu__item-icon">
								<${WorkbenchIcon} name="link" size=${14} />
							</span>
							<span>${t("action.loadUrl")}</span>
						</button>
					</div>
					${MENU_ITEMS.map(
						(item) => html`
							<button
								key=${item.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${WorkbenchIcon} name=${item.icon} size=${14} />
								</span>
								<span class="workbench-menu__item-label">
									${t(item.labelKey)}
								</span>
								<span
									class="workbench-menu__item-shortcut"
									aria-hidden="true"
								>
									<kbd>${item.shortcut}</kbd>
								</span>
							</button>
						`,
					)}
				</div>
			</div>
		</div>
	`;
}

/** @type {import("../types").Fixture} */
export const openMenuFixture = {
	id: "open-menu",
	type: "overlay",
	title: "Tool Rail File menu (open)",
	mount: ({ lang }) => renderFileMenuPanel({ lang }),
};

/** @type {import("../types").Fixture} */
export const remoteUrlInputFixture = {
	id: "remote-url-input",
	type: "overlay",
	title: "Remote URL input (focused)",
	mount: ({ lang }) =>
		renderFileMenuPanel({
			lang,
			urlValue: "https://example.com/scene.spz",
			focusRing: true,
		}),
};
