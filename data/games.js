// 公開中のゲーム。未公開ゲームを追加するときは status: "coming-soon", url: null を指定します。
// platforms には対応端末を列挙します（"pc" / "mobile"）。両対応は両方のページに掲載されます。
window.KABUKURA_GAMES = [
  {
    "id": "typing-rpg",
    "title": "株クラTPG",
    "subtitle": "株クラの仲間と冒険へ",
    "platforms": ["pc"],
    "thumbnail": "./assets/images/games/typing-rpg.jpeg",
    "thumbnailAlt": "株クラTPGのタイトル画像。キーボードの文字と4人の冒険者",
    "description": "投資の言葉をタイピングして、4人の仲間と勝負。正確に入力して、冒険を進めよう。",
    "osNote": "物理キーボード推奨。日本語入力（IME）はOFFにしてください。",
    "url": "https://kabukura-rpg.github.io/kabukura-rpg/?v=2",
    "difficulty": null,
    "players": 1,
    "controls": "キーボード・クリック",
    "status": "available"
  },
  {
    "id": "chart-rider",
    "title": "チャートを駆けろ！",
    "subtitle": "CHART RIDER",
    "platforms": ["pc", "mobile"],
    "thumbnail": "./assets/images/games/chart-rider.svg",
    "thumbnailAlt": "チャートを駆けろ！のゲームイメージ。ローソク足の間を飛ぶねむぱん",
    "description": "タップ / クリックで上昇、何もしないと落下。ローソク足の隙間を抜けて、どこまで進めるか挑戦しよう。",
    "orientation": "縦向き",
    "url": "https://kabukura-rpg.github.io/kabukura-knife-catch/",
    "difficulty": null,
    "players": 1,
    "controls": "タップ / クリック",
    "status": "available"
  },
  {
    "id": "knife-catch",
    "title": "落ちるナイフを掴め",
    "subtitle": "KNIFE CATCH",
    "platforms": ["pc", "mobile"],
    "thumbnail": "./assets/images/games/knife-catch.png",
    "description": "落ちてくるナイフをタイミングよくキャッチする反射神経ミニゲーム。",
    "url": "https://kabukura-rpg.github.io/chartDash/",
    "difficulty": null,
    "players": 1,
    "controls": "長押しで移動（タップ / クリック）",
    "status": "available",
    "thumbnailAlt": "落ちるナイフを掴めのタイトル画面"
  },
  {
    "id": "daily-bottom",
    "title": "底値を掴め！",
    "subtitle": "DAILY BOTTOM",
    "platforms": ["pc", "mobile"],
    "thumbnail": "./assets/images/games/daily-bottom.png",
    "thumbnailAlt": "底値を掴め！ DAILY BOTTOMのタイトル画面",
    "description": "動くチャートを見て、底値を狙ってBUY。デイリーと練習モードで挑戦するタイミングゲーム。",
    "url": "https://kabukura-rpg.github.io/nanpinmaster/",
    "difficulty": null,
    "players": 1,
    "controls": "BUYボタンをタップ / クリック",
    "status": "available"
  },
  {
    "id": "portfolio-roguelite",
    "title": "株クラ｜20年の相場を生き抜く",
    "subtitle": "PORTFOLIO ROGUELITE",
    "platforms": ["pc", "mobile"],
    "thumbnail": "./assets/images/games/portfolio-roguelite.png",
    "thumbnailAlt": "株クラ PORTFOLIO ROGUELITEのタイトル画面",
    "description": "100万円を元手に、20年間の市場を生き抜く。投資先を選び、手札を組み合わせ、相場を攻略する。",
    "url": "https://kabukura-rpg.github.io/Roguelite/",
    "difficulty": null,
    "players": 1,
    "controls": "タップ / クリックで投資先・戦略カードを選択",
    "status": "available"
  }
];
