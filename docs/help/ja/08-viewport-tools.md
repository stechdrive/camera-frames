---
id: viewport-tools
title: Viewport とツール
section: 8
lang: ja
related-files:
  - src/interactions/input-router.js
  - src/controllers/interaction-controller.js
  - src/controllers/viewport-tool-controller.js
  - src/controllers/viewport-tool/
  - src/controllers/measurement-controller.js
  - src/app/viewport-editing-commands.js
  - src/engine/viewport-pie.js
  - src/engine/measurement-scene-helper.js
  - src/ui/side-panel.js
  - src/ui/viewport-axis-gizmo.js
  - src/ui/measurement-overlay.js
screenshots:
  - id: tool-rail
    alt: Tool Rail の各ボタン
    scenario: cf-test-tool-rail
  - id: pie-menu-expanded
    alt: Pie menu 展開中（中ボタン押下）
    scenario: cf-test-pie-menu-hover
  - id: transform-gizmo
    alt: Transform gizmo 表示中
    scenario: cf-test-transform-gizmo
  - id: axis-gizmo
    alt: Axis gizmo（orthographic 時）
    scenario: cf-test-axis-gizmo
  - id: measurement-overlay
    alt: Measurement overlay
    scenario: cf-test-measurement
shortcuts:
  - key: V
    action: Select ツール切替
  - key: T
    action: Transform ツール切替
  - key: Q
    action: Pivot 編集モード切替
  - key: Z
    action: Zoom ツール切替
  - key: M
    action: Measurement モード切替
  - key: Shift+R
    action: Reference image 編集モード切替
  - key: R
    action: Reference image プレビュー切替
last-updated: 2026-04-18
---

# Viewport とツール

Viewport での操作は、**Navigate**（デフォルト）と各種 Tool、そして **Pie menu** で構成されます。ツールは相互排他で、常に 1 つだけが active になります。

## 1. ツール切替の仕組み

- **中央制御** — Input Router が全 pointer / keyboard イベントを受け、ツールモードに応じて interaction controller / viewport tool controller に分配する
- **Mode state** — `store.viewportToolMode.value` で現在のツールを管理（`"select"` / `"transform"` / `"pivot"` / `"reference"` / `"none"`）
- **相互排他** — 新しいツールに切替えると、前のツールは自動で終了する
- **Measurement** — `store.measurement.active.value` で独立管理される

## 2. Navigate（デフォルト）

ツールが何も選択されていない状態。シーンの視点操作に専念します。

### 2.1 Orbit（注視点中心の回転）

- **左ドラッグ** — 注視点（look pivot）を中心に orbit
- 感度: `0.18 °/px`（デフォルト）

### 2.2 Anchor Orbit（ヒット点中心の回転）

- **`Ctrl +` 左ドラッグ** または **右ドラッグ** — カーソルが指す 3D 点（hit）を中心に orbit
- per-splat edit brush 中は右ドラッグも同等

### 2.3 Pan

- **右ボタンドラッグ**（Orthographic mode 限定）

### 2.4 Dolly / Zoom

- **マウスホイール**
  - Perspective: dolly（前後移動）
  - Orthographic: zoom
  - `Shift` でホイール時 depth offset、`Alt` で微調整モード（orthographic のみ）

### 2.5 精度モディファイア

orbit / roll / lens / zoom で共通:

| 修飾キー | 効果 |
|---|---|
| `Shift` | 低精度（orbit 0.08°/px、lens 0.03 mm/px） |
| `Alt` | 中精度（orbit 0.035°/px） |
| `Alt + Shift` | 最低精度（orbit 0.015°/px） |

## 3. Zoom Tool（`Z`）

画面中央を基準にドラッグで zoom する専用ツール。

- **ドラッグ** — 右で zoom in、左で zoom out（指数スケール）
- **感度** — 通常、`Shift` で低感度
- **モード終了** — `Escape` または再度 `Z` を押す

Camera mode では `view zoom`（表示倍率）を変更、Viewport mode では lens FOV（焦点距離）を変更します。

## 4. Select Tool（`V`）

シーンアセットの選択専用ツール。

### 4.1 クリック選択

- シーンアセットにレイキャストでヒット判定
- 最初にヒットしたアセットを選択
- 非表示のアセットはスキップ

### 4.2 修飾キーによる加算選択

| 修飾キー | 効果 |
|---|---|
| なし | 単独選択（置換） |
| `Shift` / `Ctrl` / `Meta` | 加算選択（toggle） |

Scene Manager 側の選択と同期します。

## 5. Transform Tool（`T`）

選択アセットの移動 / 回転 / スケール用の gizmo を表示します。

![Transform gizmo](../assets/screenshots/ja/transform-gizmo.png)

### 5.1 Gizmo の構成

| 要素 | 動作 |
|---|---|
| **Move axes**（X / Y / Z の直線） | 軸方向にドラッグして移動 |
| **Move planes**（XY / YZ / ZX の平面） | 平面上をドラッグして移動 |
| **Rotate rings**（X / Y / Z、前後 2 分割） | 回転リングをドラッグして回転 |
| **Scale handle**（uniform） | ドラッグして均等スケール |

### 5.2 Transform Space

`local` / `world` の 2 つの basis を切り替えられます。

- **local** — アセット自身の quaternion に基づく軸
- **world** — world 軸 `(1,0,0)` / `(0,1,0)` / `(0,0,1)`

### 5.3 Multi-selection

複数選択時、pivot を中心に全アセットが一括で変換されます（相対位置を保持）。

## 6. Pivot Tool（`Q`）

シーンアセットの **working pivot**（Transform ツールでの pivot point）を編集するツール。

- Transform ツールと同じ gizmo を表示するが、**移動ハンドルのみ**有効（回転・スケールは非表示）
- gizmo をドラッグして pivot を world 座標で指定
- pivot の reset は Scene Manager 側の操作から

working pivot が `null`（origin 相当）なら、アセットの object position がデフォルトの pivot になります。

## 7. Reference Edit Tool（`Shift+R`）

Reference image を編集するモード。詳しくは [リファレンス画像](07-reference-images.md) を参照。

概要:

- `Shift+R` で toggle
- モード中は Viewport 上の reference item が編集対象に
- drag / resize handle / rotation zone / anchor で直接操作

## 8. Measurement Tool（`M`）

2 点の距離を測り、入力値でシーン全体をスケールするツール。

![Measurement overlay](../assets/screenshots/ja/measurement-overlay.png)

### 8.1 使い方

1. `M` で Measurement モードに入る
2. シーン上の 1 点目をクリック（orange 表示）
3. 2 点目をクリック（light blue 表示）
4. 下部の chip に現在の距離が出る
5. chip の入力欄に「この 2 点を X メートルにしたい」と数値を入れて Enter
6. 選択アセットが倍率でスケールされる

### 8.2 条件

Enter による scale 適用は、次が全て満たされる時のみ有効:

- 2 点ともセットされている
- アセットが選択されている
- 入力値が有限数かつ > 0

### 8.3 UI

- **Start point** — orange（`#ffb26d`）
- **End point** — light blue（`#7ddcff`）
- **Line** — 2 点を結ぶ線
- **Chip** — 画面下部の入力欄（現在距離表示 + 数値入力）

## 9. Per-splat Edit Tool（`Shift+E`）

splat アセットの個別 splat を編集するモード。

- 入口: `Shift+E` / Tool Rail / pie menu（ない場合あり）
- モード中は Viewport 内に専用 toolbar が現れる

詳しい操作は [Per-splat edit](09-per-splat-edit.md) を参照。

## 10. Pie Menu

中ボタン（middle click）ドラッグで展開する、10 項目のラジアルメニュー。

![Pie menu](../assets/screenshots/ja/pie-menu-expanded.png)

### 10.1 展開とメトリクス

- **トリガー** — 中ボタン押下で即展開（タッチは 320 ms ホールド）
- **半径** — radius 88 px、inner 28 px、outer 126 px
- **coarse pointer**（タッチ）— 1.28 倍に拡大

### 10.2 10 アクション（12 時方向起点、時計回り）

1. **Select**（{{icon:cursor}}）
2. **Reference**（{{icon:reference-tool}}）
3. **Show/Hide Refs**（{{icon:reference-preview-on}} / {{icon:reference-preview-off}}）
4. **Transform**（{{icon:move}}）
5. **Pivot**（{{icon:pivot}}）
6. **Adjust Lens**（{{icon:camera-dslr}}）
7. **New Frame**（{{icon:frame-plus}}）
8. **Toggle Frame Mask**（{{icon:mask}}）
9. **Camera/Viewport**（{{icon:camera}} / {{icon:viewport}}）
10. **Clear Selection**（{{icon:selection-clear}}）

### 10.3 有効化条件

- **Adjust Lens** — Viewport mode で orthographic 時は無効
- **Frame mask** 系 — Camera mode のみ
- **Show/Hide Refs** — reference image が存在する時のみ

### 10.4 選択と確定

- 開いた後、カーソルを項目の方向へ動かしてホバー
- 中ボタンを離すと、hover 中のアクションが確定
- 中心（inner radius 内）で離すと何も実行されない
- `Escape` でキャンセル

## 11. Middle-click / Pointer Routing

### Middle-click (button 1)

- pie menu を展開
- テキスト入力 / interactive target では無効

### 右ドラッグと `Ctrl+` 左ドラッグの同等性

- どちらも anchor orbit のトリガー
- orthographic pan は右ドラッグのみ

### タッチデバイス

- 長押し（320 ms）で pie menu 展開
- 12 px 以上動くとキャンセル
- coarse pointer 検知で pie radius を自動拡大

## 12. Axis Gizmo（Orthographic 用）

![Axis gizmo](../assets/screenshots/ja/axis-gizmo.png)

orthographic モード時に画面隅に表示される軸表示ウィジェット。

- **X / Y / Z の正負両方**のボタン + 軸トグル
- 正方向ボタンクリック → `+X` / `+Y` / `+Z` ビューへ alignment
- 負方向ボタンクリック → `-X` / `-Y` / `-Z` ビューへ alignment
- 軸中心ボタンクリック → 同軸 / 反対軸の toggle

## 13. Transform Gizmo の hover 状態

gizmo のハンドルにホバーすると、

- `data-hovered-handle` / `data-hovered-axis` 属性が付与される
- CSS でハイライト表示

## 14. Tool Rail の挙動

### 14.1 折りたたみ

Inspector の折りたたみに連動して、Tool Rail も省スペースモードに切り替わります。

### 14.2 ドラッグで移動

Tool Rail カードの余白をドラッグすると、画面内で Tool Rail 自体の位置を移動できます（`toolRailPosition`）。

### 14.3 Popover

- **Quick Menu** — モードに応じた ZoomView / Lens 調整 popover
- **Lens HUD** — lens 調整中、Viewport 上に浮かぶ mm / FOV 表示
- **Frame Mask Popover** — Frame mask mode（off / all / selected）の切替 popover

## 15. 関連ショートカット一覧

| キー | 動作 |
|---|---|
| `V` | Select ツール toggle |
| `T` | Transform ツール toggle |
| `Q` | Pivot 編集モード toggle |
| `Z` | Zoom ツール toggle |
| `M` | Measurement モード toggle |
| `Shift+E` | Per-splat edit モード toggle |
| `R` | Reference preview 切替 |
| `Shift+R` | Reference 編集モード toggle |
| `F` / `Shift+F` | Frame mask 切替（Camera mode） |
| `Escape` | Pie / Lens / Roll / Zoom モードを終了 |

全ショートカットは [キーボードショートカット一覧](11-shortcuts.md)。

## 16. 関連章

- 選択アセットの編集: [シーンアセット](04-scene-assets.md)
- Reference image の操作: [リファレンス画像](07-reference-images.md)
- Per-splat edit の詳細: [Per-splat edit](09-per-splat-edit.md)
- Frame mask: [Output Frame と FRAME](06-output-frame-and-frames.md)
