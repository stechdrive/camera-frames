import assert from "node:assert/strict";
import {
	VIEWPORT_LOD_SCALE_MAX,
	VIEWPORT_LOD_SCALE_MIN,
	VIEWPORT_LOD_SCALE_STEP,
} from "../src/constants.js";
import { formatViewportLodScaleLabel } from "../src/ui/viewport-lod-scale.js";
import { ViewportProjectStatusHud } from "../src/ui/viewport-project-status-hud.js";
import { TooltipBubble } from "../src/ui/workbench-primitives.js";

const messages = {
	"project.untitled": "Untitled",
	"viewportLodScale.label": "プレビュー品質",
	"viewportLodScale.ariaLabel": "3DGS プレビュー品質",
	"viewportLodScale.tooltipTitle": "プレビュー品質",
	"viewportLodScale.tooltipDescription":
		"3DGS が重いときに、ビューポートの表示負荷を調整します。",
};

function t(key) {
	return messages[key] ?? key;
}

function getChildren(node) {
	const children = node?.props?.children;
	if (children == null || children === false) {
		return [];
	}
	return Array.isArray(children) ? children : [children];
}

function walkVNode(node, visit) {
	if (!node || typeof node !== "object") {
		return;
	}
	visit(node);
	for (const child of getChildren(node)) {
		walkVNode(child, visit);
	}
}

function findVNode(root, predicate) {
	let found = null;
	walkVNode(root, (node) => {
		if (!found && predicate(node)) {
			found = node;
		}
	});
	return found;
}

function classListIncludes(node, className) {
	return String(node?.props?.class ?? "")
		.split(/\s+/)
		.includes(className);
}

function textContent(node) {
	if (node == null || node === false) {
		return "";
	}
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}
	if (typeof node !== "object") {
		return "";
	}
	return getChildren(node).map(textContent).join("");
}

{
	const setViewportLodScaleCalls = [];
	const store = {
		viewportLod: {
			effectiveScale: { value: 0.87 },
		},
		project: {
			name: { value: "Scene A" },
			dirty: { value: true },
			packageDirty: { value: true },
		},
		sceneAssets: { value: [{ id: "asset-a" }] },
		referenceImages: { items: { value: [] } },
		workspace: { shotCameras: { value: [] } },
	};
	const controller = () => ({
		setViewportLodScale: (value) => {
			setViewportLodScaleCalls.push(value);
		},
	});

	const root = ViewportProjectStatusHud({ store, controller, t });
	const hud = findVNode(root, (node) =>
		classListIncludes(node, "viewport-project-status"),
	);
	const label = findVNode(root, (node) =>
		classListIncludes(node, "viewport-lod-scale"),
	);
	const range = findVNode(root, (node) =>
		classListIncludes(node, "viewport-lod-scale__range"),
	);
	const value = findVNode(root, (node) =>
		classListIncludes(node, "viewport-lod-scale__value"),
	);
	const tooltip = findVNode(root, (node) => node.type === TooltipBubble);

	assert.ok(hud, "Project status HUD root must render.");
	assert.ok(label, "Preview quality label must render.");
	assert.ok(range, "Preview quality range input must render.");
	assert.ok(tooltip, "Preview quality must use the app tooltip component.");
	assert.equal(range.props.type, "range");
	assert.equal(range.props.min, VIEWPORT_LOD_SCALE_MIN);
	assert.equal(range.props.max, VIEWPORT_LOD_SCALE_MAX);
	assert.equal(range.props.step, VIEWPORT_LOD_SCALE_STEP);
	assert.equal(range.props.value, 0.87);
	assert.equal(range.props["aria-label"], "3DGS プレビュー品質");
	assert.equal(label.props.title, undefined);
	assert.equal(range.props.title, undefined);
	assert.equal(tooltip.props.title, "プレビュー品質");
	assert.equal(
		tooltip.props.description,
		"3DGS が重いときに、ビューポートの表示負荷を調整します。",
	);
	assert.equal(tooltip.props.placement, "bottom");
	assert.equal(
		textContent(value),
		formatViewportLodScaleLabel(0.87),
		"HUD should show the formatted LoD scale value.",
	);

	range.props.oninput({ currentTarget: { value: "0.74" } });
	assert.deepEqual(setViewportLodScaleCalls, ["0.74"]);
	assert.match(textContent(root), /Scene A/);
	assert.match(textContent(root), /\*/);
	assert.match(textContent(root), /PKG/);
}

console.log("✅ CAMERA_FRAMES viewport project status HUD tests passed!");
