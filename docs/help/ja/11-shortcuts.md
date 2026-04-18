---
id: shortcuts
title: キーボードショートカット一覧
section: 11
lang: ja
related-files:
  - src/interactions/input-router.js
  - src/engine/viewport-pie.js
  - src/app/viewport-editing-commands.js
  - src/controllers/interaction-controller.js
  - src/controllers/viewport-tool-controller.js
  - src/controllers/per-splat-edit-controller.js
last-updated: 2026-04-18
---

# キーボードショートカット一覧

全ショートカットのリファレンスです。各機能の詳しい挙動は該当章を参照してください。

**共通前提**: テキスト入力（`input` / `textarea` / `select` / `contenteditable` / draft editing）にフォーカスがある状態では、多くのキーボードショートカットは無効になります（テキスト編集が優先されます）。

**修飾キーの順**: 本ドキュメントでは `Ctrl > Shift > Alt > Meta` の順で表記します。

## ファイル / プロジェクト

| キー | 動作 | コンテキスト |
|---|---|---|
| `Ctrl+N` | 新規プロジェクトを作成 | 常時 |
| `Ctrl+O` | ファイルを開く（ファイルダイアログ） | 常時 |
| `Ctrl+S` | working save（IndexedDB へ保存） | 常時 |
| `Ctrl+Shift+S` | package save（`.ssproj` としてダウンロード） | 常時 |

詳しくは [ファイルを開く・保存する](03-open-save.md)。

## 履歴

| キー | 動作 | コンテキスト |
|---|---|---|
| `Ctrl+Z` | undo | 常時（ネイティブテキスト編集中はブラウザ側優先） |
| `Ctrl+Y` | redo | 同上 |
| `Ctrl+Shift+Z` | redo | 同上 |

## 選択 / 削除

| キー | 動作 | コンテキスト |
|---|---|---|
| `Ctrl+D` | 選択をクリア（Per-splat edit 中は splat 選択クリア） | 常時 |
| `Ctrl+A` | 全 splat を選択 | Per-splat edit mode |
| `Ctrl+I` | splat 選択を反転 | Per-splat edit mode |
| `Delete` / `Backspace` | 測定ポイント / シーンアセットを削除 | 選択あり |

## ツール切替（Viewport / Camera mode）

| キー | 動作 | コンテキスト |
|---|---|---|
| `V` | Select ツールを切替 | Viewport / Camera mode |
| `T` | Transform ツールを切替 | Viewport / Camera mode |
| `Q` | Pivot 編集モードを切替 | Viewport / Camera mode |
| `Z` | Zoom ツールを切替 | Viewport / Camera mode |
| `M` | Measurement モードを切替 | Viewport / Camera mode |
| `Shift+E` | Per-splat edit モードを切替 | Viewport / Camera mode |
| `R` | Reference image プレビュー表示切替 | Viewport / Camera mode（reference あり） |
| `Shift+R` | Reference image 編集モードを切替 | Viewport / Camera mode |

詳しくは [Viewport とツール](08-viewport-tools.md) / [Per-splat edit](09-per-splat-edit.md)。

## Frame / Mask（Camera mode）

| キー | 動作 | コンテキスト |
|---|---|---|
| `F` | Frame mask（all）を切替 | Camera mode |
| `Shift+F` | Frame mask（selected）を切替 | Camera mode |

詳しくは [Output Frame と FRAME](06-output-frame-and-frames.md)。

## モード終了 / Escape

| キー | 動作 | コンテキスト |
|---|---|---|
| `Escape` | Pie menu を閉じる | Pie menu 展開中 |
| `Escape` | Lens adjust モードを終了 | Lens 調整中 |
| `Escape` | Roll adjust モードを終了 | Roll 調整中 |
| `Escape` | Zoom tool を終了 | Zoom tool 操作中 |

## マウス操作と修飾キー

### ナビゲーション基本

| 操作 | 動作 |
|---|---|
| 左ドラッグ | orbit（注視点中心で回転） |
| `Ctrl +` 左ドラッグ または 右ドラッグ | ヒット点中心のアンカーオービット |
| 右ボタンドラッグ | pan |
| マウスホイール | dolly（前後移動） / orthographic では zoom |
| 中ボタン（押し込み） | Pie menu を開く |

### 精度モディファイア（orbit / roll / lens / zoom）

| 修飾キー | 効果 |
|---|---|
| `Shift` | 低精度（orbit 0.08°/px、lens 0.03 mm/px など） |
| `Alt` | 中精度（orbit 0.035°/px など） |
| `Alt + Shift` | 最低精度（orbit 0.015°/px など） |

### Viewport orthographic ホイール

| 修飾キー | 効果 |
|---|---|
| `Shift` | depth offset |
| `Alt` | 微調整モード |

### シーンアセット選択（クリック）

| 修飾キー | 効果 |
|---|---|
| なし | 単独選択に置き換え |
| `Shift` / `Ctrl` / `Meta` | 加算選択（toggle） |

### Per-splat edit brush

| 修飾キー | 効果 |
|---|---|
| なし | 追加モード |
| `Alt` | 削除（subtract）モード |

### Splat edit brush 中のナビゲーション

| 操作 | 効果 |
|---|---|
| 右ドラッグ `+ Shift` | pan |

## Pie Menu アクション

Pie menu（中ボタンドラッグ）で呼び出せるアクション一覧:

| ラベル | 動作 | ショートカット代替 |
|---|---|---|
| **Select** | 選択ツール切替 | `V` |
| **Reference** | Reference 編集ツール切替 | `Shift+R` |
| **Show/Hide Refs** | Reference プレビュー切替 | `R` |
| **Transform** | Transform ツール切替 | `T` |
| **Pivot** | Pivot 編集ツール切替 | `Q` |
| **Adjust Lens** | Lens 調整モード | — |
| **New Frame** | FRAME を作成 | — |
| **Toggle Frame Mask** | Frame mask 切替（all） | `F` |
| **Camera/Viewport** | モード切替 | — |
| **Clear Selection** | 選択をクリア | `Ctrl+D` |

## 補足操作

- **数値フィールドのスクラブ** — 数値入力欄のラベル上で左右にドラッグすると値がスクラブ（連続変化）。`Shift` で低精度、`Alt` で微調整。
- **Inspector のセクション折りたたみ** — セクション見出しをクリック。
- **Inspector のピン留め** — 見出しの Pin ボタンで Peek パネルに切り替え。

## 関連章

- ファイル操作全般: [ファイルを開く・保存する](03-open-save.md)
- Viewport の基本操作: [Viewport とツール](08-viewport-tools.md)
- Per-splat edit 詳細: [Per-splat edit](09-per-splat-edit.md)
- Frame / Mask: [Output Frame と FRAME](06-output-frame-and-frames.md)
