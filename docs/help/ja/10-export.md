---
id: export
title: Export
section: 10
lang: ja
related-files:
  - src/controllers/export-controller.js
  - src/controllers/export/
  - src/ui/workbench-camera-export-sections.js
  - src/app/export-controller-bindings.js
  - src/engine/export-bundle.js
  - src/engine/export-pass-plan.js
  - src/engine/export-readiness.js
  - src/engine/linear-composite.js
  - src/engine/psd-export.js
  - src/engine/frame-mask-export.js
screenshots:
  - id: export-output-section
    alt: Export > Output セクション
    scenario: export-output-section
  - id: export-settings-section
    alt: Export Settings セクション
    scenario: export-settings-section
  - id: export-progress
    alt: Export 実行中の progress overlay
    scenario: export-progress
last-updated: 2026-04-18
---

# Export

CAMERA_FRAMES の **Export** は、shot camera 単位で紙面（output frame）に沿った画像を書き出す機能です。出力は **PNG** または **PSD**（レイヤー付き）。

Inspector の Export タブで設定し、**Output** セクションの **Download Output** ボタンで実行します。

## 1. Output セクション

### 1.1 Export Target

| target | 意味 |
|---|---|
| **`current`** | 現在 active な shot camera のみを export（デフォルト） |
| **`all`** | workspace 内の全 shot camera を export |
| **`selected`** | 明示的にチェックした shot camera のみを export |

`selected` 選択時は shot camera のチェックリストが出現し、対象を選びます。何も選択されていない状態では Download ボタンが disabled になります。

### 1.2 Include Reference Images

チェックボックス。export run 単位で、reference image を出力に含めるかを切り替えます。

### 1.3 Download Output

export を実行するボタン。ボタンは以下の時に disabled:

- export 実行中（`exportBusy`）
- `selected` target で 1 つも選ばれていない

## 2. Export Settings セクション（shot camera ごと）

shot camera ごとに異なる設定を持てます。

### 2.1 Export Name（ファイル名テンプレート）

| 設定 | 例 |
|---|---|
| テンプレート | `cf-%cam` |
| 変数 | `%cam` → shot camera の名前 |

**ファイル名の正規化**:

- `\/:*?"<>|` と連続空白 → `-` に置換
- 連続ハイフン `-+` → `-` に圧縮
- 先頭末尾のハイフンを削除

**Batch 時の sequence suffix**: 同じベース名が複数ある場合のみ `-01`、`-02` のような連番が付与されます（1 つだけなら suffix なし）。

### 2.2 Export Format

| format | 拡張子 | 用途 |
|---|---|---|
| **`png`** | `.png` | 合成済み 1 枚画像 |
| **`psd`** | `.psd` | レイヤー分け画像（Photoshop 形式） |

### 2.3 Grid Overlay

チェックボックス。ON / OFF の切替。ON のときに **Grid Layer Mode** が現れます。

### 2.4 Grid Layer Mode（Grid Overlay ON 時のみ）

| mode | 効果（PSD 構造上の位置） |
|---|---|
| **`bottom`** | Grid レイヤーが Render より**下**に配置（背景より上） |
| **`overlay`** | Grid レイヤーが Render より**上**に配置（最上部寄り） |

PNG では単に合成順に影響します。

### 2.5 Model Layers（PSD 形式のみ）

チェックボックス。

- ON — PSD にモデルアセットを個別レイヤーとして出力
- OFF — モデルも背景に統合される

### 2.6 Splat Layers（PSD + Model Layers 両方 ON 時のみ）

チェックボックス。

- ON — splat アセットも個別レイヤーとして出力
- OFF — splat は統合される

Model Layers が OFF の場合、自動的に disabled になります。

## 3. Export 実行フロー

### 3.1 開始

**Download Output** ボタンを押すと:

1. `exportBusy = true` に設定、UI が disabled に
2. target documents を解決（current / all / selected）
3. 各 document に対し export bundle を構築
4. Progress overlay が表示される

### 3.2 Phase（進捗フェーズ）

Progress overlay には各フェーズが列挙されます。`todo` → `active` → `done` と遷移。

| フェーズ | 対象 |
|---|---|
| **prepare** | 準備（readiness check など） |
| **beauty** | メインレンダリング |
| **guides** | Grid / Eye Level（Grid Overlay ON 時） |
| **masks** | Frame mask（mask あり時） |
| **psd-base** | PSD ベース合成（PSD + Model Layers 時） |
| **model-layers** | Model layers（PSD + Model Layers 時） |
| **splat-layers** | Splat layers（PSD + Splat Layers 時） |
| **reference-images** | Reference images（Include Reference Images 時） |
| **write** | ファイル書き込み |

### 3.3 完了

ファイルがダウンロードされ、summary と status メッセージが出ます。

- **PNG 単体** → `status.pngExported`
- **PNG batch** → `status.pngExportedBatch { count }`
- **PSD** → `status.psdExported`
- **Mixed** → `status.exportedMixed`

### 3.4 エラー

失敗時は Error overlay が出て、stack trace / message が詳細に表示されます。

## 4. PNG Export

### 4.1 構成

PNG は全レイヤーを **合成した 1 枚画像**として書き出されます。合成順は PSD と同じルール（Grid Layer Mode などを反映）。

### 4.2 合成の特徴

CAMERA_FRAMES の PNG 合成は **linear-space**（sRGB 変換して線形で合成、その後 sRGB に戻す）で行われます。

- sRGB → Linear 変換: ルックアップテーブル使用
- Pre-multiplied alpha blending: 各レイヤーを順に alpha 合成
- Linear → sRGB 逆変換: 最終ピクセルに適用

これにより、通常の sRGB 合成で起きる色ずれを避けて、物理的に正しい合成結果を得ます。

## 5. PSD Export

### 5.1 レイヤー構造

PSD は **bottom-to-top**（一番下が先）のスタック順で格納されます。Photoshop で開くと**上から**表示されます。

レイヤー順序（下から上）:

1. **Background**（あれば）
2. **Reference Images (Back)**（group）— Grid Layer Mode = `bottom` の時
3. **Grid** — Grid Layer Mode = `bottom` の時
4. （Grid Layer Mode = `overlay` の場合は Reference Images Back のみ先に出力）
5. **Render** — メインレンダリング
6. **Splat Layers**（reversed）— Splat Layers ON 時
7. **Model Layers**（reversed）— Model Layers ON 時
8. **Grid** — Grid Layer Mode = `overlay` の時
9. **Eye Level**
10. **Reference Images (Front)**（group）
11. **Frames**（group）
    - frame overlay layers
    - Trajectory layer（`trajectoryExportSource` ≠ `none` の時）
12. **Mask**（hidden、opacity 0.8、frame mask shape に応じた描画）

### 5.2 主要レイヤーの詳細

#### Render

shot camera から見たメインの描画結果（splat + model が統合された beauty pass）。

#### Model Layers

各 model アセットを個別レイヤーとして出力。reversed されているので scene manager の並びが PSD の上から順に一致します。

#### Splat Layers

同上で splat アセット版。

#### Reference Images（Back / Front）

preset の item が、`back` / `front` group ごとにレイヤーグループとして格納されます。各 layer の `left` / `top` / `opacity` が反映されます。

#### Grid / Eye Level

viewport で guide として見えていた grid と eye level（水平線）が、別レイヤーとして出力されます。

#### Frames group

各 FRAME の枠線やアノテーションが `Frames` group に入ります。`trajectoryExportSource` が `none` 以外なら、同じ group に Trajectory layer が追加されます。Trajectory layer の名前は source によって変わります（`Trajectory`, `Trajectory Top Left` 等）。

#### Mask（hidden）

Frame mask が出ていた場合、その領域を示す Mask レイヤーが **hidden = true**（初期状態で非表示）、**opacity 0.8** で追加されます。PSD 側で目立たせたい時だけ表示すれば OK。

- fill color: `rgb(3, 6, 11)`（暗めのグレー）
- shape: frame mask の `shape`（`bounds` / `trajectory`）に応じた形状

### 5.3 Metadata

PSD ファイルに以下のメタ情報が埋め込まれます。

- **解像度**: 150 DPI（horizontal / vertical）
- **単位**: インチ
- **サムネイル**: max 256 px
- **compression**: オフ（ファイルサイズ優先より速度 / 互換性優先）

## 6. Frame Mask の export 反映

### 6.1 Mask mode と対象フレーム

| `frameMask.mode` | export |
|---|---|
| `off` | mask なし |
| `on` | 全 FRAME の外側を mask |
| `selected` | 選択フレームのみ mask |

### 6.2 Shape

| `shape` | 形状 |
|---|---|
| `bounds` | FRAME 矩形のバウンディング（1 FRAME ならそのまま、複数なら共通の向きでまとめたバウンディング、向きがバラバラなら軸並行のバウンディング） |
| `trajectory` | FRAME 軌道のスイープ領域 |

### 6.3 Trajectory Export Source

| source | PSD 出力 |
|---|---|
| `none` | Trajectory layer なし |
| `center` | `Trajectory`（FRAME center 起点） |
| `top-left` | `Trajectory Top Left`（FRAME 左上 corner 起点） |
| `top-right` | `Trajectory Top Right` |
| `bottom-right` | `Trajectory Bottom Right` |
| `bottom-left` | `Trajectory Bottom Left` |

各 FRAME の起点に、**軌道線と直交する tick mark** が同じレイヤーに描かれます。

## 7. Export 前の状態要件

### 7.1 LoD settle（warmup）

splat アセットがある場合、LoD（level of detail）を安定させるため **最低 2 pass の warmup** が要求されます。

- `minWarmupPasses`: 0（デフォルト）
- `splatWarmupPasses`: 2（splat アセットがある場合）
- `maxWaitMs`: 1500 ms（タイムアウト）

### 7.2 Active shot camera

`current` target では、active shot が存在しないと export できません（エラー表示）。

### 7.3 Reference image の可用性

Include Reference Images が ON でも、source file が取得できない item は layer には出ません（存在しないファイルはスキップ）。

## 8. Undo / Redo

各 export 設定の変更は history に記録されます。

- `camera.export-name`
- `camera.export-format`
- `camera.export-grid`
- `camera.export-grid-layer`
- `camera.export-model-layers`
- `camera.export-splat-layers`

`Ctrl+Z` / `Ctrl+Y` で巻き戻し / やり直せます。

## 9. 関連章

- shot camera と export name: [Shot Camera](05-shot-camera.md)
- FRAME / Frame mask / Trajectory: [Output Frame と FRAME](06-output-frame-and-frames.md)
- Reference image 参加条件: [リファレンス画像](07-reference-images.md)
