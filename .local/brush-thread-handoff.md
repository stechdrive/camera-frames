# Brush Thread Handoff

最終更新: 2026-04-08

## Scope

- repo: `D:\GitHub\camera-frames`
- active branch: `codex/splat-brush`
- code baseline for this memo: `686bdc8` (`Tune brush sample spacing to 1.5x diameter`)
- `main / v0.7.0` には `Brush` はまだ入っていない
- この branch の `Brush` は実装途中で、まだ merge-ready ではない

## What Exists Now

### Brush ツール
- スクリーンスペースのブラシサイズ（デフォルト 30px）
- ワールド半径はヒット深度 × FOV から逆算
- ray-hit 基準の円柱選択（packed array 直接アクセス + spatial index）
- 通常 add / `Alt` subtract / `through` / `depth` モード
- drag stroke: 最終サンプルのみフル raycast、中間は深度平面交差
- サンプル間隔: ブラシ直径 × 1.5 ごと（スプレー感）
- カーソル（ring）はヒット計算の前に即更新 → マウス追従が軽い
- ブラシ中の右ドラッグ=オービット、右+Shift=パン
- depth bar（デフォルト非表示、`brushDepthBarVisible` で有効化可能）
- Vite HMR: controllers/engine 変更時に full reload を強制

### Per-splat 編集全般
- Box 選択、Transform（Move/Rotate/Scale）、Delete、Separate
- Undo/Redo
- 選択ハイライト（RGBA テクスチャ + `updateGenerator()`）

## 関連コミット（新→旧、このセッション分）

- `686bdc8` Tune brush sample spacing to 1.5x diameter
- `b817355` Move brush cursor update before hit computation in drag
- `d88a11f` Increase brush sample spacing to brush diameter
- `3297f56` Use depth plane for intermediate brush samples, raycast only on last
- `932e586` Restore per-sample raycast during brush drag
- `c895c7a` Fix brush drag depth by using camera-forward depth plane
- `148b701` Fix brush drag not painting by removing rAF highlight deferral
- `d9f34a3` Switch brush from world-space to screen-space sizing
- `797e301` Force full reload for controller/engine file changes
- `bf6ea0d` Add spatial index tests and ignore .claude directory
- `9c0ce86` Default brush depth bar to hidden, keep as opt-in feature
- `482162a` Fix brush tool selection and highlight update
- `4ff7125` Wire brush stroke bindings into input router

## Next Work (priority order)

### 1. トランスフォーム確定後のカメラ回転パフォーマンス
- **現状**: extractSplats 方式でハイライト追従しながらの移動は動作している
- **問題**: 選択スプラットをハイライトした状態で移動確定後、カメラを回すと描画パフォーマンスが悪い
- **調査方針**: プレビューメッシュの破棄/再構築タイミング、確定後に残る余計な SplatMesh、ハイライト RGBA テクスチャの状態などを確認

### 3. Duplicate（複製）
- Separate の応用。選択スプラットを同じ位置にコピーして新アセットに追加
- トランスフォームが安定してから着手

## Performance Architecture

```
pointermove
  ├─ syncBrushPreviewFromPointer(clientX, clientY)  ← 即座（DOM更新のみ）
  │
  └─ for each sample (間隔: ブラシ直径×1.5):
       ├─ 中間サンプル: getBrushHitFromClientPointFast（深度平面交差、軽い）
       └─ 最終サンプル: getBrushHitFromClientPoint（WASM raycast、表面追従）
            └─ applySplatEditBrushHit
                 ├─ ensureBrushSpatialIndex（lazy uniform grid）
                 ├─ getBrushIndexQueryCandidates（grid cell query, O(k)）
                 └─ syncSelectionHighlight → updateGenerator()
```

## Important Files

- `src/controllers/per-splat-edit-controller.js` — ブラシ本体 + spatial index + transform
- `src/engine/splat-selection-highlight.js` — ハイライト RGBA テクスチャ
- `src/engine/splat-transform-preview.js` — トランスフォームプレビュー（extractSplats + 別 SplatMesh 方式）
- `src/controllers/interaction-controller.js` — 右ドラッグオービット/パン
- `src/controllers/runtime-controller.js` — バインディング配線
- `src/interactions/input-router.js` — ポインタイベントルーティング
- `vite.config.js` — HMR force reload 設定

## Important Notes

- `Camera View` では preview camera が off-axis projection を持つ。render-box rect との二重補正に注意
- `fromHalf` を `@sparkjsdev/spark` からインポートして packed center 抽出に使用
- `brushSize` store 値はピクセル単位（旧：メートル単位）
- Vite HMR で `per-splat-edit-controller.js` の変更が反映されない問題は force reload plugin で解決済み
- `updateGenerator()` は `generatorDirty = true` を設定するだけ（軽い）。実際の再構築はレンダーループで遅延実行
- rAF バッチハイライトは廃止（メインスレッド占有中に rAF が実行されない問題があった）

## Current Validation

- `npm test`: pass (120 tests)
- `npm run lint`: pass
- `npm run build`: pass
- browser smoke: ブラシ選択・ドラッグ・ハイライト・カーソル追従 動作確認済み
