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
3. スクショが古くなったら fixture を更新して再撮影（下記）
4. アプリ内 Help モーダルで表示確認（`F1` で開く）
5. `npm test` が通ることを確認（`test/docs-fixture-registry.test.ts` が fixture id 重複 / chapter ↔ fixture id 整合 / アイコン参照を検証）

### スクショ再撮影

詳細は [CAPTURE.md](CAPTURE.md)。概要:

- 小変更（mock state だけいじる）: fixture ファイル `src/docs/fixtures/<id>.js` を編集 → `preview_eval: await __CF_DOCS__.captureFixture("<id>")` で再生成
- UI 構造が大きく変わった: 影響 fixture を書き換え。real コンポーネントを mount している fixture なら props 側は自動追随するが、inline DOM で再現しているもの（pie-menu / render-box chrome / gizmo 系）は同じ形に手で追随する必要あり
- backdrop（splat 画像）を差し替えたい: cf-test2 を主アプリで開いて `__CF_DOCS__.loadProject` → canvas を `/__backdrop` に POST（CAPTURE.md 参照）

## 新しい章を追加するとき

1. `ja/NN-<slug>.md` を作成（NN は 2 桁連番）
2. frontmatter を [SCHEMA.md](SCHEMA.md) に従って書く。`screenshots[].id` は対応する fixture id と同一にする
3. `ja/index.md` の目次に追加
4. 必要な fixture を `src/docs/fixtures/` に追加し、`index-browser.js`（または node-safe なら `index.js`）に登録
5. `npm test` の registry parity check が該当章の `screenshots[].id` に対応する fixture を要求するので、作り忘れると落ちる
6. アプリ側 deep link の default を調整したければ `src/ui/help/` を確認

## 新しい fixture を追加するとき

1. `src/docs/fixtures/<fixture-id>.js` を作る
2. type は `panel` / `overlay` / `viewport` / `composite` / `reference` のどれか
3. annotations が要るなら fixture 定義に `annotations: [{ n, selector, label }]` を足す
4. `index-browser.js`（vite-only な実 UI を transitive import する場合）or `index.js`（node-safe な場合、現状は hello と icons-all のみ）で `registerFixture(...)` を呼ぶ
5. `/docs.html?fixture=<id>` で描画確認
6. `__CF_DOCS__.captureFixture("<id>")` で PNG 生成
7. `docs/help/ja/*.md` の適切な章の body に `![alt](../assets/screenshots/ja/<id>.png)` を配置（frontmatter の screenshots[].id とセット）

## 言語追加（将来）

1. `en/` ディレクトリを作成し、同じファイル名で英訳
2. `src/ui/help/i18n/en.json` を追加（UI 文字列）
3. Help モーダルの言語スイッチャに選択肢を追加
4. `__CF_DOCS__.captureAllFixtures({ lang: "en" })` で `assets/screenshots/en/*.png` を一括生成
5. registry parity check は言語を見ないので、章と fixture id の 1:1 が合っていれば通る

## 本文記法のポイント

- アイコン参照は `{{icon:tool-select}}` のような記法を使う（レンダラが実 SVG へ展開）。registry test が `src/ui/svg/<name>.svg` との整合を検証する
- パネル名・ボタン名は本文中で `**Shot Camera**` のように太字にする
- ショートカットは `` `Ctrl+S` `` のようにコードスパン
- 画像参照は `../assets/screenshots/ja/<id>.png` の相対パス

## 関連コードの場所

- アプリ内 Help モーダル: `src/ui/help/`
- 撮影ブリッジ（dev のみ、`__CF_DOCS__`）: `src/main.js` + `src/ui/help/docs-bridge.js`
- Fixture 定義 / レジストリ: `src/docs/fixtures/` + `src/docs/mock/` + `src/docs/docs-app.js`
- Backdrop 画像実体: `docs/help/assets/fixture-backdrops/`
- 撮影ワークフロー: [CAPTURE.md](CAPTURE.md)
- アイコン実体: `src/ui/workbench-icons.js` + `src/ui/svg/*.svg`
- frontmatter スキーマ: [SCHEMA.md](SCHEMA.md)

## チェックリスト（PR 送る前）

- [ ] frontmatter の `last-updated` を更新した
- [ ] 変更が影響する章を全部確認した（`related-files` が参考になる）
- [ ] 必要な fixture を追加・更新した
- [ ] スクショ再撮影が要るならやった
- [ ] アプリ内 Help で表示崩れがないことを確認した
- [ ] `docs/CameraFramesFeatures.md` の該当節も必要なら更新した
- [ ] `npm test` が通る
