# Spark CAMERA_FRAMES Feature Map

このファイルは、`supersplat-cameraframes` を正本にした機能移植の対応表です。
仕様本文はコピーせず、Spark 側での受け皿と実装状況だけを管理します。

## Canonical Sources

- `D:\GitHub\supersplat-cameraframes\docs\camera_frames_requirements.md`
- `D:\GitHub\supersplat-cameraframes\docs\CameraFramesFeatures.md`
- `D:\GitHub\supersplat-cameraframes\docs\render-backend-transition-status.md`

## Status Legend

- `todo`: 未着手
- `investigating`: 調査中
- `designing`: 設計中
- `in-progress`: 実装中
- `ported`: 実装済み
- `validated`: 実装済みかつ動作確認済み
- `deferred`: 後回し
- `not-planned`: 今は対象外

## Core Porting Table

| Area | Canonical requirement | Spark-side target | Status | Notes |
| --- | --- | --- | --- | --- |
| Render Box / Output Frame | アンカー付き off-axis 構図維持 | `THREE.Camera` custom projection + app 側 Output Frame state | validated | anchor 基点 resize、構図維持、on-canvas編集、viewport pan まで動作確認済み |
| Dual camera workflow | 撮影表示 / 編集表示の分離 | app state 上の `Viewport / Camera View` | validated | Camera document と viewport camera の分離は成立 |
| UI shell | shot authoring 用の viewport-first workbench | `Preact + Signals + htm` app shell | in-progress | standalone shell、panel/UI split、runtime wiring は成立。left tool rail には zoom / mask / contextual coordinate-space controls、right inspector は Scene / Reference / Camera / Export の icon-tab + collapsible/pinnable sections。Scene/Camera は上段スクロール + 下段固定 inspector、Reference は preset / manager / property split まで入った。次は DCC density / discoverability / section cleanup |
| Viewport projections | perspective / top / front / right の authoring view | workspace pane model + viewport projection controller | designing | `workspace-model.js` に projection/preset seam はある。実 UI と runtime の切替導線は未完 |
| Camera presets | preset ごとの camera / output frame / export 状態保持 | Camera document + export target state | in-progress | 複数 Camera、switch、export target 骨格あり。legacy `.ssproj` camera preset import は実データで確認済み。camera list manager、camera properties inspector、shot 35mm default、viewport 14mm default、viewport->shot lens copy / shot->viewport asymmetric copy、safe-area fit action まで入った |
| Frame editing | frame 配置 / 回転 / 拡縮 / anchor 編集 | 2D overlay レイヤー + hit test + transform | validated | move / resize / rotate / free anchor / cursor polish / drag-state cursor lock まで入った |
| Asset transform tools | object の再配置 / move / rotate / scale | viewport tool system + selection/manipulator state | in-progress | Scene inspector で numeric transform/edit は入った。integrated gizmo、working pivot、world/local、viewport/camera-view selection、grouped transform、multi-select delta inspector、persistent apply-transform workflow まで入った。次は selected visual cue、off-screen pivot/gizmo rescue、type-aware multi-edit、focus selected、orthographic integration |
| Reference images | preset と camera override | app-managed image layer system | in-progress | PNG/JPG/WEBP/PSD import、PSD leaf-layer 展開、`(blank)` special-case、Camera View-only preview、per-item preview/export toggle、transient preview/export gate、`.ssproj`/working save roundtrip、`R` mode の単体/複数 transform、preset / manager / property split、PSD layer-order preserving import、reference absolute XY input fix まで入った。残りは preset UX polish、preview back-layer composition、batch QA、multi-select polish |
| Model lighting | GLB の視認性調整 | directional + ambient + hidden fill rig | in-progress | 旧 CAMERA_FRAMES 寄りの single-light rig を導入。direction widget、intensity、ambient、project persistence まで入った。影や多灯化は対象外 |
| Undo / Redo | direct manipulation と numeric edit の自然な履歴 | dedicated history controller/module | validated | `history-controller.js` を追加。shot document + viewport lens + scene asset edit state の snapshot/restore、Ctrl/Cmd+Z / Shift+Z / Y、frame/output-frame drag transaction、asset/camera numeric edit、free-fly camera pose history まで browser QA 済み |
| Export PNG | preview と一致する PNG export | active Spark renderer offscreen target + 2D compositing | in-progress | PNG export は representative data で確認済み。GLB / 3DGS / FRAME / Infinite Grid / Eye Level まで経路あり。guide overlay の色 parity と LoD settle は未完 |
| Export settle policy | LoD の荒い段階を export しない | app 側の convergence wait / quality mode / timeout policy | designing | export viewpoint foundationの上で次の最優先 slice |
| Export PSD | layered PSD export | offscreen render + PSD writer/compositor | in-progress | Beauty、Frame Overlay、GLB layers/masks、3DGS layers/masks、Infinite Grid、Eye Level まで経路あり。color parity と residual/polish は継続中 |
| Multi-camera export | 全カメラ export と安定待ち | current / all / selected camera loop | in-progress | export target と per-camera export name あり。LoD settle と追加 QA が必要 |
| Project save | `.ssproj` 相当の保存意味 | working save + portable package save | in-progress | `Ctrl+S` は lightweight working save、package save は explicit heavy save として分離済み。legacy `.ssproj` reopen、overwrite/save-as 確認、package save overlay は browser で通過。SOG 圧縮は Spark parser columns -> worker -> `writeSog` に切り替わって通るようになった。archive backend は `zip.js` に統一され、final ZIP は streaming write。controller-level smoke test で broken `.ssproj` overlay cleanup も押さえた。reference image persistence も入った。残りは巨大 asset の peak-memory hardening |
| Project asset import | `.ssproj` から scene asset を再利用 | zip package から supported asset を抽出して通常 loader へ渡す | validated | recent / older legacy package の GLB / PLY / SOG / SPZ / SPLAT 系、camera preset, output frame, frame import は代表データで確認済み。reference image / timeline はまだ無視 |
| Remote import links | 実制作用 viewer-link 的 deep link と安全なリモート読込 | startup `?load=` + allow/deny policy + shared overlay | in-progress | confirm/progress/error overlay と `https`/private-address policy は入った。Box 等の CORS/共有URL差は引き続き運用・文言で吸収が必要 |
| Camera exchange | `.sscam` 相当の保存意味 | camera-only JSON format | designing | document shape はあるが serialize 未着手 |
| Undo/Redo | numeric input 編集中の自然な undo/redo | history transaction layer | in-progress | foundation は local 実装済み。import/clear は今は history clear 扱い、camera free-fly continuous pose は後続課題 |
| Scene order contract | Scene Manager 順と export layering の一致 | app-managed scene list + export order | validated | Scene UI は `GLB / モデル` と `3DGS` を分け、同カテゴリ内のみ reorder。layered PSD contract と矛盾しない |
| Viewport utilities | Home / Fit Scene / Focus Selected / Measurement | viewport authoring utility layer | designing | Home はある。Fit/Focus/Measurement はこれから |
| Per-splat editing | select / transform / delete / duplicate / separate | dedicated splat-edit mode + selection/manipulator pipeline | deferred | 最終要件として重要。通常の shot/layout authoring と混ぜず、別モード前提で設計する |

## Current Spark Notes

- Spark 2.0 のレンダリング性能を活かしつつ、CAMERA_FRAMES の UX と export contract を崩さないことが目的。
- 速度改善だけでは移植完了とみなさない。`camera_frames_requirements.md` の不変条件を優先する。
- Spark は renderer / splat engine としては強いが、CAMERA_FRAMES が必要とする app/workflow 層は自前実装が必要。
- controller/ui split は一段落した。次は workbench UI polish と viewport tool system を進めつつ、export correctness を詰める。
- workbench は `Scene / Reference / Camera / Export` の icon-tab に寄ったが、現在の主課題は「説明を減らしたまま、どこで選びどこで編集するか」をさらに明確にすること。
- orthographic viewport は `Shot` 機能ではなく `Viewport authoring` 機能として扱う。
- object transform tools も inspector の一項目ではなく viewport tool system として扱う。
- grouped transform は persistent Null を作らず、selection set + active-object working pivot ベースの transient transform とする。
- project save は旧 CAMERA_FRAMES と同じく `working save` と `package save` を分ける。SOG 圧縮は package save 時だけの明示オプションとし、decoder としての `SplatTransform` には依存しない。
- app version は `package.json` を正本にし、build 時に `version.json` を出す。
- dev 中は workbench header 直下に `version / commit / dev:` を表示して build freshness を確認する。
- raw PLY の `lod: true` 読み込みでは、Spark の coarse-to-fine 更新により export correctness を app 側で補う必要がある。
- large 3DGS scenes では full bounds と no-camera startup framing を分ける。full bounds は diagnostics/export 用、startup は home view 優先。

## Current Branch Recommendation

- 統合ブランチは `main`
- GitHub Pages deploy は `npm run deploy`
- 次の主作業は `codex/*` branch で viewport-first workbench UI と export correctness の slice を切る

## Update Rule

- 新しく調べたことは、仕様の要約ではなく「Spark 側の対応先」と「未解決点」を中心に追記する。
- 仕様の本文を引用したくなったら、正本パスだけ書いて重複を避ける。
