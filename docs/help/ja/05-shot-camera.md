---
id: shot-camera
title: ショットカメラ
section: 5
lang: ja
related-files:
  - src/controllers/camera-controller.js
  - src/controllers/camera/
  - src/app/camera-controller-bindings.js
  - src/app/camera-pose-commands.js
  - src/engine/camera-pose.js
  - src/engine/camera-lens.js
  - src/engine/clip-range.js
  - src/ui/workbench-camera-export-sections.js
  - src/ui/workbench-browser-sections.js
  - src/controllers/interaction-controller.js
screenshots:
  - id: shot-camera-manager
    alt: カメラ一覧 セクション
    scenario: shot-camera-manager
    annotations:
      - { n: 1, label: "追加" }
      - { n: 2, label: "複製" }
      - { n: 3, label: "削除" }
      - { n: 4, label: "shot 一覧" }
  - id: shot-camera-properties
    alt: カメラプロパティ セクション
    scenario: shot-camera-properties
  - id: camera-mode-render-box
    alt: カメラモード で render box が表示された状態
    scenario: camera-mode-render-box
shortcuts:
  - key: Escape
    action: Lens / Roll adjust モードを終了
last-updated: 2026-04-19
---

# ショットカメラ

CAMERA_FRAMES の **ショットカメラ** は、構図ごとに保存するカメラオブジェクトです。ビューポート の作業用カメラとは別物で、**構図を成立させる全情報**（pose / lens / 紙面サイズ / フレーム / 下絵 binding / 書き出し設定）を 1 つにまとめて保持します。

## 1. ショットカメラ とは

- **複数持てる** — 1 プロジェクトに複数の ショットカメラ を作成・切替・並び替え・削除できる
- **構図ごとに独立** — pose / lens / clipping / 用紙 / フレーム / フレームマスク / 下絵 binding / 書き出し設定をそれぞれ独立に保持
- **ビューポート のカメラとは別** — ビューポート で自由に視点を動かしても ショットカメラ は変わらない。ショットカメラ は意図的に保存した構図だけが残る
- **常に perspective** — orthographic は ビューポート 側だけで、ショットカメラ には昇格しない

ショットカメラ の状態は `.ssproj` の project document に保存され、書き出し は ショットカメラ 単位で行われます。

## 2. カメラ一覧 セクション

インスペクター の カメラ タブにあります。

![カメラ一覧](../assets/screenshots/ja/shot-camera-manager.png)

### 2.1 追加する

ボタン **[+]** で新規 ショットカメラ を追加。新規 ショットカメラ は独立した初期値で作られ、現在の ビューポート 視点がコピーされることはありません。

### 2.2 複製する

ボタン **[Duplicate]** で アクティブな ショットカメラ をまるごと複製します。pose / lens / フレーム / 用紙 も含めてコピーされ、独立編集できます。

### 2.3 選択する

ショットカメラ 一覧の行をクリックで切替。アクティブな ショットカメラ は常に 1 つ。

### 2.4 名前を変える

アクティブな ショットカメラ の行を再クリックすると、インライン編集になります（Enter で確定、Esc でキャンセル）。

### 2.5 削除する

ボタン **[Delete]** で選択 ショットカメラ を削除。ショットカメラ が 1 つしかない時は削除できません（必ず 1 つ以上残ります）。

## 3. カメラプロパティ セクション

アクティブな ショットカメラ のプロパティをここで編集します。

![カメラプロパティ](../assets/screenshots/ja/shot-camera-properties.png)

### 3.1 レンズ（焦点距離 / FOV）

- **Equivalent MM** — 35mm 換算の焦点距離（14〜200 mm、step 0.01）
- スライダーには標準レンズのスナップポイント: `14 / 18 / 21 / 24 / 28 / 35 / 50 / 70 / 75 / 85 / 100 / 135 / 200`
- 右側に対応する水平 FOV（度）がサマリ表示される

内部では水平 FOV（度）で持っており、Equivalent MM は表示用の換算値です（互いに変換されます）。

### 3.2 Pose（位置 / 回転）

Pose は position + 回転（quaternion）で構成されます。

**Position** — X / Y / Z の 3 軸、step `0.01`

**Rotation** — quaternion を Yaw / Pitch / Roll に分解して表示・編集

| フィールド | 範囲 | 意味 |
|---|---|---|
| Yaw（Y） | −180〜180° | 水平方向の首振り |
| Pitch（P） | −90〜90° | 俯仰角 |
| Roll（R） | −180〜180° | forward 軸周りの回転 |

step はすべて `0.01`。内部表現は quaternion ですが、入力は Euler で行えます。

### Pose action row

カメラプロパティ セクションの pose 行にあります。

- **→ Copy ビューポート to Shot** — ビューポート の現在視点を アクティブな ショットカメラ に書き込む
- **← Copy Shot to ビューポート** — アクティブな ショットカメラ の視点を ビューポート にコピー
- **↺ Reset Active View** — 視点をデフォルトに戻す

### 3.3 Clipping（Near / Far）

| フィールド | 初期値 | 制約 |
|---|---|---|
| Near | 0.1 | `≥ 0.1`, step `0.1` |
| Far | 1000 | `≥ Near + 0.01`, step `0.1` |
| Auto Clipping | ON | ON 時は Near / Far 編集不可 |

Auto Clipping が ON の時、シーン の深度範囲から Near / Far が自動計算されます（Near は最近点 × 0.05 などの補正、Far は最遠点 × 1.15 のパディング）。

### 3.4 ロールロック

rotation 行の右端にあるロックアイコン。

- **ON** — orbit で roll が変化しない（水平線が傾かない）。roll 自体は ロール調整モードで変更可能
- **OFF** — orbit で roll も動く。自由度が高いが、水平線が傾きやすい

ショット構図 を整える場面では ON が便利です。

### 3.5 Local Movement Grid

camera 自身の軸を基準に、細かく視点をオフセットするボタン群。

| ボタン | 動き |
|---|---|
| ← / → | 水平（camera right 軸） |
| ↑ / ↓ | 垂直（camera up 軸） |
| ⟲ / ⟳ | 深度（camera forward 軸） |

手動で Position X/Y/Z を触るより構図が崩れにくいので、微調整に向きます。

## 4. カメラモード と ビューポートモード

ビューポート の描画は 2 モード切替できます。

| | ビューポートモード | カメラモード |
|---|---|---|
| 視点 | エディタ用の作業カメラ | active ショットカメラ |
| 操作 | orbit / pan / dolly で自由 | ショットカメラ 視点を直接動かす（ショットカメラ に反映） |
| orthographic | 切替可能（ビューポート のみ） | 常に perspective |
| Render box | 表示されない | **表示される**（paper サイズ枠） |
| フレームマスク | 表示されない | 設定に応じて表示 |
| 下絵 | preview 可 | preview 可・編集可 |

![カメラモード で render box が表示された状態](../assets/screenshots/ja/camera-mode-render-box.png)

### 4.1 モードの意味

- **ビューポートモード** — シーンの様子を自由に見る作業視点
- **カメラモード** — 書き出し される構図を**そのまま**見ている視点

どちらも同じシーンを描画しますが、**目的が違う**という位置付けです。

### 4.2 切替方法

- **パイメニュー**（中ボタンドラッグ）の **カメラ/ビューポート** 項目
- パイメニュー の **レンズ調整** や **Clear Selection** なども同系列

ビューポート で orthographic に切り替えたいときは、モード切替とは別に orthographic トグル が必要です（orthographic は ビューポート のみ）。

## 5. 視点の直接操作

ビューポート / カメラモード 共通で、次のマウス操作が使えます。

### 5.1 Orbit / アンカー Orbit

| 操作 | 動作 |
|---|---|
| 左ドラッグ | 注視点中心に orbit |
| `Ctrl +` 左ドラッグ または 右ドラッグ | ヒット点中心のアンカーオービット |

### 5.2 Pan

- 右ボタンドラッグ

### 5.3 Dolly / Zoom

- マウスホイール
  - Perspective モード: dolly（前後移動）
  - Orthographic モード: zoom

### 5.4 精度モディファイア

| 修飾キー | Orbit | Roll | Lens |
|---|---|---|---|
| なし | 0.18 °/px | 0.18 °/px | 0.12 mm/px |
| `Shift` | 0.08 °/px | 0.08 °/px | 0.03 mm/px |
| `Alt` | 0.035 °/px | 0.035 °/px | —（効果なし） |
| `Alt + Shift` | 0.015 °/px | 0.015 °/px | — |

### 5.5 レンズ調整モード

パイメニュー の **レンズ調整** から入ります。

- マウスドラッグで lens の焦点距離 / FOV をリアルタイム変更
- ビューポート 上に mm / FOV の HUD が出る
- `Shift` で低感度
- **`Escape`** または マウスリリース で終了

### 5.6 ロール調整モード

カメラモード でのみ有効。パイメニュー 経由または内部コマンドから起動します。

- マウスドラッグで camera の roll（forward 軸周りの回転）を変更
- HUD に roll 角（度）が出る
- `Shift` / `Alt` で精度調整
- **`Escape`** または マウスリリース で終了
- ロールロック が ON でも ロール調整 は使用可能（orbit 時だけ roll が抑制される）

## 6. 書き出し名

書き出し タブの **書き出し設定** セクションにある **書き出し名** が、shot ごとの出力ファイル名の元になります。

- **テンプレート変数** `%cam` — ショットカメラ の名前に置換される
- **デフォルト** `cf-%cam`
- テンプレートが空なら shot 名そのもの
- 使えない文字（`\/:*?"<>|` と連続空白）は自動的に `-` に正規化される

shot ごとに異なる 書き出し名 を設定できます。重複したまま 書き出し する場合の扱いは [書き出し](10-export.md) を参照。

## 7. 関連ショートカット

| キー | 動作 |
|---|---|
| `Escape` | Lens / Roll adjust モードを終了 |
| 修飾キー全般 | [キーボードショートカット一覧](11-shortcuts.md) 参照 |

## 8. 関連章

- 紙面サイズと フレーム: [用紙 と フレーム](06-output-frame-and-frames.md)
- シーンアセット管理: [シーンアセット](04-scene-assets.md)
- 書き出し: [書き出し](10-export.md)
