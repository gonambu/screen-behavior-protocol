# UI Description Protocol (UIDP) v0.3.0

**UI画面の構造・状態・遷移を記述するための設計ドキュメント形式**

---

## 概要

UIDPは、フロントエンドUIの設計を構造化テキストで記述するためのプロトコルである。
**デザイナーと開発者のコミュニケーションツール**として、コードを書かずにUIを定義できる。

### UIDPが解決する課題

| 従来の課題 | UIDPによる解決 |
|-----------|---------------|
| デザインカンプは視覚的だが状態や遷移を表現できない | 構造・状態・遷移を一体で記述 |
| 自然言語の仕様書は曖昧 | 厳密な構文で解釈の揺れを排除 |
| コードは詳細すぎて設計意図が埋もれる | 抽象レベルで意図を明確に表現 |
| AIによるコード生成の入力として不適切 | 機械可読かつ人間可読な形式 |
| **プログラミング知識が必要** | **自然言語に近いクエリ形式で非エンジニアも読み書き可能** |

### UIDPではないもの

- **ランタイムではない**: DivKitのように実行時にJSONを解釈してUIを描画するものではない
- **デザインツールではない**: Figmaのような視覚的デザインツールではない
- **コンポーネントライブラリではない**: 実装済みのコンポーネントを提供するものではない

---

## スコープ

UIDPは「デザイナーと開発者のコミュニケーションツール」として、**意図**を記述する。実装詳細は含めない。

### UIDPが扱うもの

| 領域 | 内容 |
|------|------|
| 構造 | コンポーネントツリー、相対レイアウト（Stack, Grid） |
| 状態 | ローカル状態、グローバル状態、フォーム状態、派生状態 |
| 振る舞い | イベントハンドラ、アクション、画面遷移 |
| データ | 「外部からデータを取得する」「データを保存する」という**意図** |
| トークン | デザイントークン（W3C DTCG互換） |

### UIDPが扱わないもの

| 領域 | 理由 | 責務 |
|------|------|------|
| API定義（エンドポイント、HTTPメソッド） | 実装の詳細 | バックエンド/実装 |
| 永続化先（localStorage, DB） | 実装の詳細 | 実装 |
| ピクセル単位のレイアウト | 視覚的デザインの詳細 | Figma |
| 絶対配置・z-index | CSSの詳細 | Figma/CSS |
| 詳細なCSS（box-shadow, transform） | 実装の詳細 | CSS |
| アニメーション・トランジション | 複雑、実装依存が大きい | Figma/CSS |
| セキュリティ実装（CSRF, XSS） | インフラの責務 | 実装 |
| パフォーマンス最適化（memo化） | フレームワーク依存 | 実装 |
| テスト記述 | 別ツールの責務 | テストツール |
| アナリティクス | 別ツールの責務 | 分析ツール |

### 設計原則との関係

このスコープ定義は4つの設計原則に基づく：

- **Human-Readable First**: 詳細すぎる情報は可読性を下げる
- **AI-Parseable**: 複雑すぎる構文は避ける
- **Framework-Agnostic**: 実装詳細は含めない
- **Progressive Detail**: 省略可能な情報は詳細レベルで追記

---

## 設計原則

### 1. Human-Readable First（人間が読める）

```yaml
# 良い例：意図が明確
- when: user.isAdmin
  show: AdminPanel

# 避ける：暗号的な省略
- if: u.ia then: AP
```

- YAMLで記述し、インデントで階層を表現
- 省略より明確さを優先
- 日本語・英語どちらでもキー以外のテキストに使用可能
- **デザイナーが読める自然言語に近い表現**

### 2. AI-Parseable（AIが解釈可能）

```yaml
# 構造が一貫している
layout:
  - ComponentName:
      prop1: value1
      prop2: value2

# 参照はクォートなし、文字列はクォート付きで区別
data: users                              # 参照
status: "active"                         # 文字列リテラル
on:click: navigate(UserDetail, { id: row.id })
```

- 構造のパターンが一貫している
- 参照と文字列リテラルを区別（クォートの有無）
- 曖昧な自然言語記述を避ける

### 3. Framework-Agnostic（フレームワーク非依存）

```yaml
# 抽象コンポーネント名を使用
- TextField:
    label: "名前"
    bind: $form.name

# フレームワーク固有の記述を避ける
# NG: <MuiTextField>, <input className="...">
```

- 抽象的なコンポーネント名を使用
- マッピングファイルで具象実装に変換

### 4. Progressive Detail（段階的詳細化）

```yaml
# Level 1: 概要のみ
screens:
  UserList:
    description: ユーザー一覧を表示し、検索・ページネーション・CRUD操作ができる

# Level 2: 構造を追加
screens:
  UserList:
    layout:
      - SearchBar
      - DataTable
      - Pagination

# Level 3: 完全な定義
screens:
  UserList:
    state:
      users: { type: User[], source: external }
    layout:
      - SearchBar:
          bind: $searchQuery
          on:submit: actions.search
      # ...
```

---

## ドキュメント構造

```yaml
uidp: "0.2.1"                    # プロトコルバージョン（必須）

meta:                            # メタデータ
  name: "アプリケーション名"
  description: "説明"
  version: "1.0.0"
  authors: ["author@example.com"]

imports:                         # 外部定義のインポート
  - ./components/common.uidp.yaml
  - ./tokens/design-tokens.yaml

tokens:                          # デザイントークン（W3C DTCG互換）
  colors: { ... }
  spacing: { ... }

types:                           # 型定義
  User: { ... }

globals:                         # グローバル状態（アプリ全体で共有）
  currentUser: { ... }

subscriptions:                   # リアルタイムイベント購読（任意）
  - event: ...

components:                      # 再利用可能コンポーネント
  SearchBar: { ... }

screens:                         # 画面定義
  UserList: { ... }

flows:                           # 画面遷移定義
  UserManagement: { ... }
```

---

## 用語集（Glossary）

| 用語 | 定義 | 例 |
|-----|------|-----|
| **Screen** | ルーティング可能な独立した画面単位 | `/users`, `/users/:id` |
| **Component** | 再利用可能なUI部品 | `Button`, `DataTable` |
| **Layout** | コンポーネントの配置構造（ツリー） | `[Header, Content, Footer]` |
| **State** | 画面またはコンポーネントが持つ状態 | `loading`, `users`, `form` |
| **Globals** | アプリ全体で共有されるグローバル状態 | `currentUser`, `theme` |
| **Action** | ユーザー操作に対する振る舞いの手続き | `submit`, `delete` |
| **Flow** | 画面間の遷移グラフ | `UserList → UserDetail` |
| **Subscription** | リアルタイムイベントの購読 | WebSocket, Server-Sent Events |
| **Binding** | 状態とUIの双方向接続 | `bind: $form.name` |
| **Reference** | 状態や値への参照 | `$users`, `$form.valid` |
| **Token** | デザインの基本値（色、間隔など） | `$colors.primary` |
| **Persist** | 状態の永続化先 | `localStorage`, `sessionStorage` |

---

## 1. Types（型定義）

画面間で共有するデータ構造を定義する。

```yaml
types:
  # エンティティ型
  User:
    id: string
    name: string
    email: string
    role: Role
    status: UserStatus
    createdAt: datetime
    updatedAt: datetime

  # 列挙型
  Role:
    enum: [admin, member, viewer]
    labels:                      # 表示ラベル（任意）
      admin: 管理者
      member: メンバー
      viewer: 閲覧者

  UserStatus:
    enum: [active, inactive, pending]

  # ページネーション付きレスポンス
  PaginatedResponse<T>:
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number

  # フォーム型
  UserForm:
    name: string
    email: string
    role: Role
```

### 組み込み型

| 型 | 説明 | 例 |
|----|------|-----|
| `string` | テキスト | `"hello"` |
| `number` | 数値 | `42`, `3.14` |
| `boolean` | 真偽値 | `true`, `false` |
| `date` | 日付（時刻なし） | `2024-01-15` |
| `datetime` | 日時 | `2024-01-15T09:30:00Z` |
| `any` | 任意の型 | - |

### 型修飾子

| 記法 | 意味 | 例 |
|------|------|-----|
| `T[]` | Tの配列 | `User[]` |
| `T?` | Tまたはnull | `string?` |
| `T \| U` | TまたはU | `string \| number` |

---

## 2. Tokens（デザイントークン）

W3C Design Tokens Community Group (DTCG) 形式との互換性を持つ。

```yaml
tokens:
  colors:
    primary:
      $value: "#1976d2"
      $type: color
    secondary:
      $value: "#dc004e"
      $type: color
    error:
      $value: "#f44336"
      $type: color
    text:
      primary:
        $value: "rgba(0, 0, 0, 0.87)"
        $type: color
      secondary:
        $value: "rgba(0, 0, 0, 0.6)"
        $type: color

  spacing:
    xs:
      $value: "4px"
      $type: dimension
    sm:
      $value: "8px"
      $type: dimension
    md:
      $value: "16px"
      $type: dimension
    lg:
      $value: "24px"
      $type: dimension
    xl:
      $value: "32px"
      $type: dimension

  typography:
    h1:
      $value:
        fontFamily: "Roboto, sans-serif"
        fontSize: "2.5rem"
        fontWeight: 700
        lineHeight: 1.2
      $type: typography

  borderRadius:
    sm:
      $value: "4px"
      $type: dimension
    md:
      $value: "8px"
      $type: dimension

# 使用例
layout:
  - Card:
      padding: $tokens.spacing.md
      background: $tokens.colors.background
```

---

## 3. Globals（グローバル状態）

アプリケーション全体で共有される状態を定義する。

```yaml
globals:
  # === 認証ユーザー ===
  currentUser:
    type: User
    source: external              # 外部から取得（実装が決定）
    # 未認証時はnull

  # === アプリ設定 ===
  theme:
    type: enum[light, dark, system]
    initial: system
    persist: true                 # 永続化する（実装が方法を決定）

  # === ワークスペース（Slackのような複数テナント）===
  currentWorkspace:
    type: Workspace
    persist: true

  # === 機能フラグ ===
  features:
    type: object
    source: external
    schema:
      darkMode: boolean
      betaFeatures: boolean

  # === 通知設定 ===
  notifications:
    type: Notification[]
    initial: []
```

### グローバル状態の参照

```yaml
# どの画面からでも参照可能
layout:
  - when: $currentUser.role == "admin"
    then: AdminPanel

  - UserAvatar:
      user: $currentUser

# 条件付きレンダリング
  - when: $features.darkMode
    then: DarkModeToggle
```

### 永続化（persist）

`persist: true` を指定すると、その状態が永続化される（ブラウザを閉じても維持される）。
永続化の方法（localStorage、cookie、DBなど）は実装が決定する。

```yaml
globals:
  theme:
    type: string
    persist: true               # 永続化する
```

---

## 4. Subscriptions（リアルタイム購読）

WebSocket、Server-Sent Events などのリアルタイムイベントを購読する。

```yaml
# === 画面またはコンポーネントでの定義 ===
screens:
  ChannelView:
    subscriptions:
      # メッセージ受信
      - event: newMessage
        filter: $event.channelId == $props.channelId
        action: actions.onNewMessage($event)

      # タイピング通知
      - event: typing
        filter: $event.channelId == $props.channelId
        action: actions.onTyping($event)

      # ユーザーステータス変更
      - event: userStatus
        action: actions.updateUserStatus($event)
```

### Subscription 定義

| プロパティ | 説明 | 必須 |
|-----------|------|------|
| `event` | 購読するイベント名 | ✓ |
| `filter` | イベントを受け取る条件（式） | |
| `action` | イベント受信時に実行するアクション | ✓ |

### イベント受信時のアクション

```yaml
actions:
  onNewMessage:
    params:
      event: MessageEvent
    steps:
      # メッセージをリストに追加
      - set: $messages = [...$messages, $event.message]
      # スクロール位置を調整
      - effect: scrollToBottom($messageList)

  onTyping:
    params:
      event: TypingEvent
    steps:
      # タイピング中ユーザーを追加
      - set: $typingUsers = addToSet($typingUsers, $event.user)
      # 3秒後に削除
      - delay: 3000ms
      - set: $typingUsers = removeFromSet($typingUsers, $event.user)
```

### グローバルなサブスクリプション

```yaml
# アプリ全体で購読するイベント
globals:
  notifications:
    type: Notification[]
    initial: []

# ルートレベルでの定義
subscriptions:
  - event: notification
    action: globals.addNotification($event)

  - event: sessionExpired
    action: navigate(Login)
```

---

## 5. Screen（画面）

ルーティング可能な独立した画面単位。

```yaml
screens:
  UserList:
    # === 基本情報 ===
    title: ユーザー一覧
    description: |
      ユーザーの一覧を表示する。
      検索、ページネーション、作成・編集・削除が可能。

    # === ルーティング ===
    route: /users
    params:
      page:
        type: number
        default: 1
      q:
        type: string
        default: ""

    # === 状態 ===
    state:
      users:
        type: PaginatedResponse<User>
        source: external
      loading:
        type: boolean
        initial: true
      selectedIds:
        type: string[]
        initial: []

    # === 派生状態 ===
    computed:
      hasSelection:
        not empty: selectedIds
      canDelete:
        all:
          - hasSelection
          - currentUser.role equals "admin"

    # === レイアウト ===
    layout:
      - PageHeader:
          title: title
          actions:
            - Button:
                label: "新規作成"
                icon: add
                variant: primary
                on:click: navigate(UserCreate)

      - Card:
          children:
            - Toolbar:
                left:
                  - SearchField:
                      value: params.q
                      placeholder: "名前またはメールで検索"
                      on:submit: navigate(UserList, { q: value, page: 1 })
                right:
                  - when: hasSelection
                    show:
                      - Button:
                          label: "一括削除"
                          variant: danger
                          disabled: not canDelete
                          on:click: actions.bulkDelete

            - match: loading
              true:
                - TableSkeleton:
                    rows: 10
              false:
                - DataTable:
                    data: users.items
                    columns: columns
                    selectable: true
                    selection: selectedIds
                    on:selectionChange: set(selectedIds, value)
                    on:rowClick: navigate(UserDetail, { id: row.id })
              empty:
                - EmptyState:
                    icon: people
                    title: ユーザーがいません
                    description: 新規作成ボタンからユーザーを追加してください
                    action:
                      label: 新規作成
                      on:click: navigate(UserCreate)
              error:
                - ErrorState:
                    message: error.message
                    action:
                      label: 再読み込み
                      on:click: do: reload

            - Pagination:
                page: $users.page
                totalPages: $users.totalPages
                on:change: navigate(UserList, { page: $value, q: $params.q })

    # === カラム定義 ===
    columns:
      - field: name
        header: 名前
        sortable: true
      - field: email
        header: メールアドレス
        sortable: true
      - field: role
        header: 権限
        cell:
          - RoleChip:
              value: $cell
      - field: status
        header: ステータス
        cell:
          - StatusBadge:
              value: $cell
      - field: createdAt
        header: 作成日
        cell:
          - DateTime:
              value: $cell
              format: YYYY/MM/DD
      - field: _actions
        header: ""
        width: 100
        cell:
          - IconButton:
              icon: edit
              tooltip: 編集
              on:click: navigate(UserEdit, { id: $row.id })
          - IconButton:
              icon: delete
              tooltip: 削除
              on:click: actions.deleteOne($row.id)

    # === アクション ===
    actions:
      deleteOne:
        params:
          id: string
        confirm:
          title: ユーザーを削除
          message: このユーザーを削除しますか？この操作は取り消せません。
          confirmLabel: 削除
          cancelLabel: キャンセル
          variant: danger
        steps:
          - do: deleteUser({ id })
          - when: success
            then:
              - toast: success("ユーザーを削除しました")
          - when: failure
            then:
              - toast: error(message)

      bulkDelete:
        confirm:
          title: 一括削除
          message: "選択した{count(selectedIds)}件のユーザーを削除しますか？"
          variant: danger
        steps:
          - do: deleteUsers({ ids: selectedIds })
          - when: success
            then:
              - toast: success("{result.count}件のユーザーを削除しました")
              - set: { selectedIds: [] }
          - when: failure
            then:
              - toast: error(message)
```

### 埋め込みScreen（コンポーネントとしての画面）

`route` を持たない Screen は、他の画面内に埋め込んで使用できる。
Component との違いは、独自の state やライフサイクルを持つ点。

```yaml
screens:
  # === 埋め込みScreen（routeなし）===
  ChannelView:
    description: チャンネルのメッセージ一覧と入力欄

    # props を受け取る（routeの代わり）
    props:
      channelId:
        type: string
        required: true

    # 親に対してイベントを発火
    events:
      - openThread
      - openChannelInfo

    # 独自の状態を持つ
    state:
      channel:
        type: Channel
        source: external
        fetchOn: [mount, propsChange]   # propsが変わったら再取得
      messages:
        type: Message[]
        source: external
      loading:
        type: boolean
        initial: true

    # リアルタイム購読
    subscriptions:
      - event: newMessage
        filter: $event.channelId == $props.channelId
        action: actions.onNewMessage($event)

    layout:
      - Flex:
          direction: column
          height: 100%
          children:
            - MessageList:
                messages: $messages
                on:replyClick: emit(openThread, $value)
            - MessageInput:
                on:submit: actions.sendMessage

    actions:
      sendMessage:
        steps:
          - do: sendMessage({ channelId: props.channelId, content: value })

  # === 通常のScreen（routeあり）===
  Workspace:
    route: /workspace/:workspaceId
    layout:
      - Flex:
          direction: horizontal
          children:
            # 埋め込みScreenの使用
            - ChannelView:
                channelId: $selectedChannelId
                on:openThread: actions.openThread($value)
                on:openChannelInfo: set($showChannelInfo, true)

            # 条件付きで表示
            - when: $activeThread
              then:
                - ThreadPanel:
                    threadId: $activeThread.id
                    on:close: set($activeThread, null)
```

### Screen vs Component

| 特性 | Screen (routeなし) | Component |
|-----|-------------------|-----------|
| 状態 | 独自の `state` を持てる | 親から props で受け取る |
| 外部データ | `source: external` で取得 | 親で取得して渡す |
| ライフサイクル | マウント/アンマウント | 親に依存 |
| 購読 | `subscriptions` を持てる | 持てない |
| 用途 | 独立した機能単位 | 再利用可能なUI部品 |

---

## 6. State（状態）

### 状態の種類

```yaml
state:
  # === 1. ローカル状態 ===
  isOpen:
    type: boolean
    initial: false

  selectedTab:
    type: string
    initial: "overview"

  # === 2. 外部データソース ===
  users:
    type: User[]
    source: external
    fetchOn: [mount, paramsChange]

  # === 3. フォーム状態 ===
  form:
    type: form
    schema: UserForm
    initial:
      name: ""
      email: ""
      role: "member"
```

### 派生状態（computed）- クエリ形式

派生状態はJavaScriptの式ではなく、**自然言語に近いクエリ形式**で記述する。

```yaml
computed:
  # === カウント ===
  remainingCount:
    count: todos
    where: not completed

  totalUsers:
    count: users

  # === 存在チェック ===
  hasCompleted:
    any: todos
    where: completed

  allCompleted:
    every: todos
    where: completed

  # === 空チェック ===
  isEmpty:
    empty: todos

  hasData:
    not empty: users

  # === 集計 ===
  totalPrice:
    sum: items
    field: price

  averageScore:
    avg: scores
    field: value

  # === 検索 ===
  selectedUser:
    find: users
    where: id equals selectedId

  activeUsers:
    filter: users
    where: status equals "active"

  # === 論理演算 ===
  canDelete:
    all:
      - hasSelection
      - currentUser.role equals "admin"

  showBanner:
    any:
      - isNewUser
      - hasPromotion
```

### クエリ演算子一覧

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `count` | 条件に合う要素数 | `count: todos` `where: not completed` |
| `any` | いずれかが条件を満たす | `any: todos` `where: completed` |
| `every` | すべてが条件を満たす | `every: items` `where: valid` |
| `empty` | 配列が空か | `empty: todos` |
| `not empty` | 配列が空でないか | `not empty: users` |
| `sum` | 合計値 | `sum: items` `field: price` |
| `avg` | 平均値 | `avg: scores` `field: value` |
| `find` | 条件に合う最初の要素 | `find: users` `where: id equals selectedId` |
| `filter` | 条件に合う要素の配列 | `filter: users` `where: status equals "active"` |
| `all` | すべてがtrue（AND） | `all: [cond1, cond2]` |

### 条件式（where句）

| 式 | 説明 | 例 |
|----|------|-----|
| `equals` | 等しい | `status equals "active"` |
| `not equals` | 等しくない | `role not equals "guest"` |
| `greater than` | より大きい | `age greater than 18` |
| `at least` | 以上 | `count at least 1` |
| `less than` | より小さい | `price less than 100` |
| `at most` | 以下 | `items at most 10` |
| `contains` | 含む | `name contains "田"` |
| `is empty` | 空である | `list is empty` |
| `in` | リストに含まれる | `status in ["active", "pending"]` |
| `not` | 否定 | `not completed` |
| `and` | かつ | `active and verified` |
| `or` | または | `admin or owner` |

### フォーム状態の詳細

```yaml
state:
  form:
    type: form
    schema: UserForm
    initial:
      name: ""
      email: ""
      role: "member"

    validation:
      name:
        - rule: required
          message: "名前は必須です"
      email:
        - rule: required
          message: "メールアドレスは必須です"
        - rule: email
          message: "有効なメールアドレスを入力してください"

# フォームのプロパティ参照
form.values          # 全フィールドの値
form.values.name     # 特定フィールドの値
form.errors          # 全エラー
form.errors.name     # 特定フィールドのエラー
form.dirty           # 変更があるか
form.valid           # 全体の有効性
```

---

## 7. Layout（レイアウト）

### コンポーネントツリーの記法

```yaml
layout:
  # === 単純なコンポーネント ===
  - Header

  # === プロパティ付きコンポーネント ===
  - Button:
      label: クリック
      variant: primary
      on:click: actions.submit

  # === 子要素を持つコンポーネント ===
  - Card:
      title: カードタイトル
      children:
        - Text:
            content: カードの内容
        - Button:
            label: アクション

  # === レイアウトコンテナ ===
  - Stack:
      direction: horizontal
      gap: $tokens.spacing.md
      children:
        - Box:
            flex: 1
            children: [...]
        - Box:
            width: 300
            children: [...]
```

### childrenのデフォルト配置

`children`を持つコンポーネントは、特に指定がない限り**垂直方向（上から下）**に子要素を配置する。

```yaml
# childrenは暗黙的に縦並び
- Card:
    children:
      - Text:
          content: 1番目（上）
      - Text:
          content: 2番目（下）

# 横並びにしたい場合は明示的にStackを使う
- Card:
    children:
      - Stack:
          direction: horizontal
          children:
            - Text:
                content: 左
            - Text:
                content: 右
```

この規則はHTML（ブロック要素）やReact Native（flexDirection: column）など、多くのUIフレームワークのデフォルト動作と一致する。

### レイアウトプリミティブ

```yaml
# 縦横スタック
- Stack:
    direction: vertical | horizontal
    gap: number | token
    align: start | center | end | stretch
    justify: start | center | end | space-between | space-around
    wrap: true | false
    children: [...]

# グリッド
- Grid:
    columns: number | "auto-fill" | "auto-fit"
    gap: number | token
    minItemWidth: number        # auto-fill/fitの場合
    children:
      - GridItem:
          span: number          # 占めるカラム数
          children: [...]

# フレックスボックス（低レベル）
- Flex:
    direction: row | column
    wrap: wrap | nowrap
    gap: number | token
    children: [...]

# 固定幅/高さのボックス
- Box:
    width: number | string | "auto"
    height: number | string | "auto"
    padding: number | token
    margin: number | token
    children: [...]

# スペーサー
- Spacer                        # flex: 1 で残り空間を埋める
```

### 条件分岐

```yaml
# === when-then-else ===
- when: $loading
  then:
    - Spinner
  else:
    - Content

# === 複数条件（switch） ===
- switch: $status
  cases:
    draft:
      - DraftBadge
    published:
      - PublishedBadge
    archived:
      - ArchivedBadge
  default:
    - UnknownBadge

# === 存在チェック ===
- when: $error
  then:
    - ErrorBanner:
        message: $error.message

# === 論理演算 ===
- when: $user.isAdmin && $feature.enabled
  then:
    - AdminPanel

# === 否定 ===
- when: not($loading)
  then:
    - Content
```

### 繰り返し

```yaml
# === 配列のループ ===
- each: $users
  as: user
  key: $user.id
  render:
    - UserCard:
        name: $user.name
        email: $user.email
        on:click: navigate(UserDetail, { id: $user.id })
  empty:
    - EmptyState:
        message: ユーザーがいません

# === インデックス付きループ ===
- each: $items
  as: item
  index: i
  render:
    - Text:
        content: "${$i + 1}. ${$item.name}"

# === フィルター付きループ ===
- each: $users.filter(u => u.status == "active")
  as: user
  render:
    - ActiveUserCard:
        user: $user
```

### イベントハンドラのオプション

イベントハンドラには、イベントの伝播やデフォルト動作を制御するオプションを指定できる。

```yaml
# 基本形
on:click: actions.handleClick

# オプション付き（親要素へのイベント伝播を停止）
on:click:
  stop: true
  action: actions.handleClick

# オプション付き（デフォルト動作を抑制）
on:submit:
  prevent: true
  action: actions.handleSubmit

# 両方を指定
on:click:
  stop: true
  prevent: true
  action: actions.handleClick
```

| オプション | 説明 | 用途例 |
|----------|------|--------|
| `stop` | 親要素へのイベント伝播を停止 | リスト項目内のボタンクリック |
| `prevent` | ブラウザのデフォルト動作を抑制 | フォーム送信、リンククリック |

---

## 8. Actions（アクション）

アクションは**宣言的な操作**として記述する。JavaScriptの式ではなく、意図を明確に表現する。

### 基本構文

```yaml
actions:
  actionName:
    params:
      id: string
    confirm:
      title: "確認"
      message: "実行しますか？"
      variant: danger
    steps:
      - step1
      - step2
```

### ステップの種類

```yaml
actions:
  submit:
    steps:
      # === 状態更新（set） ===
      - set: loading to true
      - set: form.values.name to "新しい名前"

      # 複数の状態を同時に更新
      - set:
          loading: false
          error: null

      # === 配列に追加（add） ===
      - add: todos
        at: start
        item:
          id: uuid()
          text: newTodoText
          completed: false

      # === 配列を更新（update） ===
      - update: todos
        find: id equals targetId
        set:
          completed: toggle
          updatedAt: now()

      # === 配列から削除（remove） ===
      - remove: todos
        where: id equals targetId

      # 条件に合うすべてを削除
      - remove: todos
        where: completed

      # === 外部操作（do） ===
      # 外部とのやり取りは do: で表現
      # 成功/失敗の可能性があるため when: でハンドリング
      - do: createUser({ values: form.values })
      - when: success
        then:
          - toast: success("作成しました")
          - navigate: UserDetail
            params: { id: result.id }
      - when: failure
        then:
          - toast: error(message)

      # === 条件分岐（if） ===
      - if: form.isValid
        then:
          - do: submitForm({ values: form.values })
        else:
          - toast: error("入力内容を確認してください")

      # === 画面遷移 ===
      - navigate: ScreenName
        params: { key: value }

      # === 通知 ===
      - toast: success("メッセージ")
      - toast: error("エラーメッセージ")

      # === 遅延 ===
      - delay: 1000ms

      # === 早期終了 ===
      - return

      # === ループ ===
      - each: selectedIds
        as: id
        do:
          - do: deleteUser({ id })
```

---

## 9. Flow（画面遷移）

画面間の遷移を状態機械として定義する。

```yaml
flows:
  UserManagement:
    description: ユーザー管理画面群の遷移

    # 初期画面
    initial: UserList

    # 画面一覧（このフローに含まれる画面）
    screens:
      - UserList
      - UserDetail
      - UserCreate
      - UserEdit

    # 遷移定義
    transitions:
      # === 基本遷移 ===
      - from: UserList
        to: UserDetail
        on: selectUser
        params:
          id: $event.userId

      - from: UserList
        to: UserCreate
        on: clickCreate

      # === 条件付き遷移 ===
      - from: UserCreate
        on: submit
        to:
          - when: $result.success
            screen: UserDetail
            params:
              id: $result.id
          - else:
            screen: UserCreate    # 同じ画面に留まる

      # === 複数の遷移元 ===
      - from: [UserDetail, UserEdit]
        to: UserList
        on: back

      # === どこからでも（グローバル） ===
      - from: "*"
        to: Login
        on: sessionExpired

      # === モーダル遷移 ===
      - from: UserList
        to: DeleteConfirmModal
        on: clickDelete
        type: modal
        params:
          userId: $event.userId

      # === モーダルからの遷移 ===
      - from: DeleteConfirmModal
        on: confirm
        effect:
          - do: deleteUser({ id: params.userId })
          - when: success
            then:
              - close              # モーダルを閉じる
              - toast: success("削除しました")

      - from: DeleteConfirmModal
        on: cancel
        effect:
          - close

    # ガード（遷移の条件）
    guards:
      - transition: "* -> UserEdit"
        when: $currentUser.role == "admin" || $currentUser.id == $params.id
        otherwise:
          - toast: error("編集権限がありません")
```

### 遷移タイプ

| タイプ | 説明 |
|--------|------|
| `navigate` | 通常の画面遷移（デフォルト） |
| `replace` | 履歴を置換する遷移 |
| `modal` | モーダルとして表示 |
| `drawer` | ドロワーとして表示 |
| `back` | 前の画面に戻る |

---

## 10. Expression（式）

### 参照構文

```yaml
# === 状態参照 ===
$stateName                    # 現在のスコープの状態
$screen.stateName             # 画面の状態を明示
$parent.stateName             # 親コンポーネントの状態
$root.stateName               # ルートの状態

# === パラメータ ===
$params.id                    # URLパラメータ
$params.page

# === イベントデータ ===
$event                        # イベントオブジェクト全体
$event.value                  # イベントの値
$value                        # $event.value のショートカット

# === 反復変数 ===
$item                         # each内の現在のアイテム
$index                        # each内の現在のインデックス
$row                          # DataTable行のデータ
$cell                         # DataTableセルの値

# === 特殊参照 ===
$result                       # 直前のcallの結果
$error                        # エラーオブジェクト
$currentUser                  # ログインユーザー（グローバル）

# === トークン ===
$tokens.colors.primary
$tokens.spacing.md
```

### 演算子

```yaml
# === 算術 ===
$a + $b
$a - $b
$a * $b
$a / $b
$a % $b

# === 比較 ===
$a == $b
$a != $b
$a > $b
$a >= $b
$a < $b
$a <= $b

# === 論理 ===
$a && $b
$a || $b
not($a)

# === 文字列 ===
"Hello, ${$name}!"            # テンプレートリテラル
$a + $b                       # 文字列結合

# === 配列 ===
$items.length
$items[0]
$items.filter(x => x.active)
$items.map(x => x.name)
$items.find(x => x.id == $id)
$items.some(x => x.active)
$items.every(x => x.valid)
$items.includes($value)

# === オブジェクト ===
$user.name
$user["property-with-dash"]

# === Null安全 ===
$user?.name                   # Optional chaining
$value ?? "default"           # Null合体演算子

# === 三項演算子 ===
$loading ? "読込中" : "完了"
```

### 組み込み関数

```yaml
# === 型変換 ===
toString($value)
toNumber($value)
toBoolean($value)

# === 文字列 ===
uppercase($str)
lowercase($str)
trim($str)
split($str, ",")
join($arr, ", ")
substring($str, 0, 10)

# === 日付 ===
formatDate($date, "YYYY/MM/DD")
formatDateTime($datetime, "YYYY/MM/DD HH:mm")
now()
today()

# === 数値 ===
round($num)
floor($num)
ceil($num)
abs($num)
min($a, $b)
max($a, $b)

# === 配列 ===
first($arr)
last($arr)
take($arr, 5)
skip($arr, 10)
sort($arr, "name")
sortDesc($arr, "createdAt")
unique($arr)
flatten($arr)
groupBy($arr, "category")

# === オブジェクト ===
keys($obj)
values($obj)
entries($obj)
pick($obj, ["a", "b"])
omit($obj, ["password"])
merge($obj1, $obj2)

# === 条件 ===
if($condition, $then, $else)
isEmpty($value)
isNotEmpty($value)
isDefined($value)

# === その他 ===
uuid()                        # ユニークID生成
debug($value)                 # コンソール出力（開発用）
```

---

## 11. Component（コンポーネント）

再利用可能なUI部品の定義。

```yaml
components:
  # === 単純なコンポーネント ===
  StatusBadge:
    description: ステータスを色付きバッジで表示
    props:
      status:
        type: enum[active, inactive, pending]
        required: true
    render:
      - Chip:
          label:
            switch: $props.status
            cases:
              active: 有効
              inactive: 無効
              pending: 保留
          color:
            switch: $props.status
            cases:
              active: success
              inactive: default
              pending: warning
          size: small

  # === 状態を持つコンポーネント ===
  SearchField:
    description: デバウンス付き検索フィールド
    props:
      value:
        type: string
        bind: true              # 双方向バインディング
      placeholder:
        type: string
        default: "検索..."
      debounce:
        type: number
        default: 300
    events:
      - submit
    state:
      localValue:
        type: string
        sync: $props.value      # propsと同期
    render:
      - TextField:
          value: $state.localValue
          placeholder: $props.placeholder
          on:change: set($state.localValue, $value)
          on:keydown:
            when: $event.key == "Enter"
            do: emit(submit, $state.localValue)
          debounce:
            event: change
            delay: $props.debounce
            action: emit(submit, $state.localValue)

  # === スロットを持つコンポーネント ===
  Card:
    description: カードコンテナ
    props:
      title:
        type: string
      subtitle:
        type: string
    slots:
      header:
        description: ヘッダー領域（titleより優先）
      default:
        description: メインコンテンツ
        required: true
      footer:
        description: フッター領域
    render:
      - Box:
          className: card
          children:
            - when: $slots.header
              then:
                - Slot: header
              else:
                - when: $props.title
                  then:
                    - Box:
                        className: card-header
                        children:
                          - Text:
                              variant: h6
                              content: $props.title
                          - when: $props.subtitle
                            then:
                              - Text:
                                  variant: body2
                                  color: secondary
                                  content: $props.subtitle
            - Box:
                className: card-content
                children:
                  - Slot: default
            - when: $slots.footer
              then:
                - Box:
                    className: card-footer
                    children:
                      - Slot: footer

  # 使用例
  # - Card:
  #     title: ユーザー情報
  #     children:               # default slotへ
  #       - UserProfile
  #     footer:                 # footer slotへ
  #       - Button:
  #           label: 編集
```

---

## ファイル構成例

```
project/
├── uidp.config.yaml           # プロジェクト設定
├── tokens/
│   └── design-tokens.yaml     # デザイントークン
├── types/
│   └── entities.yaml          # 型定義
├── components/
│   ├── common.uidp.yaml       # 共通コンポーネント
│   └── forms.uidp.yaml        # フォーム系コンポーネント
├── screens/
│   ├── users/
│   │   ├── list.uidp.yaml
│   │   ├── detail.uidp.yaml
│   │   ├── create.uidp.yaml
│   │   └── edit.uidp.yaml
│   └── dashboard/
│       └── index.uidp.yaml
├── flows/
│   └── user-management.yaml   # 画面遷移定義
└── mappings/
    └── mui.yaml               # MUIマッピング
```

---

## 付録A: 省略記法

可読性を保ちながら記述量を減らすための省略記法。

```yaml
# === コンポーネント省略 ===
# 完全形
- Button:
    label: "送信"

# 省略形（propsが1つでlabelの場合）
- Button: "送信"

# === 条件分岐省略 ===
# 完全形
- when: $loading
  then:
    - Spinner

# 省略形（コンポーネント1つの場合）
- when: $loading
  then: Spinner

# === イベントハンドラ省略 ===
# 完全形
on:click:
  action: navigate
  params:
    screen: UserDetail
    id: $row.id

# 省略形
on:click: navigate(UserDetail, { id: $row.id })

# === バインディング省略 ===
# 完全形
- TextField:
    value: $form.values.name
    on:change: set($form.values.name, $value)

# 省略形
- TextField:
    bind: $form.values.name
```

---

## 付録B: バリデーション

UIDPドキュメントの検証ルール。

### 必須チェック

- `uidp` バージョンは必須
- `screens` または `components` のいずれかが必要
- Screen には `route` と `layout` が必要

### 参照チェック

- 状態参照は定義された状態を参照している
- `navigate(Screen)` は定義された画面を参照している
- `do: xxx` は定義されたアクションを参照している

### 型チェック

- 状態の型と初期値が一致
- propsの型と渡される値が一致
- 外部データの型と使用箇所が一致

---

## 変更履歴

### v0.3.0 (現在)

- **スコープの明確化**: API定義・永続化方法を範囲外に
  - `source: api:/xxx` → `source: external`
  - `persist: localStorage` → `persist: true`
  - API定義セクションを削除
- **外部操作の抽象化**: `call: api.xxx()` → `do: actionName(params)`
- **結果ハンドリング**: `on:success/on:error` → `when: success/failure`
- **refetch削除**: データ再取得は実装の責務
- computed をクエリ形式に変更（JavaScriptの式を廃止）
- actions を宣言的な操作に変更
- テンプレート構文を簡略化: `${$var}` → `{var}`
- $プレフィックスを廃止（文脈で判断）

### v0.2.1

- Globals セクションを追加（アプリ全体の共有状態）
- Subscriptions セクションを追加（リアルタイムイベント購読）
- 埋め込みScreen（props付きScreen）のドキュメント追加
- 永続化オプション（persist）の追加
- childrenのデフォルト配置ルールを明記（垂直方向）
- 用語集に Globals, Subscription, Persist を追加
- スコープセクションを追加（UIDPが扱うもの・扱わないもの）
- イベントハンドラのオプション（stop, prevent）を追加
- 組み込み関数に uuid() を追加
- set のオブジェクト形式・配列リテラル形式を追加

### v0.2

- 設計原則に「AI-Parseable」を追加
- 用語集を追加
- Tokens セクションを追加（W3C DTCG互換）
- computed（派生状態）を追加
- 式・関数の詳細を追加
- ファイル構成例を追加

### v0.1

- 初版
