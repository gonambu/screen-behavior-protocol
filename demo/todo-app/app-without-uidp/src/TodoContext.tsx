import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Todo } from './types';

// 図には「globals」と書いてあるのでグローバル状態を使う
// 実装方法はContext, Redux, Zustandなど選択肢がある → Contextを選択

const TodoContext = createContext<{
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
} | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);

  // 「ブラウザを閉じてもデータが残る（localStorage）」という要件
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      // Date型の復元が必要 → 実装者が気づかないと文字列のままになる
      const parsed = JSON.parse(saved);
      setTodos(parsed.map((t: Todo) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  return (
    <TodoContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within TodoProvider');
  return context;
}
