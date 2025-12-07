# UI Description Protocol (UIDP) v0.2

**UI画面の構造・状態・遷移を記述するための設計ドキュメント形式**

---

## 概要

UIDPは、フロントエンドUIの設計を構造化テキストで記述するためのプロトコルである。

### UIDPが解決する課題

| 従来の課題 | UIDPによる解決 |
|-----------|---------------|
| デザインカンプは視覚的だが状態や遷移を表現できない | 構造・状態・遷移を一体で記述 |
| 自然言語の仕様書は曖昧 | 厳密な構文で解釈の揺れを排除 |
| コードは詳細すぎて設計意図が埋もれる | 抽象レベルで意図を明確に表現 |
| AIによるコード生成の入力として不適切 | 機械可読かつ人間可読な形式 |

### UIDPではないもの

- **ランタイムではない**: DivKitのように実行時にJSONを解釈してUIを描画するものではない
- **デザインツールではない**: Figmaのような視覚的デザインツールではない
- **コンポーネントライブラリではない**: 実装済みのコンポーネントを提供するものではない

---

## 設計原則

### 1. Human-Readable First（人間が読める）

```yaml
# 良い例：意図が明確
- when: $user.isAdmin
  then: AdminPanel

# 避ける：暗号的な省略
- if: $u.ia then: AP
```

- YAMLで記述し、インデントで階層を表現
- 省略より明確さを優先
- 日本語・英語どちらでもキー以外のテキストに使用可能

### 2. AI-Parseable（AIが解釈可能）

```yaml
# 構造が一貫している
layout:
  - ComponentName:
      prop1: value1
      prop2: value2

# 参照は常に$プレフィックス
data: $users
on:click: navigate(UserDetail, { id: $row.id })
```

- 構造のパターンが一貫している
- 参照と値を明確に区別できる
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
      users: { type: User[], source: api:/users }
    layout:
      - SearchBar:
          bind: $searchQuery
          on:submit: actions.search
      # ...
```

---

## ドキュメント構造

```yaml
uidp: "0.2"                      # プロトコルバージョン（必須）

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
| **Action** | ユーザー操作に対する振る舞いの手続き | `submit`, `delete` |
| **Flow** | 画面間の遷移グラフ | `UserList → UserDetail` |
| **Binding** | 状態とUIの双方向接続 | `bind: $form.name` |
| **Reference** | 状態や値への参照 | `$users`, `$form.valid` |
| **Token** | デザインの基本値（色、間隔など） | `$colors.primary` |

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

## 3. Screen（画面）

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
        source: api:/users
        params:
          page: $params.page
          q: $params.q
      loading:
        type: boolean
        initial: true
      selectedIds:
        type: string[]
        initial: []

    # === 派生状態 ===
    computed:
      hasSelection:
        type: boolean
        expr: $selectedIds.length > 0
      canDelete:
        type: boolean
        expr: $hasSelection && $currentUser.role == "admin"

    # === レイアウト ===
    layout:
      - PageHeader:
          title: $title
          actions:
            - Button:
                label: 新規作成
                icon: add
                variant: primary
                on:click: navigate(UserCreate)

      - Card:
          children:
            - Toolbar:
                left:
                  - SearchField:
                      value: $params.q
                      placeholder: 名前またはメールで検索
                      on:submit: navigate(UserList, { q: $value, page: 1 })
                right:
                  - when: $hasSelection
                    then:
                      - Button:
                          label: 一括削除
                          variant: danger
                          disabled: not($canDelete)
                          on:click: actions.bulkDelete

            - switch: $loading
              loading:
                - TableSkeleton:
                    rows: 10
              ready:
                - DataTable:
                    data: $users.items
                    columns: $columns
                    selectable: true
                    selection: $selectedIds
                    on:selectionChange: set($selectedIds, $value)
                    on:rowClick: navigate(UserDetail, { id: $row.id })
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
                    message: $error.message
                    action:
                      label: 再読み込み
                      on:click: refetch($users)

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
          - call: api.deleteUser($id)
          - on:success:
              - toast: success("ユーザーを削除しました")
              - refetch: $users
          - on:error:
              - toast: error($error.message)

      bulkDelete:
        confirm:
          title: 一括削除
          message: "選択した${$selectedIds.length}件のユーザーを削除しますか？"
          variant: danger
        steps:
          - call: api.deleteUsers($selectedIds)
          - on:success:
              - toast: success("${$result.count}件のユーザーを削除しました")
              - set: $selectedIds = []
              - refetch: $users
          - on:error:
              - toast: error($error.message)
```

---

## 4. State（状態）

### 状態の種類

```yaml
state:
  # === 1. ローカル状態 ===
  # 画面内で管理する状態
  isOpen:
    type: boolean
    initial: false

  selectedTab:
    type: string
    initial: "overview"

  # === 2. URLパラメータ連動状態 ===
  # URLと同期する状態（params経由）
  # → screen.paramsで定義

  # === 3. 外部データソース ===
  # APIから取得するデータ
  users:
    type: User[]
    source: api:/users
    params:
      page: $params.page
    fetchOn:
      - mount                    # 画面マウント時
      - paramsChange             # パラメータ変更時
    staleTime: 5m                # キャッシュ有効期間
    retry: 3                     # リトライ回数

  # === 4. フォーム状態 ===
  form:
    type: form<UserForm>
    initial:
      name: ""
      email: ""
      role: member

  # === 5. 派生状態（computed） ===
  # 他の状態から計算される
  # → screen.computedで定義
```

### フォーム状態の詳細

```yaml
state:
  form:
    type: form<UserForm>
    initial:
      name: ""
      email: ""
      role: member

    # フィールドごとのバリデーション
    validation:
      name:
        - rule: required
          message: 名前は必須です
        - rule: maxLength(100)
          message: 100文字以内で入力してください

      email:
        - rule: required
          message: メールアドレスは必須です
        - rule: email
          message: 有効なメールアドレスを入力してください
        - rule: async(api:/users/check-email)
          message: このメールアドレスは既に登録されています
          debounce: 500ms

      role:
        - rule: required
          message: 権限を選択してください

    # フォーム全体のバリデーション
    formRules:
      - when: $form.startDate > $form.endDate
        message: 開始日は終了日より前にしてください
        fields: [startDate, endDate]

# フォームのプロパティ参照
$form.values          # 全フィールドの値
$form.values.name     # 特定フィールドの値
$form.errors          # 全エラー
$form.errors.name     # 特定フィールドのエラー
$form.touched         # 操作済みフラグ
$form.touched.name    # 特定フィールドの操作済みフラグ
$form.dirty           # 変更があるか
$form.valid           # 全体の有効性
$form.submitting      # 送信中フラグ
```

---

## 5. Layout（レイアウト）

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

---

## 6. Actions（アクション）

### 基本構文

```yaml
actions:
  actionName:
    # パラメータ（任意）
    params:
      id: string
      force: boolean = false

    # 確認ダイアログ（任意）
    confirm:
      title: string
      message: string
      variant: danger | warning | info

    # 実行ステップ
    steps:
      - step1
      - step2
      - ...
```

### ステップの種類

```yaml
actions:
  submit:
    steps:
      # === 状態更新 ===
      - set: $loading = true
      - set: $form.values.name = "新しい名前"

      # === API呼び出し ===
      - call: api.createUser($form.values)
        as: result                   # 結果を変数に格納

      # === 条件分岐 ===
      - if: $result.success
        then:
          - toast: success("作成しました")
          - navigate: UserDetail
            params:
              id: $result.id
        else:
          - toast: error($result.error)

      # === 結果ハンドリング（call直後） ===
      - call: api.deleteUser($id)
      - on:success:
          - toast: success("削除しました")
          - navigate: UserList
      - on:error:
          - toast: error($error.message)

      # === データ再取得 ===
      - refetch: $users

      # === 画面遷移 ===
      - navigate: ScreenName
        params:
          key: value

      # === モーダル表示 ===
      - modal: ConfirmDialog
        params:
          message: "確認してください"
        on:confirm:
          - call: api.doSomething()
        on:cancel:
          - toast: info("キャンセルしました")

      # === 通知 ===
      - toast: success("メッセージ")
      - toast: error("エラーメッセージ")
      - toast: warning("警告メッセージ")
      - toast: info("情報メッセージ")

      # === 複数を並列実行 ===
      - parallel:
          - call: api.fetchUsers()
          - call: api.fetchRoles()

      # === 遅延 ===
      - delay: 1000ms

      # === 早期終了 ===
      - return

      # === ループ ===
      - each: $selectedIds
        as: id
        do:
          - call: api.deleteUser($id)
```

---

## 7. Flow（画面遷移）

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
          - call: api.deleteUser($params.userId)
          - close                  # モーダルを閉じる
          - refetch: UserList.$users

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

## 8. Expression（式）

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
debug($value)                 # コンソール出力（開発用）
```

---

## 9. Component（コンポーネント）

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

## 10. API（外部連携）

```yaml
api:
  # === ベースURL ===
  baseUrl: https://api.example.com/v1

  # === 共通ヘッダー ===
  headers:
    Authorization: "Bearer ${$auth.token}"
    Content-Type: application/json

  # === エンドポイント定義 ===
  endpoints:
    # 一覧取得
    getUsers:
      method: GET
      path: /users
      params:
        page: number
        pageSize: number = 20
        q: string?
      response: PaginatedResponse<User>

    # 単体取得
    getUser:
      method: GET
      path: /users/:id
      response: User

    # 作成
    createUser:
      method: POST
      path: /users
      body: UserForm
      response:
        id: string

    # 更新
    updateUser:
      method: PUT
      path: /users/:id
      body: UserForm
      response: User

    # 削除
    deleteUser:
      method: DELETE
      path: /users/:id
      response:
        success: boolean

    # 一括削除
    deleteUsers:
      method: POST
      path: /users/bulk-delete
      body:
        ids: string[]
      response:
        count: number

    # カスタムアクション
    checkEmail:
      method: POST
      path: /users/check-email
      body:
        email: string
        excludeId: string?
      response:
        available: boolean
```

### API呼び出し

```yaml
# state定義での使用
state:
  users:
    type: PaginatedResponse<User>
    source: api.getUsers
    params:
      page: $params.page
      q: $params.q

# action内での使用
actions:
  submit:
    steps:
      - call: api.createUser($form.values)
      - on:success:
          - navigate: UserDetail
            params:
              id: $result.id
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
├── api/
│   └── endpoints.yaml         # API定義
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

- `$xxx` 参照は定義された状態を参照している
- `navigate(Screen)` は定義された画面を参照している
- `api.xxx` は定義されたエンドポイントを参照している

### 型チェック

- 状態の型と初期値が一致
- propsの型と渡される値が一致
- API response の型と使用箇所が一致

---

## 変更履歴

### v0.2 (現在)

- 設計原則に「AI-Parseable」を追加
- 用語集を追加
- Tokens セクションを追加（W3C DTCG互換）
- computed（派生状態）を追加
- API定義セクションを追加
- 式・関数の詳細を追加
- ファイル構成例を追加

### v0.1

- 初版
