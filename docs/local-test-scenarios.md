# Local `.ssproj` Scenario Tests

最終更新: 2026-04-26

この文書は、Git 管理しない `.local/cf-test/` の `.ssproj` 実データを使った保守用ブラウザ smoke の運用手順をまとめる。

共有 contract の正本は `src/`, `test/`, `docs/` であり、`.local/cf-test/` の実ファイルは local-only の検証材料として扱う。fixture を GitHub に上げない前提は変えない。

## Runner

ローカル scenario runner:

```powershell
npm run test:local-scenarios
```

この script は必要に応じて Vite dev server を起動し、一時 profile の Chrome / Edge を CDP 付きで開く。既定では `.local/cf-test/scenarios.json` を読み、なければ built-in fallback scenario を使う。

主な option:

```powershell
npm run test:local-scenarios -- --list
npm run test:local-scenarios -- --scenario cf-test-project
npm run test:local-scenarios -- --scenario cf-test-project,rad-full-data-swap
npm run test:local-scenarios -- --headed
npm run test:local-scenarios -- --manifest .local/cf-test/scenarios.json
```

結果は `.local/local-scenario-smoke/local-scenarios.json` と screenshot に出る。

## Manifest

manifest は Git 管理しない `.local/cf-test/scenarios.json` に置く。形式:

```json
{
  "version": 1,
  "description": "Local CAMERA_FRAMES scenario set",
  "scenarios": [
    {
      "id": "cf-test-project",
      "kind": "project-state",
      "project": "/.local/cf-test/cf-test.ssproj",
      "expected": "default",
      "screenshot": true
    }
  ]
}
```

対応 `kind`:

| kind | 用途 |
|---|---|
| `ui-smoke` | app 起動後、rendered UI の最小操作を実行する |
| `project-state` | `test/ui-state-verification.js` の既定期待値または manifest の `expected` で project state を検証する |
| `project-summary` | project を開き、shot / frame 数など summary 条件を検証する |
| `rad-ssproj` | RAD-backed `.ssproj` を開き、object transform と FullData swap を検証する |
| `docs-fixture` | `/docs.html?fixture=...` を開き、fixture ready と console error を確認する |

`optional: true` を付けた scenario は、対象 local file が存在しない環境では skip される。必須 scenario の local file が欠けている場合は fail する。

## Maintenance

`.local/cf-test/` に新しい `.ssproj` を追加したら、次の順で scenario を追加する。

1. `.local/cf-test/README.md` に fixture の目的、守る contract、重さ、更新日を書く。
2. `.local/cf-test/scenarios.json` に scenario を追加する。
3. `npm run test:local-scenarios -- --list` で id と local file 解決を確認する。
4. 新しい scenario だけ `--scenario <id>` で実行する。
5. contract として共有すべき挙動が増えた場合は、local fixture だけでなく `test/` 側にも軽量 unit / fixture test を追加する。

ローカル scenario は「実データで壊れないこと」を見るための補助であり、CI の必須正本にはしない。保守上の重要 contract を見つけた場合は、軽量化した Git 管理 test に昇格する。
