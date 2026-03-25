export const BASE_RENDER_BOX = Object.freeze({ width: 1754, height: 1240 });
export const BASE_FRAME = Object.freeze({ width: 1536, height: 864 });
export const FRAME_OUTLINE_WIDTH_PX = 2;
export const FRAME_MAX_COUNT = 20;
export const PROJECT_PACKAGE_EXTENSION = "ssproj";
export const MAX_OUTPUT_FRAME_DIMENSION = 16000;
export const MIN_OUTPUT_FRAME_SCALE_PCT = 100;
export const MAX_OUTPUT_FRAME_WIDTH_PCT = Math.floor(
	(MAX_OUTPUT_FRAME_DIMENSION / BASE_RENDER_BOX.width) * 100,
);
export const MAX_OUTPUT_FRAME_HEIGHT_PCT = Math.floor(
	(MAX_OUTPUT_FRAME_DIMENSION / BASE_RENDER_BOX.height) * 100,
);
export const DEFAULT_CAMERA_VIEW_ZOOM = 1;
export const MIN_CAMERA_VIEW_ZOOM_PCT = 20;
export const MAX_CAMERA_VIEW_ZOOM_PCT = 200;
export const AUTO_VIEW_ZOOM_MARGIN = 0.96;
export const AUTO_WORKBENCH_MIN_SAFE_ZOOM = 0.55;
export const WORKBENCH_STACK_BREAKPOINT_PX = 960;
export const WORKBENCH_SAFE_GUTTER_PX = 16;
export const OUTPUT_FRAME_MIN_VISIBLE_PX = 1;
export const DEFAULT_CAMERA_NEAR = 0.1;
export const DEFAULT_CAMERA_FAR = 1000;
export const DEFAULT_FPS_MOVE_SPEED = 2.5;
export const DEFAULT_POINTER_SLIDE_SPEED = 0.006;
export const DEFAULT_POINTER_SCROLL_SPEED = 0.0015;
export const DEFAULT_GRID_SIZE_METERS = 12;
export const DEFAULT_GRID_DIVISIONS = 24;
export const VIEWPORT_PIXEL_RATIO = 1;
export const SCENE_UNIT_BADGE = "1u = 1m";

export const SPLAT_EXTENSIONS = new Set([
	"ply",
	"spz",
	"splat",
	"ksplat",
	"zip",
	"sog",
	"rad",
]);

export const MODEL_EXTENSIONS = new Set(["glb", "gltf"]);

export const ANCHORS = {
	"top-left": { x: 0, y: 0 },
	"top-center": { x: 0.5, y: 0 },
	"top-right": { x: 1, y: 0 },
	"middle-left": { x: 0, y: 0.5 },
	center: { x: 0.5, y: 0.5 },
	"middle-right": { x: 1, y: 0.5 },
	"bottom-left": { x: 0, y: 1 },
	"bottom-center": { x: 0.5, y: 1 },
	"bottom-right": { x: 1, y: 1 },
};
