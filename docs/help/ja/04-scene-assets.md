---
id: scene-assets
title: シーンアセット
section: 4
lang: ja
related-files:
  - src/controllers/scene-assets/
  - src/controllers/asset-controller.js
  - src/controllers/lighting-controller.js
  - src/engine/scene-units.js
  - src/lighting-model.js
  - src/ui/workbench-scene-sections.js
  - src/ui/workbench-property-sections.js
  - src/ui/workbench-controls.js
  - src/workspace-model.js
last-updated: 2026-04-18
---

# シーンアセット

CAMERA_FRAMES のシーンは **splat**（Gaussian splatting）と **model**（glTF / glb）の 2 種類のアセットで構成されます。各アセットは Inspector の Scene タブで一覧・編集できます。

## 1. Scene Manager セクション

Inspector の Scene タブ内、最上部のセクション。

![Scene Manager](../assets/screenshots/ja/scene-manager.png)

アセットは **kind ごとに分かれて**表示されます。表示順は固定で `model` → `splat` の順。各セクションにヘッダー（kind 名 + 個数の pill）が付きます。

### 1.1 アセットの追加

追加の入口は次の通り。

- **ファイルダイアログ** — Tool Rail の `Open Files...`（`Ctrl+O`）
- **Drag & Drop** — Viewport に直接ファイルをドロップ
- **Remote URL** — Tool Rail の URL 入力欄に `http://` / `https://` を貼って Load
- **Package expansion** — `.ssproj` / `.spz` / `.zip` を開くとアセットが展開される

同時に最大 3 つのアセットを並行してロードします。Import フェーズは `verify → expand → load → apply` の 4 段階で、進捗は Progress overlay に表示されます。

### 1.2 選択する

| 操作 | 効果 |
|---|---|
| クリック | そのアセットを単独選択（再クリックで解除） |
| `Ctrl` / `Meta` + クリック | 加算選択（toggle） |
| `Shift` + クリック | 範囲選択（anchor からの範囲） |

アセット選択は **Scene Manager 側でもシーン（Viewport）側でも同期**されます。Viewport 上で splat を Select ツールでクリックすると、Scene Manager 側もハイライトされます。

### 1.3 表示切替（Eye アイコン）

行右端の eye アイコン（{{icon:eye}} / {{icon:eye-off}}）で、アセット単位に表示を切替できます。アセットを選択せずに eye を押しても OK（選択に影響しない）。

表示オフにしたアセットは Viewport / preview / export のすべてから消えます。

### 1.4 順序変更

#### ドラッグによる並び替え

行左の grip アイコンをドラッグして移動します。

- **同じ kind 内でのみ並び替え可能**（splat を model セクションに入れたり、その逆はできない）
- drop 位置は行の上半分か下半分かで before / after を判定
- 複数選択時は同じ kind のアセット群を一括移動

#### ボタン

各行のコンテキストボタンで 1 段ずつ移動できます（上へ / 下へ）。

### 1.5 Label 編集

active アセット行をクリックすると、インライン編集に切り替わります。改行などは sanitize されます。

### 1.6 削除

複数選択した状態で `Delete` キー（Viewport フォーカス時）、または Scene Manager のコンテキスト操作から削除します。削除は undo 可能。

### 1.7 複製

コンテキスト操作から **Duplicate** を実行。複製アセットは元アセットの直下（`sourceIndex + 1`）に挿入されます。ラベルには `Copy`, `Copy 2` のように unique な suffix が付きます。

complete per-splat edit 結果の source は複製にも引き継がれます（新アセットとして独立）。

## 2. Selected Scene Object セクション

アセット選択時に展開されるプロパティセクション。複数選択時は **一括編集**として働きます。

### 2.1 Translate（位置）

| フィールド | step |
|---|---|
| X / Y / Z | 0.01 |

複数選択時は delta（変化量）が全選択アセットに適用されます。

### 2.2 Rotate（回転、degree）

| フィールド | 範囲 |
|---|---|
| X / Y / Z | −180〜180° |

内部では Euler order `XYZ` で degree で入出力されます。

### 2.3 Scale（World Scale）

- フィールド: 単一の倍率
- 制約: `0.01 ≤ worldScale`
- 意味: `asset.object.scale = baseScale × worldScale`（import 時点の scale を保ったまま後から倍率を掛ける）

複数選択時は掛け算（factor）が全アセットに適用されます。

### 2.4 Apply Transform

**Apply Transform** ボタンで、現在の wrapper の transform を content object に bake します。bake 後、wrapper は identity（無変形）に戻り、`baseScale` は `(1, 1, 1)` になります。

wrapper と content の 2 段階構造を 1 段に畳み込むことで、後続の操作が扱いやすくなります。

### 2.5 Content Transform

アセットは 2 段階の構造を持っています。

- **wrapper**（`asset.object`） — ユーザーが編集する外側の transform
- **content object** — 中身（splat の correction group、または GLB の root node）

Content transform は content object 側の transform であり、通常はユーザーは触らず、`Apply Transform` で bake される時のみ関わります。

### 2.6 baseScale / worldScale / unitMode

| 項目 | 意味 |
|---|---|
| **baseScale** | import 時点の asset.object.scale（固定値） |
| **worldScale** | 後から適用する倍率（ユーザー編集可能） |
| **unitMode** | アセットの想定単位（表示用ラベル） |

unit は kind ごとのデフォルトに基づきます。

### 2.7 Export Role

- **beauty** — 通常の export 対象（デフォルト）
- **omit** — export 時に別レイヤー / channel に分離（hidden 扱い）

PSD export 時、omit されたアセットは layer に出つつ beauty 合成から外れます。

### 2.8 Mask Group

任意の文字列で複数アセットを論理的にグループ化する設定。export 時に同じ group をまとめて扱えます。空欄なら `—` と表示。

### 2.9 Working Pivot

Transform ツールや Pivot ツールで回転 / スケールの中心点として使う座標。

- **設定** — Pivot ツール（`Q`）の gizmo をドラッグして world 座標を指定
- **reset** — 原点に戻す。origin と等しい pivot は `null` として扱われる

変換操作をするアセットによって、自然な pivot が異なる（例: 人物モデルなら足元、ビルなら底面中央）ので、ここを明示的に設定すると意図した回転が得られます。

## 3. Lighting セクション

シーン全体の照明を 1 つのモデルで制御します。

### 3.1 Direction Widget

![Lighting direction widget](../assets/screenshots/ja/lighting-widget.png)

132 × 132 px の円形ウィジェット。半径 46 px。中心のドラッグで方向（azimuth / elevation）を指定します。

- **azimuth** — 水平方向の角度（viewer から見た回転、`−180〜180°`）
- **elevation** — 俯仰角（`−89〜89°`）
- viewer から見た**相対角度**で表現されるため、Viewport が回転すると widget の向きも相対的に追随する

### 3.2 光源の種類

- **Ambient** — 全体を包む拡散光（強度 `0〜2.5`、初期 `1.1`）
- **Model Light**（key light） — 方向光
  - **enabled** — ON / OFF（初期 ON）
  - **intensity** — `0〜3`、step `0.01`、初期 `2.0`
  - **azimuth / elevation** — 上記 widget で設定
- **Ambient fill** — key の反対方向からの補助光（自動）

### 3.3 リセット

「Reset Lighting」で default state（ambient 1.1、intensity 2.0、azimuth 36.87°、elevation 45°）に戻せます。

## 4. splat と model の違い

| | splat | model |
|---|---|---|
| **主なフォーマット** | `.ply` / `.spz` / `.splat` / `.ksplat` / `.sog` / `.rad` / `.zip` | `.glb` / `.gltf` |
| **構造** | SplatMesh（correction group 付き）| GLB scene / node |
| **per-splat edit** | 対応 | 非対応 |
| **export** | 通常 / splat layers（PSD only） | 通常 / model layers（PSD only） |
| **Content object** | correction group | GLB の root node |

per-splat edit（`Shift+E`）は splat アセットに対してのみ有効で、model にはそもそも適用されません（別アセットとして扱うか、3D ツール側で編集してから再インポートしてください）。

## 5. 削除・複製と per-splat edit

- **削除** — 選択アセットを削除。undo 可能。関連する per-splat edit state はクリア
- **複製** — 元の source から新アセットを clone して `sourceIndex + 1` に挿入。per-splat edit の state は複製には引き継がれない（fresh copy）

per-splat edit の Separate / Duplicate から作られた新アセットは、element の source の**直上**に挿入されます（per-splat edit の章で詳述）。

## 6. 関連ショートカット

Scene アセット固有のショートカットは少なく、主に Viewport 側の操作と連動します。

- `Delete` / `Backspace` — 選択アセットを削除
- 選択時の修飾キー（`Shift` / `Ctrl` / `Meta`）

全ショートカットは [キーボードショートカット一覧](11-shortcuts.md) を参照。

## 7. 関連章

- Viewport での操作: [Viewport とツール](08-viewport-tools.md)
- per-splat edit: [Per-splat edit](09-per-splat-edit.md)
- 書き出し時の layer 扱い: [Export](10-export.md)
