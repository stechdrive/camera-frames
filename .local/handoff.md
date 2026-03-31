# Handoff

最終更新: 2026-03-31

## Current Repo State

- repo: `D:\GitHub\camera-frames`
- integration branch: `main`
- current working branch: `codex/orthographic-structure-plan`
- current local worktree: dirty (uncommitted HUD gizmo polish follow-up)
- working version source of truth: `package.json`
- current release baseline: `0.6.8`
- dependency: `@sparkjsdev/spark = sparkjsdev/spark#v2.0.0-preview`
- Pages URL: `https://stechdrive.github.io/camera-frames/`
- latest build info: `local orthographic viewport HUD WIP / ortho entry reference + gizmo polish follow-up / lint+build+test pass`
- latest deploy baseline: `gh-pages d836f40 (publish ee89d33)`

## Current App Structure

- `src/main.js`: bootstrap / app mount only
- `src/ui/`: viewport-first workbench shell (`app-view.js`, `side-panel.js`, `viewport-shell.js`, `frame-layer.js`)
- `src/ui/svg/`: workbench icon assets (`1 icon = 1 svg file`)
- `src/ui/workbench-controls.js`: shared numeric/scrub input controls and UI event isolation
- `src/ui/workbench-icons.js`: SVG icon system for workbench panels/tabs
- `src/ui/workbench-primitives.js`: reusable header/section/tab primitives
- `src/ui/workbench-sections.js`: Scene / Reference / Camera / Export section renderers, left-rail popovers, scene/browser/detail sections
- `src/controllers/asset-controller.js`: asset load / clear / legacy `.ssproj` asset import / scene selection / per-asset numeric transform / same-kind reorder / grouped transform application
- `src/controllers/camera-controller.js`: shot camera documents, pose/lens/clip mutation, viewport-vs-shot copy rules, view copy/reset
- `src/controllers/export-controller.js`: PNG/PSD export, GLB/3DGS layered PSD, guide passes, current/all/selected export
- `src/controllers/frame-controller.js`: FRAME CRUD, move, resize, rotate, anchor drag
- `src/controllers/history-controller.js`: snapshot-based undo/redo stack and transaction boundary manager
- `src/controllers/interaction-controller.js`: navigate mode, zoom/mask tool routing, orbit-on-hit navigation, mouse-only control momentum
- `src/controllers/lighting-controller.js`: directional light rig, ambient/fill tuning, camera-relative light direction widget
- `src/controllers/output-frame-controller.js`: render box pan, resize, anchor drag, overlay state, safe-area fit / display fit behavior
- `src/controllers/project-controller.js`: project open/save orchestration, working save vs package save split, package save option/progress flow
- `src/controllers/reference-image-controller.js`: reference-image document/preset state, import, preset binding, manager reorder/selection, numeric edit, on-canvas transform orchestration
- `src/controllers/reference-image-render-controller.js`: Camera View reference-image preview and selection box projection
- `test/camera-frames-project-controller.test.ts`: controller-level save/open smoke coverage for overlay cleanup, replacement confirm, and HUD/save-state alignment
- `test/camera-frames-input-router.test.ts`: native text undo routing only during active draft editing
- `test/camera-frames-interaction-controller.test.ts`: interaction-only UI toggles should not dirty the project
- `src/controllers/projection-controller.js`: render-box/camera projection sync and viewport-vs-shot frustum split
- `src/controllers/runtime-controller.js`: input binding, animation loop, focus-sensitive navigation gating, init/dispose
- `src/controllers/ui-sync-controller.js`: scene rows, selection sync, summaries, drop hint, UI state sync
- `src/controllers/viewport-axis-gizmo-controller.js`: Viewport-only HUD XYZ gizmo projection / visibility / active-state sync
- `src/controllers/viewport-projection-controller.js`: Viewport perspective/orthographic ownership, ortho pan/zoom/depth, and active viewport camera routing
- `src/controllers/viewport-tool-controller.js`: viewport / camera-view asset selection, integrated gizmo, working pivot, tool modes, grouped transform
- `src/project-working-state.js`: IndexedDB-backed lightweight working save store with cleanup limits
- `src/project-file.js`: portable project package build/read and package assembly orchestration
- `src/engine/sog-data-table.js`: Spark parser based save-only splat columns for SOG package save
- `src/engine/sog-compress-worker-client.js`: package-save SOG compression client
- `src/engine/sog-compress.worker-impl.js`: worker-side `writeSog` execution for package save
- `src/importers/legacy-ssproj.js`: legacy `.ssproj` camera / frame / asset transform translation
- `src/engine/import-link-policy.js`: deep-link / remote URL allow/deny policy
- `src/interactions/input-router.js`: text-input focus routing, tool shortcuts, viewport select/transform input separation
- `src/ui/app-overlay.js`: shared confirm / progress / error overlay
- `src/ui/project-status.js`: viewport HUD-only project save-state display (`name / * / PKG`)
- `src/ui/viewport-axis-gizmo.js`: Viewport-only Blender-like XYZ orthographic HUD gizmo
- `.local/state-ownership-map.md`: what lives in package save vs working save vs runtime only
- `src/engine/camera-lens.js`: standard-FRAME H-FOV and full-frame horizontal focal-length conversion helpers
- `src/engine/camera-pose.js`: render-box-center-axis pose decomposition / composition helpers
- `src/engine/scene-asset-order.js`: GLB/3DGS category-aware scene ordering
- `src/engine/viewport-orthographic.js`: Viewport-only orthographic view ids, state normalization, and ortho camera configuration
- `src/engine/spark-export-renderer.js`: Spark offscreen export renderer manager
- `src/engine/export-bundle.js`: layered export bundle and flatten helpers
- `src/engine/export-pass-plan.js`: pass planning for beauty / guides / masks
- `src/engine/psd-export.js`: PSD writer
- `src/engine/reference-image-export-order.js`: PSD reference-image layer ordering helpers
- `src/engine/reference-image-loader.js`: PNG/JPG/WEBP/PSD decoding and PSD leaf-layer expansion
- `src/engine/reference-image-selection.js`: reference-image hit testing and selection box geometry
- `src/engine/guide-overlays.js`: Infinite Grid / Eye Level preview and export rendering
- `src/engine/linear-composite.js`: linear compositing helper for export flatten/composite
- `src/engine/rotate-cursor.js` / `src/engine/resize-cursor.js`: angle-aware cursor generation
- `src/lighting-model.js`: saved lighting document for directional/ambient rig
- `src/reference-image-model.js`: canonical reference-image document/preset/item normalization and display/composite ordering helpers

## Validation Status

- `npm run lint`: pass
- `npm run build`: pass
- `npm test`: pass
- browser smoke tests:
  - app boot: pass
  - Viewport / Camera switch: pass
  - `.ssproj` inner GLB + splat load: pass
  - older raw `.ssproj` import compatibility: pass on representative project data
  - older GLB baked-transform edge case (`model_1.glb` style): pass
  - FRAME move / resize / rotate / anchor: pass
  - render box pan / resize: pass
  - PNG export: pass
  - PSD export: pass
  - GLB layer masks: pass on representative test data
  - 3DGS layered PSD export: pass on representative test data
  - Infinite Grid / Eye Level preview and export: pass
  - Scene UI grouped reorder (`GLB / モデル` and `3DGS` split): pass
- numeric input draft editing / input focus isolation: pass
- numeric scrub input with modifier drag: pass
- numeric scrub edge slowdown / hold behavior: pass
- viewport lens and shot lens separation: pass
- lighting controls and persistence: pass
- drag-and-drop / file picker / URL import progress overlay: pass
- startup `?load=` confirm flow: pass
- SOG / PLY bounds display and no-camera home view: pass
- compact workbench toggle for phone smoke tests: pass
- undo/redo foundation lint/build/test: pass
- undo/redo browser smoke test: pass
- viewport integrated gizmo: pass
- working pivot edit: pass
- viewport/camera-view asset selection: pass
- grouped transform (multi-select move/rotate/uniform scale): pass
- reference image import / save / export foundation: pass on representative browser tests
- reference image `R` mode single/multi transform: pass on representative browser tests
- reference preset / manager / property split: pass on representative browser tests
- reference manager reorder + PSD-order import contract: pass on representative browser tests
- left rail zoom tool (`Z`) popup and fit-to-safe-area action: pass
- left rail mask / frame control popup: pass
- camera property inspector actions (copy/reset/pose edit): pass
- scene/reference/camera/export icon-tab inspector shell: pass on representative browser smoke
- project save UX:
  - viewport HUD `name / * / PKG`: pass
  - `Open...` unified project/import flow: pass
  - new-project / open replacement confirm: pass
- shot-camera local editor state:
  - FRAME selection restore: pass
  - output-frame selection restore: pass
  - reference selection / remembered selection restore: pass
- save redesign integration:
  - `Ctrl+S` side: pass at lint/build/test level
  - package save overlay/options: pass in browser
  - controller wiring for open/save/export: pass in browser
  - controller smoke test for broken `.ssproj` overlay cleanup: pass
  - legacy `.ssproj` reopen after package save: pass
  - SOG compression package save: pass on representative browser test after Spark-parser column pipeline rewrite
- orthographic viewport branch snapshot:
  - Viewport-only orthographic state/document wiring: pass at lint/build/test level
  - HUD XYZ gizmo render/sync wiring: pass at lint/build/test level
  - X/Z orthographic preview helper grid wiring: pass at lint/build/test level
  - perspective return after ortho now restores camera controls again: pass on current branch logic
  - ortho entry axis-position preservation logic updated to keep full world position on entry: pass at lint/build/test level, browser QA still needed
  - ortho entry size now derives from current viewport perspective view scale instead of previous/saved ortho size: pass at lint/build/test level, browser QA still needed
  - ortho entry reference priority is now `viewport center hit -> short-lived orbit-hit hint -> last valid center-hit -> scene center`: pass at lint/build/test level, browser QA still needed
  - HUD XYZ gizmo active button fill / negative-facing label suppression / line-to-node alignment polish: pass at lint/build/test level, browser QA still needed
  - HUD XYZ gizmo line coordinates now use the gizmo's real pixel size instead of the fixed 100x100 SVG space: pass at lint/build/test level, browser QA still needed
  - browser smoke for gizmo click / ortho controls / preview helper grid / perspective auto-exit: pending

## Versioning / Release Rule

- app version is managed in `package.json`
- production build emits `dist/version.json`
- workbench header shows `version / commit / dev:` for dev freshness checks
- startup deep link uses `?load=` instead of `?url=` because Vite dev conflicts with `url`
- standard release bump command is `npm version patch|minor|major`
- service worker is not used yet, so deploy updates rely on hashed assets and reload

## Known Risks

- export correctness for Spark LoD convergence is still unresolved
- guide overlay export color still differs slightly from browser preview, especially the red/blue grid lines
- workbench UI is substantially reworked now, but visual density / panel hierarchy / CSS polish are still mid-transition
- scene/reference/camera density and shared inspector discoverability still need another pass
- 3D object multi-select inspector is now delta-based, but the right amount of type-aware bulk editing is still open
- reference preview still lacks true back-layer composition between background and infinite grid; current `back/front` split is export/manager-correct but preview-layer-limited
- shot-camera local editor state intentionally lives only in working save; `.ssproj` reopen restores content, not transient selection/editor focus
- mobile now has a first-pass bottom dock + inspector drawer, but broader touch QA and polish remain
- mobile/touch 実装は未着手。方針は `phone = portrait + bottom sheet`, `tablet = desktop-like + touch/pen`
- orthographic viewport mode is now in active branch work, and browser/manual QA is still pending around entry scale feel and axis-direction expectations
- viewport gizmo is now in place, and orthographic HUD gizmo was added on the branch, but polish remains: no selected-object visual cue and no off-screen pivot/gizmo rescue
- legacy import now works, but `project-package.js` should later be split more cleanly
- Vite build still reports a large chunk warning
- very large 3DGS scenes can still produce huge full bounds / huge auto Far; no-camera startup now uses a fixed home view, but full bounds remain intentionally large for diagnostics/export
- native project save is now usable, and final package ZIP write is streaming via `zip.js`, but very large asset peak-memory behavior still needs hardening
- reference images are now first-class, but polish remains:
  - preset duplication / switching UX
  - broader representative browser QA
  - export gate / batch workflow polish
- camera inspector is now denser and closer to production use:
  - `Pose` owns XYZ / YPR / clip / local move
  - shot default lens is 35mm
  - viewport default lens is 14mm until the user edits it
  - viewport->shot copy includes lens, shot->viewport remains asymmetric
- working save currently depends on project identity/fingerprint; brand-new scenes still need the first package save
- grouped transform currently uses active-object working pivot as group pivot; UX may still need refinement
- per-splat edit mode is still absent
- package save no longer assembles the final zip archive in memory, but giant assets still need a later asset-level streaming/peak-memory review

## Next Work

1. Run browser smoke on the orthographic branch: HUD gizmo visibility, 6-direction clicks, centered-axis flip, entry position, entry size feel, center-hit vs empty-space fallback, ortho pan/zoom/depth, X/Z helper grid visibility, and auto-return to perspective only on rotation gestures
2. After smoke results, fix any ortho interaction issues and update drop hint / status wording only if needed
3. Continue viewport authoring tools after ortho settles: focus selected / fit scene / measurement groundwork
4. Continue workbench UI polish with DCC density priorities: scene/reference/camera/export discoverability, list compactness, file-menu wording, and right-panel hierarchy cleanup
5. Finish reference-image polish: preset UX, manager/export consistency, true preview back-layer composition, and representative browser QA
6. Stabilize export correctness: guide color parity, LoD settle policy, and layered PSD contract polish
7. Re-check package save on larger assets: per-asset peak memory, SOG output size, and failure reporting
8. Plan per-splat edit mode after tool-system seams and save model stabilize

## Resume Prompt

`このリポでは .local/AGENTS.local.md と .local/development-playbook.md と .local/code-structure-plan.md と .local/feature-map.md と .local/state-ownership-map.md と .local/architecture-roadmap.md と .local/open-questions.md と .local/handoff.md を先に見て。release baseline は main / v0.6.8。保存方針は old CAMERA_FRAMES と同じく \`working save\` と \`package save\` を分けること。project status の正本は viewport 右上 HUD の \`name / * / PKG\`。現ブランチでは Viewport-only orthographic の仕込みが進んでいて、\`viewport-projection-controller\`、\`viewport-axis-gizmo-controller\`、\`viewport-orthographic.js\`、\`viewport-axis-gizmo.js\` が追加されている。HUD XYZ gizmo で 6 方向オルソへ入る設計で、store/project-document/runtime/input-router まで state と配線は入っているが、browser smoke はまだ必要。Camera tab は shot state のまま触らず、right panel に viewport 専用 UI は増やさない前提。現状仕様は .local/feature-map.md、保存範囲は .local/state-ownership-map.md、残課題は .local/architecture-roadmap.md を正本にする。正本仕様は D:\GitHub\supersplat-cameraframes\docs を見る。`
