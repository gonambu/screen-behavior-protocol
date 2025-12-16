# AI時代の画面設計の限界：「動くUI」をAIにどう伝えるか？

## はじめに

AIを活用した開発をしていると、ある壁にぶつかります。

**「複雑なUIの動作や遷移を、AIにどう正確に伝えるか？」**

Figmaなどのビジュアルデザインツールは、画面の「見た目」を定義する上では強力です。しかし、ユーザーの操作による「状態変化」や「画面遷移」になると、AIへの指示が上手くいかないことがあります。

例えば、こんな要件：

> 「フォームAに3文字未満で入力している間は、ボタンBを非活性にして、エラーメッセージを出す」

これをデザインカンプだけでAIに伝えても、期待通りのコードは出てきません。

---

## 仮説：「動作」をテキストで定義すれば伝わるのでは？

AIは宣言的なテキスト定義との相性が良いです。「UIがどうあるべきか」をテキストで受け取ると、コードの骨格を生成しやすい。

ならば、**画面の「動作」と「遷移」を構造化テキストで定義すれば、AIが正確に解釈できるのでは？**

この仮説を検証するため、YAMLベースのプロトコルを試作してみました。

---

## 試作：画面振る舞いプロトコル（SBP）

### 定義する3つの要素

1. **構成（Structure）**: コンポーネントの種類、親子関係
2. **動作（Behavior）**: ユーザー操作に対する状態変化のルール
3. **遷移（Transition）**: 画面間・レイヤー間の移動ルール

### 書き方の例

```yaml
screens:
  SettingPage:
    state:
      form:
        type: form
        schema: SettingForm

    computed:
      isFormValid:
        all of:
          - name is not empty
          - email contains "@"

    layout:
      - TextField:
          label: 名前
          value: form.name
          on:change: set form.name to {value}

      - Button:
          label: 設定を保存
          disabled: not isFormValid
          on:click: actions.saveAndApprove
```

ポイントは：
- **自然言語に近い構文**: `name is not empty`, `email contains "@"`
- **プログラミング知識なしで読める**: 「名前が空だとボタン押せない」とわかる

---

## 検証：リアルなワークフローで試す

### 想定するワークフロー

```
1. デザイナー → Figmaでデザイン作成
        ↓
2. Figma → AIでSBPのベース生成（構造部分）
        ↓
3. エンジニア + デザイナー → 振る舞い・遷移を追記
        ↓
4. SBP → AIでコード生成
```

このワークフローをシミュレーションして、SBPの有効性を検証します。

### 検証用の画面：分析ダッシュボード

SBPの威力を試すため、**動作・遷移が複雑な画面**を用意しました。

```
┌─────────────────────────────────────────┐
│ ヘッダー  [+ 新規作成] [🔔] [ユーザー▼] │
├────────┬────────────────────────────────┤
│ダッシュ │  タブ: [概要] [売上] [ユーザー]│
│ボード   │ ┌─────────┐ ┌─────────┐       │
│────────│ │ カード  │ │ カード  │       │
│データ   │ └─────────┘ └─────────┘       │
│管理    │                               │
│────────│                               │
│設定    │                               │
└────────┴────────────────────────────────┘
  ↑ページ遷移    ↑ タブで切り替え
```

**画面構成：**
- **ダッシュボード**: タブで概要/売上/ユーザーを切り替え、カード表示
- **データ管理**: テーブル＋CRUD操作（編集モーダル、削除確認）
- **設定**: トグルスイッチによる設定変更

**含まれるコンポーネント：**
- サイドナビゲーション（ページ遷移）
- ヘッダーメニュー（通知ドロップダウン、ユーザーメニュー）
- タブ切り替え（ダッシュボード画面内）
- テーブル → 行アクション（編集モーダル、削除確認）
- トースト通知

### ステップ1: Figmaでデザイン作成

デザイナーがFigmaでダッシュボードのデザインを作成。
見た目は決まるが、「いつドロワーが開く？」「削除時に確認出す？」は不明確。

### ステップ2: SBPでコンポーネント構造を書く

Figmaデザインを元に、AIでSBPのベースを生成：

```yaml
layout:
  - Box:
      display: flex
      children:
        - Drawer:
            children:
              - List:
                  children:
                    - ListItem: { children: [...] }
        - Box:
            children:
              - AppBar: { ... }
              - Tabs: { ... }
              - Grid:
                  children:
                    - Card: { ... }
              - Table: { ... }
```

### ステップ3: 振る舞いを追記

ここが**SBPの本領発揮**。Figmaだけでは伝わらない「動き」を定義：

**ダッシュボード画面の状態：**

```yaml
screens:
  Dashboard:
    state:
      drawerOpen:
        type: boolean
        initial: true
      activeTab:
        type: string
        initial: "overview"
      notificationOpen:
        type: boolean
        initial: false

    computed:
      unreadCount:
        count: $notifications
        where: not read
```

**データ管理画面の状態：**

```yaml
  DataManagement:
    state:
      editModalOpen:
        type: boolean
        initial: false
      deleteConfirmOpen:
        type: boolean
        initial: false
      selectedItem:
        type: DataItem | null
        initial: null

    computed:
      canSaveEdit:
        all:
          - $editForm.name is not empty
          - $editForm.value greater than 0
```

**イベントハンドラ：**

```yaml
# サイドナビでページ遷移
- ListItem:
    on:click: navigate(DataManagement)

# タブ切り替え（ダッシュボード内）
- Tabs:
    value: $activeTab
    on:change: set $activeTab to {value}

# 編集モーダル（データ管理画面）
- IconButton:
    icon: Edit
    on:click: |
      set $selectedItem to item
      set $editForm to { name: item.name, value: item.value }
      set $editModalOpen to true
```

**アクション定義：**

```yaml
actions:
  saveItem:
    steps:
      - set: $loading to true
      - do: "updateItem({ id: $selectedItem.id, ...$editForm })"
      - when: success
        then:
          - set: $editModalOpen to false
          - set:
              $toast:
                message: "保存しました"
                type: success
      - when: failure
        then:
          - set:
              $toast:
                message: "保存に失敗しました"
                type: error
```

**ページ遷移の定義：**

```yaml
flows:
  MainNavigation:
    initial: Dashboard
    screens:
      - Dashboard
      - DataManagement
      - Settings
    transitions:
      - from: Dashboard
        to: DataManagement
        trigger: navigate(DataManagement)
```

### ステップ4: Claude Codeでコード生成

SBP + Figmaデザインを渡して「React + MUIで実装して」と依頼。

→ **結果**: （実験後に追記）

### ステップ5: 動作確認

生成されたコードがSBP通りに動くか確認：

- [ ] サイドナビでページ遷移（ダッシュボード→データ管理→設定）
- [ ] タブ切り替え（概要/売上/ユーザー）
- [ ] ドロワー開閉
- [ ] 編集モーダル開閉
- [ ] 削除確認ダイアログ表示
- [ ] トースト表示
- [ ] フォームバリデーション
- [ ] 保存成功/失敗時の分岐

→ **結果**: （実験後に追記）

---

## 期待しているワークフロー

検証が成功すれば、こんな協業ができるかもしれません：

```
デザイナー ──→ Figma（見た目）
                    ↓
              SBPベース生成
                    ↓
デザイナー ──┐
             ├──→ SBP（振る舞い）を共同編集
エンジニア ──┘
                    ↓
              Claude Code
                    ↓
              実装コード
```

- デザイナーとエンジニアが **同じドキュメント** を見て会話できる
- 「このボタンの`disabled`条件、こう変えたい」みたいな議論がテキストベースでできる
- 変更履歴がGitで追跡できる

---

## 考察

### 強み
- **動作ロジックの翻訳ロス解消**: ビジュアルでは伝えにくい条件分岐が明確になる
- **設計意図の曖昧さ排除**: デザイナーの意図がテキストで構造化される
- **AIへの指示精度向上**: 「削除時に確認」「成功時にトースト」が確実に伝わる

### 課題
- **デザインの詳細度の限界**: 色やアニメーションは別途指定が必要
- **メンテナンスコスト**: 複雑になるとYAML自体が複雑になる
- **仕様が固まっていない**: まだ実験段階

---

## まとめ

- Figma等のビジュアルツールでは「動作」をAIに伝えきれない
- 宣言的なテキスト形式（SBP）で動作を定義すると、AIが解釈しやすい（仮説）
- 複雑なダッシュボード画面で検証中

まだ実験段階で、これが正解かどうかはわかりません。AIの進化で不要になるかもしれないし、全然違うアプローチの方が良いかもしれない。

でも「動くUIをAIに伝える」という課題は確実にあるので、試行錯誤を続けていきます。

---

**検証用SBP**: [examples/dashboard/dashboard.sbp.yaml](../../examples/dashboard/dashboard.sbp.yaml)
