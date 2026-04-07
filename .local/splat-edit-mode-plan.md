# スプラット編集モード設計メモ

最終更新: 2026-04-07

## Current Status

`main / v0.7.0` 時点で入っているもの:

- `Box`
- `Transform`
  - `Move`
  - `Rotate`
  - `Uniform Scale`
- `Delete`
- `Separate`
- 選択 highlight
- `Undo / Redo`
- `.ssproj` persistence for edited splat content
- 初回クリックでの Box 生成

`codex/splat-brush / 2026-04-07` で進めているもの:

- `Brush` 基礎実装
  - ray-hit 基準の円柱 add/subtract
  - `through / depth`
  - default depth `0.2m`
  - drag stroke
  - preview ring / label
  - `Camera View` ray context fix
  - highlight 差分更新

まだ残っているもの:

- `Brush` の performance / highlight response / browser QA 完了
- `Duplicate`
- marquee / lasso / sphere
- raw selection の package save / working save persistence
- transform preview の orbit-time performance/polish

## Product Position

- `Splat Edit` は通常の scene object transform と別 mode
- `Viewport perspective / Camera View / Viewport orthographic` のどこからでも使える
- `Shot` document には混ぜない
- raw な splat selection は `.ssproj` に保存しない

## Core Model

分ける state は次の 3 つ。

1. `edit scope`
   - どの splat asset 群の中を編集対象にするか
2. `splat selection`
   - scope 内のどの splat を選択中か
3. `edit tool state`
   - box / brush / hover / preview volume

## v1 Entry And Exit

入口:

- 左ツールバーの `Splat Edit`
- shortcut は当面 `Shift+E`

起動時の scope 解決:

1. scene selection に含まれる `kind === "splat"` asset 群
2. なければ remembered scope
3. どちらも無ければ入らず、「先に 3DGS を選択」

終了時:

- current tool preview / hover / temporary session は捨てる
- remembered scope は残す

## UI Contract

### Left Toolbar

- `Splat Edit` の入退出を置く
- active 中も camera navigation は許可
- active 中は reference / transform / pivot / measurement と同時 active にしない

### HUD

現在の v1 UI は Scene tab ではなく viewport HUD を正本にしている。

- scope asset 数
- selected splat 数
- current tool
- box center / size
- clear / delete / separate
- transform tool 切替
- box 未配置時の `クリックでBoxを配置`

## v1 Tools

### Box

- world-axis aligned box
- 回転なし
- 操作:
  - center move
  - X / Y / Z 個別サイズ変更
  - uniform scale
- 通常: 範囲内 splat を選択へ追加
- `Alt`: 範囲内 splat を選択から削除

### Brush

基礎実装ありだが未完。

- 画面 ray hit を中心に塗る
- transformed splat center を円柱判定する
- 通常: add
- `Alt`: subtract
- brush size は world-space の full size として持つ
- default depth mode は `depth`
- default depth は `0.2m`

depth mode:

- `through`
  - hit point から視線方向へ無限貫通
- `depth`
  - hit point から奥方向へ `depth` だけ伸びる有限円柱

現状 UI:

- brush size
- depth mode: `through / depth`
- depth
- preview ring / label
- `ドラッグで追加 / Alt+ドラッグで除外`

現状の未解決:

- 大きい splat asset でかなり重い
- selection count に対して highlight 反映が遅れることがある
- browser 実機で「塗る感」がまだ不足している
- camera lock は改善したが deterministic QA がまだ足りない

## Selection Rule

v1 の判定対象は `transformed splat center` を基準にする。

- covariance / splat ellipse は v1 では使わない
- 見た目完全一致より、安定で予測可能な選択を優先する

## Selection Operations

v1 で expose するのは 2 つだけ。

- `add`
- `subtract`

`Alt` 押下で subtract に切り替える。

## View Contract

選択は必ず active edit view の canonical context を使う。

- active camera
- active render rect
- screen -> NDC
- ray / volume 生成

Camera View では:

- preview を描いている実 camera を使う
- off-axis projection を正にする
- render-box 基準の pointer 座標を使う

## Persistence

### Package Save

- raw splat selection は保存しない
- content-bearing な編集結果だけを保存対象にする

### Working Save

raw splat selection 自体はまだ保存しない。runtime-only の box/scope/tool 状態は working-save 復元の候補として残しているが、content-bearing な正本は edited splat content のみ。

### Runtime Only

- mode active
- scope asset ids
- remembered scope asset ids
- current tool
- current splat selection
- brush preview / box preview
- hover

## Edit Actions

現在入っているもの:

- `Delete`
- `Separate`
- `Clear Selection`
- `Transform`

次に入れるもの:

- `Duplicate`

ルール:

- `Delete` で asset が空になったら asset 自体も削除
- `Separate` は source asset ごとに分離

## Undo Contract

現状でも raw selection 自体は `Ctrl+Z` 対象外。

- undoable:
  - transform
  - delete
  - separate
- runtime-only:
  - current splat selection
  - box / brush preview

## Controller Ownership

- `src/controllers/per-splat-edit-controller.js`
  - mode entry/exit
  - remembered scope
  - current tool
  - selection owner
  - tool dispatch

新ロジックは `src/controller.js` に戻さない。

## Next Steps

1. `Brush` を完成させる
2. `Duplicate`
3. transform preview の orbit-time performance 改善
4. splat-edit HUD / discoverability polish
