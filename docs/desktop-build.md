# CAMERA_FRAMES desktop build

最終更新: 2026-06-22

## 目的

GitHub Pages で動く Web 版を正規配布として維持したまま、同一 frontend source から Windows 向け desktop exe を作るための保守メモ。

現 baseline の desktop 方針:

- Windows 11 以降を主対象にする
- Tauri を使う
- 開発検証では installer を作らず、standalone exe を直接起動する
- macOS binary は当面正式対象にしない。動く範囲は experimental とし、通常導線は Web 版とする
- app version の正本は `package.json` とし、`src-tauri/` 側の version は test で drift を検出する

## build command

Web / GitHub Pages 版:

```sh
npm run build
npm run pages:publish
```

Desktop frontend build:

```sh
npm run desktop:build:web
```

Windows standalone exe:

```sh
npm run desktop:build:exe
```

`desktop:build:exe` は `tauri build --no-bundle` を使う。installer bundle を作らないため、開発中に setup を毎回実行する必要はない。
release exe は Windows GUI subsystem で build し、起動時に console window を開かない。
実体は `scripts/build-tauri.mjs` 経由で実行し、Rust build 時に repo path / user profile path / Cargo cache path を匿名 path へ remap する。
build 後は PDB や dependency sidecar を削除し、開発検証の配布単位を exe 単体に寄せる。

想定出力:

```text
src-tauri/target/release/camera-frames.exe
```

Installer が必要になった時だけ次を使う:

```sh
npm run desktop:build
```

## release path audit

配布前には次を実行し、gh-pages 用 `dist/`、tracked RAD encoder wasm、Tauri exe に開発環境の絶対 path が残っていないことを確認する。

```sh
npm run release:audit-paths
```

この audit は `C:\Users\...`, repo root, `CARGO_HOME`, `RUSTUP_HOME`, local temp 由来の path と sourcemap file を検出する。
Rust / wasm build は必ず次の wrapper 経由にする。

```sh
npm run build:rad-encoder
npm run desktop:build:exe
```

`wasm-pack` や `tauri build` を直接実行すると、panic location や debug metadata に local path が残る場合がある。

## Vite base

`vite.config.js` は build mode で base を分ける。

- 通常 build: `/camera-frames/`
- desktop mode: `./`
- dev: `/`

これにより GitHub Pages 版の URL contract を維持しつつ、Tauri の embedded frontend では相対 path で asset を読める。

## data policy

通常 desktop mode では、localStorage / IndexedDB / WebView2 profile 由来の小さい設定や working save は Windows 標準の app data 領域に置く。

Portable mode を将来導入する場合だけ、exe 横の marker file または `camera-frames-data/` を検出して、独自 JSON / cache / working data をその配下へ逃がす。標準動作で exe 配下へ書き込む前提にはしない。

## 注意点

- `src-tauri/target/` と `src-tauri/gen/` は生成物なので Git 追跡しない
- `src-tauri/icons/` は Windows build に必要な `icon.ico` だけを追跡対象にする。`tauri icon` が生成する Android / iOS / AppX 用 icon は初期 Windows-only 方針では追跡しない
- WebView2 runtime がない古い Windows は対象外
- sidecar や外部 resource を追加した場合、厳密な「exe 単品」ではなく同梱 ZIP 配布に切り替える
- `target/release` directory 全体を配布しない。PDB / `.d` などの build sidecar には local path が含まれ得る
- RAD streaming / WebCodecs / WebGPU worker は desktop smoke で別途確認する
