# ヘルプ Markdown スキーマ

`docs/help/<lang>/*.md` のフォーマット定義。

## Frontmatter

YAML frontmatter は必須。

```yaml
---
id: shot-camera
title: Shot Camera
section: 5
lang: ja
related-files:
  - src/controllers/camera-controller.js
  - src/controllers/camera/active-shot.js
  - src/ui/side-panel.js
screenshots:
  - id: shot-camera-panel
    alt: Shot Camera パネル
    scenario: shot-camera-panel-open
    annotations:
      - { n: 1, label: "追加ボタン" }
      - { n: 2, label: "shot 一覧" }
shortcuts:
  - key: Shift+C
    action: Shot camera を追加
last-updated: 2026-04-18
---
```

### フィールド仕様

| field | 型 | 必須 | 用途 |
|---|---|---|---|
| `id` | string | ✅ | アプリ内 deep link の key。kebab-case で unique |
| `title` | string | ✅ | 目次 / モーダル見出し |
| `section` | number | ✅ | 並び順（章番号、0 = 目次） |
| `lang` | string | ✅ | `ja` / `en` |
| `related-files` | string[] |  | 関連ソースファイルの repo 相対パス。この files が変わったら章を見直す目印 |
| `screenshots` | object[] |  | 撮影シナリオ定義（Phase 3 以降で利用） |
| `shortcuts` | object[] |  | キーボードショートカット。11 章が frontmatter を横串に集約する |
| `last-updated` | YYYY-MM-DD | ✅ | 最終更新日 |

### `screenshots` サブフィールド

| field | 用途 |
|---|---|
| `id` | 出力ファイル名 `<id>.png` の元 |
| `alt` | alt text（Markdown img 記法の alt にも使う） |
| `scenario` | `test/docs-capture.js` 内のシナリオ名 |
| `annotations` | 番号オーバーレイ（`n`: 1 始まりの連番、`label`: 参照用） |

### `shortcuts` サブフィールド

| field | 用途 |
|---|---|
| `key` | ショートカット表記（`Ctrl+S`, `Shift+E` など） |
| `action` | 動作説明（日本語） |

## 本文記法

- GFM 拡張（heading, table, code block, link, image）
- アイコン参照: `{{icon:<icon-name>}}` — レンダラが `workbench-icons.js` の SVG へ展開
- パネル名・ボタン名は太字: `**Shot Camera**`
- ショートカット表記はコードスパン: `` `Ctrl+S` ``
- 章間リンクは通常の Markdown: `[Output Frame](06-output-frame-and-frames.md#anchor)` — アプリ側は `.md` を剥がして deep link へ変換する

## 画像参照

相対パスで書く:

```markdown
![Shot Camera パネル](../assets/screenshots/ja/shot-camera-panel.png)
```

番号オーバーレイ付きスクショを使うときは、本文で連番対応表を書く:

```markdown
![Shot Camera パネル](../assets/screenshots/ja/shot-camera-panel.png)

1. **追加ボタン** — shot camera を 1 つ追加する
2. **shot 一覧** — 複数 shot を切り替える
```

`annotations` frontmatter と本文の番号は一致させる。

## アンカーと deep link

- 各見出しは自動で slugify されて anchor になる（`## 追加する` → `#追加する`）
- 他章から: `[追加する](05-shot-camera.md#追加する)`
- アプリ内 deep link URL（概念、Phase 2 で確定）: `help://<id>/<anchor>` 形式を想定
