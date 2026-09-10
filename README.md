# 株クラRPG 公式ポータル

仕様書に基づく静的HTML・CSS・Vanilla JavaScriptサイト。npm・フレームワーク・バックエンド不要。元の仕様書と logo.png は変更していません。

## ページとファイル

- `index.html`：提供された `top.jpeg` のキービジュアル、メニューへのスクロール導線、4つの入口、メッセージ
- `about.html`：プロジェクト紹介、世界観、基本情報
- `characters.html`：4人の人物カードと詳細モーダル
- `games-pc.html` / `games-mobile.html`：プラットフォーム別のクエスト一覧
- `assets/css/`：共通、トップ、下層ページのデザイン
- `assets/js/`：共通ナビゲーション、人物詳細、ゲームカード描画
- `data/characters.js` / `data/games.js` / `data/site.js`：編集用データ
- `assets/images/logo/kabukura-rpg.png`：提供ロゴのコピー
- `assets/images/backgrounds/top.jpeg`：提供キービジュアル。PCでは横幅100%、縦横比を維持して全体表示し、画像または初期画面の下部にある「冒険を始める」でメニューへスクロールします。スマホではコンパクトなヘッダー直下に横幅100%・16:9の枠で表示します。`overflow: hidden` と `object-fit: cover`、`object-position: center top` で下端の机や小物をトリミングし、ロゴと4人全員の頭・顔を残します。歓迎文・別ロゴ・メンバーリンクは重複表示せず、画像直後に案内文と横1列の4つの小型アーチボタンが続きます。
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

`data/characters.js` の配列を編集します。`id`, `name`, `className`, `image`, `description`, `profile`, `stats` を設定してください。画像パスはHTMLを基準とした相対パスです。正式画像を設定したら `placeholder: false` に変更します。`stats` の `hp`, `investing`, `development` は0〜5、未設定は `null`。PCトップは `assets/images/backgrounds/top.jpeg` を全体表示します。スマホトップは、ヘッダー → キービジュアル → 案内文 → 横1列の4つの小型アーチボタンという専用レイアウトです。ヘッダーのメニュー・案内文・カードはHTMLで実装しています。

## 未設定・差し替え事項

- PC「株クラTPG」とスマホ「チャートを駆けろ！」を公開中として登録。提供されたGitHub PagesのURLへ同一タブで移動します。PCの `?v=2` も保持しています。ゲーム本体はこのフォルダへコピーしていません。
- 4名の画像は `assets/images/characters/` の提供JPEGを使用しています。クラス・詳しいプロフィール・能力値は引き続き未設定です。
- 世界観は「株式投資をしている4人が集まって、ワイワイ遊ぶ」に変更しました。旧設定のフィナンツェ・資産1億円はサイト本文から削除しています。
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
- 提供された両ゲームの公開ページの読み込みを確認。ゲームの全編プレイは未実施。
- Chrome単体・Safari実機・iPhone実機・Lighthouseの測定は未実施。

## 音と保存データ

音の自動再生、アクセス解析、localStorageへの読み書きはありません。ゲームの保存領域に干渉しません。人物モーダルはネイティブdialogを使い、Escape・フォーカス制御に対応しています。

## 今回の導線・ゲーム一覧の調整

- PCのスクロール導線は、画像下端と初期画面下端のうち手前に置きます。トップ画像自体の表示・スマホのトリミングは維持しています。
- 768〜1199pxの扉は中間サイズの4列です。767px以下の小型4列も維持しています。
- TOPのh1はPC用セクションの外に置き、どの画面幅でも読み上げ可能にしています。
- `data/games.js` の `description`、`thumbnailAlt`、`controls`、`orientation`、`osNote` がゲーム内容・操作説明です。
- `data-layout="single"` はゲーム1本の場合の横長紹介（スマホは縦積み）、`collection` は複数本の一覧です。
- PCサムネイルは公開ゲームの `assets/start.jpeg`。スマホサムネイルは公開ゲームの `assets/nempanGo.png?v=2` を使ったSVGのゲームイメージです。スクリーンショットではありません。

### ナビゲーションのフック

- 各ページの `main[data-page-view][data-page]`：ページ全体の演出対象。
- `a[data-navigation="door"][data-destination]`：TOPの扉。内側の `.portal-content[data-transition-visual]` を動かせます。
- `a[data-navigation="page"][data-destination]`：ヘッダー・フッター・ページ間リンク。
- `a[data-navigation="game"][data-destination]`：ゲーム開始。内側の `.quest-launch-content[data-transition-visual]` を動かせます。
- `.quest-card[data-quest-id]`：ゲームごとの演出対象。サムネイルにも `data-transition-visual` があります。
- `data-navigation="scroll"`：PCトップ内スクロール。ページ遷移と区別します。

実際の移動先は常に `href` です。`dungeon.js` は767px以下で通常の同一タブ移動だけに短い演出を追加します。

### スマホ探索UX（Phase 1）

- `assets/css/dungeon.css` / `assets/js/dungeon.js` に分離。扉400ms、ページ間360ms、ゲーム開始560msで遷移します。ゲーム開始のみ「QUEST START」を表示します。
- 4扉横1列、`top.jpeg` の16:9・center topのトリミング、768px以上の表示設定は維持。
- 下層ページにエリア名と上部「← ギルドへ戻る」を追加。下部にも既存の戻るリンクがあります。
- 画面より下にある紹介セクション・人物カード・ゲームカード・戻る導線は、IntersectionObserverで一度だけ380msの出現。最初から見える部分は即表示、キーボードでフォーカスした部分も即表示します。
- 演出はスクロールやポインター操作をブロックしません。二重タップで待ち時間を延ばさず、別リンクへの操作を優先します。Escapeで待機を中止できます。
- ブラウザバック・タブ切替時は演出を解除。移動先の応答が遅い場合も、遷移開始から100ms後には元ページの暗転を解除します。
- 動きを減らす設定、PC、修飾キー付きクリック、別タブ、ダウンロード、同一ページ内リンクは通常のリンク動作。JavaScript無効時やIntersectionObserver非対応時もコンテンツを隠しません。
- 拡張用イベント `kabukura:navigation-start` のdetailは `kind` / `destination` / `duration`。`dungeon.js` 自体は音・振動・保存領域を操作しません。Phase 3の操作音は独立した `feedback.js` が扱います。

検証：`node scripts/test-dungeon.cjs`（29項目）、`python3 scripts/check.py`。ブラウザでは5ページ×7幅（360 / 390 / 430 / 768 / 1024 / 1440 / 1920px）の横はみ出し・PCへの干渉を確認。扉→エリア、スクロール出現、QUEST START→公開スマホゲーム起動画面、ブラウザバック、ギルドへの帰還を確認済み。iPhone / Android実機での操作感・60fps測定は未実施です。

### スマホ探索UX（Phase 2）

- 石壁の上に静的な暗色グラデーションを重ね、下へ進むほど少し暗くしています。背景の常時アニメーションやスクロール監視は追加していません。
- 「GUILD HALL」「ARCHIVES · 記録の棚」「RETURN TO GUILD」の金色の区切りを追加。架空の階数や松明の点滅は使っていません。
- スマホの人物カードは全面が既存の詳細ボタンのタップ領域です。キーボード操作用のボタンは各カード1個のままです。
- ステータスウィンドウは開く240ms・閉じる200ms（220msで確実に閉じる）。閉じるボタンはスクロール中も上部に残ります。Escape・背景タップ・フォーカス復帰・スクロールロック解除に対応。
- ギルドメニューは220msで開閉。現在地を金枠で表示し、閉じた項目はinertでフォーカス対象から外します。画面高が小さい場合はパネル内をスクロールできます。
- 768px以上は従来の表示、動きを減らす設定では待機なし。トップ画像の表示設定と4扉の配置は変更していません。
- 検証：`node scripts/test-guild-ui.cjs`（16項目）と既存の遷移テスト（29項目）。ブラウザで人物画像タップ、Enter/Escape、閉じたメニューのTabスキップ、全5ページ×7幅の横はみ出し・PCへの干渉を確認。実機とフレームレート測定は未実施。

### スマホ探索UX（Phase 3）

- ギルドメニューに「SOUND ON / OFF」と「振動 ON / OFF」を追加。新しいセッションは両方OFFです。オンにする操作も含め、実際のユーザー操作でのみ鳴動します。ページ表示・スクロールによる自動再生はありません。
- `assets/js/feedback.js` に分離。外部音源や音声ファイルの追加読み込みはなく、Web Audioの小音量・短い三角波で扉（約160ms）／決定（75ms）／QUEST START（300ms）を表現します。実際の木・石の録音音源ではありません。
- 音声の準備や再生をページ移動処理が待つことはありません。音OFF、画面非表示、ページ離脱では待機中・再生中の音を止めます。連打の重複を抑え、使い終わった音声ノードを解放します。
- 振動は対応ブラウザで15ms。非対応・拒否環境では設定を利用不可にし、動きを減らす設定では振動しません。API対応でも実際に振動するかは端末に依存します。
- `sessionStorage` の専用キー `kabukura.portal.feedback.v1` だけで、このタブ内の設定を引き継ぎます。localStorageやゲームのキーにはアクセスしません。保存できない環境でも現在のページ内で利用できます。
- 768px以上では設定を表示せず、音・振動も実行しません。PCのレイアウト、スマホ4扉、画像表示、既存の遷移タイミングは維持しています。
- 検証：`node scripts/test-feedback.cjs`（24項目）と既存45項目。ブラウザで初期OFF、設定切替、ページ移動後の引き継ぎ、短い画面でのパネル内スクロール、7画面幅を確認。確認後は音・振動ともOFFに戻しています。実機での音量・音色・振動の体感は未確認です。
