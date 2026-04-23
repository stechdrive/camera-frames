---
id: open-save
title: ファイルを開く・保存する
section: 3
lang: ja
related-files:
  - src/interactions/input-router.js
  - src/app/file-open-routing.js
  - src/controllers/project-controller.js
  - src/controllers/project/
  - src/project/
  - src/importers/legacy-ssproj.js
  - src/project-package.js
  - src/app/project-state-bridge.js
  - src/controllers/scene-assets/import-runtime.js
  - src/ui/side-panel.js
screenshots:
  - id: open-menu
    alt: ツールレール の File メニュー
    scenario: open-menu
  - id: remote-url-input
    alt: Remote URL 入力欄
    scenario: remote-url-input
  - id: confirm-new-project
    alt: 未保存状態での新規プロジェクト確認ダイアログ
    scenario: confirm-new-project
shortcuts:
  - key: Ctrl+N
    action: 新規プロジェクトを作成
  - key: Ctrl+O
    action: ファイルを開く（ファイルダイアログ）
  - key: Ctrl+S
    action: working save（IndexedDB）
  - key: Ctrl+Shift+S
    action: package save（.ssproj ダウンロード）
last-updated: 2026-04-19
---

# ファイルを開く・保存する

CAMERA_FRAMES のファイル操作は、**読み込み**（シーンアセット / 下絵 / プロジェクト を読む）と **保存**（作業保存 と パッケージ保存）の 2 系統で構成されます。

## 1. 開く（読み込み）

### 1.1 4 つの入口

どの方法で開いても、ファイル種別に応じた振り分けが行われます。

| 入口 | 操作 |
|---|---|
| **File メニュー**（ツールレール） | `Open Files...`（`Ctrl+O`）でファイルダイアログ |
| **Drag & Drop** | ビューポート にファイルをドロップ |
| **Remote URL** | ツールレール の URL 入力欄に `http://` / `https://` の URL を貼って Load |
| **起動時 URL パラメータ** | ブラウザに `?load=<URL>` 付きでアクセス |

![ツールレール の File メニュー](../assets/screenshots/ja/open-menu.png)

### 1.2 対応ファイル形式

| カテゴリ | 拡張子 |
|---|---|
| **シーンアセット** | `.ply` / `.spz` / `.splat` / `.kSplat` / `.sog` / `.zip` / `.rad` / `.glb` / `.gltf` |
| **下絵** | `.png` / `.jpg` / `.jpeg` / `.webp` / `.psd` |
| **プロジェクト** | `.ssproj` |

PSD は leaf レイヤーを個別の 下絵アイテム として展開します。詳しくは [リファレンス画像](07-reference-images.md)。

### 1.3 複数ファイルを同時に開いたとき

一度に複数を選択 / ドロップすると、次の順で振り分けられます。

1. **単独の `.ssproj`** → プロジェクトとして開く
2. **それ以外**:
   - 下絵 対応ファイル → 下絵 として読み込み
   - 残り → シーンアセット として読み込み

シーンアセット と 下絵 を混ぜても、それぞれ対応する経路に自動で振り分けられます。

### 1.4 リモート URL から読み込む

ツールレール の URL 入力欄で、複数 URL を一度に指定できます。

![リモート URL 入力欄](../assets/screenshots/ja/remote-url-input.png)

- **区切り文字** — 改行、カンマ、空白
- **プロトコル制約** — `http://` または `https://` のみ（その他は除外）

Enter または Load ボタンで取り込みます。

### 1.5 起動時 URL パラメータ（`?load=`）

アプリ URL に `?load=<URL>` を付けて起動すると、ページロード直後にその URL を読み込みます。`?load=A&load=B` のように複数指定できます。

- HTTPS 要件・プライベートホスト などの安全性検証に引っかかった URL は警告され、読み込まれない
- 安全性検証を通った URL は **起動時読み込み確認ダイアログ** で「Continue Load」を押した時点で読み込みが始まる

### 1.6 旧 `.ssproj` の読み込み

旧バージョンの CAMERA_FRAMES で保存した `.ssproj` もそのまま開けます。用紙 / ショットカメラ / フレーム / カメラの回転などが自動で現行フォーマットに変換されてロードされます。保存し直すと現行フォーマットで出力されます。

## 2. 保存する

CAMERA_FRAMES の保存は **作業保存**（ブラウザ内）と **パッケージ保存**（ファイルダウンロード）の 2 種類です。性質が異なるので使い分けます。

### 2.1 2 種類の保存

| | 作業保存 | パッケージ保存 |
|---|---|---|
| **ショートカット** | `Ctrl+S` | `Ctrl+Shift+S` |
| **保存先** | ブラウザ IndexedDB | `.ssproj` ファイル（ダウンロード） |
| **用途** | 同じブラウザで作業再開 | 別環境に持ち運ぶ / バックアップ |
| **容量** | IndexedDB 制約内 | ファイルシステム制約内 |

### 2.2 作業保存 の詳細

`Ctrl+S` は、プロジェクトの状態で挙動が変わります。

- **すでに `.ssproj` を開いている、または 一度でも パッケージ保存 したことがある** — そのままブラウザ内に 作業保存 される
- **新規プロジェクトでまだ `.ssproj` にしていない** — パッケージ保存 にフォールバックし、`.ssproj` のダウンロードを促される

初回 作業保存 時は、説明の確認ダイアログが出ます（`Continue Save` で実行）。

### 2.3 パッケージ保存 の詳細

`Ctrl+Shift+S` で `.ssproj` をダウンロードします。確認ダイアログは **保存モード** の 2 択を中心に構成されます。

**保存モード**（ラジオ、排他）

| 選択肢 | 目的 | 保存時間 | 次回読込み | 描画 |
|---|---|---|---|---|
| **Fast** | 素早く保存、ファイルを小さく | 瞬時 | Fast（ロード後に裏で LoD を自動構築） | 初回ロード直後は未最適化、数秒後に LoD が効いて軽くなる |
| **Quality** | LoD を事前計算して保存、配布・長期保管に向く | 数十秒（大規模シーンは 1 分前後） | Fastest（事前計算済み LoD を即座に反映） | 最初から LoD 最適化済み、安定して軽い |

**自動 LoD 構築について**

- 100,000 splats 以上の 3DGS を読み込むと、アプリがバックグラウンドで LoD ツリーを自動構築します（`AUTO_LOD_MIN_SPLATS` 定数、tunable）
- 構築完了時には画面下に `{名前} の描画を LoD 最適化しました。` と一瞬通知
- この runtime LoD は ssproj には保存されません（次回ロード時にまた構築される）
- 保存してから何度も開き直すワークフローでは **Quality モードでの事前計算** が圧倒的に有利（初回ロードから LoD が効く）

**詳細オプション**（折りたたみ）

Fast モード選択時に、未編集の PLY / SPZ がシーンに含まれる場合にのみ展開可能:

- `未編集 3DGS を SOG 圧縮でさらに小さく保存`（チェックボックス）
  - 未編集 PLY / SPZ 原本を SOG 形式に再圧縮してファイルサイズを大幅削減
  - WebGPU 必須
  - `Max SH bands`: `0` / `1` / `2` / `3`
  - `Iterations`: `4` / `8` / `10` / `12` / `16`
- per-splat 編集した 3DGS には効果がない（既に Spark の量子化が入っているため）

**重要な挙動**

- **per-splat 編集で焼込み済み LoD は無効化される**。削除・分離・複製・カラー変更で内容が変わると自動破棄。再保存時に Quality を選べば焼き直される
- per-splat 編集後の 3DGS は Spark の量子化で自然に縮むため、Fast 保存でも元 PLY よりサイズは小さくなる
- 原本のハイクオリティ PLY は別途保管しておくことを推奨。ssproj は作業ファイル / 配布用バイナリという位置付け

**焼込み済み ssproj を開いた後の再保存**

- Quality で焼込み済み ssproj を開くと、Package save ダイアログの既定値が **Quality** に切替わる
- そのまま保存すると**再計算はスキップされ、既存の焼込み結果が維持される**（時間 0 秒）
- Quick で焼込み済み ssproj（過去バージョン由来）を開いた場合、Quality に自動アップグレードしてくれる
- 編集が入った asset のみ再計算対象になる。未編集の asset は skip されるので、部分編集時の保存時間コストは最小限

**保存先**

- 元の `.ssproj` を上書き（`Overwrite Package`）
- 別名保存（`Save Package As`）
- 初回の 書き出し なら `Export Project`

パッケージ保存 に成功すると、対応する 作業保存 は保存済みパッケージ側に取り込まれた扱いになり、「未反映の変更あり」の目印（`PKG` バッジ）は消えます。

### 2.4 `.ssproj` を開いたときの自動復元

作業保存 は元になった `.ssproj` と紐付けて保持されます。同じ `.ssproj` を再度開くと、その ショットカメラ / フレーム / 下絵 の編集途中状態が自動で復元されます。別の `.ssproj` を開いた場合や、`.ssproj` を別バージョンで上書きしていた場合は復元されず、`.ssproj` の内容だけでロードします。

### 2.5 保存状態の表示

ビューポート 左上の HUD にプロジェクト名と状態が出ます。

- `Untitled` — 未保存の新規プロジェクト
- `*` — 作業保存 に未保存の変更がある
- `PKG` — パッケージ（`.ssproj`）に未反映の変更がある（かつ シーンアセット / 下絵 / 複数 ショットカメラ / プロジェクト名 のいずれかが存在する場合のみ表示）

`PKG` バッジは「作業保存 があっても、パッケージ に書き出していない変更が残っている」ことを意味します。

## 3. 新規プロジェクト

### 3.1 `Ctrl+N` の動作

未保存の変更がない状態では、即座に新規プロジェクトに切り替わります。ワークスペース / ショットカメラ / フレーム / 下絵 / シーンアセット がすべてリセットされ、クリーンな `Untitled` 状態になります。

### 3.2 未保存の変更がある場合

確認ダイアログが出ます。選択肢:

- **Cancel** — 新規化しない
- **Discard and New Project** — 変更を捨てて新規化
- **Save and New Project**（作業保存 可能時）— 作業保存 してから新規化
- **Save Package and New Project**（作業保存 不可時）— パッケージ保存 してから新規化

![未保存状態での新規プロジェクト確認ダイアログ](../assets/screenshots/ja/confirm-new-project.png)

## 4. 関連章

- ファイル読み込み後の操作: [画面構成](02-ui-layout.md)
- 下絵 の扱い: [リファレンス画像](07-reference-images.md)
- 書き出し: [書き出し](10-export.md)
