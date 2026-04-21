---
id: viewport-tools
title: ビューポートとツール
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
    alt: ツールレール の各ボタン
    scenario: tool-rail
  - id: pie-menu-expanded
    alt: パイメニュー 展開中（中ボタン押下）
    scenario: pie-menu-expanded
  - id: transform-gizmo
    alt: Transform gizmo 表示中
    scenario: transform-gizmo
  - id: axis-gizmo
    alt: Axis gizmo（orthographic 時）
    scenario: axis-gizmo
  - id: measurement-overlay
    alt: 測定オーバーレイ
    scenario: measurement-overlay
shortcuts:
  - key: V
    action: 選択ツール切替
  - key: T
    action: 変形ツール切替
  - key: Q
    action: Pivot 編集モード切替
  - key: Z
    action: ズームツール切替
  - key: M
    action: 測定モード切替
  - key: Shift+R
    action: Reference image 編集モード切替
  - key: R
    action: Reference image プレビュー切替
last-updated: 2026-04-19
---

# ビューポート とツール

ビューポート での操作は、**視点操作**（デフォルト）と各種ツール、そして **パイメニュー** で構成されます。ツールは相互排他で、常に 1 つだけがアクティブになります。

## 1. ツール切替の仕組み

- **中央制御** — 入力ルーター が全 ポインタ / キーボード イベントを受け、ツールモードに応じて 対話 コントローラー / ビューポート ツール コントローラー に分配する
- **モード状態** — `store.ビューポートToolMode.value` で現在のツールを管理（`"select"` / `"transform"` / `"pivot"` / `"reference"` / `"none"`）
- **相互排他** — 新しいツールに切替えると、前のツールは自動で終了する
- **測定** — `store.measurement.active.value` で独立管理される

## 2. 視点操作（デフォルト）

ツールが何も選択されていない状態。シーンの視点操作に専念します。

### 2.1 Orbit（注視点中心の回転）

- **左ドラッグ** — 注視点（ルックピボット）を中心に orbit
- 感度: `0.18 °/px`（デフォルト）

### 2.2 アンカー Orbit（ヒット点中心の回転）

- **`Ctrl +` 左ドラッグ** または **右ドラッグ** — カーソルが指す 3D 点（ヒット点）を中心に orbit
- スプラット編集 のブラシ使用中は右ドラッグも同等

### 2.3 Pan（パン）

- **右ボタンドラッグ**（Orthographic モード 限定）

### 2.4 Dolly / Zoom

- **マウスホイール**
  - Perspective: dolly（前後移動）
  - Orthographic: zoom
  - `Shift` でホイール時の深度オフセット、`Alt` で微調整モード（orthographic のみ）

### 2.5 精度モディファイア

orbit / roll / lens / zoom で共通:

| 修飾キー | 効果 |
|---|---|
| `Shift` | 低精度（orbit 0.08°/px、lens 0.03 mm/px） |
| `Alt` | 中精度（orbit 0.035°/px） |
| `Alt + Shift` | 最低精度（orbit 0.015°/px） |

## 3. ズームツール（`Z`）

画面中央を基準にドラッグで zoom する専用ツール。

- **ドラッグ** — 右で zoom in、左で zoom out（指数スケール）
- **感度** — 通常、`Shift` で低感度
- **モード終了** — `Escape` または再度 `Z` を押す

カメラモード では `表示ズーム`（表示倍率）を変更、ビューポートモード ではレンズ FOV（焦点距離）を変更します。

## 4. 選択ツール（`V`）

シーンアセットの選択専用ツール。

### 4.1 クリック選択

- シーンアセットにレイキャストでヒット判定
- 最初にヒットしたアセットを選択
- 非表示のアセットはスキップ

### 4.2 修飾キーによる加算選択

| 修飾キー | 効果 |
|---|---|
| なし | 単独選択（置換） |
| `Shift` / `Ctrl` / `Meta` | 加算選択（切替） |

シーンマネージャー 側の選択と同期します。

## 5. 変形ツール（`T`）

選択アセットの移動 / 回転 / スケール用の gizmo を表示します。

![Transform gizmo](../assets/screenshots/ja/transform-gizmo.png)

### 5.1 Gizmo の構成

| 要素 | 動作 |
|---|---|
| **移動軸**（X / Y / Z の直線） | 軸方向にドラッグして移動 |
| **移動平面**（XY / YZ / ZX の平面） | 平面上をドラッグして移動 |
| **回転リング**（X / Y / Z、前後 2 分割） | 回転リングをドラッグして回転 |
| **スケールハンドル**（均等） | ドラッグして均等スケール |

### 5.2 Transform Space

`local` / `world` の 2 つの基底 を切り替えられます。

- **local** — アセット自身の quaternion に基づく軸
- **world** — ワールド 軸 `(1,0,0)` / `(0,1,0)` / `(0,0,1)`

### 5.3 複数選択

複数選択時、pivot を中心に全アセットが一括で変換されます（相対位置を保持）。

## 6. ピボットツール（`Q`）

シーンアセットの **working pivot**（変形ツールでの pivot 点）を編集するツール。

- 変形ツールと同じ gizmo を表示するが、**移動ハンドルのみ**有効（回転・スケールは非表示）
- gizmo をドラッグして pivot を ワールド 座標で指定
- pivot のリセットは シーンマネージャー 側の操作から

working pivot が `null`（原点相当）なら、アセットの オブジェクト位置 がデフォルトの pivot になります。

## 7. 下絵編集ツール（`Shift+R`）

下絵 を編集するモード。詳しくは [リファレンス画像](07-reference-images.md) を参照。

概要:

- `Shift+R` で切替
- モード中は ビューポート 上の 下絵アイテム が編集対象に
- ドラッグ / リサイズハンドル / 回転ゾーン / アンカー で直接操作

## 8. 測定ツール（`M`）

2 点の距離を測り、入力値でシーン全体をスケールするツール。

![Measurement overlay](../assets/screenshots/ja/measurement-overlay.png)

### 8.1 使い方

1. `M` で 測定モードに入る
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

## 9. スプラット編集 ツール（`Shift+E`）

スプラット アセットの個別 スプラット を編集するモード。

- 入口: `Shift+E` / ツールレール / パイメニュー（ない場合あり）
- モード中は ビューポート 内に専用ツールバーが現れる

詳しい操作は [スプラット編集](09-per-splat-edit.md) を参照。

## 10. パイメニュー

中ボタン（middle click）ドラッグで展開する、10 項目のラジアルメニュー。

![パイメニュー](../assets/screenshots/ja/pie-menu-expanded.png)

### 10.1 展開とメトリクス

- **トリガー** — 中ボタン押下で即展開（タッチは 320 ms 長押し）
- **半径** — 外周 88 px、内周 28 px、ホバー領域外周 126 px
- **粗いポインタ**（タッチ）— 1.28 倍に拡大

### 10.2 10 アクション（12 時方向起点、時計回り）

1. **Select**（{{icon:cursor}}）
2. **Reference**（{{icon:reference-tool}}）
3. **下絵表示切替**（{{icon:reference-preview-on}} / {{icon:reference-preview-off}}）
4. **Transform**（{{icon:move}}）
5. **Pivot**（{{icon:pivot}}）
6. **レンズ調整**（{{icon:camera-dslr}}）
7. **New Frame**（{{icon:frame-plus}}）
8. **フレームマスク切替**（{{icon:mask}}）
9. **カメラ/ビューポート**（{{icon:camera}} / {{icon:viewport}}）
10. **Clear Selection**（{{icon:selection-clear}}）

### 10.3 有効化条件

- **レンズ調整** — ビューポートモード で orthographic 時は無効
- **フレームマスク** 系 — カメラモード のみ
- **下絵表示切替** — 下絵 が存在する時のみ

### 10.4 選択と確定

- 開いた後、カーソルを項目の方向へ動かしてホバー
- 中ボタンを離すと、ホバー 中のアクションが確定
- 中心（内周内）で離すと何も実行されない
- `Escape` でキャンセル

## 11. 中ボタン と ポインタの振り分け

### 中ボタン（button 1）

- パイメニュー を展開
- テキスト入力 / 対話要素では無効

### 右ドラッグと `Ctrl+` 左ドラッグの同等性

- どちらも アンカー orbit のトリガー
- orthographic の パン は右ドラッグのみ

### タッチデバイス

- 長押し（320 ms）で パイメニュー 展開
- 12 px 以上動くとキャンセル
- 粗いポインタ検知で パイメニュー の半径を自動拡大

## 12. Axis Gizmo（Orthographic 用）

![Axis gizmo](../assets/screenshots/ja/axis-gizmo.png)

orthographic モード時に画面隅に表示される軸表示ウィジェット。

- **X / Y / Z の正負両方**のボタン + 軸トグル
- 正方向ボタンクリック → `+X` / `+Y` / `+Z` ビューへ整列
- 負方向ボタンクリック → `-X` / `-Y` / `-Z` ビューへ整列
- 軸中心ボタンクリック → 同軸 / 反対軸の切替

## 13. 変形 Gizmo のホバー状態

Gizmo のハンドルにホバーすると、

- `data-hovered-handle` / `data-hovered-axis` 属性が付与される
- CSS でハイライト表示

## 14. ツールレール の挙動

![ツールレール の各ボタン](../assets/screenshots/ja/tool-rail.png)

### 14.1 折りたたみ

インスペクター の折りたたみに連動して、ツールレール も省スペースモードに切り替わります。

### 14.2 ドラッグで移動

ツールレール カードの余白をドラッグすると、画面内で ツールレール 自体の位置を移動できます（`toolRailPosition`）。

### 14.3 ポップオーバー

- **クイックメニュー** — モードに応じた ZoomView / レンズ調整 ポップオーバー
- **レンズ HUD** — レンズ調整中、ビューポート 上に浮かぶ mm / FOV 表示
- **フレームマスク ポップオーバー** — フレームマスク モード（off / all / selected）の切替 ポップオーバー

## 15. 関連ショートカット一覧

| キー | 動作 |
|---|---|
| `V` | 選択ツール 切替 |
| `T` | 変形ツール 切替 |
| `Q` | Pivot 編集モード 切替 |
| `Z` | ズームツール 切替 |
| `M` | 測定モード 切替 |
| `Shift+E` | スプラット編集 モード 切替 |
| `R` | 下絵 プレビュー切替 |
| `Shift+R` | 下絵 編集モード切替 |
| `F` / `Shift+F` | フレームマスク 切替（カメラモード） |
| `Escape` | Pie / Lens / Roll / Zoom モードを終了 |

全ショートカットは [キーボードショートカット一覧](11-shortcuts.md)。

## 16. 関連章

- 選択アセットの編集: [シーンアセット](04-scene-assets.md)
- 下絵 の操作: [リファレンス画像](07-reference-images.md)
- スプラット編集 の詳細: [スプラット編集](09-per-splat-edit.md)
- フレームマスク: [用紙 と フレーム](06-output-frame-and-frames.md)
