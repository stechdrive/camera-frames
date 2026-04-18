---
id: reference-images
title: リファレンス画像
section: 7
lang: ja
related-files:
  - src/controllers/reference-image-controller.js
  - src/controllers/reference-image/
  - src/controllers/reference-image-render-controller.js
  - src/engine/reference-image-selection.js
  - src/engine/reference-image-loader.js
  - src/reference-image-model.js
  - src/ui/workbench-sections.js
  - src/ui/reference-multi-selection-input.js
  - src/app/reference-image-controller-bindings.js
screenshots:
  - id: reference-presets
    alt: Reference Presets セクション
    scenario: reference-presets
  - id: reference-manager
    alt: Reference Manager セクション（前後グループ）
    scenario: reference-manager
  - id: reference-edit-mode
    alt: Reference image 編集モード中の Viewport
    scenario: reference-edit-mode
shortcuts:
  - key: R
    action: Reference image プレビュー表示切替
  - key: Shift+R
    action: Reference image 編集モード切替
last-updated: 2026-04-18
---

# リファレンス画像

CAMERA_FRAMES の **reference image** は、Camera View 上に重ねる下絵です。紙面基準で位置・サイズを保持し、背景（back）と前景（front）のレイヤー分けに対応します。

## 1. 全体像（3 層の階層）

reference image は次の 3 階層で管理されます。

1. **Preset** — 構図ごとに使い分ける下絵セット（1 preset = 複数 item のコンテナ）
2. **Item** — preset 内の個別の画像
3. **Shot binding / Override** — shot camera がどの preset を使うか、item 単位の override

1 つの shot camera は 1 つの preset を参照します。同じ preset を複数の shot で共有しても、shot ごとに item の位置や表示有無を override できます。

## 2. Reference Presets セクション

Inspector の Reference タブ最上部。

![Reference Presets](../assets/screenshots/ja/reference-presets.png)

### 2.1 `(blank)` preset

ID `reference-preset-blank`、名前 `(blank)` の**デフォルト preset**。常に存在し、削除できません。

意味:

- 「下絵セットを使っていない」状態を表す空 preset
- 新規 camera や下絵未設定 camera は実質的に `(blank)` を参照する
- `(blank)` 選択中に import した時は、新しい preset を作ってそこへ読み込み、`(blank)` 自体は汚さない

### 2.2 Preset の操作

| 操作 | 効果 |
|---|---|
| **作成** | 新規 preset を作成し、active に切替、active shot に binding |
| **切替** | active preset を変更。active shot の binding も更新 |
| **複製** | active preset の item と baseRenderBox をコピーして新規 preset |
| **削除** | `(blank)` 以外を削除可能。削除された preset ID は全 shot から自動で剥がされる |

### 2.3 Shot camera への binding

各 shot camera は `referenceImages.presetId` を持ち、どの preset を使うかを記録します。

- shot に明示的な preset 指定がなければ `(blank)` を返す
- preset を切替えると、active shot の binding も同時に更新される

## 3. Reference Manager セクション

active preset の item 一覧を編集するセクション。

![Reference Manager](../assets/screenshots/ja/reference-manager.png)

### 3.1 Item 一覧

item は **Back** / **Front** の 2 グループに分けて表示されます。

- **Back** — シーンの後ろ（下絵として透かす用途）
- **Front** — シーンの前（重ね合わせ用途）

item の表示順は Back → Front の順で描画されます（Back が下、Front が上）。

### 3.2 preview visible と export enabled の独立切替

各 item は次の 2 つを**独立に**持ちます。

| フラグ | 効果 |
|---|---|
| **preview visible** | Viewport / Camera View での表示有無 |
| **export enabled** | export 時の layer 参加有無 |

preview だけ表示して export からは外す、あるいはその逆、も可能です。

### 3.3 Front / Back の切替

各 item の group 値を変更することで前後を移動できます。移動先グループの末尾に配置されます。

### 3.4 順序（同じグループ内）

各 item は `order` 値を持ち、同一グループ内で並び替えができます。ドラッグ & ドロップで順序を変更すると、各グループの order が再計算されます。

### 3.5 Import

import の入口は Reference Manager セクションの + ボタン、または Viewport への drag & drop。

#### 通常画像（PNG / JPG / WebP）

1 ファイル = 1 item として追加されます。

#### PSD

PSD は **leaf layer を個別 item として展開**します。

- 子を持たない layer（leaf）のみ抽出
- 各 layer の `visible` / `opacity` / 位置情報が item の初期値に反映される
- PSD の layer 順がそのまま Front グループ末尾に追加される

### 3.6 `(blank)` で import したとき

active preset が `(blank)` の状態で import を実行すると、**新規 preset が自動作成**され、そこに import されます。

- preset 名はファイル名または shot 名をヒントに生成
- `(blank)` 自体には item を加えない
- shot camera にも新 preset が binding される

## 4. Reference Properties セクション

選択 item の位置・回転・拡縮を編集。

### 4.1 単一 item の編集

| フィールド | 単位 | 初期値 | 範囲 |
|---|---|---|---|
| **opacity** | 0〜1 | 1 | 0〜1 |
| **scale** | % | 100% | 0.1〜100000% |
| **rotation** | degree | 0 | — |
| **offset** | px (x, y) | 0, 0 | — |
| **anchor** | 正規化 (ax, ay) | 0.5, 0.5 | 0〜1 |

### 4.2 Multi-selection 一括変換

複数選択時は、選択を囲む **Logical Selection Box**（left / top / width / height / rotation / anchor）が自動生成され、以下の操作が selection 全体に一括適用されます。

- **Move** — pivot 中心に全 item を同量移動
- **Rotate** — selection の pivot を中心に全 item を回転
- **Scale** — selection の pivot を中心にスケール

各 item の個別パラメータは、一括変換の結果で自動更新されます。

## 5. Per-shot override の仕組み

同じ preset を複数の shot で共有しつつ、shot ごとに item をカスタマイズする仕組み。

### 5.1 Override の構造

shot camera の `referenceImages.overridesByPresetId[presetId]` に、preset ごとの差分を格納します。

```
override = {
  activeItemId,
  renderBoxCorrection: { x, y },
  items: {
    [itemId]: { /* 差分のみ */ name, group, order, previewVisible, exportEnabled, opacity, scalePct, rotationDeg, offsetPx, anchor },
    ...
  }
}
```

### 5.2 マージルール

item 表示時は `base item` ⊕ `override item patch` をマージして使用。override に存在する属性だけが base を上書きします。

override が完全に空（差分なし）の場合、自動的に削除されます。

### 5.3 Preset / item 削除時の追従

- preset 削除 — 全 shot から該当 preset ID が剥がされる
- item 削除 — 全 shot の override から該当 item ID が剥がされる

## 6. baseRenderBox と renderBoxCorrection

### 6.1 baseRenderBox

各 preset は **baseRenderBox**（紙面基準サイズ）を持ちます。

- 初回 item を追加した時点の output size が初期値
- デフォルトは `1754 × 1240 px`
- preset ごとに独立（複数 preset で異なる紙面基準を持てる）

item の `offsetPx` はこの baseRenderBox に対する相対座標で保存されます。

### 6.2 renderBoxCorrection

shot ごとの紙面差分を補正する `renderBoxCorrection: { x, y }` を override 内に持てます。shot によって output frame の paper size / anchor が違う場合に、紙面基準の位置ズレを補正する目的です。

### 6.3 Effective offset の計算

実際の表示位置は次の式で求めます。

```
effectiveOffset.x = offsetPx.x
                  + (anchor.ax - renderBoxAnchor.ax) × (currentSize.w - baseRenderBox.w)
                  + renderBoxCorrection.x
effectiveOffset.y = offsetPx.y
                  + (anchor.ay - renderBoxAnchor.ay) × (currentSize.h - baseRenderBox.h)
                  + renderBoxCorrection.y
```

これにより、**output frame の size / anchor が変わっても、下絵は紙面基準の位置関係を保ったまま再配置**されます。

## 7. Viewport 上での直接操作

### 7.1 編集モードに入る

| キー | 動作 |
|---|---|
| `Shift+R` | Reference image 編集モードを toggle |
| `R` | Reference preview の表示を toggle（編集モードとは独立） |

編集モード中のみ、Viewport 上で item のハンドル操作が有効になります。

![Reference edit mode](../assets/screenshots/ja/reference-edit-mode.png)

### 7.2 ドラッグ操作

| 操作 | 効果 |
|---|---|
| 枠内ドラッグ | 移動（4 px 以上で drag 判定） |
| corner / edge handle | リサイズ（`Alt` で item 自身の anchor を pivot に） |
| rotation zone（枠外周） | 回転（selection の pivot 中心） |
| anchor dot | anchor（pivot 点）の編集（single selection のみ） |

multi-selection 時は、selection box ごとまとめて変換します（相対位置を保つ）。

## 8. Preview と Export の参加条件

### Preview 参加条件

以下すべてが満たされた時のみ Viewport で表示:

1. `store.referenceImages.previewSessionVisible !== false`（`R` キーの toggle）
2. `item.previewVisible !== false`
3. 画像アセットが有効（source file が存在）

### Export 参加条件

以下すべてが満たされた時のみ export output に含まれる:

1. Export セクションの **Include Reference Images** が有効（export run 単位の toggle）
2. `item.exportEnabled !== false`
3. 画像アセットが有効

### Preview と Export の独立性

preview と export は**独立した 2 つの toggle 系統**を持ちます。

- Preview: session 単位（`R`）＋ item 単位（manager）
- Export: export run 単位（Output セクション）＋ item 単位（manager）

例えば「プレビューしないが export にだけ含める」「プレビューするが export からは外す」も可能です。

## 9. 関連ショートカット

| キー | 動作 |
|---|---|
| `R` | Reference preview 表示切替 |
| `Shift+R` | Reference 編集モード切替 |
| `Alt` + resize handle | item の anchor を pivot にリサイズ |

## 10. 関連章

- 紙面サイズの概念（baseRenderBox の context）: [Output Frame と FRAME](06-output-frame-and-frames.md)
- Shot camera と preset の binding: [Shot Camera](05-shot-camera.md)
- Export での layer 参加: [Export](10-export.md)
