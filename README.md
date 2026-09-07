# 株クラRPG 公式ポータル

仕様書に基づく静的HTML・CSS・Vanilla JavaScriptサイト。npm・フレームワーク・バックエンド不要。元の仕様書と logo.png は変更していません。

## ページとファイル

- `index.html`：ロゴ、ギルドホール、4つの入口、メッセージ
- `about.html`：プロジェクト紹介、世界観、基本情報
- `characters.html`：4人の人物カードと詳細モーダル
- `games-pc.html` / `games-mobile.html`：プラットフォーム別のクエスト一覧
- `assets/css/`：共通、トップ、下層ページのデザイン
- `assets/js/`：共通ナビゲーション、人物詳細、ゲームカード描画
- `data/characters.js` / `data/games.js` / `data/site.js`：編集用データ
- `assets/images/logo/kabukura-rpg.png`：提供ロゴのコピー
- `assets/images/backgrounds/guild-hall.webp`：生成した背景素材。UI・人物を含みません
- `assets/images/placeholders/adventurer.svg`：正式な人物の外見を創作しない、汎用の仮画像
- `scripts/check.py` / `scripts/build.py`：任意の静的検証・配布用コピー

## ローカル表示

`index.html` をブラウザで開くだけで利用できます。開発時はこのフォルダで `python3 -m http.server 4173` を実行して `http://localhost:4173` を開いてください。Pythonは開発用サーバー・任意のチェック用であり、サイト自体の必須依存ではありません。

## ゲーム追加

1. ゲームのフォルダを `games/pc/任意の名前/` または `games/mobile/任意の名前/` に配置します。ゲーム内部の相対パスを保つためフォルダごと配置してください。既存ゲームは移動せず、外部URLを指定することもできます。
2. サムネイルを `assets/images/games/` に配置します（任意）。
3. `data/games.js` の配列に1件追加します。

```js
{
  id: 'my-game',
  title: 'ゲーム名',
  subtitle: '短い説明',
  platform: 'pc', // pc または mobile
  thumbnail: './assets/images/games/my-game.webp', // 未設定は null
  url: './games/pc/my-game/index.html', // 外部 https URL も利用可能
  difficulty: 3, // 0〜5、未定は null
  players: 1,
  controls: 'キーボード',
  status: 'available', // 未公開は coming-soon
  newTab: false // 既定は同じタブで起動
}
```

スマホ向けには `orientation: '縦向き'` と `osNote: '対応環境の注記'` も指定できます。`status: 'available'` と有効な `url` の両方があると「冒険を始める」が表示されます。それ以外は無効な準備中ボタンです。データが0件のページには空状態が表示されます。

## 人物追加・差し替え

`data/characters.js` の配列を編集します。`id`, `name`, `className`, `image`, `description`, `profile`, `stats` を設定してください。画像パスはHTMLを基準とした相対パスです。正式画像を設定したら `placeholder: false` に変更します。`stats` の `hp`, `investing`, `development` は0〜5、未設定は `null`。トップに表示する名前も同じデータから自動生成されます。

## 未設定・差し替え事項

- ゲーム本体と起動URLは未提供。PCの詠唱タイピングバトルとスマホの予告枠をCOMING SOON表示しています。実ゲームを新たに創作していません。
- 4名の正式な立ち絵、クラス、紹介文、能力値は未提供。人物カードとプロフィールを差し替えてください。
- フィナンツェの世界観は仕様書の仮設定を元にしています。
- X / GitHub のURLは `data/site.js` の `xUrl` / `githubUrl` に設定します。未設定中はリンクではなく「準備中」と表示します。
- OGPは提供ロゴを利用しています。各HTMLの `og:image` と `og:url` は現在のSites用URLです。GitHub Pagesへ公開する際は、その公開URLへ変更してください。
- 元の参考デザイン画像は未提供。提供ロゴと文章仕様に沿って作成しています。

## GitHub Pages

このフォルダのHTML・assets・data・games・`.nojekyll` をリポジトリの公開対象へ配置し、GitHubのPages設定で対象ブランチのルートを選択してください。すべてのサイト内リンクと読み込みパスは相対パスなので、`https://ユーザー.github.io/リポジトリ名/` でも動作します。GitHubへの公開操作自体はまだ行っていません。

任意で `python3 scripts/check.py` で参照切れを検査し、`python3 scripts/build.py` で配布用ファイルを `dist/` にまとめられます。`.openai/hosting.json` はSitesのプレビュー用設定です。

## 動作確認

- 5ページのローカル参照、画像alt、CSS内画像参照を検証。
- アプリ内ブラウザで全ページの描画、360px幅で横はみ出しがないことを確認。
- 1920pxの4列メニュー、人物一覧、紹介ページを確認。
- 人物詳細の表示、Escapeで閉じる操作、元ボタンへのフォーカス復帰、モバイルメニューの開閉を確認。
- 未公開クエストは起動できない無効ボタンとして表示。
- 390pxのトップも横はみ出しなし。CSSは360px / 390px / タブレット / PCに対応。アニメーション軽減設定に対応。
- ゲーム起動は本体未提供のため実ゲームでの確認不可。
- Chrome単体・Safari実機・iPhone実機・Lighthouseの測定は未実施。

## 音と保存データ

音の自動再生、アクセス解析、localStorageへの読み書きはありません。ゲームの保存領域に干渉しません。人物モーダルはネイティブdialogを使い、Escape・フォーカス制御に対応しています。
