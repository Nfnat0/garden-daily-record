# 開発ワークフロー

## ローカルコマンド

アプリ関連コマンドは `garden-daily-record/` から実行します。

```powershell
node tools/build-garden-bundle.cjs
node garden-store.test.cjs
```

静的サーバーはリポジトリルートから起動します。

```powershell
python -m http.server 8000 --directory garden-daily-record
```

確認URL:

- Main app: `http://localhost:8000/Garden.html`
- Development app: `http://localhost:8000/Garden.dev.html`
- Wireframes: `http://localhost:8000/Wireframes.html`

## ビルドルール

`Garden.html` が利用する `.jsx` ソースを変更したら、本番バンドルを再生成します。

```powershell
node tools/build-garden-bundle.cjs
```

`garden-app.bundle.js` は手で編集しません。差分が出た場合も、生成物としてレビューします。

## テストルール

次の領域を変更したら `node garden-store.test.cjs` を実行します。

- ストレージ挙動
- スキーマ正規化・バリデーション
- XP計算・サマリー集計
- i18n辞書
- entryのマージ挙動
- PlanとTodayのデータ境界

UIだけの変更でも、バンドル生成とブラウザ検証は行います。

## ブラウザ検証

UI変更時は少なくとも次を確認します。

- 初回保存フォルダゲート
- 接続後ダッシュボード
- 変更したルート
- 390px前後のモバイルviewport
- 1280px前後のデスクトップviewport
- console error
- テキストのはみ出し・折り返し
- テーマ挙動に関わる場合はライト・ダーク双方の可読性

Playwrightの同梱ブラウザが未インストールの場合、ユーザー確認なしに新しいブラウザをインストールしません。既存のChromeまたはEdgeが使えるなら、それを使って検証します。

## 現在のUXレビュー基準値

2026-04-30 のレビューでは、次の確認が通りました。

```powershell
node garden-store.test.cjs
node tools/build-garden-bundle.cjs
```

既存Chromeを使ったブラウザsmoke testで、保存フォルダゲート、接続状態、Dashboard、Plan、Today、Study、Library、Settings まで到達し、page error はありませんでした。

観測された既知課題:

- 接続後の390pxモバイルviewportで `document.body.scrollWidth` が400、`window.innerWidth` が390でした。原因はStudyチャートカードの最小幅です。

レビュー時のスクリーンショットは `output/playwright/` に生成されます。このフォルダは `.gitignore` 対象です。

## Git運用

safe.directory 警告が出る場合は、読み取り専用の状態確認に次を使います。

```powershell
git -c safe.directory=C:/Users/user/projects/garden-daily-record status --short
```

関係ないユーザー変更を戻しません。無関係な差分がある場合は触らず、必要なファイルだけに変更を限定します。
