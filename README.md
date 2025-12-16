# SBP - Screen Behavior Protocol

**AIと人間が共に読み書きできる画面振る舞い設計ドキュメント形式**

> **⚠️ 実験段階のプロジェクトです**
>
> SBPはまだ「こういう形式があったら便利かも」というアイデアを試している段階です。
> 仕様は頻繁に変わりますし、厳密な型定義もありません。
> 「自然言語で書いてAIが解釈してくれればOK」くらいの緩さで運用しています。
>
> 世に出せる完成度ではないので、参考程度にご覧ください。

---

## TL;DR

SBPは、フロントエンド画面の**振る舞い（状態・遷移・操作）**を構造化テキストで記述するためのプロトコルです。

```yaml
sbp: "0.4.0"

screens:
  UserList:
    route: /users
    state:
      users:
        type: User[]
        source: external
      loading:
        type: boolean
        initial: true

    computed:
      hasUsers:
        not empty: $users

    layout:
      - Box:
          padding: 3
          children:
            - TextField:
                label: "検索"
                value: $searchQuery
                on:change: set $searchQuery to $value

            - when: $loading
              then: CircularProgress
              else:
                - Table:
                    children:
                      - TableBody:
                          children:
                            - for: user in $users
                              render:
                                - TableRow:
                                    on:click: navigate(UserDetail, { id: $user.id })
                                    children:
                                      - TableCell:
                                          content: $user.name
```

このYAMLから：
- **人間**は画面の構造と振る舞いを理解できる
- **AI**はReact/Vue/Flutterなどのコードを生成できる
- **レビュアー**は設計の意図を確認できる

---

## なぜSBPが必要か

### 従来のUI設計の課題

| 手法 | 課題 |
|------|------|
| **Figma等のデザインカンプ** | 状態遷移や条件分岐を表現できない |
| **自然言語の仕様書** | 曖昧で解釈が分かれる |
| **実装コード** | 詳細すぎて設計意図が埋もれる |
| **プロトタイプ** | 作成コストが高い |

### AIコード生成時代の新しい課題

- デザインカンプだけでは「どう動くか」がAIに伝わらない
- 自然言語の指示は曖昧で、意図しないコードが生成される
- 生成されたコードのレビューに設計意図との照合が困難

### SBPの解決策

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   デザイン    │────▶│     SBP     │────▶│    コード    │
│  (見た目)    │     │ (構造+振る舞い) │     │   (実装)    │
└─────────────┘     └─────────────┘     └─────────────┘
      ↑                   ↑                   ↑
   デザイナー          設計者/AI           開発者/AI
```

SBPは「見た目」と「実装」の間の**振る舞いを記述する中間層**として機能します。

---

## 設計思想

### 1. Human-Readable First（人間が読める）

YAMLで記述し、**人間が読んで理解できる**ことを最優先にします。

```yaml
# 良い例：意図が明確
- when: $user.isAdmin
  then: AdminPanel
  else: UserPanel

# 避ける：暗号的な省略
- if: u.ia then: AP
```

### 2. AI-Parseable（AIが解釈可能）

構造が一貫しており、**AIが確実に解釈できる**ようにします。

- 状態参照は `$` プレフィックス（`$users`, `$form.valid`）
- イベントは `on:` プレフィックス（`on:click`, `on:submit`）
- 条件は `when:` / `match:` で統一
- 派生状態は自然言語クエリ形式（`count: $todos where: not completed`）

### 3. MUIコンポーネントベース

**Material-UI (MUI) のコンポーネント名とプロパティ**をベースにします。

```yaml
# MUIコンポーネントを使用
- TextField:
    label: "名前"
    variant: outlined
    value: $form.name
    on:change: set $form.name to $value

- Button:
    variant: contained
    color: primary
    label: "保存"
    on:click: actions.save
```

AIはMUIコンポーネントから、他のフレームワーク（Chakra UI、Vuetify、Flutter等）への変換も可能です。

### 4. 省略可能なフィールド

多くのフィールドは省略可能であり、必要に応じて記述できます。

```yaml
# 最小限の定義（descriptionのみでも有効）
screens:
  UserList:
    description: ユーザー一覧を表示

# 必要に応じてフィールドを追加
screens:
  UserList:
    description: ユーザー一覧を表示
    route: /users
    state:
      users: { type: User[], source: external }
    layout:
      - Table:
          data: $users
```

---

## SBPではないもの

明確にするために、SBPが**対象としないもの**を記載します。

| カテゴリ | 説明 |
|----------|------|
| **ランタイム** | DivKitのように実行時にJSONを解釈してUIを描画するものではない |
| **デザインツール** | Figmaのような視覚的デザインツールではない |
| **コンポーネントライブラリ** | 実装済みのコンポーネントを提供するものではない |
| **スタイリング言語** | CSSやTailwindの代替ではない |

---

## クイックスタート

### 1. 基本構造

```yaml
sbp: "0.4.0"

meta:
  name: My App
  description: サンプルアプリケーション

types:
  User:
    id: string
    name: string
    email: string

screens:
  UserList:
    route: /users
    state:
      users:
        type: User[]
        source: external
    layout:
      - Table:
          children:
            - TableBody:
                children:
                  - for: user in $users
                    render:
                      - TableRow:
                          children:
                            - TableCell:
                                content: $user.name
```

### 2. 状態と参照

```yaml
state:
  # ローカル状態
  loading:
    type: boolean
    initial: true

  # 外部データ
  users:
    type: User[]
    source: external

  # フォーム
  form:
    type: form
    schema: UserForm
    initial:
      name: ""
      email: ""

# 派生状態（自然言語クエリ形式）
computed:
  activeUsers:
    filter: $users
    where: status equals "active"

  userCount:
    count: $users

# 参照は$プレフィックス
layout:
  - when: $loading
    then: CircularProgress
    else:
      - Table:
          data: $users
  - TextField:
      value: $form.name
      on:change: set $form.name to $value
```

### 3. アクション

```yaml
actions:
  submit:
    steps:
      - validate: $form
      - if: not $form.valid
        then:
          - return
      - do: createUser($form.values)
      - when: success
        then:
          - toast: success("作成しました")
          - navigate: UserList
      - when: failure
        then:
          - toast: error($message)
```

### 4. 条件分岐

```yaml
layout:
  # when-then-else
  - when: $loading
    then: CircularProgress
    else: Content

  # match
  - match: $status
    cases:
      active: ActiveBadge
      inactive: InactiveBadge
    default: UnknownBadge

  # 繰り返し
  - for: user in $users
    render:
      - Card:
          children:
            - Typography:
                content: $user.name
```

---

## ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [SPEC.md](./SPEC.md) | 完全な仕様書 |
| [COMPETITORS.md](./docs/COMPETITORS.md) | 競合調査 |
| [DESIGN_DECISIONS.md](./docs/DESIGN_DECISIONS.md) | 設計判断の記録 |

## サンプル

| ファイル | 内容 |
|----------|------|
| [examples/user-management/](./examples/user-management/) | CRUD画面の完全なサンプル |
| [examples/todo-app/](./examples/todo-app/) | プロジェクト・タグ管理付きToDoアプリ |
| [examples/slack-like-chat/](./examples/slack-like-chat/) | Slackライクなチャットアプリ |
| [examples/dashboard/](./examples/dashboard/) | 分析ダッシュボード |

---

## 想定ワークフロー

### 1. 設計フェーズ

```
デザインカンプ → SBP記述 → レビュー → 承認
```

1. デザイナーがFigmaでビジュアルを作成
2. 設計者がSBPで構造・状態・遷移を記述
3. チームでSBPをレビュー（PRベース）
4. 合意が取れたら実装フェーズへ

### 2. 実装フェーズ

```
SBP → AI生成/手動実装 → コードレビュー
```

1. SBPをAIに渡してコード生成
2. 生成されたコードをSBPと照合してレビュー
3. 必要に応じて調整

### 3. 変更フェーズ

```
要件変更 → SBP更新 → 差分レビュー → コード更新
```

1. 要件変更があればSBPを更新
2. SBPの差分をレビュー
3. 差分に基づいてコードを更新

---

## 貢献

このプロジェクトはまだ初期段階です。以下の貢献を歓迎します：

- 仕様へのフィードバック
- サンプルの追加
- ツール実装（パーサー、バリデーター）

---

## ライセンス

MIT License

---

## 関連プロジェクト・参考文献

- [DivKit](https://github.com/divkit/divkit) - Yandex のServer-Driven UI
- [JSON Forms](https://jsonforms.io/) - JSON Schemaベースのフォーム生成
- [W3C Design Tokens](https://www.designtokens.org/) - デザイントークン標準
- [UIML](https://en.wikipedia.org/wiki/UIML) - UIマークアップ言語（学術）
