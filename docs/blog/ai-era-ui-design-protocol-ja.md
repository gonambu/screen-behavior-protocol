# 「画面の振る舞い」をAIに伝えるためのYAML定義を試作して検証してみた

## はじめに

こんにちは、ログラスの南部です。

AIを活用してフロントエンドを開発していて、画面の動作や遷移を伝えるのが難しいなと感じたことはありませんか？

Figmaなどのビジュアルデザインツールは、画面の「見た目」を定義する上では強力です。しかし、ユーザーの操作による「動作」や「遷移」になると、MCPでの連携や画像の提供に加えて、さらに個別に自然言語での指示が必要な場合があります。

私は常々、デザインも動作も一度に渡して一気に開発できないかなと思っていました。

そこで今回は、その課題を解決するかもしれないアイデアを試してみました。

---

## 仮説：「振る舞い」をテキストで定義すれば伝わるのでは？

AIは原則テキストとの相性が良いです。なので、画面についての情報をテキストで渡すことができればコード生成の精度が上がるのでは？と考えました。

画面の構成・動作・遷移を構造化テキストで定義すれば、AIが正確に解釈できるはずです。

この仮説を検証するため、YAMLベースのプロトコルを試作してみました。

---

## 試作：画面振る舞いプロトコル（SBP: Screen Behavior Protocol）

Screen Behavior Protocol(以下、SBP)というものを試作してみました。
プロトコルといっても通信に使う意図はなく、デザイナーとエンジニアが画面について会話するためのプロトコルになるといいなという意味を込めて名付けました。

コンポーネントの名前はMaterial UIを参考にしています。
まだまだ仕様は曖昧ですが、少なくとも検証段階でAIに渡す分には困らないかと思い一定の曖昧さは許容しています。

### 書き方の例

```yaml
# 商品一覧・詳細画面の例
#
# ┌─────────────────┐      ┌─────────────────┐
# │ 商品一覧        │      │ 商品詳細        │
# ├─────────────────┤      ├─────────────────┤
# │ ┌─────────────┐ │      │ 商品名          │
# │ │ 商品A    →  │─┼─────→│ ¥1,000          │
# │ └─────────────┘ │      │                 │
# │ ┌─────────────┐ │      │ [カートに追加]  │
# │ │ 商品B    →  │ │      │                 │
# │ └─────────────┘ │      │ [← 一覧に戻る]  │
# └─────────────────┘      └─────────────────┘

screens:
  ProductList:
    # 動作: 状態の定義
    state:
      products:
        type: Product[]
        source: external

    # 構成: UIの構造
    layout:
      - List:
          for: product in $products
          children:
            - ListItem:
                content: $product.name
                # 動作: クリック時の処理
                on:click: "navigate(ProductDetail, { id: $product.id })"

  ProductDetail:
    params:
      id: string

    state:
      product:
        type: Product
        source: external

    layout:
      - Typography:
          variant: h1
          content: $product.name
      - Typography:
          content: $product.price
      - Button:
          label: カートに追加
          on:click: addToCart($product.id)
      - Button:
          label: 一覧に戻る
          on:click: navigate(ProductList)

# 遷移: 画面間の移動ルール
flows:
  ProductFlow:
    initial: ProductList
    transitions:
      - from: ProductList
        to: ProductDetail
        trigger: navigate(ProductDetail)
      - from: ProductDetail
        to: ProductList
        trigger: navigate(ProductList)
```

---

## 検証：想定されるSBPを使った開発フロー

### 想定する開発フロー

現実的に考えて、デザイナーがいきなりSBPを書くといったことは難しいかなと考えています。
1番想像しうる使われ方としては以下のフローに示す通りと考えます。

```
1. デザイナー → Figmaでデザイン作成
        ↓
2. Figma → AIでSBPのベース生成（構造部分）
        ↓
3. エンジニア + デザイナー → 振る舞い・遷移を追記
        ↓
4. SBP → AIでコード生成
```

このフローをシミュレーションして、SBPの有効性を検証して行こうと思います。

### 検証用の画面：分析ダッシュボード

SBPの威力を試すため、動作・遷移が複雑な画面を用意します。
動作の複雑性が高い画面であることを重視しているので、アプリケーションとして良いデザインかどうかは考慮していません。

### ステップ1: Figmaでデザイン作成

@[figma](https://www.figma.com/proto/vZsTb2RFHn4zXt9zk8d406/%E3%83%86%E3%83%83%E3%82%AF%E3%83%96%E3%83%AD%E3%82%B0%E7%94%A8?node-id=0-1&t=jGUe1cKqmeJzDw5h-1)

画面構成：

- ダッシュボード: タブで概要/売上/ユーザーを切り替え、カード表示
- データ管理: テーブル＋CRUD操作（編集モーダル、削除確認）
- 設定: トグルスイッチによる設定変更

含まれるコンポーネント：

- サイドナビゲーション（ページ遷移）
- ヘッダーメニュー（通知ドロップダウン、ユーザーメニュー）
- タブ切り替え（ダッシュボード画面内）
- テーブル → 行アクション（編集モーダル、削除確認）
- トースト通知

### ステップ2: SBPでコンポーネント構造を書く

Figmaデザインを元に、AIでSBPのベースを生成します。

https://github.com/gonambu/screen-behavior-protocol/blob/9acf84a97f0473c7a0ee54ebbf4ed05724433282/examples/dashboard/dashboard.sbp.yaml#L91-L200

### ステップ3: 振る舞いを追記

ここがSBPの本領発揮。Figmaだけでは伝わらない「動き」を定義します。

状態定義（state / computed）：

https://github.com/gonambu/screen-behavior-protocol/blob/9acf84a97f0473c7a0ee54ebbf4ed05724433282/examples/dashboard/dashboard.sbp.yaml#L64-L89

アクション定義：

https://github.com/gonambu/screen-behavior-protocol/blob/9acf84a97f0473c7a0ee54ebbf4ed05724433282/examples/dashboard/dashboard.sbp.yaml#L708-L760

画面遷移定義（flows）：

https://github.com/gonambu/screen-behavior-protocol/blob/9acf84a97f0473c7a0ee54ebbf4ed05724433282/examples/dashboard/dashboard.sbp.yaml#L992-L1036

### ステップ4: Claude Codeでコード生成

SBPのファイルだけ渡してSBPの仕様と一緒に渡し、以下のプロンプトでClaude Codeを使って開発してみました。

**与えたプロンプト:**

```
dashboard.sbp.yaml をReact MUIを使って実装して
SPEC.mdに仕様はあります
```

結果以下のようなアプリケーションが完成しました。
![](https://storage.googleapis.com/zenn-user-upload/9ff7bd9fb468-20251217.gif)


画面構成でいうと概ねFigmaデザイン通りですが、ヘッダーの長さが明らかに短く左側に余白があります。
そして大事なのはふるまいですが、定義した通りに動くかを確認すると、以下の動きを全て満たしていました。

- [x] サイドナビでページ遷移（ダッシュボード→データ管理→設定）
- [x] タブ切り替え（概要/売上/ユーザー）
- [x] ドロワー開閉
- [x] 編集モーダル開閉
- [x] 削除確認ダイアログ表示
- [x] トースト表示
- [x] フォームバリデーション
- [x] 保存成功/失敗時の分岐

N=1ではありますが振る舞いに関してはこのくらいの複雑さであれば一定適切に読み取って実装できそうということがわかりました。
ヘッダーの長さについても修正は簡単なレベルの誤差と捉えられる範囲かなと思います。

---

## まとめと今後の展望

今回の検証で、YAMLベースのプロトコル（SBP）を使って画面の振る舞いを定義し、AIにコード生成させるアプローチが一定有効であることがわかりました。

### わかったこと

- 構造化テキストで動作を定義すると、AIが正確に解釈できる
- Figmaだけでは伝えにくい条件分岐やイベント処理が明確になる
- 複雑なダッシュボード画面でも、定義した振る舞いを再現できた

### 今後の展望

- Figma MCPとの連携で、見た目と振る舞いを同時に渡せるワークフローの検証
- より複雑なアプリケーション（リアルタイム更新、認証フローなど）での検証
- デザイナーとエンジニアが共同編集するワークフローの実践

### 実際の開発現場で想定される課題

- 既存プロダクトへの途中導入が難しい（新規開発向き）
- コーポレートデザインやデザインシステムとの統合に工夫が必要
- SBP自体の学習コスト

まだ実験段階ですが、「動くUIをAIに伝える」という課題に対する一つのアプローチとして、引き続き試行錯誤を続けていきます。

---

検証用SBP: https://github.com/gonambu/screen-behavior-protocol/blob/6752f9a/examples/dashboard/dashboard.sbp.yaml
生成されたコード: https://github.com/gonambu/screen-behavior-protocol/tree/6752f9a/examples/dashboard/implementation
