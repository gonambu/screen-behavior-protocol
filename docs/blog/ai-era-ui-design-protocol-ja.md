# SBPでデザイナーとエンジニアの協業を試してみた

> **⚠️ これは実験記録です**
>
> まだ全然定まった仕様ではなく、試行錯誤している段階です。
> 世に出せるほどのものではないので、「こんなアプローチもあるんだな」程度にご覧ください。

---

## やりたいこと

デザイナーとエンジニアが **同じドキュメント** を見ながら会話できないかな、と思いました。

- デザイナー: Figmaで見た目を作る
- エンジニア: コードで動きを実装する

この間に「画面の振る舞い」を書いたテキストがあれば、両者の橋渡しになるのでは？

---

## 試したこと

### 1. SBP（画面振る舞い定義）を書く

まず、画面の「状態」と「動き」をYAMLで書きました。

```yaml
screens:
  UserCreate:
    state:
      name:
        type: string
        initial: ""
      email:
        type: string
        initial: ""

    computed:
      isValid:
        all of:
          - name is not empty
          - email contains "@"

    layout:
      - TextField:
          label: 名前
          value: name
          on:change: set name to {value}

      - TextField:
          label: メールアドレス
          value: email
          on:change: set email to {value}

      - Button:
          label: 登録
          disabled: not isValid
          on:click: actions.submit
```

ポイントは：
- **自然言語に近い構文**: `name is not empty`, `email contains "@"`
- **プログラミング知識なしで読める**: デザイナーも「あ、名前が空だとボタン押せないのね」とわかる

### 2. Figma Makeに渡してみる

このSBPをFigma Makeに渡して「このSBPに基づいてUIを作って」とお願い。

→ **結果**: （ここに実験結果を追記予定）

### 3. コーディングAI（Claude）に渡してみる

同じSBPをClaudeに渡して「React + MUIで実装して」とお願い。

→ **結果**: （ここに実験結果を追記予定）

---

## 期待している効果

もし両方でちゃんと意図が伝わるなら：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  デザイナー   │────▶│     SBP     │────▶│  エンジニア  │
│  + Figma Make │◀────│  (共通言語)  │◀────│  + Claude   │
└─────────────┘     └─────────────┘     └─────────────┘
```

- デザイナーがSBPを書く/読む → Figma Makeでプロトタイプ生成
- エンジニアが同じSBPを読む → Claudeでコード生成
- **両者が同じドキュメントを見て会話できる**

「このボタンの`disabled`条件、こう変えたい」みたいな会話ができるようになるかも。

---

## 現状

まだ実験中です。

- SBPの書き方自体がまだ固まってない
- 「自然言語で書いてAIが解釈してくれればOK」くらいの緩さ
- 厳密な仕様があるわけじゃない

うまくいったら追記します。興味ある方は [SPEC.md](../../SPEC.md) をどうぞ。
