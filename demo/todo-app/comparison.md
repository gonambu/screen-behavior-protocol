# UIDP有無の比較

## 作りたい画面

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
│  │ ☐ 牛乳を買う                        🗑  ││
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

## 機能要件

- タスクを追加できる（Enter or ボタン）
- 空文字では追加できない
- チェックで完了/未完了を切り替え
- 完了タスクは打ち消し線で表示
- 個別削除できる
- 完了済みを一括削除できる
- 残りタスク数を表示
- ブラウザを閉じてもデータが残る

---

## 比較: UIDPなしの場合

### プロンプト例

```
ToDoアプリを作ってください。
タスクの追加、完了、削除ができるようにしてください。
データはローカルストレージに保存してください。
```

### 問題点

| 曖昧な点 | 解釈A | 解釈B |
|---------|-------|-------|
| レイアウト | 入力欄が上 | 入力欄が下 |
| 追加方法 | ボタンのみ | Enter対応 |
| 完了の表現 | 打ち消し線 | グレーアウト |
| 空文字 | エラー表示 | ボタン無効化 |
| 削除UI | 各行にボタン | スワイプ削除 |
| 一括削除 | あり | なし |
| カウント表示 | 残り件数 | 完了/全体 |

### 生成されるコード

```tsx
// AIによって全く異なる実装が生成される可能性

// パターンA: シンプルすぎる
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
    </div>
  );
}

// パターンB: 過剰に複雑
function TodoApp() {
  // Redux, Context, カスタムフック...
  // ドラッグ&ドロップ、カテゴリ分け...
  // 要件にない機能が大量に追加される
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
| レイアウト | `Card > Stack(horizontal) > TextField + Button` |
| 追加方法 | `on:click` + `on:keydown (Enter)` |
| 完了の表現 | `disabled: $todo.completed` |
| 空文字 | `disabled: $newTodoText.trim() == ""` |
| 削除UI | `IconButton icon: delete` |
| 一括削除 | `when: $hasCompleted` で条件表示 |
| カウント表示 | `computed: remainingCount` |

### 生成されるコード

```tsx
// UIDPに忠実なコードが生成される

function TodoList() {
  // state: UIDPで定義された通り
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");

  // computed: UIDPで定義された通り
  const remainingCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);
  const isEmpty = todos.length === 0;

  // persist: UIDPで定義された通り
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // layout: UIDPで定義された通り
  return (
    <Card sx={{ maxWidth: 480, margin: "auto", p: 3 }}>
      <Typography variant="h1" align="center">
        やることリスト
      </Typography>

      <Stack direction="row" spacing={1}>
        <TextField
          value={newTodoText}
          placeholder="新しいタスクを入力..."
          onChange={e => setNewTodoText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          disabled={newTodoText.trim() === ""}
          onClick={addTodo}
        >
          追加
        </Button>
      </Stack>

      {/* ... 以下、UIDPの構造に忠実 ... */}
    </Card>
  );
}
```

---

## 結論

| 観点 | UIDPなし | UIDPあり |
|------|---------|---------|
| 再現性 | 低い（AIの解釈次第） | 高い（仕様が明確） |
| 手戻り | 多い（意図と違う実装） | 少ない（仕様通り） |
| コミュニケーション | 曖昧 | 構造化 |
| 人間の確認 | 困難（コードを読む） | 容易（YAMLを読む） |

**UIDPは「AIへの設計書」として機能し、曖昧さを排除する。**
