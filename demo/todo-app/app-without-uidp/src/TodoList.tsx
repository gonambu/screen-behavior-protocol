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

  const handleAdd = () => {
    if (!newText.trim()) return;
    const newTodo = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      description: '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
    setNewText('');
  };

  const handleToggle = (id: string) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    ));
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const remaining = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        やることリスト
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="新しいタスクを入力..."
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd} disabled={!newText.trim()}>
          追加
        </Button>
      </Stack>

      <Stack spacing={0.5}>
        {todos.map(todo => (
          <Stack key={todo.id} direction="row" alignItems="center" spacing={1}>
            <Checkbox
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <Box
              sx={{ flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/todos/${todo.id}`)}
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
