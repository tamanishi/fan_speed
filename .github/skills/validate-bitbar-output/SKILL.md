---
name: validate-bitbar-output
description: 'BitBar または SwiftBar プラグインの標準出力を検証します。fan_speed.5s.js の表示形式、SWIFTBAR 分岐、N/A フォールバック、コマンド失敗時の動作を確認するときに使用します。'
argument-hint: '検証対象または確認したい出力ケース'
user-invocable: true
---

# BitBar 出力検証

## 使用するとき

- `fan_speed.5s.js` の表示形式を確認するとき
- BitBar と SwiftBar のアイコンやオプションの差分を確認するとき
- `ismc` または `jq` の失敗時に `N/A` が表示されることを確認するとき
- プラグインの標準出力や標準エラー出力に関わる変更をレビューするとき

## 手順

1. 使用中のシェルが bash 以外の場合も含め、外部コマンドは必ず `bash -lc '...'` を経由して実行します。
2. リポジトリのルートで `bash -lc 'node --test __tests__/fan_speed.node.test.js'` を実行します。
3. `fan_speed.5s.js` の `run()` をモックした `child_process.execSync` で呼び出し、次のケースを確認します。
   - 通常の BitBar モードでは `:cyclone:` と `| size=12` が出力される。
   - `SWIFTBAR=1` では `:wind.snow:` と `| size=12, symbolize=true` が出力される。
   - 有効なファン速度がない場合は `N/A` が出力される。
   - コマンドが失敗した場合もプロセスがクラッシュせず、`N/A` と診断メッセージが出力される。
4. 実機の `/opt/homebrew/bin/ismc` はテストで呼び出しません。テストでは `child_process.execSync` を差し替えます。
5. 出力仕様を変更する場合は、対応する Node テストと [README.md](../../../README.md) も更新します。

## 実行例

次のコマンドは、実機の iSMC を呼び出さずに成功時の BitBar 出力を確認します。

```sh
bash -lc 'node --eval "const childProcess = require(\"child_process\"); const originalExecSync = childProcess.execSync; const originalLog = console.log; childProcess.execSync = () => Buffer.from(JSON.stringify({ \"Fan 1 Current Speed\": { quantity: 1705 }, \"Fan Count\": { quantity: 1 } })); console.log = (line) => process.stdout.write(line + String.fromCharCode(10)); try { delete process.env.SWIFTBAR; require(\"./fan_speed.5s\").run(); } finally { childProcess.execSync = originalExecSync; console.log = originalLog; }"'
```

期待値は `:cyclone: 1705 rpm| size=12` です。
