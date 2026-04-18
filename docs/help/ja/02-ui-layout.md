---
id: ui-layout
title: 画面構成
section: 2
lang: ja
related-files:
  - src/ui/app-view.js
  - src/ui/viewport-shell.js
  - src/ui/side-panel.js
  - src/ui/app-overlay.js
  - src/ui/workbench-rail-sections.js
  - src/ui/workbench-sections.js
  - src/ui/workbench-section-ids.js
  - src/ui/workbench-icons.js
  - src/engine/viewport-pie.js
screenshots:
  - id: app-layout-overview
    alt: アプリ全体のレイアウト
    scenario: cf-test-loaded-default-layout
    annotations:
      - { n: 1, label: "Viewport" }
      - { n: 2, label: "Tool Rail（ドラッグ可能）" }
      - { n: 3, label: "Inspector" }
      - { n: 4, label: "Project Status HUD" }
  - id: inspector-tabs
    alt: Inspector の 4 タブ
    scenario: cf-test-inspector-tabs
  - id: pie-menu
    alt: Pie menu を開いた状態
    scenario: cf-test-pie-menu-open
  - id: splat-edit-toolbar
    alt: Per-splat edit 時のツールバー
    scenario: cf-test-splat-edit-active
last-updated: 2026-04-18
---

# 画面構成

CAMERA_FRAMES の画面は、大きく次の 3 領域と、画面上に重ねて表示される overlay 群で構成されます。

- **Viewport**（中央） — 3D シーン表示と直接操作
- **Tool Rail**（左、ドラッグ可能） — ファイル操作、ツール切替、クイックメニュー
- **Inspector**（右、折りたたみ可能） — シーン・カメラ・下絵・書き出しの詳細編集

![全体レイアウト](../assets/screenshots/ja/app-layout-overview.png)

## 1. Viewport

3D シーンが描画される主領域です。Viewport には 2 つのモードがあります。

- **Viewport mode** — editor 用の作業カメラ。orbit / pan / dolly で自由に視点を動かせる
- **Camera mode** — 現在の shot camera の視点。この視点がそのまま export に対応する

モード切替は pie menu（中ボタンドラッグ）または Tool Rail の「Camera/Viewport」ボタンから行います。

### Viewport 上の overlay 要素

Viewport には次の要素が重なります。

#### Project Status HUD（左上）

プロジェクト名と保存状態を表示します。

- プロジェクト名 — 未保存の場合は `Untitled`
- `*` — working save に未保存の変更がある
- `PKG` — package（`.ssproj`）に未反映の変更がある

#### Render Box（出力フレーム枠）

Camera mode で表示される**紙面枠**。この枠の中身がそのまま export 出力になります。

- 8 つのリサイズハンドル（四隅 + 各辺中央）
- 4 つのパンエッジ（各辺）
- 枠の下に出力サイズと anchor のメタ情報
- 中央に anchor dot

詳しくは [Output Frame と FRAME](06-output-frame-and-frames.md) を参照。

#### FRAME 群

render box 内に配置される矩形。複数配置でき、選択・移動・回転・リサイズ・anchor 編集に対応します。trajectory（軌道）モードでは frame center を繋ぐ path を編集できます。

詳しくは [Output Frame と FRAME](06-output-frame-and-frames.md) を参照。

#### Reference Image Layers（下絵）

shot camera に紐付いた reference image が Viewport 上に重なります。

- **back** グループ — シーンの後ろ
- **front** グループ — シーンの前
- 編集モード中は選択ハンドルや回転ゾーンが表示される

詳しくは [リファレンス画像](07-reference-images.md) を参照。

#### Pie Menu（中ボタンドラッグで出現）

よく使う操作を円形に並べたクイックメニュー。中央付近で離すと何も実行されません。

![Pie menu](../assets/screenshots/ja/pie-menu.png)

項目（時計回り、12 時方向を起点）:

1. **Select** — 選択ツール
2. **Reference** — Reference image 編集ツール
3. **Show/Hide Refs** — Reference image プレビューの表示切替
4. **Transform** — Transform ツール
5. **Pivot** — Pivot 編集ツール
6. **Adjust Lens** — Lens（焦点距離 / FOV）調整モード
7. **New Frame** — FRAME を追加
8. **Toggle Frame Mask** — Frame mask 表示切替
9. **Camera/Viewport** — Viewport mode ↔ Camera mode の切替
10. **Clear Selection** — 選択クリア

#### Lens HUD / Roll HUD

lens 調整モードや roll 調整モード中に、マウス近くに値（mm / 度）を表示します。

#### Axis Gizmo

現在の視点の軸方向を表示する小さなウィジェット。各軸ボタンをクリックで正面 / 背面ビューに切替できます（X/Y/Z それぞれに正側・負側・軸トグルの 3 ボタン）。

#### Transform Gizmo

オブジェクト選択中かつ Transform ツール使用時に表示される、移動・回転・スケール操作用のハンドル群。XY / YZ / ZX プレーン、X / Y / Z 軸ハンドル、均等スケールハンドルを持ちます。

#### Measurement Overlay（測定モード時、`M` キー）

2 点を指定して距離を測ります。距離値を入力すると、その値に合わせてシーンのスケール調整もできます。

#### Per-splat Edit Brush Preview

Per-splat edit の brush ツール使用時に、カーソル位置にリング状のブラシプレビューが表示されます。`Alt` 押下で削除（subtract）モード、ペイント中は塗り状態のスタイルに切り替わります。

#### Drop Hint

シーン未読込時に表示される操作ヒント。orbit / pan / dolly / anchor orbit の案内が出ます。

#### Per-splat Edit Toolbar

Per-splat edit モード（`Shift+E`）に入ると、Viewport 内にドラッグ可能なツールバーが現れます（後述）。

## 2. Tool Rail（左）

画面左に浮遊する、ドラッグ可能なツール群です。コンパクト表示では位置と形状が変わります。

### ヘッダーメニュー

| ラベル | アイコン | ショートカット |
|---|---|---|
| New Project | {{icon:plus}} | `Ctrl+N` |
| Open Files | {{icon:folder-open}} | `Ctrl+O` |
| Save Working State | {{icon:save}} | `Ctrl+S` |
| Save Package | {{icon:package}} | `Ctrl+Shift+S` |

### Remote URL

HTTP(S) URL を入力して Load ボタンで読み込む欄。外部ホストの scene asset を取り込めます。

### Inspector Collapse Toggle

Inspector を折りたたむ / 展開するボタン（{{icon:chevron-left}} / {{icon:chevron-right}}）。

### Quick Menu / Zoom Popover

現在のモードに応じて出現する補助ポップオーバー:

- **Viewport mode** — Lens / FOV 設定
- **Camera mode** — Zoom / View 設定

### ツールボタン

| ラベル | 動作 | ショートカット |
|---|---|---|
| Select | 選択ツール | `V` |
| Transform | Transform ツール | `T` |
| Pivot | Pivot 編集 | `Q` |
| Reference Edit | Reference image 編集 | `Shift+R` |
| Measurement | 距離測定 | `M` |
| Zoom | Zoom ツール | `Z` |
| Per-splat Edit | Splat per-point 編集 | `Shift+E` |

詳しい挙動は [Viewport とツール](08-viewport-tools.md)。

### Frame / Mask ツール

- **New Frame** — FRAME を追加
- **Frame Mask 設定** — mask mode（off / all / selected）、opacity、shape（bounds / trajectory）、trajectory export source
- **Reference Preview 表示切替**（`R`）

詳しくは [Output Frame と FRAME](06-output-frame-and-frames.md)。

## 3. Inspector（右）

右側のサイドパネル。タブごとに内容が切り替わり、折りたたみ可能です。

### 4 つのタブ

![Inspector タブ](../assets/screenshots/ja/inspector-tabs.png)

| タブ | アイコン | 主な用途 |
|---|---|---|
| **Scene** | {{icon:scene}} | シーンアセット（splat / model）の管理、照明、選択アセットの transform |
| **Camera** | {{icon:camera-dslr}} | Shot camera の管理、カメラプロパティ、Output Frame |
| **Reference** | {{icon:image}} | Reference image の preset、一覧、プロパティ |
| **Export** | {{icon:export-tab}} | 出力設定と書き出し |

### 各タブのセクション

#### Scene タブ

- **Scene Manager** — splat / model アセットの一覧、表示切替、並び替え、削除
- **Lighting** — 照明の方向・強度
- **Selected Scene Object** — 選択中アセットの transform（translate / rotate / scale / unit / content transform / working pivot）

詳しくは [シーンアセット](04-scene-assets.md)。

#### Camera タブ

- **Shot Camera Manager** — shot camera 一覧、追加、選択、削除、並び替え、export name 編集
- **Shot Camera Properties** — active shot の pose、lens、clipping、roll lock
- **Output Frame** — paper size（width × height）、anchor 3×3、center / fit / view zoom

詳しくは [Shot Camera](05-shot-camera.md) と [Output Frame と FRAME](06-output-frame-and-frames.md)。

#### Reference タブ

- **Reference Presets** — preset 作成・切替・削除、現 shot への binding
- **Reference Manager** — active preset 内の item 一覧、表示切替、前後グループ、export 対象切替
- **Reference Properties** — 選択 item の位置・回転・拡縮、multi-selection 一括変換

詳しくは [リファレンス画像](07-reference-images.md)。

#### Export タブ

- **Output** — 書き出し実行、target（`current` / `all` / `selected`）、format（PNG / PSD）
- **Export Settings** — PSD layer options、grid、reference image 参加有無、書き出しファイル名

詳しくは [Export](10-export.md)。

### セクションの共通機能

- **折りたたみ** — 見出しをクリック
- **ピン留め** — 各セクション見出しの Pin ボタンで、Inspector 右端の Peek パネルに集約表示
- **順序** — セクションはタブごとに固定順（ピン留めした並びは Peek 専用）

## 4. Per-splat Edit Toolbar

Per-splat edit モード（`Shift+E`）に入ると Viewport 内に現れるツールバー。ドラッグで位置を移動できます。

![Per-splat edit toolbar](../assets/screenshots/ja/splat-edit-toolbar.png)

### ツール選択グループ

- **Box** — 矩形選択
- **Brush** — ブラシ選択（`Alt` で削除）
- **Transform** — 選択 splat の変形

### 選択操作グループ

- **Select All**（`Ctrl+A`）
- **Invert**（`Ctrl+I`）
- **Clear**（`Ctrl+D`）

### 編集アクショングループ

- **Delete** — 選択 splat を削除
- **Separate** — 選択 splat を別アセットとして切り出し
- **Duplicate** — 選択 splat を複製

### 選択数表示

右端に現在の選択数（`42 sel` など）。

詳しくは [Per-splat edit](09-per-splat-edit.md)。

## 5. Overlay（モーダルダイアログ）

画面全体を覆うダイアログは 3 種類あります。

| 種類 | 用途 | 主な要素 |
|---|---|---|
| **Confirm** | 上書き / 削除などの意思決定 | タイトル、本文、URL 一覧、追加フィールド、アクションボタン |
| **Progress** | 書き出し / 大きな import の進捗 | 進捗バー、フェーズ一覧、ステップ一覧、経過時間 |
| **Error** | エラー通知 | タイトル、本文、詳細（折りたたみ可能）、URL 一覧、エラー詳細 pre |

## 6. モバイル / コンパクト表示

画面幅が狭いとき、Tool Rail と Inspector の配置は次のように変わります。

- Inspector は右全幅のドロワーまたは画面下部ドロワーに切り替わる
- Tool Rail は下部ドックに変形し、必要最低限のボタンに集約
- タブ切替は常時可能、ピン機能は一部制限

基本的な操作は同じですが、レイアウトが調整されます。

## 次に読む

- 実際の操作方法: [Viewport とツール](08-viewport-tools.md)
- 機能別の詳細: 各章（目次から選択）
- 全ショートカット: [キーボードショートカット一覧](11-shortcuts.md)
