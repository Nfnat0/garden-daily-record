# AI作業手順

## UX・UI作業の前に

1. `AGENTS.md` を読む。
2. `docs/ai/repository-guide.md`、`docs/ai/development-workflow.md`、`docs/ai/coding-standards.md` を読む。
3. `docs/ai/ux-improvement-plan.md` と `docs/ai/progress.md` を確認する。
4. `git status --short` で作業ツリーを確認し、無関係なユーザー変更に触れない。
5. UIを提案・編集する前に、対象のJSX、HTML、CSS、i18nエントリを確認する。

## UXレビュー手順

1. 対象ジャーニーを決める: 初回起動、予定作成、今日の記録、振り返り、ライブラリ登録、設定。
2. コードとブラウザの両方で現状挙動を確認する。
3. ユーザーの目的、次に見える行動、詰まり、エラー状態、empty state、モバイル挙動を記録する。
4. 発見事項を `docs/ai/progress.md` またはタスク専用メモに残す。
5. 優先度に影響する発見は `docs/ai/ux-improvement-plan.md` に反映する。

## 実装手順

1. 変更範囲を依頼されたジャーニーに限定する。
2. 生成バンドルではなく `.jsx` ソースを編集する。
3. ユーザー向けテキストは `GardenI18n` に日本語・英語の両方を追加する。
4. ファイル追加・リネーム時は `Garden.dev.html` と `tools/build-garden-bundle.cjs` の順序を揃える。
5. 本番バンドルを再生成する。

```powershell
node tools/build-garden-bundle.cjs
```

6. 関連テストを実行する。

```powershell
node garden-store.test.cjs
```

7. ブラウザで確認し、残るリスクを記録する。

## ブラウザQA手順

リポジトリルートからローカルHTTPサーバーを起動します。

```powershell
python -m http.server 8000 --directory garden-daily-record
```

確認対象:

- `http://localhost:8000/Garden.html`
- source順やBabel読み込みファイルを変えた場合は `http://localhost:8000/Garden.dev.html`
- ワイヤーフレーム関連作業の場合のみ `http://localhost:8000/Wireframes.html`

最低限の視覚確認:

- 保存フォルダゲート
- 接続後ダッシュボード
- 変更したルート
- 390pxモバイルviewport
- 1280pxデスクトップviewport
- console error
- interactive controlを変えた場合のキーボードfocus
- テキストのはみ出し・折り返し

ユーザー確認なしにPlaywrightブラウザや新規ソフトウェアをインストールしません。既存のChromeまたはEdgeが利用できる場合は、それを使います。

## 進捗管理手順

`docs/ai/progress.md` をライブトラッカーとして使います。

各タスクには次を残します。

- status: proposed、ready、in progress、blocked、done
- owner: human、AI、unassigned
- evidence: コマンド出力、スクリーンショットパス、コード参照
- decision: 採用方針、却下した案、未解決質問
- next action: 次に行う具体的な1ステップ

短く、現在の判断に役立つ状態を保ちます。詳細な変更履歴にしすぎないでください。

## ドキュメント更新手順

次のときにドキュメントを更新します。

- プロジェクト構成が変わった
- ビルド・テストコマンドが変わった
- 新しいUX優先度が決まった
- 手順が現状と合わなくなった
- QA中に再発しそうな問題を見つけた

`AGENTS.md` は短く保ちます。長く残る詳細は `docs/ai/` に置き、`AGENTS.md` からリンクします。
