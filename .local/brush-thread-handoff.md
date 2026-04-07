# Brush Thread Handoff

最終更新: 2026-04-07

## Scope

- repo: `D:\GitHub\camera-frames`
- active branch: `codex/splat-brush`
- code baseline for this memo: `58d8d21` (`Improve splat brush responsiveness`)
- `main / v0.7.0` には `Brush` はまだ入っていない
- この branch の `Brush` は実装途中で、まだ merge-ready ではない

## What Exists Now

- `3DGS編集` mode の `Brush` ツール
- ray-hit 基準の円柱選択
- 通常 add / `Alt` subtract
- `through / depth`
- default depth `0.2m`
- drag stroke
- brush preview ring / label
- `Camera View` の ray context ずれ修正
- brush tool 切替時の navigation resync
- highlight 更新の差分化

関連コミット:

- `6128a18` `Add initial per-splat brush selection`
- `e4f89f0` `Refine splat brush stroke workflow`
- `a4b538c` `Fix splat brush input fallback and nav lock`
- `21a610d` `Fix camera-view splat edit ray context`
- `58d8d21` `Improve splat brush responsiveness`

## Current Problems

- まだ「ブラシで塗る」体感になっていない
- 大きい splat asset ではかなり重い
- selection count は増えても、緑 highlight の反映が視覚的に遅れることがある
- browser 実機では brush stroke の最終 UX が未確認
- camera lock は改善したが、完全に deterministic とまでは確認できていない

## Likely Cost Centers

- `applySplatEditBrushHit()` が stroke の各 sample ごとに scope 内の全 splat を走査する
- 各 splat で transformed center の world-space 判定をしている
- highlight は差分更新にしたが、texture/updateGenerator 系の実コストはまだ重い可能性がある

つまり現状の主要コストは:

`O(scope splat count × stroke sample count)`

## Important Files

- `src/controllers/per-splat-edit-controller.js`
- `src/engine/splat-selection-highlight.js`
- `src/engine/splat-edit-scene-helper.js`
- `src/interactions/input-router.js`
- `src/controllers/interaction-controller.js`
- `src/ui/viewport-shell.js`

参照になる既存実装:

- `src/engine/view-interaction-context.js`
- `src/controllers/measurement-controller.js`

## Important Notes

- `Camera View` では preview camera が off-axis projection を持っている
- そのため per-splat edit 側でさらに `render-box` rect を NDC に使うと二重補正になって ray がずれる
- いまは `Camera View` でも preview camera + viewport rect を使う実装に戻してある
- Box 初回生成は「mode 突入時 auto spawn」ではなく「初回クリックで 1m box 配置」が正本
- `Delete / Separate / Transform` の controller 境界は戻さない
- raw selection は package save 対象ではない

## Recommended Next Work

1. browser 実機で `Brush` の重さを再確認する
2. `applySplatEditBrushHit()` の前段に空間 culling を入れる
3. stroke 中の sample 数と highlight 更新頻度を見直す
4. `Box` で荒く選んで `Brush` で add/subtract する実運用フローで QA する
5. Brush が納得いくまで `Duplicate` には進まない

## Candidate Directions

- asset ごとの center bounds で brush cylinder と交差しない asset を先に弾く
- stroke 中は highlight の即時更新を間引くか、`requestAnimationFrame` 単位にまとめる
- sample 間隔を brush 半径依存からもう少し粗くする
- 将来的には per-asset spatial index を持つ

## Minimum QA Checklist

- `Shift+E` で `3DGS編集`
- 初回クリックで box 配置
- `Box` で荒く選択
- `Brush` で add
- `Alt+Brush` で subtract
- drag 中に selection count と highlight が自然に追従する
- `Camera View` で click 位置と hit がずれない
- `Brush` 中に意図せず camera が動かない
- `Box -> Brush -> Transform -> Undo / Redo` が破綻しない

## Current Validation

- `npm test`: pass
- `npm run lint`: pass
- `npm run build`: pass
- browser smoke for `Brush`: not passed yet
