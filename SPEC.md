# Screen Behavior Protocol (SBP) v0.4.0

**画面の構造・状態・遷移を記述するための設計ドキュメント形式**

> **v0.4.0 破壊的変更**: JS式を完全廃止し、自然言語式に統一。MUIコンポーネントベースの型定義を導入。

---

## 概要

SBPは、フロントエンド画面の振る舞いを構造化テキストで記述するためのプロトコルである。
**デザイナーと開発者のコミュニケーションツール**として、コードを書かずに画面の振る舞いを定義できる。

### SBPが解決する課題

| 従来の課題 | SBPによる解決 |
|-----------|---------------|
| デザインカンプは視覚的だが状態や遷移を表現できない | 構造・状態・遷移を一体で記述 |
| 自然言語の仕様書は曖昧 | 厳密な構文で解釈の揺れを排除 |
| コードは詳細すぎて設計意図が埋もれる | 抽象レベルで意図を明確に表現 |
| AIによるコード生成の入力として不適切 | 機械可読かつ人間可読な形式 |
| **プログラミング知識が必要** | **自然言語に近いクエリ形式で非エンジニアも読み書き可能** |

### SBPではないもの

- **ランタイムではない**: DivKitのように実行時にJSONを解釈してUIを描画するものではない
- **デザインツールではない**: Figmaのような視覚的デザインツールではない
- **コンポーネントライブラリではない**: 実装済みのコンポーネントを提供するものではない

---

## スコープ

SBPは「デザイナーと開発者のコミュニケーションツール」として、**意図**を記述する。実装詳細は含めない。

### SBPが扱うもの

| 領域 | 内容 |
|------|------|
| 構造 | コンポーネントツリー、相対レイアウト（Stack, Grid） |
| 状態 | ローカル状態、グローバル状態、フォーム状態、派生状態 |
| 振る舞い | イベントハンドラ、アクション、画面遷移 |
| データ | 「外部からデータを取得する」「データを保存する」という**意図** |
| トークン | デザイントークン（W3C DTCG互換） |

### SBPが扱わないもの

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

### 4. 省略可能なフィールド

多くのフィールドは省略可能であり、必要に応じて記述する。

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
      - DataTable:
          data: $users
```

**注意**: 上記は同じ画面の「異なる書き方の例」である。YAMLでは同じキーを複数回書くと上書きされるため、マージはされない。

---

## ドキュメント構造

```yaml
sbp: "0.4.0"                     # プロトコルバージョン（必須）

meta:                            # メタデータ
  name: "アプリケーション名"
  description: "説明"
  version: "1.0.0"
  authors: ["author@example.com"]

imports:                         # 外部定義のインポート
  - ./components/common.sbp.yaml
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
| **Modal** | 画面上に重ねて表示されるダイアログ（インライン定義必須） | 削除確認、フォーム入力 |
| **Drawer** | 画面端からスライドして表示されるパネル（インライン定義必須） | サイドメニュー、設定パネル |

---

## MUIコンポーネント型定義

SBPはMaterial-UI (MUI) のコンポーネント名とプロパティをベースにする。各コンポーネントで使用可能なプロパティは以下の通り。

### レイアウトコンポーネント

```yaml
Box:
  props:
    display: flex | block | grid | none
    flexDirection: row | column | row-reverse | column-reverse
    justifyContent: flex-start | center | flex-end | space-between | space-around
    alignItems: flex-start | center | flex-end | stretch | baseline
    flexGrow: number
    flexShrink: number
    gap: number
    padding: number
    margin: number
    marginTop: number
    marginBottom: number
    marginLeft: number
    marginRight: number
    width: number | string
    height: number | string
    minWidth: number | string
    maxWidth: number | string
    minHeight: number | string
    overflow: auto | hidden | scroll | visible

Stack:
  props:
    direction: row | column
    spacing: number
    divider: boolean
    justifyContent: flex-start | center | flex-end | space-between
    alignItems: flex-start | center | flex-end | stretch

Grid:
  props:
    container: boolean
    item: boolean
    spacing: number
    columns: number
    xs: number  # 1-12
    sm: number
    md: number
    lg: number
    xl: number
```

### ナビゲーション・構造コンポーネント

```yaml
AppBar:
  props:
    position: static | fixed | absolute | sticky | relative
    color: default | inherit | primary | secondary | transparent

Drawer:
  props:
    variant: permanent | persistent | temporary
    anchor: left | right | top | bottom
    open: boolean
    width: number

Tabs:
  props:
    value: state-reference
    variant: standard | scrollable | fullWidth
    centered: boolean
  events:
    onChange: action

Tab:
  props:
    label: string
    value: string
    disabled: boolean
    icon: icon-name
```

### 入力コンポーネント

```yaml
Button:
  props:
    variant: contained | outlined | text
    color: primary | secondary | error | warning | info | success | inherit
    size: small | medium | large
    disabled: boolean
    fullWidth: boolean
    startIcon: icon-name
    endIcon: icon-name
  events:
    onClick: action

IconButton:
  props:
    color: primary | secondary | error | default | inherit
    size: small | medium | large
    disabled: boolean
    edge: start | end | false
  events:
    onClick: action

TextField:
  props:
    variant: outlined | filled | standard
    label: string
    placeholder: string
    type: text | password | email | number | tel
    value: state-reference
    required: boolean
    disabled: boolean
    error: boolean
    helperText: string
    multiline: boolean
    rows: number
    maxLength: number
    fullWidth: boolean
  events:
    onChange: action
    onBlur: action

Select:
  props:
    label: string
    value: state-reference
    disabled: boolean
    multiple: boolean
    fullWidth: boolean
  events:
    onChange: action

Switch:
  props:
    checked: boolean
    disabled: boolean
    color: primary | secondary | default
  events:
    onChange: action

Checkbox:
  props:
    checked: boolean
    disabled: boolean
    indeterminate: boolean
  events:
    onChange: action

RadioGroup:
  props:
    value: state-reference
    row: boolean
  events:
    onChange: action
```

### 表示コンポーネント

```yaml
Typography:
  props:
    variant: h1 | h2 | h3 | h4 | h5 | h6 | subtitle1 | subtitle2 | body1 | body2 | caption | overline
    color: primary | secondary | textPrimary | textSecondary | error
    align: left | center | right | justify
    noWrap: boolean

Chip:
  props:
    label: string
    variant: filled | outlined
    color: default | primary | secondary | error | warning | info | success
    size: small | medium
    onDelete: action

Alert:
  props:
    severity: error | warning | info | success
    variant: standard | filled | outlined

Paper:
  props:
    elevation: number  # 0-24
    variant: elevation | outlined
    square: boolean

Card:
  props:
    variant: elevation | outlined
    raised: boolean
```

### テーブルコンポーネント

```yaml
Table:
  props:
    size: small | medium
    stickyHeader: boolean

TableHead:
  # ヘッダー行を含む

TableBody:
  # データ行を含む

TableRow:
  props:
    selected: boolean
    hover: boolean
  events:
    onClick: action

TableCell:
  props:
    align: left | center | right
    padding: normal | checkbox | none
```

### フィードバックコンポーネント

```yaml
Modal:
  props:
    open: boolean
    title: string
    size: xs | sm | md | lg | xl | fullscreen
    closable: boolean
    closeOnBackdrop: boolean

Dialog:
  props:
    open: boolean
    fullWidth: boolean
    maxWidth: xs | sm | md | lg | xl | false

Snackbar:
  props:
    open: boolean
    autoHideDuration: number
    anchorOrigin:
      vertical: top | bottom
      horizontal: left | center | right
```

### リストコンポーネント

```yaml
List:
  props:
    dense: boolean
    disablePadding: boolean

ListItem:
  props:
    button: boolean
    selected: boolean
    disabled: boolean
    divider: boolean

ListItemButton:
  props:
    selected: boolean
    disabled: boolean
  events:
    onClick: action

ListItemText:
  props:
    primary: string
    secondary: string
```

### その他コンポーネント

```yaml
Divider:
  props:
    orientation: horizontal | vertical
    variant: fullWidth | inset | middle
    light: boolean

Stepper:
  props:
    activeStep: number
    orientation: horizontal | vertical
    alternativeLabel: boolean

Accordion:
  props:
    expanded: boolean
    disabled: boolean
  events:
    onChange: action

Tooltip:
  props:
    title: string
    placement: top | bottom | left | right
    arrow: boolean
```

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
    position: static | relative | absolute | fixed | sticky
    flex: number                # flexアイテムとしての伸縮比率
    flexGrow: number            # 伸びる比率
    flexShrink: number          # 縮む比率
    children: [...]

# スペーサー
- Spacer                        # flex: 1 で残り空間を埋める
```

### position プロパティと影響

`position` プロパティは要素の配置方法を指定する。特に `fixed` は注意が必要：

| 値 | 説明 | 影響 |
|----|------|------|
| `static` | 通常フロー（デフォルト） | なし |
| `relative` | 通常フロー + オフセット可能 | なし |
| `absolute` | 最寄りの relative/absolute 親基準 | 通常フローから外れる |
| `fixed` | ビューポート基準で固定 | **通常フローから外れる** |
| `sticky` | スクロールで固定される | 親の範囲内で固定 |

**重要**: `position: fixed` を持つコンポーネント（AppBar等）の**下に配置される要素**は、その高さ分のマージンまたはパディングが必要：

```yaml
# AppBar（固定ヘッダー）の下にコンテンツを配置する場合
layout:
  - AppBar:
      position: fixed
      height: 64px           # 明示的に高さを指定
      children: [...]

  # メインコンテンツには AppBar の高さ分のオフセットが必要
  - Box:
      marginTop: 64px        # AppBar の高さと一致させる
      children: [...]
```

### オーバーレイコンポーネント（Modal / Drawer）

Modal（モーダル）やDrawer（ドロワー）は、**必ずトリガーとなるコンポーネントと同じlayout内にインラインで定義する**。
これにより、YAMLの構造がそのまま親子関係を表し、実装漏れを防ぐ。

```yaml
layout:
  # === 基本的なModal ===
  - Button:
      label: 削除
      on:click: set($showDeleteConfirm, true)

  - Modal:
      open: $showDeleteConfirm
      title: 削除の確認
      children:
        - Text:
            content: 本当に削除しますか？
        - Stack:
            direction: horizontal
            children:
              - Button:
                  label: キャンセル
                  on:click: set($showDeleteConfirm, false)
              - Button:
                  label: 削除
                  variant: danger
                  on:click: actions.delete

  # === ネストしたModal/Drawer ===
  # ドロワー → モーダル → モーダル の3層ネストも
  # YAMLの構造として表現する
  - IconButton:
      icon: settings
      on:click: set($settingsOpen, true)

  - Drawer:
      open: $settingsOpen
      anchor: right
      children:
        - Text:
            content: 設定
        - Button:
            label: アカウント削除
            variant: danger
            on:click: set($deleteConfirmOpen, true)

        # Drawerの中にModalをネスト
        - Modal:
            open: $deleteConfirmOpen
            title: アカウント削除
            children:
              - Text:
                  content: DELETEと入力してください
              - TextField:
                  bind: $confirmText
              - Button:
                  label: 最終確認へ
                  disabled: $confirmText != "DELETE"
                  on:click: set($twoFactorOpen, true)

              # さらにModalをネスト
              - Modal:
                  open: $twoFactorOpen
                  title: 二要素認証
                  children:
                    - TextField:
                        label: 認証コード
                        bind: $authCode
                    - Button:
                        label: 削除を実行
                        on:click: actions.deleteAccount
```

**重要な規則**:

1. **インライン定義のみ**: Modal/Drawerは別セクションに分離せず、トリガー元と同じlayout内に書く
2. **構造=親子関係**: YAMLのネスト構造がそのままオーバーレイのスタック順序を表す
3. **状態はローカル**: `open`に使う状態（`$showDeleteConfirm`など）は同じscreen/componentのstateで定義
4. **閉じる責務**: 各Modal/Drawerは自身を閉じるボタンを持つ（親が閉じると子も閉じる）

この規則により、「どのコンテキストでどのオーバーレイが開くか」が構造として明確になり、実装時の漏れを防ぐ。

### Modal プロパティ

| プロパティ | 説明 | 必須 |
|-----------|------|------|
| `open` | 表示状態（boolean参照） | ✓ |
| `title` | タイトル | |
| `size` | サイズ（sm, md, lg, fullscreen） | |
| `closable` | 閉じるボタンを表示（デフォルト: true） | |
| `closeOnBackdrop` | 背景クリックで閉じる（デフォルト: true） | |
| `children` | コンテンツ | ✓ |

### Drawer プロパティ

| プロパティ | 説明 | 必須 |
|-----------|------|------|
| `open` | 表示状態（boolean参照）※variantがtemporaryの場合のみ必要 | |
| `variant` | 表示モード（下表参照） | |
| `anchor` | 出現位置（left, right, top, bottom） | |
| `width` | 幅（anchor=left/rightの場合） | |
| `height` | 高さ（anchor=top/bottomの場合） | |
| `children` | コンテンツ | ✓ |

#### Drawer variant（表示モード）

| variant | 説明 | レイアウトへの影響 |
|---------|------|-------------------|
| `temporary` | オーバーレイとして表示（デフォルト） | 隣接要素に影響なし |
| `permanent` | 常に表示、閉じることができない | **隣接要素を押しのける**（固定幅を確保） |
| `persistent` | トグル可能、開くと隣接要素を押しのける | 開閉に応じて隣接要素が移動 |

**重要**: `variant: permanent` の Drawer は、隣接するコンテンツに対して固定幅を確保する。
親要素は `display: flex` で横並びにする必要がある：

```yaml
# サイドバー（permanent Drawer）+ メインコンテンツの構成
layout:
  - Flex:
      direction: row
      height: 100vh
      children:
        # 固定幅のサイドバー
        - Drawer:
            variant: permanent
            width: 240px
            children: [...]

        # 残りの幅を埋めるメインコンテンツ
        - Box:
            flex: 1              # 残り幅を占める
            children: [...]
```

### マルチペインレイアウト

固定ヘッダー + サイドバー + メインコンテンツ + 詳細パネルのような複合レイアウトの定義例：

```yaml
# 3ペイン構成（AppBar + Sidebar + MainContent + DetailPanel）
layout:
  # 固定ヘッダー（通常フローから外れる）
  - AppBar:
      position: fixed
      height: 64px
      zIndex: drawer + 1       # Drawerより上に表示
      children:
        - Typography:
            text: アプリ名
        - Spacer: {}
        - IconButton:
            icon: settings

  # メインエリア（横並び）
  - Flex:
      direction: row
      minHeight: 100vh
      children:
        # サイドバー（固定幅、AppBar下にスペーサー）
        - Drawer:
            variant: permanent
            width: 240px
            children:
              - Box:
                  height: 64px       # AppBar分のスペーサー
              - List:
                  children: [...]

        # コンテンツエリア（残り幅を分割）
        - Flex:
            direction: row
            flex: 1
            marginTop: 64px          # AppBar分のオフセット
            children:
              # メインコンテンツ（伸縮する）
              - Box:
                  flex: 1
                  padding: 3
                  children: [...]

              # 詳細パネル（条件付き表示、固定幅）
              - when: $selectedId != null
                then:
                  - Paper:
                      width: 350px
                      flexShrink: 0    # 縮まない
                      children: [...]
```

この例の重要なポイント：
1. **AppBar**: `position: fixed` で固定。`zIndex` で Drawer より上に表示
2. **Drawer**: `variant: permanent` で常に表示。内部に AppBar 分のスペーサーが必要
3. **メインエリア**: `marginTop: 64px` で AppBar 分のオフセット
4. **DetailPanel**: `flexShrink: 0` で縮まないようにする

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

## 10. Expression（式）- 自然言語構文

SBPでは、プログラミング式ではなく**自然言語に近い構文**を使用する。使用可能な表現は以下に列挙される。

### 参照構文

状態やプロパティへの参照は `{name}` 形式で記述する。

```yaml
# === 状態参照 ===
{stateName}                   # 現在のスコープの状態
{screen.stateName}            # 画面の状態を明示
{parent.stateName}            # 親コンポーネントの状態

# === パラメータ ===
{params.id}                   # URLパラメータ
{route.params.id}             # ルートパラメータ

# === イベントデータ ===
{value}                       # イベントの値（on:change等で使用）

# === 反復変数 ===
{item}                        # each内の現在のアイテム
{index}                       # each内の現在のインデックス
{row}                         # DataTable行のデータ
{row.fieldName}               # 行の特定フィールド

# === 特殊参照 ===
{result}                      # 直前のdoの結果
{currentUser}                 # ログインユーザー（グローバル）

# === オブジェクトのフィールド ===
{user.name}                   # ネストしたフィールド
{user.address.city}           # 深いネスト
```

### 比較演算（使用可能な表現一覧）

| 表現 | 意味 | 例 |
|------|------|-----|
| `{field} equals {value}` | 等しい | `name equals "John"` |
| `{field} equals "{literal}"` | 文字列と等しい | `status equals "active"` |
| `{field} is not {value}` | 等しくない | `role is not "guest"` |
| `{field} is empty` | 空である | `email is empty` |
| `{field} is not empty` | 空でない | `name is not empty` |
| `{field} contains {value}` | 含む | `email contains "@"` |
| `length of {field} equals {n}` | 長さが等しい | `length of code equals 6` |
| `length of {field} is not {n}` | 長さが等しくない | `length of code is not 6` |
| `{field} greater than {n}` | より大きい | `age greater than 18` |
| `{field} less than {n}` | より小さい | `count less than 10` |
| `{field} at least {n}` | 以上 | `score at least 60` |
| `{field} at most {n}` | 以下 | `items at most 100` |

### 配列操作（使用可能な表現一覧）

| 表現 | 意味 | 例 |
|------|------|-----|
| `find in {array} where {field} equals {value}` | 条件に合う最初の要素 | `find in users where id equals {selectedId}` |
| `filter {array} where {field} equals {value}` | 条件に合う要素の配列 | `filter users where status equals "active"` |
| `remove from {array} where {field} equals {value}` | 条件に合う要素を除いた配列 | `remove from users where id equals {targetId}` |
| `count of {array}` | 配列の要素数 | `count of users` |
| `count of {array} where {condition}` | 条件に合う要素数 | `count of users where status equals "active"` |
| `first of {array}` | 先頭要素 | `first of items` |
| `last of {array}` | 末尾要素 | `last of items` |

### 論理演算（YAML構造）

```yaml
# AND条件（すべてがtrue）
all of:
  - name is not empty
  - email is not empty
  - email contains "@"

# OR条件（いずれかがtrue）
any of:
  - status equals "admin"
  - status equals "owner"

# NOT条件
not: isLoading

# ネストした条件
all of:
  - hasSelection
  - any of:
      - {currentUser.role} equals "admin"
      - {currentUser.id} equals {selectedUserId}
```

### 組み込み値

| 表現 | 意味 |
|------|------|
| `today` | 今日の日付（YYYY-MM-DD形式） |
| `now` | 現在時刻（ISO形式） |
| `new id` | 新規UUID |
| `new id with prefix "{prefix}"` | プレフィックス付きID（例: `user-xxx`） |
| `toggle {field}` | 真偽値の反転 |

### 文字列テンプレート

文字列内で参照を埋め込む場合は `{name}` 形式を使用する。

```yaml
text: "{user.name}さん、こんにちは"
text: "合計: {count of items}件"
text: "ステータス: {status}"
```

### 使用例

```yaml
# computed での使用
computed:
  # 単純な参照（find）
  user: find in users where id equals {selectedUserId}

  # フィルター
  activeUsers: filter users where status equals "active"

  # カウント
  activeCount: count of users where status equals "active"

  # 複合条件
  canDelete:
    all of:
      - selectedIds is not empty
      - {currentUser.role} equals "admin"

  # 空チェック
  hasUsers: users is not empty

  # 比較
  isConfirmed: confirmText equals "DELETE"

# layout での使用
layout:
  # 条件分岐
  - when: loading
    then: Spinner

  - when: {activeTab} equals "list"
    then: UserListTab

  - when: selectedUserId is not empty
    then: DetailPanel

  # disabled条件
  - Button:
      text: 次へ
      disabled:
        any of:
          - name is empty
          - email is empty
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
├── sbp.config.yaml            # プロジェクト設定
├── tokens/
│   └── design-tokens.yaml     # デザイントークン
├── types/
│   └── entities.yaml          # 型定義
├── components/
│   ├── common.sbp.yaml        # 共通コンポーネント
│   └── forms.sbp.yaml         # フォーム系コンポーネント
├── screens/
│   ├── users/
│   │   ├── list.sbp.yaml
│   │   ├── detail.sbp.yaml
│   │   ├── create.sbp.yaml
│   │   └── edit.sbp.yaml
│   └── dashboard/
│       └── index.sbp.yaml
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

SBPドキュメントの検証ルール。

### 必須チェック

- `sbp` バージョンは必須
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

## 付録C: フィールド一覧（クイックリファレンス）

### トップレベルセクション

| セクション | 説明 | 必須 |
|-----------|------|------|
| `sbp` | プロトコルバージョン | ✓ |
| `meta` | メタデータ（name, description, version, authors） | |
| `imports` | 外部ファイルのインポート | |
| `tokens` | デザイントークン（W3C DTCG互換） | |
| `types` | 型定義 | |
| `globals` | グローバル状態 | |
| `subscriptions` | リアルタイムイベント購読 | |
| `components` | 再利用可能コンポーネント | ※ |
| `screens` | 画面定義 | ※ |
| `flows` | 画面遷移定義 | |

※ `components` または `screens` のいずれかが必要

### Screen定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `title` | 画面タイトル | |
| `description` | 説明 | |
| `route` | URLルート（/users, /users/:id） | ※ |
| `params` | URLパラメータ定義 | |
| `props` | 埋め込みScreen用プロパティ | ※ |
| `events` | 発火可能なイベント（埋め込みScreen用） | |
| `state` | ローカル状態 | |
| `computed` | 派生状態（クエリ形式） | |
| `subscriptions` | リアルタイム購読 | |
| `layout` | レイアウト構造 | ✓ |
| `columns` | DataTable用カラム定義 | |
| `actions` | アクション定義 | |

※ `route` または `props` のいずれか

### State定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `type` | 型 | ✓ |
| `initial` | 初期値 | |
| `source` | データソース（"external"） | |
| `fetchOn` | 取得トリガー（mount, paramsChange, propsChange） | |
| `sync` | propsとの同期（コンポーネント用） | |

### フォーム状態（type: form）

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `schema` | フォームの型名 | ✓ |
| `initial` | 初期値 | |
| `validation` | バリデーションルール | |

### Action定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `params` | パラメータ定義 | |
| `confirm` | 確認ダイアログ | |
| `steps` | 実行ステップ | ✓ |

### Actionステップ

| コマンド | 説明 | 例 |
|---------|------|-----|
| `set` | 状態更新 | `set: loading to true` |
| `add` | 配列に追加 | `add: todos` `item: {...}` |
| `update` | 配列を更新 | `update: todos` `find: ...` `set: ...` |
| `remove` | 配列から削除 | `remove: todos` `where: ...` |
| `do` | 外部操作 | `do: createUser({...})` |
| `if` | 条件分岐 | `if: condition` `then: [...]` |
| `navigate` | 画面遷移 | `navigate: ScreenName` |
| `toast` | 通知表示 | `toast: success("完了")` |
| `delay` | 遅延 | `delay: 1000ms` |
| `return` | 早期終了 | `return` |
| `each` | ループ | `each: items` `as: item` `do: [...]` |

### Layout構文

| 構文 | 説明 |
|------|------|
| `- ComponentName` | 単純なコンポーネント |
| `- ComponentName: { props }` | プロパティ付き |
| `children: [...]` | 子要素 |
| `when: condition` | 条件分岐 |
| `switch: value` / `cases:` | マッチ分岐 |
| `each: array` / `render:` | 繰り返し |
| `on:event: action` | イベントハンドラ |
| `- Modal: { open, children }` | モーダル（インライン定義必須） |
| `- Drawer: { open, anchor, children }` | ドロワー（インライン定義必須） |

### Component定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `description` | 説明 | |
| `props` | プロパティ定義 | ✓ |
| `events` | 発火可能なイベント | |
| `state` | ローカル状態 | |
| `slots` | スロット定義 | |
| `render` | レイアウト | ✓ |

### Flow定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `description` | 説明 | |
| `initial` | 初期画面 | ✓ |
| `screens` | フローに含まれる画面 | ✓ |
| `transitions` | 遷移定義 | ✓ |
| `guards` | 遷移ガード | |

### Transition定義

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `from` | 遷移元（"*"で全画面） | ✓ |
| `to` | 遷移先 | ✓ |
| `on` | トリガーイベント | ✓ |
| `type` | 遷移タイプ（navigate, replace, modal, drawer, back） | |
| `params` | パラメータ | |
| `effect` | 遷移時の処理 | |

---

## 変更履歴

### v0.4.0 (現在) - 破壊的変更

- **MUIコンポーネント型定義を導入**
  - 各コンポーネントで使用可能なプロパティをenumで定義
  - Button, TextField, AppBar, Drawer など主要コンポーネントの型を明記
- **自然言語式に統一（JS式の完全廃止）**
  - `$users.filter(u => u.status == 'active')` → `filter users where status equals "active"`
  - `$confirmText == "DELETE"` → `confirmText equals "DELETE"`
  - `$name.trim() != ""` → `name is not empty`
- **参照構文の変更**
  - `$variableName` → `{variableName}` 形式に統一
- **使用可能な表現を明確に列挙**
  - 比較演算: `equals`, `is not`, `is empty`, `contains`, `greater than` など
  - 配列操作: `find in ... where`, `filter ... where`, `count of`, `remove from ... where`
  - 論理演算: `all of`, `any of`, `not` (YAML構造)
  - 組み込み値: `today`, `now`, `new id`, `toggle`
- **後方互換性なし**
  - 旧形式のJS式はサポートしない

### v0.3.3

- **レイアウトプロパティの拡充**
  - Boxに `position`, `flex`, `flexGrow`, `flexShrink` プロパティを追加
  - `position` プロパティの影響（特に `fixed`）を明文化
  - AppBar等の固定要素使用時のオフセット指定パターンを追加
- **Drawer variant の追加**
  - `temporary`, `permanent`, `persistent` の3種類を定義
  - 各variantがレイアウトに与える影響を明記
- **マルチペインレイアウトのパターンを追加**
  - AppBar + Sidebar + MainContent + DetailPanel の複合レイアウト例

### v0.3.2

- **オーバーレイコンポーネント（Modal/Drawer）セクションを追加**
  - Modal/Drawerは必ずlayout内にインライン定義する規則を明記
  - ネストしたModal/Drawerの書き方を例示
  - 「構造=親子関係」の原則により実装漏れを防ぐ
- Layout構文にModal/Drawerを追加

### v0.3.1

- 「Progressive Detail」セクションを「省略可能なフィールド」に変更
  - YAMLではマージされないことを明記
- 「付録C: フィールド一覧（クイックリファレンス）」を追加

### v0.3.0

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
