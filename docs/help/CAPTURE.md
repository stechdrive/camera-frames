# ヘルプスクリーンショット撮影

`docs/help/ja/*.md` の frontmatter に定義された `screenshots[].scenario` ごとに、アプリの特定状態のスクショを撮って `docs/help/assets/screenshots/ja/<scenario-id>.png` に配置する流れです。

## 前提

- 現行の撮影は **Claude が Claude Preview MCP 経由で手動駆動**する方式です（完全自動化された CI は無し）
- dev build のみで `globalThis.__CF_DOCS__` ブリッジが有効になります（`import.meta.env.DEV`）
- シナリオ定義は [`test/docs-capture.js`](../../test/docs-capture.js)
- テスト素材: `.local/cf-test/cf-test.ssproj`（base state として共通利用）

## ブリッジ API（`__CF_DOCS__`）

| API | 役割 |
|---|---|
| `runScenario(name, options?)` | 指定シナリオを実行。デフォルトで annotations / help modal / pie menu をリセット |
| `listScenarios()` | 登録済みシナリオ名を配列で返す |
| `loadProject(path)` | `.ssproj` / scene asset を fetch → handleAssetInputChange で import、overlay 消滅まで待機 |
| `waitForReady({ frames, delayMs })` | requestAnimationFrame で N 回待つ（既定 8）、必要なら追加遅延 |
| `setAnnotations(items)` | 番号オーバーレイを表示。`item = { n, selector?, x?, y?, label? }` |
| `clearAnnotations()` | 番号オーバーレイを消す |
| `resetState()` | annotations / help modal / pie menu をクリア |
| `store`, `controller` | 生の store / controller API へアクセス |

## 撮影フロー（Claude 向け手順）

1. **preview を起動**
   ```
   preview_start("camera-frames-dev")
   ```

2. **シナリオ一覧を取得**（確認用）
   ```js
   preview_eval: await __CF_DOCS__.listScenarios()
   ```

3. **シナリオを 1 件実行 → スクショ**
   ```js
   preview_eval: await __CF_DOCS__.runScenario("cf-test-render-box")
   ```
   ```
   preview_screenshot
   ```

4. **画像保存**（Phase 4 で確立予定）
   - `__CF_DOCS__.capturePNG()` の実装方針を決める：
     - オプション A: `html-to-image`（または `html2canvas`）を devDep に追加 → DOM 全体を PNG base64 へ → Bash で base64 デコードして書き出し
     - オプション B: `preserveDrawingBuffer: true` を dev build で有効化 → viewport を `canvas.toDataURL` で取得し、DOM は html-to-image、合成して保存
     - オプション C: Playwright を devDep に追加して `npm run docs:capture` で完全自動化
   - いずれの場合も出力は `docs/help/assets/screenshots/ja/<scenario-id>.png`

5. **annotations を入れた場合は忘れずにクリア**
   ```js
   preview_eval: __CF_DOCS__.clearAnnotations()
   ```

## シナリオを追加 / 更新するとき

1. 章の Markdown の `screenshots:` frontmatter に新しい id を足す
2. `test/docs-capture.js` の `scenarios` にエントリを追加
3. `__CF_DOCS__.runScenario("<id>")` で実行確認
4. スクショを撮って所定パスへ保存

### シナリオ設計のコツ

- 余計な状態を持ち越さない（`resetState()` が自動で呼ばれるが、シナリオ内でも明示的に `closeHelp()` などを呼ぶと安全）
- `loadBase(docs)` で `cf-test.ssproj` をロードする共通パターンを使う
- annotations は `selector` 指定で要素中央に配置できる
- pie menu / overlay を表示したまま撮る場合は、シナリオ最後で `await docs.waitForReady()` を呼んで描画安定を待つ

## 今後の自動化（Phase 4〜）

- `npm run docs:capture` の本格実装
- シナリオごとの差分検知（既存 PNG と diff、しきい値超で警告）
- 英語版撮影のための `lang: "en"` 切替
