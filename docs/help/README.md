# CAMERA_FRAMES ヘルプ

CAMERA_FRAMES アプリ内ヘルプの正本です。アプリ内の Help モーダル、repo 上の参照、GitHub Pages 公開版のすべてがこのディレクトリを参照します。

## 目次

- 日本語版: [ja/index.md](ja/index.md)
- 英語版: 未提供（将来対応予定）

## ディレクトリ構成

```
docs/help/
├── README.md           # 本ファイル
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
