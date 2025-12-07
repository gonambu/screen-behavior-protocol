# UIDP有無の比較

## 画面遷移図

```
┌─────────────┐     タスクをクリック      ┌─────────────┐
│             │ ─────────────────────────→│             │
│  TodoList   │                           │ TodoDetail  │
│  (一覧)     │ ←─────────────────────────│  (詳細)     │
│             │     戻る / 削除後          │             │
└─────────────┘                           └─────────────┘
      │                                         │
      │ 追加・完了・削除                         │ 編集・削除
      ↓                                         ↓
  ┌─────────┐                             ┌─────────┐
  │ globals │ ←───────────────────────────│ globals │
  │  todos  │      グローバル状態を共有      │  todos  │
  └─────────┘                             └─────────┘
```

---

## 作りたい画面

### 一覧画面（TodoList）

```
┌─────────────────────────────────────────────┐
│                                             │
│             やることリスト                    │
│                                             │
│  ┌─────────────────────────────────┐ ┌────┐ │
│  │ 新しいタスクを入力...            │ │追加│ │
│  └─────────────────────────────────┘ └────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ ☐ 牛乳を買う  ←(クリックで詳細へ)   🗑  ││
│  ├─────────────────────────────────────────┤│
│  │ ☑ メールを送る ←(打ち消し線)        🗑  ││
│  ├─────────────────────────────────────────┤│
│  │ ☐ レポートを書く                    🗑  ││
│  └─────────────────────────────────────────┘│
│                                             │
│  残り 2 件               [完了済みを削除]    │
│                                             │
└─────────────────────────────────────────────┘
```

### 詳細画面（TodoDetail）

```
┌─────────────────────────────────────────────┐
│                                             │
│  [←]         タスク詳細                     │
│  ─────────────────────────────────────────  │
│                                             │
│  ☐ 牛乳を買う                               │
│                                             │
│  帰りにスーパーで牛乳を買う。               │
│  低脂肪ではなく普通のもの。                 │
│                                             │
│  ─────────────────────────────────────────  │
│  作成: 2024/01/15 10:30                     │
│  更新: 2024/01/15 14:20                     │
│                                             │
│  ┌─────────────────┐ ┌─────────────────┐    │
│  │      編集       │ │      削除       │    │
│  └─────────────────┘ └─────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 編集モード

```
┌─────────────────────────────────────────────┐
│                                             │
│  [←]         タスク詳細                     │
│  ─────────────────────────────────────────  │
│                                             │
│  タイトル                                   │
│  ┌─────────────────────────────────────────┐│
│  │ 牛乳を買う                              ││
│  └─────────────────────────────────────────┘│
│                                             │
│  詳細（任意）                               │
│  ┌─────────────────────────────────────────┐│
│  │ 帰りにスーパーで牛乳を買う。            ││
│  │ 低脂肪ではなく普通のもの。              ││
│  │                                         ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────┐ ┌─────────────────┐    │
│  │      保存       │ │   キャンセル    │    │
│  └─────────────────┘ └─────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 機能要件

### 一覧画面
- タスクを追加できる（Enter or ボタン）
- 空文字では追加できない
- チェックで完了/未完了を切り替え
- 完了タスクは視覚的に区別
- 個別削除できる
- 完了済みを一括削除できる
- 残りタスク数を表示
- **タスクをクリックで詳細画面へ遷移**

### 詳細画面
- タスクの詳細を表示
- 完了/未完了を切り替え
- 編集モードへ切り替え
- 削除（確認ダイアログ付き）
- 一覧画面へ戻る

### 共通
- ブラウザを閉じてもデータが残る（localStorage）
- **画面間でデータを共有（globals）**

---

## 比較: UIDPなしの場合

### プロンプト例

```
ToDoアプリを作ってください。
- 一覧画面と詳細画面がある
- タスクの追加、完了、削除、編集ができる
- データはローカルストレージに保存
```

### 問題点

| 曖昧な点 | 解釈A | 解釈B |
|---------|-------|-------|
| 画面遷移 | React Router | 条件レンダリング |
| 状態共有 | グローバル状態 | props drilling |
| URL設計 | `/todos/:id` | クエリパラメータ |
| 編集UI | 同じ画面で | モーダル |
| 削除確認 | ダイアログ | なし |
| 戻る挙動 | ブラウザバック | ボタン |
| エラー処理 | 404画面 | アラート |

### 生成されるコード

```tsx
// AIによって全く異なる実装が生成される

// パターンA: 状態管理が分散
function App() {
  return (
    <Router>
      <Route path="/" element={<TodoList />} />
      <Route path="/:id" element={<TodoDetail />} />
    </Router>
  );
}
// → 各画面で独自にlocalStorageを読み書き
// → 状態の不整合が発生しやすい

// パターンB: 過剰に複雑
function App() {
  // Redux + Redux Saga + Reselect...
  // 小さなアプリには過剰な設計
}
```

---

## 比較: UIDPありの場合

### プロンプト例

```
以下のUIDPファイルを読み、React + MUIで実装してください。

[simple-todo.uidp.yaml]
```

### 明確な点

| 項目 | UIDPでの定義 |
|------|-------------|
| 画面構成 | `screens: TodoList, TodoDetail` |
| URL設計 | `route: /todos`, `route: /todos/:id` |
| 状態共有 | `globals: todos` で一元管理 |
| 画面遷移 | `navigate(TodoDetail, { id: $todo.id })` |
| 編集UI | `isEditing` 状態で切り替え |
| 削除確認 | `confirm: { title, message, variant }` |
| エラー処理 | `notFound` computed + 条件分岐 |

### 画面遷移の定義

```yaml
flows:
  TodoFlow:
    initial: TodoList
    transitions:
      - from: TodoList
        to: TodoDetail
        on: selectTodo
        params:
          id: $todo.id

      - from: TodoDetail
        to: TodoList
        on: back

      - from: TodoDetail
        to: TodoList
        on: delete
```

### 生成されるコード

```tsx
// UIDPに忠実なコードが生成される

// グローバル状態（globals.todos）
const TodoContext = createContext<{
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}>({ todos: [], setTodos: () => {} });

function TodoProvider({ children }) {
  const [todos, setTodos] = useState<Todo[]>([]);

  // persist: true (実装がlocalStorageを選択)
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  return (
    <TodoContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodoContext.Provider>
  );
}

// ルーティング（flows + route）
function App() {
  return (
    <TodoProvider>
      <Router>
        <Route path="/todos" element={<TodoList />} />
        <Route path="/todos/:id" element={<TodoDetail />} />
      </Router>
    </TodoProvider>
  );
}

// 一覧画面（TodoList）
function TodoList() {
  const { todos, setTodos } = useContext(TodoContext);
  const navigate = useNavigate();

  // タスククリックで詳細へ
  const handleClick = (id: string) => {
    navigate(`/todos/${id}`);
  };

  // ... UIDPの構造に忠実な実装
}

// 詳細画面（TodoDetail）
function TodoDetail() {
  const { id } = useParams();
  const { todos, setTodos } = useContext(TodoContext);
  const navigate = useNavigate();

  // computed: todo, notFound
  const todo = todos.find(t => t.id === id);
  const notFound = todo == null;

  // state: isEditing, form
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ text: "", description: "" });

  // actions: toggleComplete, startEdit, save, delete
  // ... UIDPの構造に忠実な実装
}
```

---

## 結論

| 観点 | UIDPなし | UIDPあり |
|------|---------|---------|
| 再現性 | 低い（AIの解釈次第） | 高い（仕様が明確） |
| 画面遷移 | 曖昧 | `flows`で明確 |
| 状態共有 | 設計がばらつく | `globals`で一元化 |
| URL設計 | 統一されない | `route`で定義 |
| 手戻り | 多い（意図と違う実装） | 少ない（仕様通り） |
| 人間の確認 | 困難（コードを読む） | 容易（YAMLを読む） |

**UIDPは「AIへの設計書」として機能し、画面遷移を含む複雑なアプリでも曖昧さを排除する。**
