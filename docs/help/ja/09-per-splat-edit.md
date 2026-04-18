---
id: per-splat-edit
title: Per-splat edit
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
    alt: Per-splat edit toolbar
    scenario: cf-test-per-splat-toolbar
    annotations:
      - { n: 1, label: "Tool 選択" }
      - { n: 2, label: "選択操作" }
      - { n: 3, label: "編集アクション" }
      - { n: 4, label: "選択数" }
  - id: per-splat-brush-preview
    alt: Brush preview（ring + depth bar）
    scenario: cf-test-per-splat-brush
  - id: per-splat-box-tool
    alt: Box tool 配置中
    scenario: cf-test-per-splat-box
shortcuts:
  - key: Shift+E
    action: Per-splat edit モード切替
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
last-updated: 2026-04-18
---

# Per-splat edit

**Per-splat edit** は、splat アセット内の個別の splat（単位：粒）を選択・削除・分離・複製・変形する専用モードです。Gaussian splatting ならではのクリーンナップや分割に使います。

## 1. 概念

### Raw selection は runtime-only

splat の選択状態（どの splat が選ばれているか）は **runtime でのみ保持**され、project には保存されません。モードを抜けた時点や project save には含まれず、再度 Per-splat edit に入ると「選択なし」から再開します。

ただし undo / redo 用の history には含まれるので、編集セッション中の操作は巻き戻せます。

### 編集結果は persistent

Delete / Separate / Duplicate / Transform の結果は splat アセットの **source に永続化**されます。具体的には `asset.source`（PackedSplatSource）が再構築され、`.ssproj` の save にも含まれます。

更新フロー:

1. 編集が `packedSplats.packedArray` に反映される（in-memory）
2. `asset.persistentSourceDirty = true` がマークされる
3. 適切なタイミング（editor exit、history commit、project save）で `syncSplatAssetPersistentSource()` が source を再構築

## 2. 入口

| 入口 | 操作 |
|---|---|
| **キーボード** | `Shift+E` |
| **Tool Rail** | Per-splat edit ボタン |
| **Pie menu** | （現行は未登録） |

モードに入ると Viewport 内に専用 toolbar が現れます。scope（どの splat アセットを対象にするか）が自動で解決されます。scope が空なら「splat アセットがない」エラーで失敗。

## 3. Toolbar の構造

![Per-splat edit toolbar](../assets/screenshots/ja/per-splat-edit-toolbar.png)

ドラッグで位置を変更できます（`store.splatEdit.hudPosition` に保存）。

### グループ 1: ツール選択

| ボタン | 機能 | 有効条件 |
|---|---|---|
| **Box** | 矩形選択ツール | 常時 |
| **Brush** | ブラシ選択ツール | 常時 |
| **Transform** | 選択 splat の変形 | 選択あり |

### グループ 2: 選択操作

| ボタン | ショートカット | 機能 |
|---|---|---|
| **Select All** | `Ctrl+A` | scope 内の全 splat を選択 |
| **Invert** | `Ctrl+I` | 選択を反転（要: 選択あり） |
| **Clear** | `Ctrl+D` | 選択をクリア（要: 選択あり） |

### グループ 3: 編集アクション

| ボタン | 機能 | 有効条件 |
|---|---|---|
| **Delete**（danger style） | 選択 splat を削除 | 選択あり |
| **Separate** | 選択 splat を別アセットとして切り出し | 選択あり |
| **Duplicate** | 選択 splat を複製 | 選択あり |

### 右端: 選択数

`${splatEditSelectionCount} sel` と常時表示。

## 4. Box ツール

矩形（oriented bounding box）で splat を囲んで選択するツール。

### 4.1 Box の配置

- Viewport 上をクリック → シーンへレイキャスト、hit point を center にして Box を配置
- 一度配置された Box は `boxPlaced = true` として確定

### 4.2 Box のパラメータ編集

Tool-specific popover でパラメータを触れます。

- **Center** — X / Y / Z
- **Size** — X / Y / Z
- **Rotation** — X / Y / Z（Euler → Quaternion）
- **Uniform Scale** — 一括倍率
- **Fit to Scope** — scope アセットの bounds に合わせる

![Box tool](../assets/screenshots/ja/per-splat-box-tool.png)

### 4.3 選択適用

Box 配置後の **Apply** ボタン（または確定操作）で、Box 内に中心がある splat を選択に反映します。

| モディファイア | 挙動 |
|---|---|
| なし | 選択に **追加**（add） |
| `Alt` | 選択から **減算**（subtract） |

判定は OBB（oriented bounding box）の内外判定。spatial index がある場合は高速化されます。

## 5. Brush ツール

円形 brush でカーソル付近の splat を選択するツール。

![Brush preview](../assets/screenshots/ja/per-splat-brush-preview.png)

### 5.1 Brush size

| フィールド | 単位 | 範囲 |
|---|---|---|
| **size** | px | 4 〜 400 |

brush preview（リング）がカーソル位置に表示されます。

### 5.2 Depth mode

brush が選択する「奥行き範囲」を制御。

| mode | 意味 |
|---|---|
| **`through`** | 奥行き制限なし（無限円柱で選択） |
| **`depth`** | 指定 depth 値で制限（有限円柱） |

depth mode = `depth` のとき、depth の数値は `0.01` 以上でクランプされます。

### 5.3 Subtract mode（`Alt`）

- 通常 — 選択に追加
- `Alt` ホールド — 選択から減算

brush preview の色が視覚的に変化します（CSS class `--subtract`）。ペイント中は `--painting` が付き、状態がわかりやすくなります。

### 5.4 Brush preview の構成

| 要素 | 表示条件 |
|---|---|
| **Ring** — 円形アウトライン | 常時（brush active 時） |
| **Depth Bar** — 奥行きインジケータ | depth mode = `depth` かつ `depthBarPx > 2` |
| **`--painting`** CSS class | ペイント中 |
| **`--subtract`** CSS class | `Alt` ホールド中 |

### 5.5 Brush navigation

Brush ツール中のナビゲーション:

- **左ドラッグ** — ペイント（選択追加 / 減算）
- **`Shift +` 右ドラッグ** — pan（視点移動）
- **右ドラッグ** — anchor orbit（Ctrl+ 左ドラッグと同等）
- **ホイール** — dolly / zoom

ペイント以外の操作は通常の Viewport ナビゲーションと同じです。

## 6. Transform ツール

選択 splat を直接変形するツール。

### 6.1 使い方

1. Box / Brush で splat を選択
2. Transform ツールに切替
3. Transform gizmo が表示される
4. gizmo をドラッグして選択 splat を移動 / 回転 / スケール

### 6.2 Gizmo の構成

- **Move axes**（X / Y / Z）
- **Move planes**（XY / YZ / ZX）
- **Rotate rings**（X / Y / Z）
- **Scale handle**（uniform）

### 6.3 Pivot

gizmo の pivot（変形の中心）は、選択 splat の bounds の中央がデフォルトです。

### 6.4 Undo / Redo

Transform は history に `splat-edit.transform` として記録され、`Ctrl+Z` で巻き戻せます。

### 6.5 適用フロー

1. **Preview** — ドラッグ中は preview state で仮表示（packedSplats には未反映）
2. **Update** — ドラッグ中の更新
3. **Finalize**（ドラッグ終了）— `applySelectedSplatTransform()` で packedSplats に反映、source dirty マーク

## 7. 選択操作

### 7.1 Select All（`Ctrl+A`）

scope 内の**全アセットの全 splat** を選択に追加します。大量データでは時間がかかります。

### 7.2 Invert（`Ctrl+I`）

現在の選択を反転します。選択中 splat は除外され、非選択 splat が選択されます。

### 7.3 Clear（`Ctrl+D`）

選択をすべてクリアします。

## 8. 編集アクション

### 8.1 Delete

選択 splat を削除します。

フロー:

1. 選択 splat を抽出
2. remainder（非選択 splat）で新しい source を生成
3. remainder が残っていれば `replaceSplatAssetFromSource()` でアセットの source を置換
4. remainder が空ならアセット自体を削除
5. 選択をクリア

undo 可能。

### 8.2 Separate

選択 splat を**別アセット**として切り出します。

フロー:

1. 選択 splat で新アセットを作成
2. remainder で元アセットの source を置換
3. **新アセットは元アセットの直上**（`sourceIndex`）に挿入される
4. 新アセットが自動選択される

例えば建物と人物が 1 つのアセットに入っていたら、人物を選択して Separate することで、人物を独立アセットとして扱えるようになります。

### 8.3 Duplicate

選択 splat を**複製**します。

フロー:

1. 選択 splat で新アセットを作成
2. 元アセットは**変更されない**（append only）
3. 新アセットは元アセットの直上に挿入
4. 新アセットが自動選択される

Separate と違い、元アセットから splat が「抜ける」ことはありません。

## 9. Scene asset との関係

Per-splat edit は **`asset.kind === "splat"`** のアセットにのみ適用されます。

| kind | Per-splat edit |
|---|---|
| `splat` | 対応（本章の全機能） |
| `model` | **非対応**（選択もツールも無効） |

model の編集は外部 3D ツールで行い、再インポートしてください。

## 10. モード終了時の挙動

`Shift+E` を再度押すと Per-splat edit から抜けます。抜ける際:

- 進行中の brush stroke は commit または cancel される
- Transform preview はクリアされる
- Box drag はクリアされる
- Selection highlight は消える
- spatial index などのキャッシュはクリアされる

選択自体は runtime-only のため、次回入った時は選択なしで再開します。

## 11. 関連ショートカット

| キー | 動作 |
|---|---|
| `Shift+E` | Per-splat edit モード切替 |
| `Ctrl+A` | 全 splat を選択 |
| `Ctrl+I` | 選択を反転 |
| `Ctrl+D` | 選択をクリア |
| `Alt`（brush 中） | subtract モード |
| `Delete` / `Backspace` | 選択 splat を削除 |

## 12. 関連章

- splat アセット全般: [シーンアセット](04-scene-assets.md)
- Viewport ツールと pie menu: [Viewport とツール](08-viewport-tools.md)
- 編集結果の export 側: [Export](10-export.md)
