// Overlay fixture: the "Export in progress" modal that AppOverlay
// renders when store.overlay.value.kind === "progress". Constructed
// synthetically so the fixture can depict a realistic mid-render state
// (e.g. phase 2 of 4, with 1 step done) without actually kicking off
// an export.

import { html } from "htm/preact";
import { AppOverlay } from "../../ui/app-overlay.js";

const STYLE = `
.docs-overlay-host {
	position: relative;
	width: 640px;
	height: 420px;
	background: #04070c;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	display: inline-block;
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
.docs-overlay-host .app-overlay {
	position: absolute !important;
	inset: 0 !important;
	display: flex;
	align-items: center;
	justify-content: center;
}
`;

/** @type {import("../types").Fixture} */
export const exportProgressFixture = {
	id: "export-progress",
	type: "overlay",
	title: "Export progress overlay",
	mount: () => {
		// Mock startedAt far enough in the past for a readable elapsed counter
		// without being so old that the formatter switches to minutes only.
		const now = Date.now();
		const overlay = {
			kind: "progress",
			title: "書き出し中",
			message: "すべての shot をレンダリングしています。",
			startedAt: now - 47 * 1000,
			phaseLabel: "shot 2 / 4 をレンダリング",
			phaseDetail: "Camera 2 — PSD 書き出し",
			phases: [
				{ label: "Camera 1", status: "done" },
				{ label: "Camera 2", status: "active" },
				{ label: "Camera 3", status: "pending" },
				{ label: "Camera 4", status: "pending" },
			],
			steps: [
				{ label: "projectをスナップショット", status: "done" },
				{ label: "各ショットをレンダリング", status: "active" },
				{ label: "zip アーカイブを生成", status: "pending" },
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
