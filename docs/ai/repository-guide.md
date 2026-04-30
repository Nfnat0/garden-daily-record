# リポジトリガイド

## プロジェクト概要

Garden Daily Record は `garden-daily-record/` 配下にある静的Reactプロトタイプです。生活・学習ログを「育つ庭」として表現し、ブラウザの File System Access API で選択したフォルダ内のJSONファイルにデータを保存します。

package manager 設定はありません。標準的なモジュールバンドラではなく、軽量なバンドル生成スクリプトで本番用ファイルを作ります。

## エントリーポイント

- `Garden.html`: 本番用メインアプリ。React 18 と ReactDOM のproduction UMDをCDNから読み込み、インラインCSSと `garden-app.bundle.js` を使います。
- `Garden.dev.html`: 開発用アプリ。React、ReactDOM、Babel standalone、ローカル `.jsx` ファイルを `type="text/babel"` で読み込みます。
- `Wireframes.html`: デザイン探索用キャンバス。`design-canvas.jsx`、`wf-primitives.jsx`、`wf-direction-*.jsx`、`wireframes.css` を使います。

`file://` で直接開くより、ローカルHTTPサーバーで確認してください。スクリプト読み込みとBabel経由のJSX読み込みが安定します。

## アプリ構成

- `app.jsx`: アプリシェル、ナビゲーション、ルート切り替え、テーマ・言語反映、ストレージ連携、画面配線。Reactを直接マウントします。
- `data.jsx`: モックデータ、スキーマ正規化、バリデーション、日付ヘルパー、集計、ストレージ、i18n辞書。`window.MOCK`、`window.GardenSchema`、`window.GardenCalc`、`window.GardenStore`、`window.GardenI18n` を公開します。
- `plant.jsx`: SVG植物イラスト。`window.Plant` を公開します。
- `garden-view.jsx`: 庭のビジュアル表示。`window.Garden` を公開します。
- `screen-dashboard.jsx`: ダッシュボードと庭の概要。
- `screen-plan.jsx`: 今日の予定専用画面。`window.PlanScreen` を公開します。
- `screen-today.jsx`: 今日の記録画面。予定の植物は除外します。`window.TodayScreen` を公開します。
- `screens-other.jsx`: Study、Library、Settings、各種バリデーション、エディタ補助関数。
- `tweaks-panel.jsx`: edit mode用の調整パネルと再利用フォーム部品。

## 生成物とデザイン探索

- `garden-app.bundle.js`: 生成された本番バンドル。手で編集しません。
- `tools/build-garden-bundle.cjs`: `.jsx` ソースから本番バンドルを再生成します。
- `garden.css`: GardenデザインシステムCSSのコピー。`Garden.html` にもインラインCSSがあるため、共有トークンやユーティリティを変更するときは両方を確認します。
- `wireframes.css` と `wf-*.jsx`: ワイヤーフレーム専用。明示された場合を除き、本番アプリのスタイル判断とは分けて扱います。

## 現在の実行モデル

初回は保存フォルダ選択ゲートから始まります。フォルダを選ぶまで、ユーザーはサイドバーと「保存フォルダを選択」カードだけを見ます。接続後、`GardenStore` が次のファイルを読み込み、なければ作成します。

- `settings.json`
- `plants.json`
- `entries.json`
- `library.json`

主なルートは Dashboard、Plan、Today、Study、Library、Settings です。Planの植物はTodayから除外され、`screen-plan.jsx` で扱います。

## 信頼する情報源

HTML、JSX、CSS、テストを現在のソースオブトゥルースとして扱います。`README.md` は意図的に最小限です。ドキュメントとコードが矛盾する場合はコードを確認し、ドキュメントを更新してください。
