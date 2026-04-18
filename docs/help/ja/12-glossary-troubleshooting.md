---
id: glossary-troubleshooting
title: 用語集とトラブルシューティング
section: 12
lang: ja
related-files:
  - docs/camera_frames_requirements.md
  - docs/legacy-ssproj-compatibility.md
  - docs/CameraFramesFeatures.md
last-updated: 2026-04-18
---

# 用語集とトラブルシューティング

## 1. 用語集

各用語は関連の強いカテゴリで並べています。

### プロジェクトと保存

- **Project** — workspace、ショットカメラ、scene assets、下絵 をまとめた単位。`.ssproj` ファイルと 作業保存 で永続化される。[→ 3](03-open-save.md)
- **`.ssproj`** — CAMERA_FRAMES のプロジェクトパッケージ（ZIP 形式）。現行フォーマット `camera-frames-project` version 3。[→ 3](03-open-save.md)
- **作業保存** — ブラウザの IndexedDB に保存される作業状態。`Ctrl+S`。同じブラウザでの作業再開用。[→ 3](03-open-save.md)
- **パッケージ保存** — `.ssproj` ファイルをダウンロードして保存。`Ctrl+Shift+S`。別環境へ持ち運び / バックアップ用。[→ 3](03-open-save.md)
- **projectId / packageRevision / packageFingerprint** — 作業保存 と `.ssproj` の対応を判定する 3 つの ID。全て一致した時のみ自動復元される。[→ 3](03-open-save.md)
- **Legacy `.ssproj`** — 旧 CAMERA_FRAMES の `document.json` ベースの `.ssproj`。`manifest.json` がない。現行フォーマットで開けない場合に fallback import される。[→ 3](03-open-save.md)

### カメラ

- **Shot camera** — 構図ごとに保存するカメラオブジェクト。pose / lens / clipping / 用紙 / フレーム / 下絵 binding / 書き出し設定を持つ。常に perspective。[→ 5](05-shot-camera.md)
- **ビューポート camera** — エディタ用の作業カメラ。ショットカメラ とは別 owner。orthographic に切替可能。[→ 5](05-shot-camera.md)
- **カメラモード / ビューポートモード** — ビューポート の描画モード。前者は active shot の視点、後者は自由視点。[→ 2](02-ui-layout.md), [→ 5](05-shot-camera.md)
- **Equivalent MM** — 35mm 換算の焦点距離。ショットカメラ の lens 設定で使われる。14〜200 mm。[→ 5](05-shot-camera.md)
- **ロールロック** — orbit 時に roll（forward 軸回転）を固定する設定。水平線を傾けたくない時に ON。[→ 5](05-shot-camera.md)
- **書き出し name** — ショットカメラ ごとの出力ファイル名テンプレート。`%cam` 変数で shot name に展開される。[→ 5](05-shot-camera.md)

### 紙面と構図

- **用紙** — 紙面サイズ（width × height）と アンカー を持つ、書き出し の投影契約そのもの。カメラモード で 用紙枠 として表示される。[→ 6](06-output-frame-and-frames.md)
- **紙面サイズ** — 用紙 の幅と高さ。基準 1754 × 1240 px に対する比率。100%〜912%（幅）/ 1290%（高さ）。[→ 6](06-output-frame-and-frames.md)
- **アンカー** — 紙面の基準点。3 × 3 グリッドで 9 点のうちから選ぶ。paper resize 時の固定点として機能。[→ 6](06-output-frame-and-frames.md)
- **Custom frustum** — アンカー と中心を固定したまま 紙面サイズ だけ変えられる CAMERA_FRAMES の projection 仕組み。[→ 6](06-output-frame-and-frames.md)
- **Render box** — カメラモード で ビューポート 上に表示される紙面枠。8 リサイズハンドル + 4 パンエッジ + アンカー dot + meta ラベル。[→ 6](06-output-frame-and-frames.md)
- **フレーム** — 紙面上に配置する矩形。1 shot につき最大 20 個。構図の注目領域を示す。[→ 6](06-output-frame-and-frames.md)
- **フレームマスク** — フレーム の外側を暗くする機能。mode (off/all/selected) × shape (bounds/軌道) × opacity の組合せ。[→ 6](06-output-frame-and-frames.md)
- **軌道** — 複数 フレーム の中心を繋ぐ path。line / spline。mask shape や 書き出し の軌道線に使われる。[→ 6](06-output-frame-and-frames.md)
- **Spline Node Mode** — spline 軌道 時の各 フレーム のノードモード。auto / corner / mirrored / free。[→ 6](06-output-frame-and-frames.md)
- **軌道編集トグル** — runtime-only の editor state。ON で ビューポート 上に 軌道 handle が表示される。[→ 6](06-output-frame-and-frames.md)

### シーンアセット

- **Scene asset** — 3D シーンに配置する個別オブジェクト。`スプラット` か `model` の 2 種類。[→ 4](04-scene-assets.md)
- **スプラット** — Gaussian splatting アセット。`.ply` / `.spz` / `.splat` / `.kSplat` / `.sog` / `.rad` / `.zip`。スプラット編集 対応。[→ 4](04-scene-assets.md)
- **Model** — glTF / glb モデル。スプラット編集 非対応。[→ 4](04-scene-assets.md)
- **baseScale / worldScale** — asset の scale は `baseScale × worldScale` で計算される。import 時の scale（baseScale）を保ったまま倍率（worldScale）だけ変更する設計。[→ 4](04-scene-assets.md)
- **Content Transform** — asset の wrapper と content object の 2 段階構造の内、content object 側の transform。通常は `Apply Transform` で bake される。[→ 4](04-scene-assets.md)
- **Working pivot** — 変形ツールの pivot（回転 / スケールの中心）。ピボットツールで編集。[→ 4](04-scene-assets.md)
- **書き出し role** — asset の 書き出し時の役割。`beauty`（通常）/ `omit`（別チャネル）。[→ 4](04-scene-assets.md)
- **Mask group** — asset を論理的にグループ化する任意文字列。[→ 4](04-scene-assets.md)

### スプラット編集

- **スプラット編集** — スプラット 内の個別 スプラット を選択・削除・分離・複製・変形するモード。`Shift+E`。[→ 9](09-per-splat-edit.md)
- **Raw selection** — 編集セッション中のみ存在する スプラット 選択状態。runtime-only で save されない。[→ 9](09-per-splat-edit.md)
- **Separate** — 選択 スプラット を別アセットとして切り出す操作。新アセットは元の直上に挿入される。[→ 9](09-per-splat-edit.md)
- **Box / Brush / Transform** — スプラット編集 の 3 つのツール。[→ 9](09-per-splat-edit.md)

### リファレンス画像

- **下絵** — カメラビュー 上に重ねる下絵。プリセット × item × shot binding の 3 層構造。[→ 7](07-reference-images.md)
- **プリセット** — 構図ごとに使い分ける下絵セット（複数 item のコンテナ）。[→ 7](07-reference-images.md)
- **`(blank)` プリセット** — 「下絵セットを使っていない」状態を表す空 プリセット。削除不可。[→ 7](07-reference-images.md)
- **baseRenderBox** — 各 プリセット が持つ紙面基準サイズ。item の offsetPx はこの基準での相対座標。[→ 7](07-reference-images.md)
- **renderBoxCorrection** — shot ごとの紙面差分補正。ショットカメラ の override に格納される。[→ 7](07-reference-images.md)
- **Per-shot override** — 同じ プリセット を複数 shot で共有しつつ、shot ごとに item 差分をもつ仕組み。[→ 7](07-reference-images.md)
- **Front / Back group** — reference item の前後位置。シーンの前 / 後ろに描画される。[→ 7](07-reference-images.md)
- **Preview visible / 書き出し enabled** — item ごとに独立した 2 つの toggle。preview と 書き出し の参加条件に関わる。[→ 7](07-reference-images.md)

### ビューポート とツール

- **パイメニュー** — 中ボタンドラッグで展開する 10 アクションのラジアルメニュー。[→ 8](08-viewport-tools.md)
- **Tool rail** — 画面左のツールパネル。ドラッグ可能。[→ 2](02-ui-layout.md), [→ 8](08-viewport-tools.md)
- **Axis gizmo** — orthographic 時に画面隅に出る軸方向表示ウィジェット。[→ 8](08-viewport-tools.md)
- **Transform gizmo** — Transform / ピボットツール使用中に表示される、移動 / 回転 / スケール操作用のハンドル群。[→ 8](08-viewport-tools.md)
- **アンカー orbit** — カーソルが指すヒット点を中心に orbit する操作。`Ctrl +` 左ドラッグ または 右ドラッグ。[→ 8](08-viewport-tools.md)
- **レンズ調整 / ロール調整** — パイメニュー 経由で入る lens / roll のリアルタイム調整モード。Escape で抜ける。[→ 5](05-shot-camera.md)

### 書き出し

- **書き出し対象** — 出力対象の範囲。`current` / `all` / `selected`。[→ 10](10-export.md)
- **書き出し形式** — `png` または `psd`。[→ 10](10-export.md)
- **Grid Layer Mode** — PSD 出力時の grid layer の位置。`bottom`（Render より下） / `overlay`（Render より上）。[→ 10](10-export.md)
- **Model Layers / スプラット Layers** — PSD 書き出し で model / スプラット を個別レイヤーに分離するオプション。[→ 10](10-export.md)
- **Include Reference Images** — 書き出し 実行 単位で 下絵 を含めるかの toggle。[→ 10](10-export.md)
- **軌道 書き出し Source** — PSD 軌道 layer の軌道起点。`none` / `center` / 4 corner。[→ 10](10-export.md), [→ 6](06-output-frame-and-frames.md)
- **LoD settle warmup** — スプラット アセットがある場合、書き出し前に最低 2 pass の warmup が入る。[→ 10](10-export.md)

## 2. トラブルシューティング

### 2.1 ファイルを開く / Import

#### Q. ドロップしても何も起きない

- ファイル拡張子を確認してください。対応形式は [3.1.2](03-open-save.md#12-対応ファイル形式) を参照
- 大きな `.zip` / `.ssproj` の場合、展開に時間がかかっている可能性があります（progress overlay が出るはず）

#### Q. Remote URL からロードできない

- プロトコルが `http://` または `https://` であること
- CORS の制約で URL にアクセスできない場合があります（サーバー側で Access-Control-Allow-Origin が必要）

#### Q. `?load=` の URL が自動 import されない

- HTTPS 要件や private host などの安全性検証に引っかかっている可能性があります。警告ダイアログを確認してください
- URL が許可された場合も、**Continue Load** を押して確認するまで import は走りません

#### Q. 旧 `.ssproj` を開くとエラーが出る / 一部が欠ける

- 現行フォーマットで開けない場合、自動的に legacy fallback が試行されます
- `document.json` ベースの旧形式は `cameraFramesState` / `cameraPresets` / `フレーム[]` / `models[]` / `スプラット[]` を読みます。この構造から外れている場合は読めません
- 詳細は [legacy-ssproj-compatibility.md](../../legacy-ssproj-compatibility.md) を参照

#### Q. PSD の import で layer が一部出てこない

- 子を持つ folder layer は抽出されません（leaf layer のみ個別 item として展開されます）

### 2.2 保存 / 復元

#### Q. `.ssproj` を開いたが、前の編集内容が復元されない

自動復元には次の 3 つが**全て**一致する 作業保存 が必要です。

- `projectId`
- `packageRevision`
- `packageFingerprint`

`.ssproj` を別のバージョンで上書きした後、古い 作業保存 は一致しなくなり、使われません。

#### Q. `Ctrl+S` を押したのにファイルがダウンロードされた

新規プロジェクト（`projectId` / `packageFingerprint` が未設定）では、`Ctrl+S` が **パッケージ保存 にフォールバック**します。意図せず パッケージ保存 したくない場合は、まず `.ssproj` を作ってから再度 `Ctrl+S` すると 作業保存 になります。

#### Q. `PKG` badge が消えない

`PKG` は「作業保存 より package（`.ssproj`）が古い」状態です。`Ctrl+Shift+S` で パッケージ保存 すると消えます。

#### Q. `*` badge が残っている

作業保存 が未保存の状態です。`Ctrl+S` で保存すれば消えます。

### 2.3 カメラ / 構図

#### Q. Shot camera を切替えても ビューポート の視点が変わらない

現在のモードが **ビューポートモード** になっている可能性があります。パイメニュー の **カメラ/ビューポート** で カメラモード に切替えてください。

#### Q. カメラプロパティ の Roll が編集できない

ロールロック が ON でも Roll 自体は編集可能です。ただし orbit 中は roll が抑制されます。orbit で roll を変えたいなら ロールロック を OFF にしてください。

#### Q. orthographic で ショットカメラ を保存したい

orthographic は **ビューポート-only** です。ショットカメラ には昇格しません。orthographic で「スナップショット的な視点」を保存したい場合、ビューポート で orthographic のまま構図を作り、その状態を現行の仕様では ショットカメラ には保存できません（将来の拡張対象）。

### 2.4 用紙 / フレーム

#### Q. 紙面サイズ を変えたら フレーム の位置がずれた

アンカー と中心が固定される custom frustum の仕組みにより、フレーム は紙面基準で remap されます。見た目が「ずれた」ように見えても、紙面上の相対位置は保たれているはずです。アンカー を変えると、どの点が固定されるかが変わります。

#### Q. フレーム を増やしたら フレームマスク が 軌道 に変わった

これは意図した動作です。1 → 2 フレーム に増えた瞬間、mask shape が `bounds` なら `軌道` に自動昇格します（load 時を除く）。trajectoryExportSource も自動で最適な corner を選びます。

#### Q. 軌道 handle が ビューポート に出ない

軌道編集トグル が OFF か、軌道 mode が `line` になっている可能性があります。spline mode にして、フレーム セクションの 軌道 Edit を ON にしてください。

### 2.5 下絵

#### Q. 下絵 が ビューポート に表示されない

次を確認してください。

- `R` キーで preview が有効になっているか（左上 HUD やツールバーの状態）
- active プリセット に item が入っているか
- 該当 item の **preview visible** が ON か
- 該当 item の画像ソースが読み込めているか（壊れた file path ではないか）

#### Q. 下絵 の位置が ショットカメラ ごとに違ってしまう

per-shot override が効いています。shot ごとに item の位置を override している場合、他の shot では base 値が使われます。override したくない場合は、下絵プロパティ で値を元に戻すか、ショットカメラ に対する override を手動でリセットしてください。

#### Q. `(blank)` プリセット に import したのに、別の プリセット ができていた

これは意図した動作です。`(blank)` 選択中に import すると、新しい プリセット が自動作成され、そこに import されます（`(blank)` 自体を汚さないため）。

### 2.6 ビューポート とツール

#### Q. パイメニュー が出ない

- テキスト入力にフォーカスが当たっていると パイメニュー は展開しません
- 中ボタンがないマウスの場合、タッチデバイスでは 320 ms 長押しで展開します

#### Q. Transform gizmo が出ない

- 変形ツール（`T`）に切替わっているか
- アセットが選択されているか
- 選択アセットが visible か（visible でないと gizmo は出ない）

#### Q. Measurement の Enter でスケールが掛からない

次の全てが満たされる必要があります。

- 2 点とも設定されている
- アセットが選択されている
- 入力値が有限数かつ > 0

### 2.7 スプラット編集

#### Q. `Shift+E` を押しても スプラット編集 に入れない

scope となる スプラット アセットが 0 個の場合、スプラット編集 は起動できません。スプラット アセットを 1 つ以上シーンに追加してから再試行してください。

#### Q. model アセットを スプラット編集 できない

スプラット編集 は **スプラット アセットのみ**対応です。model（glTF / glb）には適用できません。

#### Q. モードを抜けたら選択が消えた

仕様です。raw selection は **runtime-only** で、モードを抜けた時点でリセットされます。編集結果（Delete / Separate / Duplicate / Transform）は persistent に反映されます。

#### Q. Separate と Duplicate の違いは？

- **Separate** — 選択 スプラット を**元アセットから抜いて**新アセットに移す（元が減る）
- **Duplicate** — 選択 スプラット を**コピーして**新アセットを作る（元は変わらない）

どちらも新アセットは元の直上に挿入されます。

### 2.8 書き出し

#### Q. Download Output ボタンが押せない

- 他の 書き出し が実行中（`exportBusy` フラグ）
- `selected` target で 1 つも shot が選ばれていない

後者の場合、target を `current` / `all` に変えるか、shot を少なくとも 1 つチェックしてください。

#### Q. PSD を開いたら Mask レイヤーが見えない

Mask レイヤーは意図的に **hidden = true** で出力されます。Photoshop で visibility を ON にすれば見えます（opacity 0.8）。

#### Q. PNG の色が PSD と少し違う

CAMERA_FRAMES の PNG は **linear-space composite**（sRGB を線形に変換して合成、sRGB に戻す）で合成されます。通常の sRGB 合成とは色味が微妙に違う場合があります（linear の方が物理的に正確）。

#### Q. 書き出し が途中で止まる

- LoD settle の warmup が `maxWaitMs = 1500 ms` でタイムアウトしている可能性があります。大量の スプラット アセットがある場合に発生しやすい
- メモリ不足の場合もあります（特に large スプラット + PSD スプラット Layers ON）

### 2.9 履歴 / Undo

#### Q. `Ctrl+Z` で戻せない

- テキスト入力中はブラウザ側の undo が優先されます
- そもそも history に記録されない runtime-only 操作（軌道編集トグル、パイメニュー open など）は undo 対象外

## 3. 関連リファレンス

- [CAMERA_FRAMES 仕様正本](../../camera_frames_requirements.md)
- [機能一覧と回帰観点](../../CameraFramesFeatures.md)
- [Legacy `.ssproj` 互換契約](../../legacy-ssproj-compatibility.md)
- [全ショートカット一覧](11-shortcuts.md)

## 4. 問い合わせ

アプリ本体の不具合報告や機能要望は、repo の Issue / handoff.md などを参照してください（プロジェクト運用に従う）。
