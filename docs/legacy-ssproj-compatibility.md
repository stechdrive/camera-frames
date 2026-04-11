# 旧 CAMERA_FRAMES `.ssproj` 読み込み互換

最終更新: 2026-04-12

## 0. この文書の役割

この文書は、旧 CAMERA_FRAMES 系 `.ssproj` を現行 repo で読める状態を維持するための migration contract をまとめる。

これは通常の feature list ではなく、既存資産を捨てないための互換保証である。
旧 `.ssproj` の仕様自体は凍結済みとみなし、この文書は「現行 CAMERA_FRAMES 側が何をして確実に読むか」を固定する preservation spec として扱う。
ここを壊すと次が起きる。

- 旧資産が開けなくなる
- 旧 CAMERA_FRAMES から現行 repo への移行が止まる
- 旧 package を current `.ssproj` へ救済保存できなくなる

したがって、この互換 path は「便利な fallback」ではなく、保守対象の contract として扱う。

## 1. スコープ

この文書が対象にするのは「旧 `.ssproj` の読み込み互換」であって、旧形式への書き出し互換ではない。

現行 repo が持つ互換は次の 2 系統:

1. 旧 `document.json` ベース package から asset を展開して scene に読み込む互換
2. 旧 `cameraFramesState` / `cameraPresets` / `mainCameraPose` を current shot camera document へ移す互換

## 2. Entry Points

主要 entry point:

- [project-controller.js](../src/controllers/project-controller.js)
  - `openProjectSource()`
  - manifest のない old package を検知すると legacy import path へ落とす
- [project-package.js](../src/project-package.js)
  - 旧 package archive から importable asset を解決する
- [legacy-ssproj.js](../src/importers/legacy-ssproj.js)
  - old `cameraFramesState` を current shot camera / camera transform に変換する
- [project-state-bridge.js](../src/app/project-state-bridge.js)
  - legacy import で生成した shot camera documents と live camera を current workspace に適用する

### 2.1 この文書の使い方

- legacy import 周りを簡略化したくなったら、先にこの文書の case matrix と test map を見る
- この文書に載っているケースは「実データ救済対象」であり、未使用コード扱いしない
- 互換 branch を削る時は、少なくとも対応 test とこの文書を同時更新する
- 互換が壊れる可能性がある変更では、通常 feature の docs よりこの文書を優先して確認する

## 3. 必ず守るべき互換条件

### 3.1 Source detection

旧 package の判定条件:

- archive 内に `manifest.json` がない
- 代わりに `document.json` がある

この検出が外れると、旧 package は current package parser で失敗して開けなくなる。

### 3.2 Asset extraction

旧 package 読み込みでは、archive から current import runtime に渡せる asset source へ正規化する。

守るべき条件:

- splat / model asset を case-insensitive に解決できること
- `document.json` の path が archive 実体と少しずれていても、妥当な fallback があること
- packed splat manifest は `meta.json` と companion files をまとめて 1 source にできること
- path が欠けていた旧 splat entry に synthetic `assetId` / `filename` を与えられること
- raw splat fallback の時は `legacyTransformBakedInAsset` を保持すること
- `refs/` など import 対象外のファイルを scene asset と誤認しないこと

現行の具体的な工夫:

- `normalizeLegacyProjectPackageDocument()`
  - `splats[]` / `models[]` の entry が不完全でも synthetic 値を補う
- `resolveProjectPackageDocumentAssetPath()`
  - splat reference が `.sog` や leaf path でも `meta.json` へ寄せて解決を試みる
- `resolveProjectPackageAssetPaths()`
  - document 記載が揃っていればその順を優先し、不足があれば archive 全体スキャンへ fallback
- `findProjectPackageDocumentAssetEntry()`
  - 完全 path で取れない時に leaf name 一致で補う
- `createPackedSplatSource()`
  - `meta.json` から companion files を集め、alias 名でも参照できるようにする

### 3.3 Asset extraction case matrix

| legacy case | current repo での扱い | 壊れると起きること | 主な確認先 |
| --- | --- | --- | --- |
| `manifest.json` がなく `document.json` だけある `.ssproj` | current project open 失敗後に legacy project 判定へ落として import runtime で読む | old `.ssproj` が開けない | `project-controller.js`, `camera-frames-project-controller.test.ts` |
| model path の大文字小文字が archive 実体とずれる | case-insensitive に path を解決する | GLB が見つからず scene が欠ける | `project-package.js`, `camera-frames-project-package.test.ts` |
| `models/layout.glb` のような完全 path でなく leaf 名しか残っていない | leaf-name fallback で archive 実体に寄せる | 旧 model asset が欠落する | `project-package.js`, `camera-frames-project-package.test.ts` |
| splat path が `.sog` や drift した参照名になっている | packed splat の実体 `meta.json` に寄せて companion files もまとめる | 旧 splat が開けない | `project-package.js`, `camera-frames-project-package.test.ts` |
| old splat entry に filename がない | synthetic `assetId` / `filename` を補い、`legacyTransformBakedInAsset` を保持する | old raw splat の transform 救済が消える | `project-package.js`, `camera-frames-project-package.test.ts` |
| archive に `refs/` 画像が混ざっている | importable scene asset から除外する | scene asset 判定が誤爆する | `project-package.js`, `camera-frames-project-package.test.ts` |

## 4. `cameraFramesState` 変換の互換条件

旧 CAMERA_FRAMES の state は current project schema と 1 対 1 ではない。
そのため、読み込み側で current shot camera document へ補正付き変換を入れている。

### 4.1 Render Box から Output Frame への変換

現行の重要ポイント:

- `renderBox.baseSize` と `scale.kx / scale.ky` または `scalePct` から `widthScale / heightScale` を作る
- `renderBox.anchor` は nearest current anchor preset に寄せる
- `renderBox.center + lastViewport` から `viewportCenterX / viewportCenterY` を作る
- `viewZoomPct` は current の clamp へ通す
- `fitScale`, `fitViewportWidth`, `fitViewportHeight` を拾えるものは残す
- `centerX / centerY` は current contract に合わせて `0.5 / 0.5` を基準とする

ここは「旧 render box を current output frame としてどう見せるか」の中核で、見えが少しでもずれると旧カットの構図が崩れる。

### 4.2 Frame の変換

守るべき条件:

- old frame の `pos`, `scaleK` / `scalePct`, `rotationDeg`, `order`, `anchor` を current `FRAME` へ落とせること
- name がなければ `id` や `FRAME A` 形式で補えること
- old `selected` を current `activeFrameId` に移せること

### 4.3 Camera / Pose の変換

守るべき条件:

- old `mainCamera.transform.position + rotation(yaw/pitch/roll)` を current camera quaternion に正しく変換できること
- old `mainCamera.projection.baseFov` を current `lens.baseFovX` へ渡せること
- `nearClip` があれば current clipping に反映すること
- `cameraPresets` がない古い state でも `mainCameraPose` から最低 1 shot camera を再構成できること
- `selectedPresetId` が current `activeShotCameraId` へ移ること

現行の具体的な工夫:

- `buildLegacyCameraQuaternion()`
  - old yaw / pitch / roll を `YXZ` order と roll axis 補正で current quaternion 化
- `buildLegacyTransformFromPose()`
  - `mainCameraPose` の orbit / fpv 差を current world transform に変換
- `buildLegacyProjectImport()`
  - `cameraPresets` があれば preset 単位で shot 化
  - なければ `mainCameraPose` fallback を使う

### 4.4 Export setting の変換

これは読込み互換の副次要素だが、current camera document に乗るので明記する。

- `exportName`
- `exportFormat`
- `exportGridOverlay`
- `exportModelLayers`
- `exportSplatLayers`

補足:

- old format に存在しない current fields は current default で補う
- old value が不正 / 欠損でも current sanitize を通して破綻しないことを優先する

### 4.5 old input shape -> current normalized shape

| old input shape | current での正規化先 | 補足 |
| --- | --- | --- |
| `cameraFramesState.cameraPresets[]` | `shotCameras[]` | preset ごとに 1 shot camera を作る |
| `selectedPresetId` | `workspace.activeShotCameraId` | preset id から current shot id へ引く |
| `renderBox.baseSize + scale.kx/ky` または `scalePct` | `outputFrame.widthScale / heightScale` | current base render box 基準へ再計算する |
| `renderBox.anchor.ax/ay` | `outputFrame.anchor` | current anchor preset の nearest key に寄せる |
| `renderBox.center + lastViewport` | `outputFrame.viewportCenterX / viewportCenterY` | current contract 上 `centerX / centerY` は `0.5 / 0.5` に戻す |
| `renderBox.viewZoomPct` | `outputFrame.viewZoom` | current clamp を通す |
| `renderBox.fitScale + lastViewport` | `fitScale / fitViewportWidth / fitViewportHeight` | current fit state として残す |
| `frames[].pos` | `frame.x / frame.y` | current frame center に移す |
| `frames[].scaleK` または `scalePct` | `frame.scale` | `scaleK` 優先 |
| `frames[].rotationDeg` | `frame.rotation` | 度数のまま current document へ移す |
| `frames[].selected` | `activeFrameId` | first frame fallback あり |
| `mainCamera.transform.position + yaw/pitch/roll` | live shot camera transform | current quaternion に変換する |
| `mainCameraPose` の orbit / fpv | fallback shot camera transform | preset が 1 件も作れない時の救済 path |

## 5. Legacy asset transform の互換条件

old package から展開した asset は、archive path だけ読めても足りない。
旧 state に入っていた transform / visible / name を object へ適用しないと、旧資産の画面再現が崩れる。

守るべき条件:

- model は `transform.position / rotation / scale` を current object へ適用できること
- splat は old `position / rotation / scale` を current object へ適用できること
- `visible` を引き継ぐこと
- `name` を引き継ぐこと
- legacy GLB の scene root または単一路の子に local transform が入っていても、old project の world 上の見え方を極力維持すること
- 特に GLB 側の local scale が極端に小さい時、それが legacy wrapper 側の scale にさらに乗算されて「読めてはいるが見えない」に落ちないよう、wrapper と child の transform を相殺すること

重要な切り分け:

- これは「legacy GLB の internal local transform 補正」であって、旧 project に保存されていた `legacyState.transform.scale` を勝手に見やすい値へ置き換える自動救済ではない
- つまり、旧 project 自体が tiny scale を保存していた場合はその値を尊重する
- 一方で、GLB ファイル内の root / child local scale が原因で二重に小さく見えるケースは current code で補正対象にしている

現行実装:

- `applyLegacyAssetState(object, kind, legacyState)`
- model import では `gltf.scene` を wrapper `Group` に入れ、legacy transform は wrapper に適用する
- その上で `findLegacyModelCompensationTarget()` と `compensateWrapperForChildLocalTransform()` により、GLB 内の local transform を wrapper 側で相殺する
- その時点の wrapper scale は current scene asset の `baseScale` になる。以後の調整は `worldScale` で重ねる

### 5.1 legacy model / GLB で特に意識すべきこと

保守時に誤解しやすい点を先に固定する。

- current repo は old model の saved transform を wrapper object に適用している
- そのあと GLB 内 root または単一路 child の local transform を wrapper 側へ移し替え、old project と同じ world 上の見え方に寄せている
- これは「GLB の internal transform による二重適用」を避ける補正である
- これは「old project に保存されていた tiny scale を見やすい値へ自動修正する処理」ではない
- したがって、legacy asset が本当に極小 scale で保存されていた場合は、その値を current repo も基本的に尊重する
- import 後の asset scale は `baseScale * worldScale` で管理される。legacy 読込み直後の見え方を決めるのは主に `baseScale` 側である

## 6. Workspace への適用順

旧 package を開いた時の current workspace への反映順も重要。

現行の流れ:

1. old package を asset import path で展開する
2. `cameraFramesState` から `buildLegacyProjectImport()` で current shot camera 群を作る
3. shot camera document を workspace に差し替える
4. 各 live shot camera に `applyLegacyCameraTransform()` を適用する
5. active shot を viewport camera に同期する
6. editor state / helper / overlay を current app に合わせて再同期する
7. current project context を生成し、以後は current app として保存できる状態にする

ここで順番を変えると、camera helper・viewport pose・active shot・editor sidecar がずれやすい。

## 7. 何を壊しやすいか

特に壊しやすいのは次:

- path 解決ロジックの簡略化
- leaf name fallback の削除
- raw splat synthetic entry 補完の削除
- old render box から current output frame への変換式の変更
- yaw / pitch / roll から quaternion への変換の変更
- `mainCameraPose` fallback の削除
- legacy import 後の workspace 再同期手順の省略

### 7.1 current repo が補正するもの

- old package と archive 実体の path ずれ
- case mismatch
- leaf-name しか残っていない asset path
- `.sog` 系 splat 参照から `meta.json` への寄せ
- filename を失った raw splat entry への synthetic name / id 付与
- old render box から current output frame への contract 変換
- old yaw / pitch / roll から current quaternion への変換
- `cameraPresets` がない時の `mainCameraPose` fallback
- GLB 内 local transform による wrapper-child の二重変形

### 7.2 current repo が補正しないもの

- old project 自体に保存されていた tiny model scale の自動拡大
- old format への書き出し互換
- old project に含まれる非 import 対象ファイルの再現
- current app に存在しない obsolete field の完全再現
- 互換のために current save format を old shape に引き戻すこと

## 8. ドキュメント運用

この互換は feature list に埋めず、migration contract として独立保守するのがよい。

推奨運用:

- この文書に「何を補正しているか」を書く
- 互換修正をしたら、対象となる old shape と期待 current shape をここに 1 行追加する
- 可能なら同時に test fixture を追加する
- 「コードを簡単にしたい」理由だけで legacy branch を削らない

変更時チェックリスト:

1. 変更対象がこの文書の case matrix のどれに触るかを先に特定する
2. old input shape と current normalized shape の対応が変わるなら、先にこの文書へ追記する
3. path 解決、shot 生成、workspace 適用順のどこに影響するかを分けて考える
4. 「補正するもの」と「補正しないもの」を混同していないか確認する
5. 対応する test を追加または更新してから refactor する
6. 実コードで不要に見える branch でも、旧 asset corpus を救っている可能性がある前提で扱う

書き方の型:

- old input shape
- current にどう正規化するか
- それを壊すと何が壊れるか
- どの test が守っているか

## 9. 推奨テスト

最低限、legacy 互換に手を入れたら次を確認する:

- [camera-frames-legacy-ssproj.test.ts](../test/camera-frames-legacy-ssproj.test.ts)
  - old cameraFramesState から shot camera / camera transform / output frame / frame / export setting が正しく current shape に移るか
- [camera-frames-project-package.test.ts](../test/camera-frames-project-package.test.ts)
  - old package asset path 解決、leaf match、`.sog` rescue、raw splat synthetic fallback、legacyState 引き継ぎが壊れていないか
- [camera-frames-project-state-bridge.test.ts](../test/camera-frames-project-state-bridge.test.ts)
  - legacy import で shot documents、active shot、live camera transform、viewport sync が正しい順で適用されるか
- [camera-frames-project-controller.test.ts](../test/camera-frames-project-controller.test.ts)
  - old package open の fallback branch が生きているか
- [camera-frames-scene-asset-project-state.test.ts](../test/camera-frames-scene-asset-project-state.test.ts)
  - imported asset の `baseScale / worldScale / contentTransform / visible / legacyState` が current project state に乗るか
- [camera-frames-project-file.test.ts](../test/camera-frames-project-file.test.ts)
  - current `.ssproj` へ救済保存した後も、scene asset state と legacyState の round-trip が崩れないか

必要なら追加で見る:

- current output frame / projection 周りの test
- asset state persistence 周りの test
- legacy GLB の local scale / local rotation を持つ fixture で、import 後の world 見えが崩れないことを確認する専用 test

### 9.1 test map

| 変更内容 | 最低限見る test |
| --- | --- |
| legacy project 判定や open flow を触る | `camera-frames-project-controller.test.ts` |
| archive path 解決や packed splat 展開を触る | `camera-frames-project-package.test.ts` |
| shot camera 生成、renderBox 変換、frame 変換を触る | `camera-frames-legacy-ssproj.test.ts` |
| legacy import 後の active shot / viewport 同期を触る | `camera-frames-project-state-bridge.test.ts` |
| asset state への落とし込みや save/open round-trip を触る | `camera-frames-scene-asset-project-state.test.ts`, `camera-frames-project-file.test.ts` |
| GLB wrapper-child 補正を触る | 既存 test だけでは薄い。専用 fixture test を追加する |

## 10. この文書をどこから参照するか

この文書は次と一緒に読む前提にする:

- [camera_frames_requirements.md](./camera_frames_requirements.md)
- [CameraFramesFeatures.md](./CameraFramesFeatures.md)

通常の current feature contract は `camera_frames_requirements.md` 側で管理し、
旧資産の migration safety はこの文書で独立して管理する。

## 11. Historical Reference

旧 CAMERA_FRAMES の source history が必要になった時の参照先:

- [stechdrive/supersplat-cameraframes](https://github.com/stechdrive/supersplat-cameraframes)

使い方の原則:

- この repo の仕様判断は、まず current `src/`, `test/`, `docs/` を優先する
- 旧 repo は「なぜこの互換 branch があるのか」を確認するための履歴参照として使う
- この文書や PR で旧 repo を引用する時は、可能なら branch 先頭ではなく commit 固定 permalink を使う
