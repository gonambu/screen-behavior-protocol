import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  TextField,
  Button,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTodos } from './TodoContext';

export function TodoList() {
  const navigate = useNavigate();
  const { todos, setTodos } = useTodos();
  const [newText, setNewText] = useState('');

  // 要件：タスクを追加できる（Enter or ボタン）
  const handleAdd = () => {
    if (!newText.trim()) return; // 要件：空文字では追加できない

    const newTodo = {
      id: Date.now().toString(), // UUIDではなくtimestampベース（実装者の判断）
      text: newText.trim(),
      description: '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 追加位置の指定がないので末尾に追加（UIDPでは先頭だった）
    setTodos([...todos, newTodo]);
    setNewText('');
  };

  // 要件：チェックで完了/未完了を切り替え
  const handleToggle = (id: string) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
    ));
  };

  // 要件：個別削除できる
  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // 要件：完了済みを一括削除できる
  const handleClearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  // 要件：残りタスク数を表示
  const remaining = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
      {/* ワイヤーフレーム：「やることリスト」タイトル */}
      <Typography variant="h5" align="center" gutterBottom>
        やることリスト
      </Typography>

      {/* ワイヤーフレーム：入力欄と追加ボタン */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="新しいタスクを入力..."
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd}>
          追加
        </Button>
      </Stack>

      {/* ワイヤーフレーム：タスクリスト */}
      {/* 空の場合の表示は図に無いので省略（実装者の判断で追加するかも） */}
      <Stack spacing={0.5}>
        {todos.map(todo => (
          <Stack key={todo.id} direction="row" alignItems="center" spacing={1}>
            <Checkbox
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            {/* 要件：タスクをクリックで詳細画面へ遷移 */}
            {/* URLの形式は図に無い → クエリパラメータを選択 */}
            <Box
              sx={{ flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/?id=${todo.id}`)}
            >
              <Typography
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.disabled' : 'inherit',
                }}
              >
                {todo.text}
              </Typography>
            </Box>
            <IconButton size="small" color="error" onClick={() => handleDelete(todo.id)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {/* ワイヤーフレーム：「残り N 件」と「完了済みを削除」 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          残り {remaining} 件
        </Typography>
        {hasCompleted && (
          <Button variant="text" size="small" onClick={handleClearCompleted}>
            完了済みを削除
          </Button>
        )}
      </Stack>
    </Card>
  );
}
