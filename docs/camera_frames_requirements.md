# CAMERA_FRAMES 実装要件 / 保守基点

最終更新: 2026-04-26

## 0. この文書の役割

この文書は、この repo の現行実装を基準に、
CAMERA_FRAMES の共有 contract を Git 管理するための基点です。

- 正本は常に `src/`, `test/`, `package.json`
- `docs/` は共有される仕様・保守契約
- `.local/` は Git 管理しない補助メモ
- 旧 `CAMERA_FRAMES` / `supersplat-cameraframes` 側の資料は履歴参照であり、この repo の仕様を上書きしない

判断に迷った時の優先順:

1. `src/`, `test/`, `package.json`
2. この文書
3. `docs/CameraFramesFeatures.md`
4. `docs/legacy-ssproj-compatibility.md`
5. `.local/` の補助資料
6. 外部 repo / 過去資料

## 1. 現在の基準

- app version は `1.0.2`
- Spark dependency baseline は npm 公開版 `@sparkjsdev/spark@2.0.0`
- portable project format は `camera-frames-project` version `3`
- この repo は「新機能を大量に増やす段階」より、「既存 contract を壊さず hardening する段階」に入っている
- 優先順位は次を基本にする
  - bug fix
  - preview / export correctness
  - save / open / persistence safety
  - performance / large-project hardening
  - Spark 2.x 追従耐性のための構造整備

## 2. プロダクト定義と不変条件

- CAMERA_FRAMES は汎用 viewer ではなく、shot layout と export のための専用アプリである
- 価値の中心は `shot camera + output frame + FRAME + reference image + export` の一貫運用にある
- `Viewport` と `Camera View` は別の authoring context として扱う
- shot camera は project に保存される camera object、viewport camera は editor 上の作業 camera として分離して扱う
- `Output Frame` は単なる DOM 枠ではなく、preview / export の投影契約そのものとして扱う
- shot camera の custom frustum により、指定した anchor / center を基準に構図を維持できることを core contract として扱う
- output frame の width / height 調整は、指定 anchor の構図を壊さずに領域だけを変更できることを core contract として扱う
- reference image は current output frame の一時見た目に直結で保存するのではなく、preset の `baseRenderBox` を基準に保持し、output frame 変更時も紙面基準の位置関係を保つことを core contract として扱う
- `preview / export consistency` を最優先で守る
- save は local resume 用の `working save` と portable な `.ssproj` package save を分ける
- per-splat の raw selection は runtime-only、編集結果の splat source は persistent として扱う
- 旧 CAMERA_FRAMES にあった `.sscam` は現 repo の baseline ではない

## 3. 現在のアプリ形状

- 起動の composition root は `src/controller.js`
- bootstrap は `src/main.js`
- UI ではない local preference / status helper は `src/app/` を正本にし、`src/ui/` 側は必要な表示 shim に留める
- 現行 UI は single-pane 前提で運用する
- `WORKSPACE_LAYOUT_QUAD` 定数は残っているが、現行の product baseline には含めない
- 将来 split view / multi-pane を導入する余地は残すが、現行 contract には pane ごとの個別 camera 割当てや viewport state 保存を含めない
- 主要 UI 面:
  - `src/ui/viewport-shell.js`: viewport, HUD, overlay, direct manipulation
  - `src/ui/side-panel.js`: left rail, inspector, file / export 導線
  - `src/ui/app-overlay.js`: confirm / progress / error overlay

## 4. Open / Import の契約

- `Open...` は scene asset / reference image / `.ssproj` の統合入口
- 単独の `.ssproj` を開いた時は project open として扱う
- それ以外の複数ファイル選択は、scene asset import と reference image import に振り分ける
- local file picker で受ける形式:
  - scene asset / project: `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.ssproj`
  - reference image: `.png`, `.jpg`, `.jpeg`, `.webp`, `.psd`
- drag and drop でも同じ振り分けを使う
- remote URL 欄は `http://` / `https://` の URL 群を読み込める
- startup `?load=` は確認付きで読み込めるが、`https` のみ許可し、localhost / private host は拒否する
- legacy `document.json` ベース package は fallback import path で読める

補足:

- reference image の PSD import は 1 枚の PSD を複数 layer item に展開する
- legacy package から import するのは splat / model 系 asset が中心で、`refs/` の画像類は現 baseline の import asset には含めない

## 5. Save / Project Lifecycle の契約

- `Ctrl+S`
  - `projectId` と `packageFingerprint` があり、working save storage が使える時は IndexedDB の working save を更新する
  - それ以外は `.ssproj` package save に fallback する
- `Ctrl+Shift+S`
  - portable `.ssproj` package save
- `.ssproj` を開いた時は `projectId + packageRevision + packageFingerprint` が一致する working save があれば自動復元する
- current `.ssproj` open は manifest / project document / resource metadata を先に読み、scene asset bytes と reference image bytes は必要になるまで materialize しない
- `.ssproj` 由来の scene asset load は package reader を開いたまま concurrency 1 で順に materialize / load する
- remote URL 入力または startup `?load=` で単独 `.ssproj` URL が渡った場合も project open workflow にルーティングし、fetch した `File` を current package / legacy package 判定に使う
- Android / iOS / iPadOS で file picker / drop 由来の `.ssproj` を開く時は、クラウドストレージ provider の遅延 read 不安定性を避けるため、OPFS にローカル作業コピーを作成してから package reader / RAD streaming を開始する
  - OPFS staging copy は RAD streaming / deferred FullData 読み込みのため project lifetime 中は保持し、次の project へ正常に切り替えた時または new project reset 時に削除する
  - クラッシュや OS kill で cleanup が走らなかった場合に備え、起動時に staging 専用ディレクトリ内の古い `.ssproj` copy を自動掃除する
  - OPFS staging が使えない場合は 256 MiB 以下だけ memory copy fallback を許可する。それより大きい `.ssproj` は元のクラウド provider Blob のまま読み続けず、端末ローカル保存後に開き直すよう案内して失敗させる
  - Android Chrome の PC版サイト表示などで UA が desktop へ寄る場合でも、File System Access handle のないタッチ環境 `.ssproj` は staging 対象として扱う。Windows touch PC などの desktop path は既定では staging しない
- compatible working save restore が確定している `.ssproj` open では、package 側の state apply と reference image bytes materialization を skip する
- project status の UI 表示は viewport 右上 HUD の `name / * / PKG`
  - `*` は working save dirty
  - `PKG` は portable package dirty
- 同じ HUD の `プレビュー品質` は端末ローカルの viewport LoD preference であり、project status / dirty 判定 / `.ssproj` contract には含めない
- モバイル UI の `UI 倍率` は端末ローカル preference であり、project status / dirty 判定 / `.ssproj` contract には含めない
  - `camera-frames.mobileUiScale` に保存する
  - 範囲は `0.70` から `2.00`、step は `0.01`
  - user 未調整時は viewport width / screen width / coarse pointer から auto scale を解決する
  - WebGL viewport、output frame、FRAME、reference image、export output は UI 倍率に追従させない
- working save record には次を含める
  - workspace
  - shot cameras
  - editor resume state
  - scene asset working state
  - scene selection
  - reference image document
- `.ssproj` package には次を含める
  - workspace
  - shot cameras
  - scene assets
  - lighting
  - reference image assets / presets / per-shot binding
  - project identity (`projectId`, `packageRevision`, `resources`)
- package save dialog の top-level 保存モードは `Fast` / `Quality`
  - `Fast` は通常の package save。未編集 PLY / SPZ があり WebGPU + worker が使える場合だけ、advanced option として SOG compression を選べる
  - `Quality` は package snapshot capture 前に必要な splat asset へ Spark `PackedSplats.createLodSplats({ quality: true })` を実行し、baked LoD を `.ssproj` に含める
  - SOG compression と Quality LoD bake は同時に使わない
- baked LoD は `raw-packed-splat` resource の optional `lodSplats` sidecar として保存する
- baked LoD を持つ `.ssproj` は load 時に prebuilt LoD を runtime に attach し、auto-LoD を待たずに使う
- baked LoD 付き `.ssproj` でも runtime render / edit 用には root FullData が正本であり、LoD preview bundle だけを asset 本体として扱わない
- LoD-first に lazy materialize した raw-packed splat source は、編集 / package save / FullData gate が必要になった時に root `packedArray` / `extra` を materialize する
- splat 内容を変える per-splat edit 内の delete / separate / duplicate / transform は existing baked LoD を invalidate する。scene object transform は splat 内容を変えないため baked LoD / RAD cache を維持する。現在 session の表示最適化は splat edit toolbar の `LoD 最適化`、次回 load 用の永続化は package `Quality` save で行う
- `raw-packed-splat` resource は optional derived cache として `radBundle` を持てる
  - `kind: "spark-rad-bundle"` / `version: 1` / `root` / `chunks[]` / `sourceFingerprint` / `bounds` / `sparkVersion` / `build` を持つ
  - RAD root / chunk entries は `.ssproj` ZIP 内で stored/uncompressed として保存し、stored entry Blob を Service Worker から `Range` 対応 URL として配信する
  - `.ssproj` open は valid な `radBundle` があれば Spark `PagedSplats` + `SplatMesh({ paged })` を優先し、stored entry 条件 / source fingerprint / Service Worker / Range / RAD decode の失敗時は root FullData path に fallback する
  - FullData が正本であり、RAD bundle は高速表示用 cache として扱う。per-splat edit / FullData gate に入ると FullData/PackedSplats へ swap し、runtime 上の RAD cache は stale として外す
  - Quality save は package snapshot capture 前に browser module worker + WASM RAD encoder を lazy load し、生成できた asset だけ `radBundle` を同梱する
  - RAD 生成は asset 単位の best-effort とし、worker load / encode / unsupported input で失敗しても既存 Quality `.ssproj` 保存は継続する。失敗した asset は `lodSplats` だけを保存し、`radBundle` は付けない
  - dev build では `?cfDevValidation=rad-ssproj&projectUrl=...` と `globalThis.__CF_BROWSER_VALIDATE__` で、browser-use から RAD package open / object transform / per-splat FullData swap を JSON 検証できる
- `.ssproj` ZIP entry の圧縮方針は package open / RAD Range / 大容量 save の contract として扱う
  - JSON と raw PLY は deflate level 6 を基本にする
  - GLB、image (`jpg` / `jpeg` / `png` / `webp`)、SOG、SPZ、ZIP、RAD、packed splat companion binary、raw-packed `packedArray` / `extraArrays` / `lodSplats` binary は stored/uncompressed とする
  - stored entry は ZIP Blob から `Blob.slice()` できる fast path として扱い、RAD root / chunk の Range 配信にも使う

## 6. Scene / Camera / Reference Image の契約

### 6.1 Scene assets

scene asset は `splat` と `model` を同じ scene で扱う。

各 asset が持つ主な保存 state:

- `id`, `kind`, `label`
- `transform`
- `contentTransform`
- `baseScale`, `worldScale`, `unitMode`
- `visible`
- `exportRole`
- `maskGroup`
- `workingPivotLocal`
- `legacyState`

補足:

- `exportRole` は現状 `beauty` / `omit`
- scene asset order は working save / `.ssproj` の両方で保持する
- per-splat edit の結果は splat source 側へ反映され、package save にも乗る

順序と追加の不変条件:

- scene asset の canonical order は `sceneState.assets` の配列順とする
- scene manager の section 順は `model` → `splat` → それ以外の kind の encounter 順とする
- 各 section 内の表示順は canonical order を同一 kind で filter した順と一致させる
- scene manager の並び替えは kind をまたがず、同一 kind 内の相対順だけを変更する
- user add/import で既存 scene に scene asset を追加した時は、新規 asset を各 kind section の先頭側へ寄せる
- replace import / project open / working restore では、保存済み canonical order を優先し、追加直後の先頭寄せを行わない

責務の基準:

- canonical kind section 順と within-kind reorder: `src/engine/scene-asset-order.js`
- scene manager / compact browser での表示順反映: `src/ui/workbench-scene-sections.js`, `src/ui/workbench-browser-sections.js`
- scene asset import 時の新規 item 優先化: `src/controllers/scene-assets/import-runtime.js`, `src/controllers/asset-controller.js`
- scene asset order の保存 / 復元: `src/controllers/scene-assets/project-state.js`, `src/controllers/scene-assets/state-persistence.js`

### 6.2 Shot camera

shot camera は複数持てる。保存される主な state:

- `pose`
- `lens.baseFovX`
- `clipping`
- `outputFrame`
- `exportSettings`
- `frames`
- `activeFrameId`
- `frameMask`
- `navigation.rollLock`
- `referenceImages`

shot camera の責務:

- shot camera は単なる pose preset ではなく、DCC の個別 camera object に相当する保存単位として扱う
- shot camera は custom frustum を前提にした shot layout camera であり、anchor / center を基準に構図維持することを core contract とする
- custom frustum / output frame / export / reference image binding は shot camera 側の責務として保存する
- current camera view では active shot camera を使う

viewport camera との分離:

- viewport camera は shot camera document とは別の editor-only camera として扱う
- viewport は `perspective` と `orthographic` を切り替えられるが、orthographic は viewport-only であり shot camera document にはしない
- 現行 baseline では viewport state は workspace 全体で 1 系統だけ持ち、pane ごとの個別 viewport pose / projection persistence はまだ contract に含めない
- 将来 split view / multi-pane を導入する場合も、pane ごとに shot camera を割り当てること、または pane ごとに viewport 用の perspective / orthographic state を持つことを妨げないよう、shot camera と viewport camera の概念を混同しない

viewport projection 切替の契約:

- perspective ↔ orthographic の相互切替では、切替直前にユーザが viewport 中央付近に見ていた世界座標点 (viewport look pivot) を focus として保持する
- P→O 進入時の pivot 解決順は `center raycast hit → 直近の orbit gesture pivot (transient) → 直前の pivot (last) → scene framing sphere と perspective forward ray の交点 → scene center`
- pivot 決定後、ortho の `size = (pivot までの perspective 奥行) × tan(verticalFov/2)` として apparent scale を保存する。`distance` も同じ奥行を基準に設定する
- O→P 復帰時は、ortho state が P→O 進入時のスナップショットと一致すれば保存済み perspective pose を復元する。一致しない場合は `perspective position = focus + orthoSide × (size / tan(verticalFov/2))` で apparent scale と画面中央が揃う位置へ再配置する
- orthographic 中の軸切替 (ortho → ortho) では `viewId` のみ差し替え、`focus / size / distance` は保持する。ユーザが zoom-in した状態を scene-radius ベースの下限で押し上げない
- ortho 中に viewport を左ドラッグして回転を開始する時も、perspective への復帰は scale-一致配置を使う。click-like ジェスチャの場合だけ進入前の projection snapshot へ戻す

既定値の基準:

- shot camera 初期数は 1
- 初期 camera 名は `Camera 1`
- clipping 初期値は `mode=auto`, `near=0.1`, `far=1000`
- export 初期値は `exportName=cf-%cam`, `exportFormat=psd`
- grid は初期 ON
- PSD の model layer / splat layer は初期 ON

### 6.3 Output Frame

- base render box は `1754 x 1240`
- base frame は `1536 x 864`
- `FRAME` 最大数は `20`
- output frame の width / height scale は base size 未満に縮めない
- export output は 1 辺 `16000px` を超えないよう clamp する
- camera view zoom は `20%` から `200%`
- anchor は 3x3 の preset を持つ
- centered off-axis framing を維持するため、frustum は anchor / center / scale を反映して再計算する
- output frame resize では anchor 側の frustum 上の固定点を維持し、領域変更だけを行う
- `FRAME` の center / anchor も render box 変更時に新しい紙面へ remap される

FRAME / frame mask の基準:

- `FRAME` は `frames[]` と `activeFrameId` で保持する
- frame mask state は `mode`, `preferredMode`, `opacityPct`, `selectedIds`, `shape`, `trajectoryMode`, `trajectoryExportSource`, `trajectory.nodesByFrameId` を持つ
- mask mode は `off` / `all` / `selected`
- `selectedIds` は remember された mask 対象の frame id 集合として保存される
- shape は `bounds` / `trajectory`
- `bounds` は current frame 群の bounding mask を使う
- `trajectory` は `FRAME` 順の center path に沿って sampled moving rectangle の sweep area を使う
- 新規 FRAME を追加して frame 数が 1 → 2 以上に遷移した瞬間、`shape` が `bounds` なら `trajectory` に自動昇格させる (既存 project の load では昇格しない)
- 同じ 1 → 2 遷移時、`trajectoryExportSource` が `none` なら自動で基点を選ぶ。優先順は `top-left` → `top-right` → `bottom-right` → `bottom-left` で、全 FRAME の該当 corner が軌道スイープの外縁 (補間 motion geometry の corner 群の convex hull 境界) にあるものを選ぶ。どの corner も内部を通過してしまう場合は `center` にする
- PSD 出力時、`trajectoryExportSource` が `none` 以外かつ frame が 2 以上なら、各 FRAME の基点位置に軌道線と直交する tick mark を打つ (preview overlay には出さない)
- trajectory の編集基準は各 `FRAME` の center であり、corner path を直接保存しない
- trajectory mode は `line` / `spline`
- spline node mode は `auto` / `corner` / `mirrored` / `free`
- stored node handle は frame center 基準の相対 vector として `trajectory.nodesByFrameId[frameId].in/out` に保持する
- `auto` node は handle を保存しない
- legacy `trajectory.handlesByFrameId` を読んだ時は `trajectory.nodesByFrameId` の `free` node へ migrate する
- `trajectoryEditMode` 自体は runtime-only UI state であり package-save に含めない
- output frame resize では `FRAME` center / anchor だけでなく stored trajectory node vectors も remap する

### 6.4 Reference images

reference image document は次を持つ:

- `assets`
- `presets`
- `activePresetId`

shot camera 側は次を持つ:

- `presetId`
- `overridesByPresetId`
  - `activeItemId`
  - `renderBoxCorrection`
  - item override map

reference image の基準:

- default preset は `(blank)`
- `(blank)` は「下絵セット未使用」を表す sentinel preset として扱う
- `(blank)` は item を持たない空 preset として運用し、下絵 import / add の書き込み先にしない
- shot camera は `referenceImages.presetId = null` の unbound 状態を取りうるが、解決時は `(blank)` を使っているのと同義に扱う
- つまり新規 shot camera や「下絵を使わない camera」は、実質的に `(blank)` を選んでいる状態として扱う
- 下絵 import は active shot camera の文脈で扱い、現在の camera が `(blank)` なら新しい named preset を作ってそちらへ import し、その camera を新 preset へ bind する
- 画像形式は `.png`, `.jpg`, `.jpeg`, `.webp`, `.psd`
- item は `front` / `back` group を持つ
- item は `previewVisible` と `exportEnabled` を別 state で持つ
- per-shot override で name / group / order / visibility / export / opacity / scale / rotation / offset / anchor を上書きできる
- preset は import / 作成時点の `baseRenderBox` を保持する
- preview / transform / export では `baseRenderBox`, current output frame size, output frame anchor, `renderBoxCorrection` を使って effective offset を再計算する
- つまり下絵は「今の紙サイズに焼き付いた絶対位置」ではなく、「元の紙面基準の位置」を保ちながら current output frame へ投影される
- output frame の anchor や size を変えても、下絵は広がった / 縮んだ紙面上の対応位置へ置き直される
- export run には runtime-only の `Include Reference Images` トグルがあり、既定値は ON

並び順・表示順・読込みの不変条件:

- reference image item の canonical order は group ごとの bottom-to-top stack order であり、`order` の昇順を基準にする
- canonical order は preview 合成、transform、persistence、PSD export の基準として扱う
- manager UI の表示順は canonical order を reverse した display order とし、stored order と display order を混同しない
- workbench / browser の list UI は display order を使うが、保存時の `group` / `order` 契約は変えない
- current baseline の通常画像 import は `front` group の末尾に append する
- PSD import は leaf layer を individual item に展開し、`front` group に import 順で append し、layer visibility を `previewVisible` / `exportEnabled` の初期値へ反映したうえで group ごとに `order` を normalize する
- manager からの reorder は display order 上で操作し、保存時には canonical order に戻して `order` を振り直す

責務の基準:

- canonical order / display order helper: `src/reference-image-model.js`
- `(blank)` preset の sentinel 意味と shot camera 側の unbound state: `src/reference-image-model.js`, `src/workspace-model.js`
- import 先 preset の選定と `(blank)` 回避: `src/controllers/reference-image/document-helpers.js`, `src/controllers/reference-image/import-runtime.js`, `src/controllers/reference-image/camera-bindings.js`
- PSD export 用の canonical order 利用: `src/engine/reference-image-export-order.js`
- import, PSD layer 展開, order normalize: `src/controllers/reference-image/import-runtime.js`, `src/controllers/reference-image/document-helpers.js`
- display order と stored order の橋渡しをする reorder 操作: `src/controllers/reference-image/list-operations.js`
- resolved item を UI 用 state に投影する境界: `src/controllers/reference-image/ui-state-sync.js`
- workbench / compact browser での表示: `src/ui/workbench-reference-sections.js`, `src/ui/workbench-browser-sections.js`

## 7. Interaction / Tool の契約

主な tool / mode:

- navigate
- zoom
- select
- transform
- pivot
- reference image edit
- measurement
- per-splat edit

interaction の基準:

- keyboard shortcut と pointer routing の集中点は `src/interactions/input-router.js`
- `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S`, undo / redo を持つ
- viewport pie menu を持つ
- middle click で pie menu を開く
- orthographic は viewport-only
- orthographic 操作中でも click-like gesture の時は元の投影状態へ戻す
- direct manipulation は transaction 単位で undo/redo にまとめる

per-splat edit の current contract:

- entry は tool rail と `Shift+E`
- 現行 tool / action
  - `Box`
  - `Brush`
  - `Transform`
  - `Delete`
  - `Separate`
  - `Duplicate`
  - `Select All`
  - `Invert`
  - `Clear`

## 8. Export の契約

- export target は `current` / `all` / `selected`
- export format は `png` / `psd`
- selected export は shot camera checkbox で選び、実行順は workspace 上の shot camera 順に従う
- export は shot camera ごとの `exportSettings` を使う

shot camera ごとの export settings:

- `exportName`
- `exportFormat`
- `exportGridOverlay`
- `exportGridLayerMode`
- `exportModelLayers`
- `exportSplatLayers`

export のルール:

- `exportModelLayers`, `exportSplatLayers` は PSD 時のみ有効
- `exportSplatLayers` は `exportModelLayers` が有効な時だけ有効
- guide layer mode は `bottom` / `overlay`
- reference image の export 参加条件は `exportEnabled` と export session toggle の両方

PNG export:

- beauty result を出力する
- guide overlay を重ねられる
- reference images を合成できる

PSD export:

- back reference images
- guide
- render
- splat layers
- model layers
- eye-level
- front reference images
- frame overlay (`Frames` group; optional trajectory layer)
- hidden frame mask layer

補足:

- PSD の reference image は back / front を別 group で出す
- frame mask は PSD の hidden layer として持てる
- `trajectoryExportSource` は `none` / `center` / `top-left` / `top-right` / `bottom-right` / `bottom-left`
- `Frames` group には frame overlay pass に加えて optional trajectory layer が入る
- hidden `Frame Mask` は `frameMask.mode`, `selectedIds`, `shape` をそのまま使い、`trajectory` の時は viewport と同じ sweep area を rasterize する
- export pipeline は `src/controllers/export/` に分割済み

PSD layer 順の詳細契約:

- PSD layer の並びは bottom-to-top で次を基準にする
- optional `Background`
- back reference images
- guide (`Grid`) when guide layer mode is `bottom`
- `Render`
- splat layers
- model layers
- guide (`Grid`) when guide layer mode is `overlay`
- `Eye Level`
- front reference images
- frame overlay
- optional debug groups
- hidden `Frame Mask`

補足:

- reference image の PSD 出力は manager display order ではなく canonical order を使い、group は `back` → `front`、group 内は `order` 昇順とする
- model / splat PSD layer は current scene asset order を kind ごとに解釈した結果に従う。内部実装で一時的な reverse を使ってもよいが、最終 PSD の積み順結果は変えない
- PSD 出力では `scene manager の section 順` と `PSD 上の layer group 順` を別概念として扱う。現 baseline の PSD は `splat layers` が `model layers` より先に来る

## 9. Legacy 互換と baseline 外

現行 repo で互換 path を持つもの:

- legacy `document.json` ベース `.ssproj` の fallback import
- legacy project package 内の splat / model 抽出
- old CAMERA_FRAMES render box / frame state から current shot camera document への変換

互換の詳細は [legacy-ssproj-compatibility.md](./legacy-ssproj-compatibility.md) を参照。

現 baseline に含めないもの:

- `.sscam`
- generic viewer 方向の UI
- WebGPU 起動を前提にした運用
- 外部 sidecar / server 前提の generic streaming LoD
- `unified-culling=true` を既定前提にした性能議論
- `WORKSPACE_LAYOUT_QUAD` の productized workflow

## 10. ドキュメント更新ルール

次を変えたら、この文書と `docs/CameraFramesFeatures.md` を同じ変更で更新する:

- user-visible workflow
- save / open / persistence boundary
- `.ssproj` schema / versioning
- export contract
- reference image contract
- tool / shortcut / mode の意味
- preview / export consistency の前提

内部構造だけの整理で user-visible contract が変わらない場合は、まず `test/` と `.local/` を優先してよい。

ファイル分割 / リファクター時の運用ルール:

- scene asset order, reference image order, PSD layer order は user-visible contract として扱い、ファイル移動や helper 抽出だけで意味を変えない
- `canonical order`, `manager display order`, `export order` は別概念として維持し、同一の sort helper を流用して意味を混線させない
- import 時の追加規則は `add/import` と `open/restore/replace` で分けて維持する
- UI 層は独自 sort を持たず、順序の意味づけは model / controller / export assembler 側で一元化する
- file split を行う場合でも、「順序の定義」「UI での表示変換」「import 時の挿入規則」「persistence」「PSD 組み立て」の責務を分離したまま保つ
- 将来ファイル名が変わっても、この文書に書かれた責務単位が追跡できるよう、同等の cross-check file を更新する

## 11. Cross-check Files

- bootstrap / composition: `src/main.js`, `src/controller.js`
- project schema: `src/project/document.js`, `src/project/file/`
- working save: `src/project/working-state.js`, `src/controllers/project-controller.js`
- project open / save / dirty workflow: `src/controllers/project-controller.js`, `src/controllers/project/open-workflow.js`, `src/controllers/project/package-save-assets.js`, `src/controllers/project/dirty-state.js`, `src/controllers/project/source-staging.js`
- import routing: `src/app/file-open-routing.js`, `src/controllers/scene-assets/import-runtime.js`
- scene asset ordering / scene manager display: `src/engine/scene-asset-order.js`, `src/controllers/scene-assets/selection-order.js`, `src/ui/workbench-scene-sections.js`, `src/ui/workbench-browser-sections.js`
- scene asset import / source loading / order persistence: `src/controllers/asset-controller.js`, `src/controllers/scene-assets/import-runtime.js`, `src/controllers/scene-assets/source-loading.js`, `src/controllers/scene-assets/auto-lod.js`, `src/controllers/scene-assets/project-state.js`, `src/controllers/scene-assets/state-persistence.js`
- shot camera / output frame / FRAME: `src/workspace-model.js`, `src/controllers/camera-controller.js`, `src/controllers/output-frame-controller.js`, `src/controllers/frame-controller.js`, `src/engine/frame-trajectory.js`, `src/ui/frame-layer.js`
- projection: `src/engine/projection.js`, `src/controllers/projection-controller.js`, `src/controllers/viewport-projection-controller.js`
- reference image: `src/reference-image-model.js`, `src/controllers/reference-image/`, `src/controllers/reference-image-render-controller.js`
- reference image ordering / import / UI sync: `src/reference-image-model.js`, `src/engine/reference-image-export-order.js`, `src/controllers/reference-image/import-runtime.js`, `src/controllers/reference-image/document-helpers.js`, `src/controllers/reference-image/list-operations.js`, `src/controllers/reference-image/ui-state-sync.js`, `src/ui/workbench-reference-sections.js`, `src/ui/workbench-browser-sections.js`
- export: `src/controllers/export/`, `src/engine/export-pass-plan.js`, `src/engine/frame-mask-export.js`
- PSD layer assembly / reference image export ordering: `src/controllers/export/reference-images.js`, `src/controllers/export/layer-documents.js`, `src/controllers/export/psd-document.js`
- per-splat edit: `src/controllers/per-splat-edit-controller.js`
- input / shortcut: `src/interactions/input-router.js`, `src/interactions/input/`
- UI local preferences / status helpers: `src/app/mobile-ui-scale.js`, `src/app/viewport-lod-scale.js`, `src/app/project-status.js`, `src/ui/mobile-ui-scale.js`, `src/ui/viewport-lod-scale.js`, `src/ui/project-status.js`, `src/app/viewport-lod-scale-runtime-binding.js`

## 12. Verification Baseline

変更時の最低確認:

- 全体:
  - `npm run build`
  - `npm test`
  - local `.ssproj` fixture がある保守環境では、必要に応じて `npm run test:local-scenarios` も実行する（手順は `docs/local-test-scenarios.md`）
- architecture / dependency boundary:
  - `test/camera-frames-architecture-boundaries.test.ts`
- project / save:
  - `test/camera-frames-project-controller.test.ts`
  - `test/camera-frames-project-file.test.ts`
  - `test/camera-frames-project-document.test.ts`
  - `test/camera-frames-project-open-apply.test.ts`
  - `test/camera-frames-project-source-staging.test.ts`
  - `test/camera-frames-ssproj-snapshot.test.ts`
  - `test/camera-frames-asset-controller-public-api.test.ts`
- projection / output frame / frame:
  - `test/camera-frames-projection.test.ts`
  - `test/camera-frames-output-frame-controller.test.ts`
  - `test/camera-frames-frame-controller.test.ts`
  - `test/camera-frames-frame-trajectory.test.ts`
  - `test/camera-frames-frame-mask-export.test.ts`
- reference image:
  - `test/camera-frames-reference-image-*.test.ts`
  - `test/reference-image-controller*.test.ts`
- export:
  - `test/camera-frames-export-*.test.ts`
  - `test/camera-frames-psd-export.test.ts`
- per-splat:
  - `test/camera-frames-per-splat-edit-controller.test.ts`
- UI local preferences / HUD:
  - `test/camera-frames-mobile-ui-scale.test.ts`
  - `test/camera-frames-viewport-lod-scale.test.ts`
  - `test/camera-frames-viewport-lod-scale-runtime-binding.test.ts`
  - `test/camera-frames-viewport-project-status-hud.test.ts`
  - `test/camera-frames-input-router.test.ts`
