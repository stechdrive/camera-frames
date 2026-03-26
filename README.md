# CAMERA_FRAMES

CAMERA_FRAMES is a standalone shot-layout and export app built on top of Spark 2.0 preview.  
CAMERA_FRAMES は Spark 2.0 preview をベースにした、スタンドアロンのショットレイアウト兼エクスポート用アプリです。

This repository is the current app home. Spark is consumed as an external engine dependency, while the CAMERA_FRAMES workflow, UI, state model, and export behavior are implemented in the app layer.  
このリポジトリは現在のアプリ本体です。Spark は外部エンジン依存として利用し、CAMERA_FRAMES のワークフロー、UI、状態モデル、書き出し挙動はアプリ層で実装しています。

## Project Goal / 目的

The long-term goal of this repository is to reproduce the current CAMERA_FRAMES workflow on top of Spark 2.0.  
このリポジトリの長期目標は、現在の CAMERA_FRAMES ワークフローを Spark 2.0 上で再現することです。

The feature baseline and prior implementation live in the `supersplat-cameraframes` repository. This repository focuses on rebuilding that tool as a dedicated Spark-based app rather than carrying the old editor integration forward.  
機能ベースラインと従来実装は `supersplat-cameraframes` リポジトリにあります。このリポジトリでは、従来のエディタ統合を引き継ぐのではなく、Spark ベースの専用アプリとして再構築することに注力しています。

## Current Status / 現状

The project is already beyond a pure prototype and has a usable standalone app shell, but the port is still in progress.  
このプロジェクトは純粋なプロトタイプ段階は超えており、利用可能なスタンドアロン app shell を備えていますが、移植自体はまだ進行中です。

Implemented or working in the current app:  
現時点のアプリで実装済み、または動作している要素:

- Render Box / Output Frame workflow with anchor-based off-axis composition
- アンカー付き off-axis 構図を含む Render Box / Output Frame ワークフロー
- Viewport / Camera View separation
- Viewport / Camera View の分離
- On-canvas frame placement, move, rotate, resize, and anchor editing
- キャンバス上での frame 配置、移動、回転、拡縮、アンカー編集
- Multi-camera document flow and export target selection skeleton
- 複数カメラ document フローと export target 選択の骨格
- Spark-based scene loading for supported assets
- 対応アセットの Spark ベース scene loading
- Portable `.ssproj` v2 project save / reopen foundation with legacy `.ssproj` read fallback
- 旧 `.ssproj` 読み込みフォールバックを持つ、portable `.ssproj` v2 project save / reopen の基盤
- PNG export pipeline and supporting geometry / projection logic
- PNG export パイプラインと、そのための幾何 / 投影ロジック

Still in progress or not yet finished:  
進行中、または未完了の要素:

- export settle policy for Spark LoD convergence
- Spark の LoD 収束を踏まえた export settle policy
- Undo / Redo foundation
- Undo / Redo 基盤
- reference image workflow
- reference image ワークフロー
- camera exchange formats and save-mode expansion
- camera exchange formats と save mode 拡張
- PSD export and scene-order contract work
- PSD export と scene-order contract 周り

## Tech Stack / 技術構成

- Spark 2.0 preview as the rendering engine dependency
- レンダリングエンジン依存としての Spark 2.0 preview
- Preact + Signals + htm for the app UI
- アプリ UI 用の Preact + Signals + htm
- Vite for local development and production build
- ローカル開発と本番ビルド用の Vite
- Three.js utilities where needed around asset loading and camera math
- アセット読み込みやカメラ計算まわりで必要に応じて使う Three.js utility

## Development / 開発

```powershell
npm install
npm run develop
```

Start the local development server.  
ローカル開発サーバーを起動します。

## Validation / 検証

```powershell
npm run lint
npm run build
npm run test
```

Run lint, build, and tests.  
コードチェック、ビルド、テストを実行します。

## Versioning / バージョニング

`package.json` is the single source of truth for the app version. The app footer shows the current SemVer and short git commit, and production builds emit `dist/version.json` for runtime inspection and future update checks.  
アプリのバージョン正本は `package.json` です。アプリの footer には現在の SemVer と短縮 git commit が表示され、本番 build では runtime 確認や将来の更新検知用に `dist/version.json` も出力されます。

Use standard npm version bumps for releases:  
リリース時の version 更新は標準の npm コマンドを使います:

```powershell
npm version patch
npm version minor
npm version major
```

For this GitHub Pages app there is no service worker yet, so deploy updates rely on normal asset hashing plus browser refresh.  
この GitHub Pages アプリには現時点で service worker は入っていないため、deploy 後の更新反映は通常の asset hash とブラウザ再読み込みに依存します。

## Scripts / スクリプト

- `npm run develop`: start the Vite dev server / Vite の開発サーバーを起動
- `npm run build`: create a production build in `dist/` / `dist/` に本番ビルドを生成
- `npm run preview`: preview the production build locally / 本番ビルドをローカルで確認
- `npm run lint`: run Biome checks / Biome によるチェックを実行
- `npm run format`: run Biome formatting / Biome による整形を実行
- `npm run test`: run the Node test suite / Node のテストスイートを実行
- `npm run deploy`: build and publish the app to `gh-pages` for GitHub Pages / GitHub Pages 向けに `gh-pages` へ build と publish を行う

## License / ライセンス

MIT. See [LICENSE](./LICENSE).  
MIT ライセンスです。詳細は [LICENSE](./LICENSE) を参照してください。
