// Overlay fixture: the "discard current work and start a new project?"
// confirm dialog shown when the user triggers New Project while there are
// unsaved changes. Mounts AppOverlay directly with a synthesized overlay
// object so neither the store nor the controller need to be plumbed.

import { html } from "htm/preact";
import { AppOverlay } from "../../ui/app-overlay.js";

const STYLE = `
.docs-overlay-host {
	position: relative;
	width: 640px;
	height: 360px;
	padding: 0;
	background: #04070c;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	box-sizing: border-box;
	overflow: hidden;
}
.docs-overlay-host::before {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 30% 30%, rgba(246, 165, 36, 0.05), transparent 70%),
		radial-gradient(circle at 70% 70%, rgba(56, 134, 234, 0.06), transparent 65%);
	pointer-events: none;
}
/* .app-overlay in the real app is position:fixed to cover the viewport.
 * Inside this fixture we confine it to the host card so the capture
 * crops tightly instead of extending outside .docs-stage bounds. */
.docs-overlay-host .app-overlay {
	position: absolute !important;
	inset: 0 !important;
	display: flex;
	align-items: center;
	justify-content: center;
}
`;

/** @type {import("../types").Fixture} */
export const confirmNewProjectFixture = {
	id: "confirm-new-project",
	type: "overlay",
	title: "Confirm: New Project",
	mount: () => {
		const overlay = {
			kind: "confirm",
			title: "新規プロジェクトを作成しますか？",
			message:
				"現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。",
			actions: [
				{ label: "キャンセル", onClick: () => {} },
				{ label: "破棄して新規作成", primary: true, onClick: () => {} },
			],
		};
		return html`
			<div class="docs-overlay-host">
				<style>${STYLE}</style>
				<${AppOverlay} overlay=${overlay} />
			</div>
		`;
	},
};
