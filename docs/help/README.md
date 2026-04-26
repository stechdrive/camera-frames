# CAMERA_FRAMES ヘルプ

CAMERA_FRAMES アプリ内ヘルプの正本です。アプリ内の Help モーダル、repo 上の参照、GitHub Pages 公開版のすべてがこのディレクトリを参照します。

## 読む人向け

- 日本語版: [ja/index.md](ja/index.md)
- 英語版: 未提供（将来対応予定）

## 編集する人向け

- [UPDATING.md](UPDATING.md) — ヘルプ更新ワークフロー
- [CAPTURE.md](CAPTURE.md) — スクリーンショット撮影の実手順（`__CF_DOCS__.captureFixture` ベース）
- [SCHEMA.md](SCHEMA.md) — Markdown frontmatter スキーマと記法

スクショは fixture システムから生成されます:

- 定義: [`src/docs/fixtures/`](../../src/docs/fixtures/) 配下の 1 ファイル = 1 fixture
- 撮影: dev サーバを立てて `__CF_DOCS__.captureFixture(<id>)` or `captureAllFixtures()`
- 検証: `npm test` が chapter frontmatter ↔ fixture id 整合とアイコン参照を自動検査

## ディレクトリ構成

```
docs/help/
├── README.md           # 本ファイル
├── UPDATING.md         # メンテナー向け更新ガイド
├── CAPTURE.md          # スクショ撮影ワークフロー
├── SCHEMA.md           # frontmatter スキーマと記法
├── ja/                 # 日本語版本文
│   ├── index.md        # 目次
│   └── 01-*.md ...     # 各章
├── en/                 # 英語版（未提供）
└── assets/
    ├── icons/          # UI アイコンの参照用 SVG（workbench-icons.js と同期）
    ├── fixture-backdrops/  # viewport fixture 用の静的 splat backdrop PNG
    └── screenshots/
        ├── ja/         # 日本語版 UI スクショ（fixture 生成物）
        └── en/         # 英語版 UI スクショ（未提供）
```

## アプリ内ヘルプとの関係

- アプリは build time に `docs/help/<lang>/` 配下の Markdown を import する
- レンダラは軽量実装（GFM heading / table / code block / link / image, deep link anchor）
- 各章の frontmatter にある `id` がアプリ内 deep link の key
- スクショとアイコンは `docs/help/assets/` からそのまま参照する
- 言語切替は store の `lang` を変え、読み込み先ディレクトリを動的に差し替える

詳細は [SCHEMA.md](SCHEMA.md) を参照。
