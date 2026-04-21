---
id: per-splat-edit
title: スプラット編集
section: 9
lang: ja
related-files:
  - src/controllers/per-splat-edit-controller.js
  - src/controllers/per-splat-edit/
  - src/engine/splat-edit-scene-helper.js
  - src/ui/viewport-shell.js
  - src/interactions/input-router.js
screenshots:
  - id: per-splat-edit-toolbar
    alt: スプラット編集ツールバー
    scenario: per-splat-edit-toolbar
    annotations:
      - { n: 1, label: "Tool 選択" }
      - { n: 2, label: "選択操作" }
      - { n: 3, label: "編集アクション" }
      - { n: 4, label: "選択数" }
  - id: per-splat-brush-preview
    alt: ブラシプレビュー（ring + depth bar）
    scenario: per-splat-brush-preview
  - id: per-splat-box-tool
    alt: Box tool 配置中
    scenario: per-splat-box-tool
shortcuts:
  - key: Shift+E
    action: スプラット編集 モード切替
  - key: Ctrl+A
    action: 全 splat を選択
  - key: Ctrl+I
    action: 選択を反転
  - key: Ctrl+D
    action: 選択をクリア
  - key: Alt
    action: Brush で subtract モード
  - key: Delete
    action: 選択 splat を削除
  - key: Backspace
    action: 選択 splat を削除
last-updated: 2026-04-19
---

# スプラット編集

**スプラット編集** は、スプラット アセット内の個別の スプラット（単位：粒）を選択・削除・分離・複製・変形する専用モードです。Gaussian splatting ならではのクリーンナップや分割に使います。

## 1. 概念

### Raw selection は runtime-only

スプラット の選択状態（どの スプラット が選ばれているか）は **実行時のみ保持**され、プロジェクトには保存されません。モードを抜けた時点や プロジェクト保存 には含まれず、再度 スプラット編集 に入ると「選択なし」から再開します。

ただし undo / redo 用の履歴には含まれるので、編集セッション中の操作は巻き戻せます。

### 編集結果は永続化

Delete / Separate / Duplicate / Transform の結果は スプラット アセットの **ソース に永続化**されます。具体的には `asset.source`（PackedSplatSource）が再構築され、`.ssproj` の保存にも含まれます。

更新フロー:

1. 編集が `packedSplats.packedArray` に反映される（メモリ上）
2. `asset.persistentSourceDirty = true` がマークされる
3. 適切なタイミング（エディタ終了、履歴コミット、プロジェクト保存）で `syncSplatAssetPersistentSource()` が ソース を再構築

## 2. 入口

| 入口 | 操作 |
|---|---|
| **キーボード** | `Shift+E` |
| **ツールレール** | スプラット編集 ボタン |
| **パイメニュー** | （現行は未登録） |

モードに入ると ビューポート 内に専用ツールバーが現れます。対象（どの スプラット アセットを対象にするか）が自動で解決されます。対象が空なら「スプラット アセットがない」エラーで失敗。

## 3. ツールバー の構造

![スプラット編集 toolbar](../assets/screenshots/ja/per-splat-edit-toolbar.png)

ドラッグで位置を変更できます（`store.splatEdit.hudPosition` に保存）。

### グループ 1: ツール選択

| ボタン | 機能 | 有効条件 |
|---|---|---|
| **Box** | 矩形選択ツール | 常時 |
| **Brush** | ブラシ選択ツール | 常時 |
| **Transform** | 選択 スプラット の変形 | 選択あり |

### グループ 2: 選択操作

| ボタン | ショートカット | 機能 |
|---|---|---|
| **Select All** | `Ctrl+A` | 対象内の全 スプラット を選択 |
| **Invert** | `Ctrl+I` | 選択を反転（要: 選択あり） |
| **Clear** | `Ctrl+D` | 選択をクリア（要: 選択あり） |

### グループ 3: 編集アクション

| ボタン | 機能 | 有効条件 |
|---|---|---|
| **Delete**（危険操作スタイル） | 選択 スプラット を削除 | 選択あり |
| **Separate** | 選択 スプラット を別アセットとして切り出し | 選択あり |
| **Duplicate** | 選択 スプラット を複製 | 選択あり |

### 右端: 選択数

`${splatEditSelectionCount} sel` と常時表示。

## 4. Box ツール

矩形（oriented bounding box）で スプラット を囲んで選択するツール。

### 4.1 Box の配置

- ビューポート 上をクリック → シーンへレイキャスト、ヒット点を中心にして Box を配置
- 一度配置された Box は `boxPlaced = true` として確定

### 4.2 Box のパラメータ編集

ツール専用のポップオーバーでパラメータを触れます。

- **中心** — X / Y / Z
- **サイズ** — X / Y / Z
- **回転** — X / Y / Z（Euler → Quaternion）
- **均等スケール** — 一括倍率
- **Fit to Scope** — 対象アセットの境界に合わせる

![Box tool](../assets/screenshots/ja/per-splat-box-tool.png)

### 4.3 選択適用

Box 配置後の **Apply** ボタン（または確定操作）で、Box 内に中心がある スプラット を選択に反映します。

| モディファイア | 挙動 |
|---|---|
| なし | 選択に **追加** |
| `Alt` | 選択から **減算** |

判定は OBB（oriented bounding box）の内外判定。空間インデックスがある場合は高速化されます。

## 5. Brush ツール

円形 brush でカーソル付近の スプラット を選択するツール。

![Brush preview](../assets/screenshots/ja/per-splat-brush-preview.png)

### 5.1 Brush size

| フィールド | 単位 | 範囲 |
|---|---|---|
| **size** | px | 4 〜 400 |

ブラシプレビュー（リング）がカーソル位置に表示されます。

### 5.2 深度モード

ブラシ が選択する「奥行き範囲」を制御。

| モード | 意味 |
|---|---|
| **`through`** | 奥行き制限なし（無限円柱で選択） |
| **`depth`** | 指定 深度 値で制限（有限円柱） |

深度モード = `depth` のとき、深度の数値は `0.01` 以上でクランプされます。

### 5.3 減算モード（`Alt`）

- 通常 — 選択に追加
- `Alt` 押下中 — 選択から減算

ブラシプレビュー の色が視覚的に変化します（CSS class `--subtract`）。ペイント中は `--painting` が付き、状態がわかりやすくなります。

### 5.4 ブラシプレビュー の構成

| 要素 | 表示条件 |
|---|---|
| **リング** — 円形アウトライン | 常時（ブラシ アクティブ時） |
| **Depth Bar** — 奥行きインジケータ | 深度モード = `depth` かつ `depthBarPx > 2` |
| **`--painting`** CSS class | ペイント中 |
| **`--subtract`** CSS class | `Alt` 押下中 |

### 5.5 ブラシ中のナビゲーション

ブラシ ツール中のナビゲーション:

- **左ドラッグ** — ペイント（選択追加 / 減算）
- **`Shift +` 右ドラッグ** — パン（視点移動）
- **右ドラッグ** — アンカー orbit（Ctrl+ 左ドラッグと同等）
- **ホイール** — dolly / zoom

ペイント以外の操作は通常の ビューポート ナビゲーションと同じです。

## 6. 変形ツール

選択 スプラット を直接変形するツール。

### 6.1 使い方

1. Box / Brush で スプラット を選択
2. 変形ツールに切替
3. Transform gizmo が表示される
4. gizmo をドラッグして選択 スプラット を移動 / 回転 / スケール

### 6.2 Gizmo の構成

- **Move axes**（X / Y / Z）
- **Move planes**（XY / YZ / ZX）
- **Rotate rings**（X / Y / Z）
- **Scale handle**（uniform）

### 6.3 Pivot

gizmo の pivot（変形の中心）は、選択 スプラット の境界の中央がデフォルトです。

### 6.4 Undo / Redo

Transform は履歴に `スプラット-edit.transform` として記録され、`Ctrl+Z` で巻き戻せます。

### 6.5 適用フロー

1. **プレビュー** — ドラッグ中は プレビュー状態 で仮表示（packedSplats には未反映）
2. **更新** — ドラッグ中の更新
3. **確定**（ドラッグ終了）— `applySelectedSplatTransform()` で packedSplats に反映、ソース を dirty マーク

## 7. 選択操作

### 7.1 Select All（`Ctrl+A`）

対象内の**全アセットの全 スプラット** を選択に追加します。大量データでは時間がかかります。

### 7.2 Invert（`Ctrl+I`）

現在の選択を反転します。選択中 スプラット は除外され、非選択 スプラット が選択されます。

### 7.3 Clear（`Ctrl+D`）

選択をすべてクリアします。

## 8. 編集アクション

### 8.1 Delete

選択 スプラット を削除します。

フロー:

1. 選択 スプラット を抽出
2. 残り（非選択 スプラット）で新しい ソース を生成
3. 残りがあれば `replaceSplatAssetFromSource()` でアセットの ソース を置換
4. 残りが空ならアセット自体を削除
5. 選択をクリア

undo 可能。

### 8.2 Separate

選択 スプラット を**別アセット**として切り出します。

フロー:

1. 選択 スプラット で新アセットを作成
2. 残りで元アセットの ソース を置換
3. **新アセットは元アセットの直上**（`sourceIndex`）に挿入される
4. 新アセットが自動選択される

例えば建物と人物が 1 つのアセットに入っていたら、人物を選択して Separate することで、人物を独立アセットとして扱えるようになります。

### 8.3 Duplicate

選択 スプラット を**複製**します。

フロー:

1. 選択 スプラット で新アセットを作成
2. 元アセットは**変更されない**（追加のみ）
3. 新アセットは元アセットの直上に挿入
4. 新アセットが自動選択される

Separate と違い、元アセットから スプラット が「抜ける」ことはありません。

## 9. シーンアセット との関係

スプラット編集 は **`asset.kind === "スプラット"`** のアセットにのみ適用されます。

| 種類 | スプラット編集 |
|---|---|
| `スプラット` | 対応（本章の全機能） |
| `model` | **非対応**（選択もツールも無効） |

model の編集は外部 3D ツールで行い、再インポートしてください。

## 10. モード終了時の挙動

`Shift+E` を再度押すと スプラット編集 から抜けます。抜ける際:

- 進行中の ブラシストローク は確定またはキャンセルされる
- 変形プレビュー はクリアされる
- Box ドラッグ はクリアされる
- 選択ハイライト は消える
- 空間インデックス などのキャッシュはクリアされる

選択自体は実行時のみのため、次回入った時は選択なしで再開します。

## 11. 関連ショートカット

| キー | 動作 |
|---|---|
| `Shift+E` | スプラット編集 モード切替 |
| `Ctrl+A` | 全 スプラット を選択 |
| `Ctrl+I` | 選択を反転 |
| `Ctrl+D` | 選択をクリア |
| `Alt`（ブラシ 中） | 減算モード |
| `Delete` / `Backspace` | 選択 スプラット を削除 |

## 12. 関連章

- スプラット アセット全般: [シーンアセット](04-scene-assets.md)
- ビューポート ツールと パイメニュー: [ビューポート とツール](08-viewport-tools.md)
- 編集結果の 書き出し 側: [書き出し](10-export.md)
