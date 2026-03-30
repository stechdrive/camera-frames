# CAMERA_FRAMES App Roadmap

最終更新: 2026-03-30

## Current Position

- This repository is the primary app repo.
- Spark is consumed from the official `v2.0.0-preview` line.
- The standalone app shell and controller split are established.
- `main` is now at `v0.6.6` with the third UI-polish wave integrated.
- Spark offscreen export foundation is now centered on the active Spark renderer with offscreen target readback.
- Legacy `.ssproj` import now works across both recent normalized packages and older raw package variants for representative project data, including older GLB baked-transform edge cases.
- Layered PSD export is in active development: GLB layers/masks, 3DGS layers/masks, and guide layers all have a working path.
- Infinite Grid / Eye Level preview and export are in place. Remaining work is guide color/compositing parity, not basic functionality.
- Import flow now has a shared confirm/progress/error overlay, and startup deep links use `?load=` with allow/deny policy instead of auto-fetching `?url=`.
- SOG / PLY bounds now resolve well enough for scene diagnostics and auto Far. no-camera loads intentionally use a fixed home view instead of bounds-based framing.
- package archive read/write is now unified on `zip.js`, with final package ZIP written as a stream instead of full in-memory assembly.
- controller-level smoke coverage now exists for normal `.ssproj` open and broken `.ssproj` overlay cleanup.
- `package.json` now owns SemVer, and build output emits `version.json`.
- dev runtime now exposes `version / commit / dev:` so browser checks can verify the active code state.
- `npm run deploy` publishes the GitHub Pages app.
- reference images are now first-class:
  - PNG / JPG / WEBP / PSD import
  - PSD leaf-layer expansion
  - shot-camera preset binding with `(blank)` handling
  - Camera View-only preview
  - transient preview/export gates
  - on-canvas `R` mode transform
  - preset / manager / property split in the Reference tab
  - Photoshop-like manager ordering on PSD import
- lighting is now project-managed instead of hardcoded:
  - directional light
  - ambient
  - hidden fill light
  - camera-relative direction widget
- the workbench shell is now much closer to the intended UX:
  - floating left tool rail with zoom / mask / contextual coordinate-space controls
  - right inspector icon tabs (`Scene / Reference / Camera / Export`)
  - collapsible + pinnable sections
  - mobile bottom dock + drawer
  - tooltip-based low-noise labeling
- camera authoring is denser and more production-oriented:
  - shot default lens = 35mm
  - viewport default lens = 14mm until user edit
  - `Pose` section owns XYZ / YPR / clip / local move
  - viewport->shot copy includes lens, shot->viewport stays asymmetric
- workbench UI has crossed the minimum usable line:
  - Scene is now `list + shared inspector`
  - Reference is its own top-level tab
  - camera properties, paper setup, and viewport/display controls are no longer mixed in one section
  - GLB and 3DGS reorder are category-separated
  - viewport lens and shot lens are no longer coupled
  - compact collapse toggle exists for quick phone smoke tests
  - Scene / Camera now use `upper scroll region + lower fixed inspector`
  - reference manager and camera list are no longer hidden behind mixed inspector sections
- workbench icons are now file assets under `src/ui/svg/*.svg` instead of JS-owned inline definitions
- viewport tool system is now past the first usable milestone:
  - integrated gizmo exists
  - working pivot exists
  - `none / select / transform / pivot` tool modes exist
  - viewport and camera-view asset selection both work
  - grouped transform works without persistent Null objects
- native project save has now moved from "future skeleton" to active implementation:
  - `project-controller.js` owns project open/save orchestration
  - `Ctrl+S` now acts as lightweight working save
  - package save is explicit heavy save/export with overwrite vs save-as confirmation
  - package save uses the shared overlay for progress and option picking
  - SOG compression is package-save-only and user-selectable
  - SOG compression now uses Spark parser columns + worker `writeSog`, not the old raw-bytes roundtrip
- workspace model already carries the seams for viewport projection/preset work (`perspective/top/front/right` and pane projection state), but orthographic runtime/UI paths are still not exposed.

## Priority Order

1. Workbench UI polish with DCC density/discoverability focus
2. Reference image polish / preset UX / true back-layer preview composition / representative browser QA
3. Viewport tool system polish and orthographic authoring support
4. Export correctness and layered contract stabilization
5. Measurement tool and authoring utility workflow
6. Asset-level large-package hardening
7. Importer cleanup, bundle weight reduction, and per-splat edit planning

## Near-Term Goal

Reach the point where correctness-sensitive work continues on `main` with:

- reproducible PNG / PSD output on representative `.ssproj` projects,
- stable legacy project import,
- a viewport-first workbench that is not painful to use for repeated export tests,
- import/link flows that are safe enough to use as practical viewer links,
- undo/redo that makes direct manipulation safe,
- a two-tier save model that matches old CAMERA_FRAMES:
  - fast working save for ongoing work
  - explicit heavy package save for sharing / handoff
- a clear split between `Shot` authoring and `Viewport` authoring tools,
- orthographic viewport modes for placement/alignment work,
- direct object transform tooling beyond numeric inspectors,
- reference images / underlays as first-class layout aids,
- and a canonical app document shape that can be saved again.

## Code Ownership Direction

- `src/controllers/camera-controller.js`
  - shot camera document mutation, clip, export preset, camera selection
- `src/controllers/output-frame-controller.js`
  - render size, view zoom, anchor, render-box overlay, viewport-safe auto fit
- `src/controllers/frame-controller.js`
  - FRAME CRUD and direct 2D frame manipulation
- `src/controllers/asset-controller.js`
  - scene asset import, scene asset state, numeric transform, grouped reorder
- `src/controllers/runtime-controller.js`
  - animation loop, input binding, lifecycle, runtime-only navigation state
- `src/controllers/ui-sync-controller.js`
  - derived summaries / UI rows only; no new feature logic should accumulate here
- `src/controllers/history-controller.js`
  - new dedicated owner for Undo/Redo, transaction boundaries, hotkey dispatch
- `src/controllers/viewport-tool-controller.js`
  - current owner for gizmo mode, world/local toggle, selection tool routing, working pivot, grouped transform
- `src/controllers/lighting-controller.js`
  - saved directional/ambient/fill lighting rig for GLB visibility
- `src/controllers/reference-image-controller.js`
  - reference-image document, preset binding, import, numeric edit, on-canvas transform orchestration
- `src/controllers/reference-image-render-controller.js`
  - Camera View preview layer projection and selection-box projection
- `src/controllers/project-controller.js`
  - current owner for project open/save orchestration, working save vs package save split, and future format versioning
- `src/project-working-state.js`
  - current owner for local working-save persistence
- `src/project-file.js`
  - current owner for portable package build/read and package assembly
- `src/engine/sog-data-table.js`
  - owner for save-only splat columns extracted from Spark parsers
- `src/engine/sog-compress.worker-impl.js`
  - owner for worker-side `writeSog` execution during package save

`src/controller.js` should stay wiring-only. New feature logic should land in dedicated controllers/modules above.

## Non-Goal Right Now

- Introducing a service worker before update policy exists
- Final visual polish before the workbench and export contract settle
- Camera animation parity from old CAMERA_FRAMES
- Reference image serialization before the save model is stable
