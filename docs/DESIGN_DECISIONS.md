# SBP 設計判断の記録

このドキュメントでは、SBPの設計における主要な判断とその理由を記録します。

---

## ADR-001: フォーマットとしてYAMLを採用

### 状態

採用

### 背景

UI記述のフォーマットとして、JSON、XML、YAML、独自DSLなどの選択肢がある。

### 選択肢

| フォーマット | 可読性 | ツールサポート | コメント | 複数行文字列 |
|-------------|--------|---------------|----------|-------------|
| JSON | △ | ◎ | × | × |
| XML | △ | ○ | ○ | △ |
| YAML | ◎ | ○ | ○ | ○ |
| 独自DSL | △ | × | ○ | ○ |

### 決定

**YAMLを採用する**

### 理由

1. **可読性**: インデントで階層を表現し、人間が読みやすい
2. **コメント対応**: 設計意図をコメントで残せる
3. **複数行文字列**: descriptionなどの長文が書きやすい
4. **ツールサポート**: エディタ、パーサー、バリデーターが豊富
5. **JSONとの互換性**: 必要に応じてJSONに変換可能

### 懸念事項

- YAMLのインデントミスによるパースエラー
- 複雑な構造でのネストが深くなりがち

→ エディタの補助機能とスキーマバリデーションで緩和

---

## ADR-002: 参照構文として$プレフィックスを採用

### 状態

採用

### 背景

状態への参照と静的な値を区別する必要がある。

```yaml
# これは参照？値？
data: users
```

### 選択肢

1. `$users` - シェル変数風
2. `{{users}}` - テンプレートエンジン風
3. `@users` - デコレーター風
4. `${users}` - 文字列展開風
5. `users` - 特殊記法なし（文脈で判断）

### 決定

**`$`プレフィックスを採用する**

```yaml
data: $users           # 参照
label: "ユーザー"       # 静的値
```

### 理由

1. **明確な区別**: 参照と値が一目で区別できる
2. **短い**: 1文字で済む
3. **馴染みがある**: シェル変数、PHP変数で広く使われる記法
4. **パース容易**: 正規表現で簡単に抽出可能
5. **ネスト対応**: `$user.name.first`のようにドット記法と組み合わせ可能

### 文字列内での展開

```yaml
message: "こんにちは、${$user.name}さん"
```

テンプレートリテラル内では`${}`を使用し、通常の参照と区別する。

---

## ADR-003: イベントハンドラの記法

### 状態

採用

### 背景

イベントハンドラをどのように記述するか。

### 選択肢

1. `onClick: ...` - キャメルケース
2. `on-click: ...` - ケバブケース
3. `on:click: ...` - 名前空間風
4. `@click: ...` - Vue風
5. `events: { click: ... }` - オブジェクト形式

### 決定

**`on:`プレフィックスを採用する**

```yaml
- Button:
    label: 保存
    on:click: actions.save
    on:hover: set($hovered, true)
```

### 理由

1. **名前空間**: propsとイベントが明確に分離される
2. **一貫性**: YAMLのキー記法と自然に調和
3. **検索性**: `on:`で検索すればイベントハンドラが見つかる
4. **拡張性**: `on:click.stop`のような修飾子追加が可能

---

## ADR-004: 条件分岐の構文

### 状態

採用

### 背景

条件付きレンダリングをどのように記述するか。

### 選択肢

#### 案1: if-then-else

```yaml
- if: $loading
  then: Spinner
  else: Content
```

#### 案2: when-then-else

```yaml
- when: $loading
  then: Spinner
  else: Content
```

#### 案3: 配列形式

```yaml
- [$loading, Spinner, Content]
```

### 決定

**`when-then-else`を採用する**

### 理由

1. **可読性**: `when`は「〜のとき」と自然に読める
2. **`if`との差別化**: アクション内の`if`（制御フロー）と区別
3. **一貫性**: switch文との対応が自然

```yaml
# 条件分岐
- when: $loading
  then: Spinner

# 複数条件
- switch: $status
  cases:
    active: ActiveBadge
    inactive: InactiveBadge
```

---

## ADR-005: 状態定義の構造

### 状態

採用

### 背景

状態をどのような構造で定義するか。

### 選択肢

#### 案1: フラット

```yaml
state:
  loading: boolean
  users: User[]
```

#### 案2: 詳細オブジェクト

```yaml
state:
  loading:
    type: boolean
    initial: false
  users:
    type: User[]
    source: external
```

### 決定

**詳細オブジェクト形式を採用する**

### 理由

1. **メタ情報**: 型以外に初期値、ソース、バリデーションなどを記述可能
2. **拡張性**: 将来的な属性追加が容易
3. **自己文書化**: 状態の意図が明確になる

ただし、シンプルなケースでは省略記法も許容：

```yaml
# 完全形
state:
  loading:
    type: boolean
    initial: false

# 省略形（将来対応予定）
state:
  loading: boolean = false
```

---

## ADR-006: アクションの構文

### 状態

採用

### 背景

ユーザー操作に対する振る舞いをどのように記述するか。

### 選択肢

#### 案1: 宣言的

```yaml
actions:
  save:
    do: save(form)
    onSuccess: navigate(List)
    onError: showError(error)
```

#### 案2: 手続き的

```yaml
actions:
  save:
    steps:
      - do: save(form)
      - when: success
        then:
          - navigate: List
      - when: failure
        then:
          - toast: error(message)
```

### 決定

**手続き的（steps）形式を採用する**

### 理由

1. **表現力**: 複雑なフローが記述可能
2. **順序の明確化**: 処理順序が上から下へ明確
3. **条件分岐**: ステップ内でif/elseが使える
4. **デバッグ容易性**: どのステップで問題が起きたか追跡しやすい

---

## ADR-007: 画面遷移の分離

### 状態

採用

### 背景

画面遷移を画面定義内に書くか、別セクションで定義するか。

### 選択肢

#### 案1: 画面内に記述

```yaml
screens:
  UserList:
    transitions:
      - to: UserDetail
        on: rowClick
```

#### 案2: 別セクションで定義

```yaml
flows:
  UserManagement:
    transitions:
      - from: UserList
        to: UserDetail
        on: rowClick
```

### 決定

**両方をサポートするが、flowsセクションを推奨**

### 理由

1. **俯瞰性**: 遷移全体を一箇所で把握できる
2. **状態機械**: XStateのような状態機械として扱える
3. **ガード**: 遷移条件を一元管理できる
4. **柔軟性**: 画面内でも書けるので、シンプルなケースにも対応

---

## ADR-008: W3C Design Tokensとの互換性

### 状態

採用

### 背景

デザイントークン（色、間隔など）をどのように扱うか。

### 選択肢

1. 独自フォーマット
2. W3C DTCG互換
3. Style Dictionary互換

### 決定

**W3C DTCG互換フォーマットを採用する**

```yaml
tokens:
  colors:
    primary:
      $value: "#1976d2"
      $type: color
```

### 理由

1. **標準化**: W3Cコミュニティグループで策定中の標準
2. **ツール互換**: Tokens Studio、Style Dictionaryと連携可能
3. **将来性**: 業界標準として採用が進んでいる
4. **Figma連携**: Tokens Studio経由でFigmaと同期可能

---

## ADR-009: フォーム状態の専用型

### 状態

採用

### 背景

フォームの状態（値、エラー、touched等）をどのように扱うか。

### 選択肢

1. 個別の状態として定義
2. 専用の`form`型を提供

### 決定

**専用の`form`型を提供する**

```yaml
state:
  form:
    type: form<UserForm>
    initial:
      name: ""
      email: ""
    validation:
      name:
        - rule: required
          message: 名前は必須です
```

### 理由

1. **定型処理のカプセル化**: values, errors, touched, dirty, validなどを自動提供
2. **バリデーション統合**: フィールド定義と検証ルールを一体化
3. **参照の簡潔さ**: `$form.values.name`, `$form.errors.name`で一貫したアクセス
4. **実装マッピング**: React Hook Form、Formik等へのマッピングが容易

---

## ADR-010: 省略記法の提供

### 状態

採用

### 背景

冗長な記述を減らすための省略記法をどこまで提供するか。

### 選択肢

1. 完全形のみ（省略なし）
2. 限定的な省略記法
3. 広範な省略記法

### 決定

**限定的な省略記法を提供する**

```yaml
# 完全形
- Button:
    label: "送信"

# 省略形
- Button: "送信"
```

### 理由

1. **可読性の維持**: 過度な省略はAIの解釈を困難にする
2. **学習コスト**: 省略パターンが多すぎると覚えられない
3. **明確さ優先**: 省略より明確さを優先する原則に沿う

### 採用する省略記法

- 単一prop（label等）の短縮: `- Button: "送信"`
- 単一コンポーネントのthen省略: `then: Spinner`
- バインディング短縮: `bind: $form.name`

---

## 今後の検討事項

### 未決定

1. **アニメーション記述**: トランジション、アニメーションの記述方法
2. **アクセシビリティ**: ARIA属性の記述方法
3. **国際化**: 多言語対応の記述方法
4. **テスト記述**: UIテストケースの記述方法

### 実験的

1. **型推論**: 明示的な型指定を省略できるか
2. **継承**: コンポーネントやスクリーンの継承
3. **マクロ**: 繰り返しパターンの抽象化
