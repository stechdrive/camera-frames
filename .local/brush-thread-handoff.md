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

- (未コミット) Fix transform post-confirm perf: LOD invalidation, matrix precompose, eliminate double-clone, remove transform mode scene helper box
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

### 1. トランスフォームの描画パフォーマンス改善（調査・一部改善済み）

**現行方式: extractSplats + 別 SplatMesh**
- ドラッグ中のハイライト追従: 動作する
- 描画コスト: 元メッシュ + プレビューメッシュの2重描画
- 確定後のカメラ回転: 改善済み（sync 228ms→3ms）だが apply+persist で ~1.2s 残存
- メモリ: 選択スプラットを丸ごとコピー

**確定後パフォーマンス — 調査結果と実施済み改善:**

1. **LOD stale data 修正済み**: `applySelectedSplatTransform` で `disposeLodSplats()` を追加。PackedSplats の LOD データ（ExtSplats）はトランスフォーム後に古い位置データを保持していた。Spark の `SplatMesh.update()` は LOD 有効時に `lodSplats` を使い packed data の変更を無視するため、LOD を破棄して正しい packed data にフォールバック
2. **transform モードの scene helper box 削除済み**: `syncSceneHelper` から transform モードの bounding box 描画を除去。ギズモで十分
3. **apply ループ最適化済み**: 変換行列を事前合成（`composeSelectedSplatTransformMatrix` + `worldMatrixInverse`）、temp オブジェクト再利用で GC 圧力削減
4. **persist の extra 二重コピー除去済み**: `clonePackedExtra` 呼び出しを削除、`createProjectFilePackedSplatSource` 内部の単一クローンに統一

**残存ボトルネック（RTX5080, ~500K選択スプラット）:**
- apply ~570ms: `setSplat()` per-splat encoding（Spark packed format）
- persist ~600ms: `createProjectFilePackedSplatSource` 内の `new Uint32Array(packedArray)` 全体コピー + SH データクローン

**さらなる最適化の候補:**
- persist の遅延化: packed data snapshot を `requestIdleCallback` で非同期実行（undo/redo との整合性要検討）
- apply: Spark packed format への直接書き込み（Spark 内部依存で fragile）
- ドラッグ中の rAF violation は extractSplats プレビューの 2重描画コスト

**worldModifier 方式 — 調査結果（不採用）:**
- `worldModifier` は Dyno ベースで `{ gsplat }` のみ受け取る。splat index にアクセスできない
- 全スプラットに一律適用されるため、選択スプラットだけの条件付き変換が困難
- splatRgba alpha にフラグを埋め込む案は recolor/rgbaDisplaceEdits 通過後に alpha が変質するため不安定

**SplatEdit API — 調査結果（不適合）:**
- SDF ベースの空間マスク + color/displace のみ
- displace は平行移動のみ（回転・スケール不可）
- per-splat-index ではなく空間領域ベース

### 3. Duplicate（複製）
- Separate の応用。選択スプラットを同じ位置にコピーして新アセットに追加

**実装方針:**
- `separateSelectedSplats` (line ~2528) をベースに `duplicateSelectedSplats` を作成
- 差分: Separate は元アセットから選択スプラットを「切り出す」（remainder で replace）が、Duplicate は元アセットをそのまま残す
- つまり Separate のうち「remainder で元を置換する」部分（line 2564-2583）と「選択を消す」部分（line 2584）を省くだけ
- 新アセット作成: `createDerivedPackedSplatSource` → `assetController.createSplatAssetFromSource` は同じ
- UI 配線: store の tool に `"duplicate"` を追加するか、コマンドとして呼べるようにする
- undo: `runHistoryTransaction("splat-edit.duplicate", ...)` で囲む
- i18n: `status.splatEditDuplicated` を追加
- 作成後、新アセットを選択状態にする（Separate と同じ flow）

**関連関数:**
- `buildSelectedSplatOperations()` — 選択状態から操作対象リスト構築
- `createDerivedPackedSplatSource(asset, indices, { label, fileName })` — packed data から新 source 作成
- `assetController.createSplatAssetFromSource(source, { insertIndex })` — scene にアセット追加
- `buildUniqueSplitLabel(label)` — ラベル生成（`buildUniqueDuplicateLabel` 的なものが必要かも）
- `buildDerivedSplatFileName(asset, suffix)` — ファイル名生成

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
- PackedSplats の `needsUpdate = true` は `maybeUpdateSource()` で source テクスチャを GPU 再アップロードする。LOD 有効時は `lodSplats` が優先されるため、packed data 変更後は `disposeLodSplats()` が必要
- `syncSceneHelper` は box ツール専用。transform モードでの selection bounds box 表示は削除済み（ギズモで十分）
- `createProjectFilePackedSplatSource` は内部で `packedArray` と `extra` をクローンするため、呼び出し側での事前クローンは不要

## Current Validation

- `npm test`: pass (120 tests)
- `npm run lint`: pass
- `npm run build`: pass
- browser smoke: ブラシ選択・ドラッグ・ハイライト・カーソル追従 動作確認済み
