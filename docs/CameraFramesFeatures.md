# CAMERA_FRAMES 機能一覧 / 回帰チェック観点

最終更新: 2026-04-12

## 0. この文書の役割

この文書は、現行 repo の「何ができるか」を短く把握するための一覧です。
仕様の正本は `docs/camera_frames_requirements.md` と `src/` / `test/` であり、
ここでは maintainer や coding agent が回帰確認に使いやすい粒度で整理します。

## 1. 現在の baseline

- app version: `0.9.4`
- project format: `camera-frames-project` version `3`
- major feature set は概ね揃っている
- 今の開発主眼は「既存機能を壊さず強くすること」

## 2. 主機能

### 2.1 Open / Import

- `Open...` で scene asset / reference image / `.ssproj` を扱える
- drag and drop でも同じ import routing を使う
- remote URL 欄から scene asset URL を読み込める
- startup `?load=` による確認付き remote import がある
- legacy `document.json` ベース `.ssproj` を fallback import できる

対応形式:

- scene asset: `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`
- project: `.ssproj`
- reference image: `.png`, `.jpg`, `.jpeg`, `.webp`, `.psd`

### 2.2 Project / Save

- new project
- working save
- portable `.ssproj` save
- `.ssproj` open 時の compatible working save restore
- viewport HUD の `name / * / PKG` で dirty 状態を見分けられる

### 2.3 Scene assets

- splat と model を同じ scene に置ける
- asset の表示 / 順序 / transform / content transform / scale / unit を管理できる
- export role と mask group を持てる
- working pivot を持てる
- scene asset order は保存され、export 側にも影響する

### 2.4 Shot cameras

- 複数 shot camera を持てる
- shot camera ごとに pose / lens / clipping / output frame / export settings / frames / frame mask / reference binding を持てる
- shot camera ごとに export name を持てる
- roll lock を持てる

### 2.5 Output Frame / FRAME

- output frame は paper size の width / height を別々に持てる
- anchor 3x3 を持てる
- center / fit / view zoom を持てる
- shot camera の custom frustum で、指定 anchor / center の構図を保ったまま領域変更できる
- `FRAME` は複数配置できる
- `FRAME` は移動 / 回転 / 拡縮 / anchor 編集に対応する
- output frame resize 時も `FRAME` は新しい紙面位置へ remap される
- frame mask は `off` / `all` / `selected` を持つ

### 2.6 Reference images

- reference image preset を持てる
- default preset は `(blank)`
- active shot camera ごとに preset binding を持てる
- per-shot override を持てる
- item は `front` / `back` group を持つ
- item は preview visible と export enabled を別に持つ
- PSD import は leaf layer を individual item に展開する
- 複数選択と transform に対応する
- preset は `baseRenderBox` を保持する
- output frame の size / anchor が変わっても、下絵は base render box 基準の位置関係を保ちながら current paper 上へ再配置される
- per-shot `renderBoxCorrection` で shot ごとの紙面差分を補正できる

### 2.7 Viewport / Interaction

- `Viewport` と `Camera View` を分離して使う
- viewport-only orthographic を持つ
- main tool:
  - navigate
  - zoom
  - select
  - transform
  - pivot
  - reference image edit
  - measurement
  - per-splat edit
- viewport pie menu を持つ
- keyboard shortcut / pointer routing は一元化されている

### 2.8 Per-splat edit

- entry は tool rail と `Shift+E`
- current tool / action:
  - `Box`
  - `Brush`
  - `Transform`
  - `Delete`
  - `Separate`
  - `Duplicate`
  - `Select All`
  - `Invert`
  - `Clear`
- raw selection は runtime-only
- 編集結果は persistent source に反映される

### 2.9 Export

- target: `current` / `all` / `selected`
- format: `png` / `psd`
- shot camera ごとに export settings を持つ
- export run ごとに `Include Reference Images` を切り替えられる
- PNG / PSD とも preview 側の output frame 契約に沿って出す

PSD export の主な構成:

- back reference images
- guide
- render
- splat layers
- model layers
- eye-level
- front reference images
- frame overlays
- frame mask layer

## 3. 旧 CAMERA_FRAMES と混同しない点

- `.sscam` は現 repo の機能ではない
- save の主軸は `working save + .ssproj`
- Viewport と Camera View は統合しない
- current baseline は Spark 2.0 上の現行実装であり、旧 `camera-frames` branch の stable 契約をそのまま移植したものではない
- `exportSplatLayers` の既定値や reference image model は旧文書より現 repo 実装を優先する
- ただし旧 `.ssproj` の読込み互換は migration contract として維持する。詳細は [legacy-ssproj-compatibility.md](./legacy-ssproj-compatibility.md)

## 4. 回帰で壊しやすい観点

### 4.1 Save / Open

- `Ctrl+S` が working save と package save を取り違えないか
- `.ssproj` open 時に compatible working save が不正に適用 / 不適用にならないか
- legacy `.ssproj` fallback import が current project context を壊さないか

代表テスト:

- `test/camera-frames-project-controller.test.ts`
- `test/camera-frames-project-file.test.ts`
- `test/camera-frames-legacy-ssproj.test.ts`

### 4.2 Projection / Output Frame / FRAME

- output frame scale clamp
- off-axis framing
- anchor fixed のままの paper resize
- viewport-only orthographic
- frame drag / resize / rotate / anchor
- frame mask polygon / PSD mask

代表テスト:

- `test/camera-frames-projection.test.ts`
- `test/camera-frames-output-frame-controller.test.ts`
- `test/camera-frames-frame-controller.test.ts`
- `test/camera-frames-frame-mask-export.test.ts`

### 4.3 Reference images

- preset と shot binding の分離
- per-shot override
- `baseRenderBox` 基準の位置保持
- output frame size / anchor 変更時の effective offset 再計算
- PSD layer import
- preview / export の参加条件
- back / front group 順序

代表テスト:

- `test/camera-frames-reference-image-*.test.ts`
- `test/reference-image-controller*.test.ts`

### 4.4 Export

- export target resolution
- PNG / PSD の分岐
- guide / reference / frame / mask / model / splat の layering
- export 時の reference image session toggle

代表テスト:

- `test/camera-frames-export-targets.test.ts`
- `test/camera-frames-export-output-snapshot.test.ts`
- `test/camera-frames-export-reference-images.test.ts`
- `test/camera-frames-export-psd-document.test.ts`
- `test/camera-frames-psd-export.test.ts`

### 4.5 Per-splat edit

- runtime-only raw selection と persistent source 更新の境界
- transform / delete / separate / duplicate 後の source consistency

代表テスト:

- `test/camera-frames-per-splat-edit-controller.test.ts`
- `test/camera-frames-scene-asset-state-persistence.test.ts`

## 5. 現在 baseline に含めないもの

- `.sscam`
- generic viewer 方向の UI
- WebGPU を前提にした通常運用
- streaming LoD
- `WORKSPACE_LAYOUT_QUAD` の完成機能

## 6. まだ完成扱いにしないもの

今の repo で「ある程度あるが、完成済み機能として固定しない」もの:

- preview / export correctness の詰め
- reference image の true back-layer composition の最終 hardening
- very large project save/load の hardening
- LoD settle policy の詰め
- `focus selected / fit scene` の productized workflow

## 7. この文書の使い方

- PR / 変更時は、まず `docs/camera_frames_requirements.md` で contract を確認する
- 変更が user-visible なら、この文書の該当機能欄と代表テストも更新する
- `.local/` のメモ更新だけで済ませず、共有すべき仕様変更は `docs/` に昇格させる
