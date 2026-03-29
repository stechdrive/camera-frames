import { html } from "htm/preact";

function renderIconPath(name) {
	switch (name) {
		case "camera-frames":
			return html`
				<rect x="2.5" y="2.5" width="19" height="19" rx="4"></rect>
				<path d="M7 8.5h10M7 12h10M7 15.5h6"></path>
				<path d="M14.5 18.5l2.5-2.5"></path>
				<circle cx="18.2" cy="16.8" r="2.3"></circle>
			`;
		case "view":
			return html`
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z"></path>
				<circle cx="12" cy="12" r="3.5"></circle>
			`;
		case "zoom":
			return html`
				<circle cx="10.5" cy="10.5" r="5"></circle>
				<path d="M14.2 14.2L19.5 19.5"></path>
				<path d="M10.5 8v5"></path>
				<path d="M8 10.5h5"></path>
			`;
		case "scene":
			return html`
				<path d="M12 3l7 4-7 4-7-4 7-4z"></path>
				<path d="M5 11l7 4 7-4"></path>
				<path d="M5 15l7 4 7-4"></path>
			`;
		case "camera":
			return html`
				<path d="M4 8.5h11l2.5-2.5h2v12h-2L15 15.5H4z"></path>
				<circle cx="10" cy="12" r="2.5"></circle>
			`;
		case "camera-dslr":
			return html`
				<path d="M5 8h3l1.2-2h5.6L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path>
				<circle cx="12" cy="13" r="3.2"></circle>
				<path d="M7.5 10.2h1.5"></path>
				<path d="M16.5 10.2h1.5"></path>
			`;
		case "lens":
			return html`
				<circle cx="12" cy="12" r="7"></circle>
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M12 5V3"></path>
				<path d="M12 21v-2"></path>
				<path d="M19 12h2"></path>
				<path d="M3 12h2"></path>
			`;
		case "frame":
			return html`
				<rect x="4" y="5" width="16" height="14" rx="2"></rect>
				<path d="M8 5v14M16 5v14M4 9h16M4 15h16"></path>
			`;
		case "image":
			return html`
				<rect x="4" y="5" width="16" height="14" rx="2"></rect>
				<circle cx="9" cy="10" r="1.5"></circle>
				<path d="M6.5 17l4.5-4.5 2.8 2.8 2.2-2.2 1.5 1.5"></path>
			`;
		case "reference":
			return html`
				<rect x="5" y="6" width="14" height="12" rx="2"></rect>
				<path d="M5 10h14"></path>
				<path d="M9 6v12"></path>
				<circle cx="5" cy="6" r="1.25"></circle>
				<circle cx="19" cy="18" r="1.25"></circle>
			`;
		case "reference-tool":
			return html`
				<rect x="5" y="6" width="14" height="12" rx="2"></rect>
				<path d="M7.5 15.5l3.2-3.2 2.2 2.2 2.6-2.6 1.5 1.5"></path>
				<circle cx="9" cy="10" r="1.25"></circle>
				<circle cx="5" cy="6" r="1.1"></circle>
				<circle cx="19" cy="6" r="1.1"></circle>
				<circle cx="19" cy="18" r="1.1"></circle>
				<circle cx="5" cy="18" r="1.1"></circle>
			`;
		case "light":
			return html`
				<circle cx="12" cy="12" r="4"></circle>
				<path d="M12 2.5v3"></path>
				<path d="M12 18.5v3"></path>
				<path d="M2.5 12h3"></path>
				<path d="M18.5 12h3"></path>
				<path d="M5.2 5.2l2.2 2.2"></path>
				<path d="M16.6 16.6l2.2 2.2"></path>
				<path d="M18.8 5.2l-2.2 2.2"></path>
				<path d="M7.4 16.6l-2.2 2.2"></path>
			`;
		case "render-box":
			return html`
				<path d="M5 9V5h4"></path>
				<path d="M19 9V5h-4"></path>
				<path d="M5 15v4h4"></path>
				<path d="M19 15v4h-4"></path>
				<rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
			`;
		case "export":
			return html`
				<path d="M12 3v11"></path>
				<path d="M8.5 10.5L12 14l3.5-3.5"></path>
				<path d="M5 21h14"></path>
				<path d="M7.5 17.5v3.5"></path>
				<path d="M16.5 17.5v3.5"></path>
			`;
		case "folder-open":
			return html`
				<path d="M3 8.5h6l2 2H21v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h3"></path>
			`;
		case "package-open":
			return html`
				<path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5z"></path>
				<path d="M4 7.5V16.5L12 21l8-4.5V7.5"></path>
				<path d="M12 12v9"></path>
				<path d="M8.5 5.8L12 7.8l3.5-2"></path>
			`;
		case "clock":
			return html`
				<circle cx="12" cy="12" r="8"></circle>
				<path d="M12 8v4l2.8 1.8"></path>
			`;
		case "link":
			return html`
				<path d="M9.5 14.5l5-5"></path>
				<path d="M7.8 9.2l-1.9 1.9a3.5 3.5 0 0 0 5 5l1.9-1.9"></path>
				<path d="M16.2 14.8l1.9-1.9a3.5 3.5 0 0 0-5-5l-1.9 1.9"></path>
			`;
		case "save":
			return html`
				<path d="M5 4h12l2 2v14H5z"></path>
				<path d="M8 4v5h7V4"></path>
				<rect x="8" y="14" width="8" height="5" rx="1"></rect>
			`;
		case "menu":
			return html`
				<path d="M4 7h16"></path>
				<path d="M4 12h16"></path>
				<path d="M4 17h16"></path>
			`;
		case "pie-menu":
			return html`
				<circle cx="12" cy="12" r="2"></circle>
				<path d="M12 3.5v3"></path>
				<path d="M20.5 12h-3"></path>
				<path d="M12 20.5v-3"></path>
				<path d="M3.5 12h3"></path>
				<path d="M17.8 6.2l-2.1 2.1"></path>
				<path d="M17.8 17.8l-2.1-2.1"></path>
				<path d="M6.2 17.8l2.1-2.1"></path>
				<path d="M6.2 6.2l2.1 2.1"></path>
			`;
		case "package":
			return html`
				<path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5z"></path>
				<path d="M4 7.5V16.5L12 21l8-4.5V7.5"></path>
				<path d="M12 12v9"></path>
			`;
		case "plus":
			return html`
				<path d="M12 5v14"></path>
				<path d="M5 12h14"></path>
			`;
		case "duplicate":
			return html`
				<rect x="9" y="9" width="10" height="10" rx="2"></rect>
				<path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"></path>
			`;
		case "copy-to-camera":
			return html`
				<rect x="3.5" y="7" width="8" height="10" rx="1.5"></rect>
				<path d="M13 12h3.5"></path>
				<path d="M15.2 9.8l2.3 2.2-2.3 2.2"></path>
				<path d="M15.5 8.5h3l1.6-1.6h1.4v10.2h-1.4L18.5 15.5h-3z"></path>
				<circle cx="18.3" cy="12" r="1.5"></circle>
			`;
		case "copy-to-viewport":
			return html`
				<path d="M8.8 12H5.3"></path>
				<path d="M6.8 9.8L4.5 12l2.3 2.2"></path>
				<path d="M4.8 8.5h3l1.6-1.6h1.4v10.2H9.4L7.8 15.5h-3z"></path>
				<circle cx="7.7" cy="12" r="1.5"></circle>
				<rect x="12.5" y="7" width="8" height="10" rx="1.5"></rect>
			`;
		case "grip":
			return html`
				<circle cx="9" cy="7.5" r="0.9" fill="currentColor" stroke="none"></circle>
				<circle cx="15" cy="7.5" r="0.9" fill="currentColor" stroke="none"></circle>
				<circle cx="9" cy="12" r="0.9" fill="currentColor" stroke="none"></circle>
				<circle cx="15" cy="12" r="0.9" fill="currentColor" stroke="none"></circle>
				<circle cx="9" cy="16.5" r="0.9" fill="currentColor" stroke="none"></circle>
				<circle cx="15" cy="16.5" r="0.9" fill="currentColor" stroke="none"></circle>
			`;
		case "trash":
			return html`
				<path d="M4 7h16"></path>
				<path d="M9 7V4h6v3"></path>
				<path d="M7 7l1 12h8l1-12"></path>
				<path d="M10 11v5M14 11v5"></path>
			`;
		case "eye":
			return html`
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z"></path>
				<circle cx="12" cy="12" r="3"></circle>
			`;
		case "eye-off":
			return html`
				<path d="M3 3l18 18"></path>
				<path d="M10.6 5.2A11.7 11.7 0 0 1 12 5c6.2 0 10 7 10 7a18.3 18.3 0 0 1-4 4.8"></path>
				<path d="M6.1 6.1C3.6 8 2 12 2 12s3.8 7 10 7c1.7 0 3.3-.5 4.7-1.2"></path>
				<path d="M9.9 9.9A3 3 0 0 0 14.1 14.1"></path>
			`;
		case "reset":
			return html`
				<path d="M18.2 9.3A7.5 7.5 0 1 0 19.2 12.8"></path>
				<path d="M18.2 5.2v3.9h-3.9"></path>
			`;
		case "cursor":
			return html`
				<path d="M4.5 4.5l7.2 16.8 2.2-6.1 6.1-2.2-15.5-8.5z"></path>
			`;
		case "cursor-off":
			return html`
				<path d="M4.5 4.5l7.2 16.8 2.2-6.1 6.1-2.2-15.5-8.5z"></path>
				<path d="M18 6l-9.5 9.5"></path>
			`;
		case "selection-clear":
			return html`
				<rect
					x="5.5"
					y="5.5"
					width="10"
					height="10"
					rx="2"
					stroke-dasharray="2.2 2.2"
				></rect>
				<path d="M14.2 14.2l4.3 4.3"></path>
				<path d="M18.5 14.2l-4.3 4.3"></path>
			`;
		case "move":
			return html`
				<path d="M12 3v18"></path>
				<path d="M3 12h18"></path>
				<path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"></path>
				<path d="M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2"></path>
			`;
		case "scrub":
			return html`
				<path d="M4 12h16"></path>
				<path d="M4 12l3-3"></path>
				<path d="M4 12l3 3"></path>
				<path d="M20 12l-3-3"></path>
				<path d="M20 12l-3 3"></path>
			`;
		case "pivot":
			return html`
				<circle cx="12" cy="12" r="7"></circle>
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M12 5V3"></path>
				<path d="M12 21v-2"></path>
				<path d="M19 12h2"></path>
				<path d="M3 12h2"></path>
			`;
		case "frame-plus":
			return html`
				<rect x="4" y="5" width="12" height="10" rx="2"></rect>
				<path d="M8 5v10M12 5v10M4 9h12"></path>
				<path d="M19 12v7"></path>
				<path d="M15.5 15.5h7"></path>
			`;
		case "mask-selected":
			return html`
				<path d="M4 6h16v12H4z"></path>
				<rect x="8" y="9" width="8" height="6" rx="1"></rect>
				<path d="M6.5 7.5v9"></path>
				<path d="M17.5 7.5v9"></path>
			`;
		case "mask-all":
			return html`
				<path d="M4 6h16v12H4z"></path>
				<rect x="6.5" y="8.5" width="5.5" height="7" rx="0.8"></rect>
				<rect x="12" y="8.5" width="5.5" height="7" rx="0.8"></rect>
			`;
		case "viewport":
			return html`
				<rect x="3.5" y="5" width="17" height="14" rx="2"></rect>
				<path d="M3.5 9.5h17"></path>
				<path d="M8.5 5v14"></path>
			`;
		case "slash-circle":
			return html`
				<circle cx="12" cy="12" r="8"></circle>
				<path d="M7 17l10-10"></path>
			`;
		case "chevron-left":
			return html`<path d="M15 5l-6 7 6 7"></path>`;
		case "chevron-right":
			return html`<path d="M9 5l6 7-6 7"></path>`;
		case "close":
			return html`
				<path d="M6 6l12 12"></path>
				<path d="M18 6l-12 12"></path>
			`;
		case "pin":
			return html`
				<path d="M8 5h8"></path>
				<path d="M10 5v5l-2 3h8l-2-3V5"></path>
				<path d="M12 13v6"></path>
			`;
		case "lock":
			return html`
				<rect x="6.5" y="11" width="11" height="8" rx="2"></rect>
				<path d="M9 11V8.5a3 3 0 0 1 6 0V11"></path>
			`;
		case "lock-open":
			return html`
				<rect x="6.5" y="11" width="11" height="8" rx="2"></rect>
				<path d="M15 11V8.5a3 3 0 0 0-5.4-1.8"></path>
			`;
		default:
			return html`<circle cx="12" cy="12" r="8"></circle>`;
	}
}

export function WorkbenchIcon({
	name,
	className = "",
	size = 16,
	strokeWidth = 1.8,
}) {
	const classes = ["workbench-icon"];
	if (className) {
		classes.push(className);
	}
	return html`
		<svg
			class=${classes.join(" ")}
			width=${size}
			height=${size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width=${strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			${renderIconPath(name)}
		</svg>
	`;
}
