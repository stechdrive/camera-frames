# RAD Streaming Investigation

最終更新: 2026-04-25

この文書は、`.ssproj` 内蔵 RAD streaming の調査結果と現在の実装境界を記録する。
shared contract の正本は `docs/camera_frames_requirements.md` と `src/` / `test/`。

## 結論

- 実用対象は single-file `.rad` ではなく、`.ssproj` ZIP 内に stored entry 群として持つ `radBundle`。
- `.ssproj` は単体ファイルのまま維持し、外部 RAD sidecar は要求しない。
- RAD/PagedSplats は read-only streaming 表示 path として扱う。
- per-splat edit は FullData/PackedSplats へ materialize してから行う。
- 現 baseline の `@sparkjsdev/spark@2.0.0` npm package は RAD writer / `build-lod` encoder を public API として公開していないため、標準 Quality 保存での RAD 生成はまだ disabled。

## Spark 2.0 Flow

Spark 2.0 の読み込み側で成立する flow は次の形。

```js
const pagedSplats = new PagedSplats({
	rootUrl,
	fileType: SplatFileType.RAD,
});
const mesh = new SplatMesh({ paged: pagedSplats });
```

`blob:` URL や Service Worker の仮想 URL は拡張子推定に頼れないため、
`fileType: SplatFileType.RAD` を明示する。

`fileBytes` は全量 materialize 済みになるため、モバイル向け streaming 目的には使わない。

## Implemented Surface

- `raw-packed-splat.radBundle`
  - `kind: "spark-rad-bundle"`
  - `version: 1`
  - `root: { path, name, size, sha256 }`
  - `chunks: Array<{ path, name, size, sha256 }>`
  - `sourceFingerprint`, `bounds`, `sparkVersion`, `build`
- `.ssproj` package writer
  - RAD root / chunk entries を stored/uncompressed で保存する。
  - source 上の `bytes` または `Blob` から archive entry を作る。
- `.ssproj` package reader
  - stored ZIP entry を `Blob.slice()` で lazy Blob として保持する。
  - RAD bundle がある raw-packed source は root `packedArray` を先に bytes 化しない。
  - stored entry 条件や `sourceFingerprint` が崩れている RAD bundle は使わず、FullData path へ fallback する。
  - FullData gate が必要な時だけ captured Blob から root FullData を materialize する。
- Runtime loader
  - Service Worker に session token 付きで RAD bundle Blob 群を登録する。
  - Spark には same-origin URL を渡し、Service Worker が `Range` request へ `206 Partial Content` で返す。
  - Service Worker / Range / RAD decode / PagedSplats 初期化に失敗した時は existing FullData path に fallback する。
- Quality save hook
  - `buildSparkRadBundleFromPackedSplats({ packedArray, extraArrays, splatEncoding, numSplats, bounds, quality })` の入口を持つ。
  - 実装本体は `@sparkjsdev/spark@2.0.0` npm に RAD encoder が無いため現在 stub。
  - fake builder 注入テストでは Quality save 前に `radBundle` が source に付き、`.ssproj` に保存されることを確認している。

## Fixture / Smoke

- `test/fixtures/rad/tiny-splats.ply`
- `test/fixtures/rad/tiny-splats-lod.rad`
- `test/fixtures/rad/rad-streaming-smoke-page.js`
- `scripts/rad-streaming-smoke.mjs`
- `npm run test:rad-streaming`

この smoke は Chrome/CDP と Vite dev server を使い、通常の `npm test` には混ぜない。
`blob:` Range の基礎確認に加えて、実装と同じ Service Worker 登録 URL から
`Range` fetch し、その URL を Spark `PagedSplats` に渡す。

2026-04-25 の確認結果:

- `blob:` URL に対する `Range: bytes=0-31` は `206 Partial Content` になった。
- Service Worker に登録した RAD bundle Blob に対する `Range: bytes=0-31` も
  `206 Partial Content` になった。
- Spark は RAD header 取得で `bytes=0-65535` を投げた。
- fixture は小さいため body は RAD 全体になったが、chunk fetch は `bytes=1336-3399` として観測できた。
- `PagedSplats({ rootUrl, fileType: SplatFileType.RAD })` + `SplatMesh({ paged })` で 1 frame 以上 render できた。

## Per-splat Edit

直接 RAD/PagedSplats を編集する path は採用しない。

理由:

- 既存 per-splat pipeline は `PackedSplats.packedArray`, `extractSplats`, mutation/restore API に依存している。
- Spark `PagedSplats` はページング表示用で、同等の per-splat mutation API を持たない。
- RAD は authoritative source ではなく FullData から再生成できる cache として扱う方が保存互換を壊しにくい。

したがって、RAD-backed asset で edit に入る時は `ensureFullDataForSplatAssets` を通し、
mesh を `PagedSplats` から `PackedSplats` へ swap する。編集後の source は RAD bundle を保持せず、
次回 Quality save の RAD build worker で再生成する。

## Remaining Work

- Spark 2.0 build-lod 相当の browser worker encoder を追加する。
- chunked RAD 生成時に RAD meta 内の chunk filename と `.ssproj` 内 entry name を一致させる。
- export 時の paged RAD readiness gate と FullData fallback を、実 RAD bundle で browser smoke に追加する。
- Service Worker Range failure を browser smoke で明示的に検証する。
- 大規模 `.ssproj` で PC / mobile のメモリ使用量と初回表示時間を比較する。
