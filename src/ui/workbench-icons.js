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
				<path d="M20 11a8 8 0 1 0 2 5.3"></path>
				<path d="M20 4v7h-7"></path>
			`;
		case "cursor":
			return html`
				<path d="M6 4l10 8-4.5 1.2L13.7 19l-2.4 1-2.2-5.8L6 4z"></path>
			`;
		case "move":
			return html`
				<path d="M12 3v18"></path>
				<path d="M3 12h18"></path>
				<path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"></path>
				<path d="M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2"></path>
			`;
		case "pivot":
			return html`
				<circle cx="12" cy="12" r="2.5"></circle>
				<path d="M12 3v4M12 17v4M3 12h4M17 12h4"></path>
				<circle cx="12" cy="12" r="7"></circle>
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
