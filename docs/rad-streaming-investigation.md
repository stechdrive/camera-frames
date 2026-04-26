# RAD Streaming Investigation

最終更新: 2026-04-26

この文書は、`.ssproj` 内蔵 RAD streaming の調査結果と現在の実装境界を記録する。
shared contract の正本は `docs/camera_frames_requirements.md` と `src/` / `test/`。

## 結論

- 実用対象は single-file `.rad` ではなく、`.ssproj` ZIP 内に stored entry 群として持つ `radBundle`。
- `.ssproj` は単体ファイルのまま維持し、外部 RAD sidecar は要求しない。
- RAD/PagedSplats は read-only streaming 表示 path として扱う。
- per-splat edit は FullData/PackedSplats へ materialize してから行う。
- Quality 保存では、既存 FullData から作った Spark LoD を RAD bundle 化し、生成できた asset だけ `.ssproj` 内へ stored entry として同梱する。
- RAD 生成は asset 単位の best-effort。失敗した asset は `lodSplats` だけ保存し、既存 Quality `.ssproj` 保存を止めない。

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
  - `buildSparkRadBundleFromPackedSplats({ packedArray, extraArrays, splatEncoding, numSplats, bounds, quality, lodSplats })` が module worker を lazy load する。
  - `src/engine/rad-encoder-wasm-rs/` の Rust/WASM encoder が RAD root / chunk bytes を生成する。
  - Quality save pipeline が先に Spark `PackedSplats.createLodSplats({ quality: true })` を実行し、`lodSplats` を worker へ渡す。`lodSplats.extra.lodTree` がある時は worker 内で LoD を再計算しない。
  - `lodSplats` が渡されない単体呼び出しでは、worker 内で Spark public API の `PackedSplats.createLodSplats({ quality })` を呼び出してから RAD encode する。
  - RAD root / chunk 名は RAD meta の `chunks[].filename` と `.ssproj` entry name が一致するように生成する。
  - worker load / WASM init / encode / unsupported input の失敗は asset 単位で warning 扱いにし、保存全体は継続する。

## WASM Encoder Flow

`@sparkjsdev/spark@2.0.0` npm package は RAD writer を public API として公開していない。
一方で上流 Rust workspace の license は proprietary 扱いだったため、Spark source をこの repo にコピーせず、
RAD reader が期待する root/chunk layout に絞った encoder を `camera-frames` 側の Rust/WASM として実装している。
なお、Spark repo 直下の `LICENSE` と npm package metadata は MIT だが、Spark repo 内の Rust workspace は `license = "Proprietary"` を明示しているため、Rust writer の実装はこの repo にコピーしない。公式 writer 出力と公開 package の reader contract を観測し、互換 encoder を独立実装する。

通常の Quality 保存では次の順序になる。

1. `ensureFullDataForSplatAssets` で root FullData を正本として揃える。
2. Spark `PackedSplats.createLodSplats({ quality: true })` で Quality LoD を bake する。
3. `lodSplats.packedArray` と `lodSplats.extra.lodTree` を WASM worker に渡す。
4. WASM encoder が `RAD0` root と `RADC` chunk 群を生成する。
5. `sourceFingerprint`、bounds、sha256、build metadata を付けた `radBundle` を `captureProjectState()` 前に source へ attach する。
6. `.ssproj` writer が RAD entries を stored/uncompressed として ZIP に入れる。その他の package entry 圧縮方針は `docs/camera_frames_requirements.md` を正とする。

現在の encoder は packed centers / alpha / rgb / scales / orientation、通常 SH arrays (`sh1` / `sh2` / `sh3`) と LoD tree を対象にした narrow implementation。
`sh1Codes` / `sh2Codes` / `sh3Codes` のような codebook/clustered SH arrays はまだ encode せず、該当 asset の RAD 生成を skip して `lodSplats` 保存に fallback する。
この制限は Quality 保存の信頼性を守るための fail-open 契約で、FullData 正本や既存 load/edit/export path は保持される。

## Fixture / Smoke

- `test/fixtures/rad/tiny-splats.ply`
- `test/fixtures/rad/tiny-splats-lod.rad`
- `test/fixtures/rad/rad-streaming-smoke-page.js`
- `scripts/rad-streaming-smoke.mjs`
- `npm run test:rad-streaming`

この smoke は Chrome/CDP と Vite dev server を使い、通常の `npm test` には混ぜない。
`blob:` Range の基礎確認に加えて、実装と同じ Service Worker 登録 URL から
`Range` fetch し、その URL を Spark `PagedSplats` に渡す。
既存 fixture `.rad` と、WASM encoder が生成した root/chunk RAD bundle の両方を確認する。

2026-04-25 の確認結果:

- `blob:` URL に対する `Range: bytes=0-31` は `206 Partial Content` になった。
- Service Worker に登録した RAD bundle Blob に対する `Range: bytes=0-31` も
  `206 Partial Content` になった。
- Spark は RAD header 取得で `bytes=0-65535` を投げた。
- fixture は小さいため body は RAD 全体になったが、chunk fetch は `bytes=1336-3399` として観測できた。
- WASM encoder が生成した chunked RAD bundle でも `PagedSplats` render が成立した。
- 通常 SH arrays (`sh1` / `sh2` / `sh3`) を含む generated RAD bundle でも `PagedSplats` render が成立した。
- generated bundle では root fetch は `206 Partial Content`、外部 `.radc` chunk file fetch は Spark が chunk file 単位で取得するため `200 OK` として観測された。これは FullData 全量 materialize ではなく、root meta から参照された chunk entry 単位の lazy fetch として扱う。
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

## Dev Browser Validation

Codex / browser-use から file picker や drag-and-drop を直接操作しなくても検証できるように、
dev build では query param から RAD `.ssproj` 検証を起動できる。

例:

```text
http://127.0.0.1:3010/?cfDevValidation=rad-ssproj&projectUrl=http%3A%2F%2F127.0.0.1%3A3010%2F%40fs%2FD%3A%2FGitHub%2Fcamera-frames%2F.local%2Fcf-test%2Fcf-test-rad-user.ssproj
```

結果は `#cf-dev-browser-validation-result` / `data-testid="cf-dev-browser-validation-result"` に JSON として表示する。
この検証は dev-only で、production build には自動起動処理を入れない。

2026-04-25 に `cf-test-rad-user.ssproj` で確認した内容:

- package open 後、RAD-backed splat assets が `PagedSplats` + `radBundleRuntime` として表示される。
- 通常 object transform 後も RAD streaming runtime と source `radBundle` は維持される。
- per-splat edit 開始時は FullData を materialize し、mesh は `PackedSplats` へ切り替わり、runtime/source の RAD cache は stale として外れる。

## Remaining Work

- codebook/clustered SH arrays を含む asset の RAD encode 対応を追加するか、UI 上で「RAD cache 対象外」warning をより明確にする。
- export 時の paged RAD readiness gate と FullData fallback を、実 RAD bundle で browser smoke に追加する。
- Service Worker Range failure を browser smoke で明示的に検証する。
- 大規模 `.ssproj` で PC / mobile のメモリ使用量と初回表示時間を比較する。
