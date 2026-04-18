# ヘルプ更新ワークフロー

メンテナー / coding agent 向け、ヘルプ追加・修正のルール。

## いつ更新するか

user-visible な仕様変更が入るときは、該当章も同じ PR で更新する。具体的には次を触るとき:

- 新しいパネル / UI コンポーネントの追加
- 既存 UI の挙動変更・名称変更
- ショートカット追加・変更
- ファイル形式 / export 設定の追加
- legacy `.ssproj` 互換の変更
- エラーメッセージや確認ダイアログの文言変更

詳細な回帰観点は [../CameraFramesFeatures.md](../CameraFramesFeatures.md) も参照。

## 編集の流れ

1. 該当章の Markdown を編集
2. frontmatter の `last-updated` を今日の日付に更新
3. スクショが古くなったら [CAPTURE.md](CAPTURE.md) の手順で再撮影（`__CF_DOCS__.runScenario("<id>")` → preview_screenshot → 保存）
4. アプリ内 Help モーダルで表示確認（`F1` で開く）
5. `npm test` が通ることを確認

## 新しい章を追加するとき

1. `ja/NN-<slug>.md` を作成（NN は 2 桁連番）
2. frontmatter を [SCHEMA.md](SCHEMA.md) に従って書く
3. `ja/index.md` の目次に追加
4. 撮影シナリオが必要なら `test/docs-capture.js` に追加（Phase 3 以降）
5. アプリ側 deep link テーブルに `id` を登録（Phase 2 以降）

## 言語追加（将来）

1. `en/` ディレクトリを作成し、同じファイル名で英訳
2. `assets/screenshots/en/` にスクショを再撮影（英語 UI が必要なら）
3. Help モーダルの言語スイッチャに選択肢を追加
4. `src/ui/help/i18n/en.json` を追加（UI 文字列）

## 本文記法のポイント

- アイコン参照は `{{icon:tool-select}}` のような記法を使う（レンダラが実 SVG へ展開）
- パネル名・ボタン名は本文中で `**Shot Camera**` のように太字にする
- ショートカットは `` `Ctrl+S` `` のようにコードスパン
- 画像参照は `../assets/screenshots/ja/<id>.png` の相対パス

## 関連コードの場所

- アプリ内 Help モーダル: `src/ui/help/`
- 撮影ブリッジ: `src/main.js` + `src/ui/help/docs-bridge.js`（dev build のみ `__CF_DOCS__` として公開）
- 撮影シナリオ: [`test/docs-capture.js`](../../test/docs-capture.js)
- 撮影ワークフロー: [CAPTURE.md](CAPTURE.md)
- アノテーションオーバーレイ: `src/ui/docs-annotation-overlay.js`
- アイコン実体: `src/ui/workbench-icons.js`

## チェックリスト（PR 送る前）

- [ ] frontmatter の `last-updated` を更新した
- [ ] 変更が影響する章を全部確認した（`related-files` が参考になる）
- [ ] スクショの古さを確認した
- [ ] アプリ内 Help で表示崩れがないことを確認した
- [ ] `docs/CameraFramesFeatures.md` の該当節も必要なら更新した
