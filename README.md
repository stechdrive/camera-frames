# CAMERA_FRAMES

## English

CAMERA_FRAMES is a production-oriented shot-layout and export app built for Japanese animation workflows.

It is made for practical layout work: using 3DGS and GLB scene assets from real or modeled locations as background reference, deciding framing per camera, placing multiple FRAMEs for PAN / TU / TB style instructions, and exporting PNG / PSD sheets that stay aligned with the Camera View output.

### Who This Is For

- Artists creating layout sheets or background key drawings for Japanese animation.
- Teams working from modeled locations, scanned environments, or photogrammetry-derived scene reference.
- People who need framing, camera instructions, reference-image alignment, and export in one place.

### Why This App Exists

- Background-layout workflow instead of a generic viewer.
- Paper-first composition around the final output area.
- Multiple FRAMEs on one sheet for pan / track-up / track-back style instructions.
- Camera View preview aligned with PNG / PSD export.
- Reference-image aware workflow with per-camera adjustments.
- 3DGS + GLB hybrid scene setup for practical background work.
- Per-camera export settings and layered PSD delivery.

### Quick Links

- Live app: [https://stechdrive.github.io/camera-frames/](https://stechdrive.github.io/camera-frames/)
- English UI: [https://stechdrive.github.io/camera-frames/?lang=en](https://stechdrive.github.io/camera-frames/?lang=en)
- Repository: [https://github.com/stechdrive/camera-frames](https://github.com/stechdrive/camera-frames)

## 日本語

CAMERA_FRAMES は、日本のアニメ制作で背景原図やレイアウトを作るための、実制作向けのレイアウト作成・書き出しアプリです。

モデル地のある作品や、フォトグラメトリ、スキャン、3D モデルから起こした空間資料をもとに、3D Gaussian Splatting で表現したロケ地や空間資料と、GLB 形式のプロップや当たり用の 3DCG オブジェクトを組み合わせて構図を決め、PAN / TU / TB などの撮影指示フレームを 1 枚の紙面上に配置し、カメラビューと揃った PNG / PSD を出力できるようにしています。

### どういう人向けか

- アニメのレイアウトや背景原図を作る人。
- モデル地、スキャン環境、フォトグラメトリ由来の空間資料を背景作業に使いたい人。
- 構図決め、撮影指示、下絵合わせ、書き出しを 1 つのツールでやりたい人。

### このツールの価値

- 3DGS ビューアではなく背景原図・レイアウト作業のためのツール。
- 最終出力の範囲を基準にした紙面設計。
- 複数の撮影指示フレームを 1 枚に置いて整理できる。
- カメラビューの見えと PNG / PSD の書き出し結果を揃えやすい。
- 下絵の読み込み、プリセット管理、カメラごとの調整に対応。
- 3D Gaussian Splatting で表現したロケ地・空間資料と、GLB 形式の 3DCG オブジェクトを同じシーンで扱える。
- カメラごとに書き出し設定を持ち、PSD のレイヤー出力にも対応。

### 主なリンク

- 公開版: [https://stechdrive.github.io/camera-frames/](https://stechdrive.github.io/camera-frames/)
- 英語 UI: [https://stechdrive.github.io/camera-frames/?lang=en](https://stechdrive.github.io/camera-frames/?lang=en)
- リポジトリ: [https://github.com/stechdrive/camera-frames](https://github.com/stechdrive/camera-frames)

## 何ができるか

- 3D Gaussian Splatting 形式のロケ地・空間資料（`.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`）、GLB / GLTF 形式の 3DCG オブジェクト（`.glb`, `.gltf`）、プロジェクトファイル（`.ssproj`）を読み込む
- 複数のカメラを切り替えながら構図を作る
- カメラビュー上に複数の撮影指示フレームを置き、移動・回転・拡縮・基準点の編集を行う
- 下絵（`.png`, `.jpg`, `.jpeg`, `.webp`, `.psd`）を読み込み、プリセット管理やカメラごとの調整を行う
- 3DGS を構成する個々のスプラット単位で選択・変形・削除・分離・複製する
- PNG / PSD に書き出す

## 主な機能

- ビューポート / カメラビューの分離
- 最終出力の範囲を基準にした紙面設計
- 複数カメラ管理
- 撮影指示フレームの追加、複製、削除、マスク表示
- 下絵の読み込み、PSD レイヤー読込、複数選択編集
- 3D オブジェクトの位置、回転、スケール、表示、順序、書き出し設定の管理
- 照明設定と測定
- 書き出し対象の切り替え: 現在のカメラ / 全カメラ / 選択カメラ
- PNG / PSD 書き出し。PSD ではガイド、下絵、GLB / 3DGS のレイヤー出力に対応
- `.ssproj` の保存と再読込

## 対応ファイル

- シーン: `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.ssproj`
- 下絵: `.png`, `.jpg`, `.jpeg`, `.webp`, `.psd`
- 書き出し: `.png`, `.psd`

## ローカル開発

```powershell
npm install
npm run develop
```

## ライセンス

MIT ライセンスです。詳細は [LICENSE](./LICENSE) を参照してください。
