# AIへのプロンプト例

## プロンプト

```
以下のUIDPファイルを読み、React + TypeScript + MUIで実装してください。

## 要件
- Create React App または Vite で動作すること
- MUI (Material-UI) v5 を使用
- 状態管理は React hooks (useState, useEffect) を使用
- UIDPで定義された全ての機能を実装すること

## UIDPファイル

[simple-todo.uidp.yamlの内容をここに貼り付け]
```

## 期待される出力

AIは以下のようなコードを生成すべき：

### 1. 型定義

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}
```

### 2. コンポーネント構造

```typescript
function TodoList() {
  // state: todos, newTodoText
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");

  // computed: remainingCount, hasCompleted, isEmpty
  const remainingCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);
  const isEmpty = todos.length === 0;

  // persist: true (実装がlocalStorageを選択)
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // actions
  const addTodo = () => { ... };
  const toggleTodo = (id: string) => { ... };
  const deleteTodo = (id: string) => { ... };
  const clearCompleted = () => { ... };

  return (
    <Card sx={{ maxWidth: 480, margin: "auto", padding: 3 }}>
      {/* layout に従ったMUIコンポーネント */}
    </Card>
  );
}
```

### 3. レイアウト → MUIマッピング

| UIDP | MUI |
|------|-----|
| Card | Card |
| Stack | Stack |
| Text variant="h1" | Typography variant="h1" |
| TextField | TextField |
| Button | Button |
| Checkbox | Checkbox |
| IconButton icon="delete" | IconButton + DeleteIcon |
| Spacer | Box with margin |

## 検証ポイント

生成されたコードが以下を満たすか確認：

- [ ] タスクの追加ができる
- [ ] Enter キーでも追加できる
- [ ] 空文字では追加ボタンが無効になる
- [ ] タスクの完了/未完了を切り替えられる
- [ ] 完了タスクは視覚的に区別される
- [ ] 個別のタスクを削除できる
- [ ] 完了済みタスクを一括削除できる
- [ ] 残りタスク数が表示される
- [ ] ページリロードしてもデータが残る（localStorage）
