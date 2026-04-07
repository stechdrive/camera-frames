# Brush Thread Handoff

最終更新: 2026-04-07

## Scope

- repo: `D:\GitHub\camera-frames`
- active branch: `codex/splat-brush`
- code baseline for this memo: `5bff338` (`Add depth bar visual to brush preview cursor`)
- `main / v0.7.0` には `Brush` はまだ入っていない
- この branch の `Brush` は実装途中で、まだ merge-ready ではない

## What Exists Now

- `3DGS編集` mode の `Brush` ツール
- ray-hit 基準の円柱選択（packed array 直接アクセスで高速化済み）
- 通常 add / `Alt` subtract
- `through / depth`
- default depth `0.2m`
- drag stroke（ストローク中はレイキャストをスキップしてキャッシュ深度を使用）
- brush preview ring + depth bar（ラベルは削除済み）
- `Camera View` の ray context ずれ修正
- ブラシ中の右ドラッグ=オービット、右+Shift=パン
- レイキャスト外れ時のフォールバック深度（キャッシュ→シーン境界→固定距離）
- highlight 更新: `updateGenerator()` を毎回呼んで視覚反映を保証

関連コミット（新→旧）:

- `5bff338` `Add depth bar visual to brush preview cursor`
- `0a02e32` `Optimize brush hit loop and remove brush cursor label`
- `4e90892` `Optimize brush stroke by skipping raycast during drag`
- `4ff7125` `Wire brush stroke bindings into input router`
- `482162a` `Fix brush tool selection and highlight update`
- `58d8d21` `Improve splat brush responsiveness`
- `21a610d` `Fix camera-view splat edit ray context`

## Fixed Issues (this session)

1. **ブラシが選択できなかった**: レイキャスト外れ時にフォールバック深度を追加
2. **ハイライトが初回以降更新されなかった**: `syncAssetSelection` で `updateGenerator()` を呼ぶように修正
3. **ドラッグで塗れなかった**: `runtime-controller.js` → `bindInputRouter()` にブラシストローク関連5関数が渡されていなかった
4. **ブラシ中カメラが動かせなかった**: 右ドラッグ=オービット、右+Shift=パンを追加

## Current Problems

- 大きい splat asset ではまだ重い（O(N) ループが主因）
- `per-splat-edit-controller.js` が Vite HMR で反映されない問題あり（dev 体験の問題）
- browser QA 完全ではない

## Performance Status

最適化済み:
- ストローク中のレイキャストスキップ（`getBrushHitFromClientPointFast`）
- packed array 直接アクセス（`forEachSplat` コールバック廃止）
- through モードの深度カリング省略
- 既選択スプラットの早期スキップ（add モード）
- インライン行列変換

残りのボトルネック:
- `applySplatEditBrushHit` の O(N) ループ — 根本解決には空間インデックスが必要
- `updateGenerator()` のコスト — Spark 側は `generatorDirty = true` を設定するだけなのでフラグ自体は軽量、実際の再構築はレンダーループで遅延実行

## Next Work (priority order)

1. **空間インデックス**: uniform grid or octree で brush cylinder 内のスプラットだけ走査
2. **ストローク中の highlight 更新最適化**: `requestAnimationFrame` 単位でバッチ
3. **Box + Brush 実運用フロー QA**: Box で荒く選んで Brush で add/subtract
4. Brush が納得いくまで `Duplicate` には進まない

## Important Files

- `src/controllers/per-splat-edit-controller.js` — ブラシ本体（fallback depth, fast path, packed array loop）
- `src/engine/splat-selection-highlight.js` — ハイライト更新（`updateGenerator` 呼び出し追加）
- `src/controllers/interaction-controller.js` — 右ドラッグオービット/パン
- `src/controllers/runtime-controller.js` — ブラシバインディング配線
- `src/interactions/input-router.js` — ポインタイベントルーティング
- `src/ui/viewport-shell.js` — ブラシプレビュー ring + depth bar

## Important Notes

- `Camera View` では preview camera が off-axis projection を持つ。render-box rect との二重補正に注意
- Box 初回生成は「初回クリックで 1m box 配置」が正本
- raw selection は package save 対象ではない
- `fromHalf` を `@sparkjsdev/spark` からインポートして packed center 抽出に使用
- Vite dev 環境で `per-splat-edit-controller.js` の変更が HMR で反映されないことがある。ハードリロード + `rm -rf node_modules/.vite` でも解消しないケースあり

## Minimum QA Checklist

- `Shift+E` で `3DGS編集`
- 初回クリックで box 配置
- `Box` で荒く選択
- `Brush` で add（クリック＋ドラッグ）
- `Alt+Brush` で subtract
- drag 中に selection count と highlight が追従する
- ブラシカーソル（ring）がホバーで表示される
- depth モードで depth bar が表示される
- 右ドラッグでオービット、右+Shift でパン
- `Camera View` で click 位置と hit がずれない
- `Box -> Brush -> Transform -> Undo / Redo` が破綻しない

## Current Validation

- `npm test`: pass (120 tests)
- `npm run lint`: pass
- `npm run build`: pass
- browser smoke for `Brush`: partial — 選択・ドラッグ・ハイライト動作確認済み、パフォーマンスは改善途上
