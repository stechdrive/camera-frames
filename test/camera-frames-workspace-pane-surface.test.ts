import assert from "node:assert/strict";
import { createActiveWorkspacePaneSurface } from "../src/app/workspace-pane-surface.js";

function createElement(rect) {
	return {
		clientWidth: rect.width,
		clientHeight: rect.height,
		style: {},
		classList: {},
		dataset: {},
		parentElement: { id: "parent" },
		getBoundingClientRect: () => ({ ...rect }),
		addEventListener: (...args) => calls.push(["add", ...args]),
		removeEventListener: (...args) => calls.push(["remove", ...args]),
		setPointerCapture: (id) => calls.push(["capture", id]),
		releasePointerCapture: (id) => calls.push(["release", id]),
	};
}

const calls = [];
const eventTarget = createElement({ left: 0, top: 0, width: 800, height: 600 });
const shell = createElement({ left: 10, top: 20, width: 700, height: 500 });
const cameraPane = createElement({
	left: 10,
	top: 20,
	width: 280,
	height: 500,
});
const viewportPane = createElement({
	left: 298,
	top: 20,
	width: 412,
	height: 500,
});
let activePane = cameraPane;
const surface = createActiveWorkspacePaneSurface({
	eventTarget,
	workspaceShell: shell,
	getActivePaneElement: () => activePane,
});

assert.equal(surface.clientWidth, 280);
assert.equal(surface.clientHeight, 500);
assert.equal(surface.getBoundingClientRect().left, 10);
assert.equal(surface.style, shell.style);
assert.equal(surface.parentElement, shell.parentElement);

activePane = viewportPane;
assert.equal(surface.clientWidth, 412);
assert.equal(surface.getBoundingClientRect().left, 298);

const listener = () => {};
surface.addEventListener("pointerdown", listener, { capture: true });
surface.removeEventListener("pointerdown", listener, { capture: true });
surface.setPointerCapture(7);
surface.releasePointerCapture(7);
assert.deepEqual(calls, [
	["add", "pointerdown", listener, { capture: true }],
	["remove", "pointerdown", listener, { capture: true }],
	["capture", 7],
	["release", 7],
]);

console.log("✅ CAMERA_FRAMES workspace pane surface tests passed!");
