import { useState, useMemo } from 'react';
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
import { useTodos } from '../context/TodoContext';

export function TodoList() {
  const navigate = useNavigate();
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos();

  // state: newTodoText (type: string, initial: "")
  const [newTodoText, setNewTodoText] = useState('');

  // computed: remainingCount (count: todos, where: not completed)
  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  // computed: hasCompleted (any: todos, where: completed)
  const hasCompleted = useMemo(
    () => todos.some((todo) => todo.completed),
    [todos]
  );

  // computed: isEmpty (count: todos, equals: 0)
  const isEmpty = useMemo(() => todos.length === 0, [todos]);

  // actions.addTodo
  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(newTodoText);
      setNewTodoText('');
    }
  };

  // on:keydown: when: event.key is Enter and newTodoText is not empty
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTodoText.trim()) {
      handleAddTodo();
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 480,
        margin: 'auto',
        padding: 3, // tokens.spacing.lg
      }}
    >
      {/* Text: variant: h1, content: やることリスト */}
      <Typography variant="h4" align="center" gutterBottom>
        やることリスト
      </Typography>

      {/* Stack: direction: horizontal, gap: tokens.spacing.sm */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {/* TextField: value: newTodoText, placeholder: 新しいタスクを入力... */}
        <TextField
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタスクを入力..."
          size="small"
          sx={{ flex: 1 }}
        />
        {/* Button: label: 追加, variant: primary, disabled: newTodoText is empty */}
        <Button
          variant="contained"
          onClick={handleAddTodo}
          disabled={!newTodoText.trim()}
        >
          追加
        </Button>
      </Stack>

      {/* match: isEmpty */}
      {isEmpty ? (
        // cases: true
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          タスクがありません
        </Typography>
      ) : (
        // cases: false
        <Stack spacing={0.5}>
          {/* each: todos, as: todo, key: todo.id */}
          {todos.map((todo) => (
            <Stack
              key={todo.id}
              direction="row"
              alignItems="center"
              spacing={1}
            >
              {/* Checkbox: checked: todo.completed */}
              <Checkbox
                checked={todo.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTodo(todo.id);
                }}
              />
              {/* Box: flex: 1, on:click: navigate(TodoDetail, { id: todo.id }) */}
              <Box
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  py: 1,
                  px: 0.5,
                  borderRadius: 1,
                }}
                onClick={() => navigate(`/todos/${todo.id}`)}
              >
                {/* Text: content: todo.text, disabled: todo.completed */}
                <Typography
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {todo.text}
                </Typography>
              </Box>
              {/* IconButton: icon: delete, size: small, color: error */}
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Stack: direction: horizontal, justify: space-between */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        {/* Text: content: "残り {remainingCount} 件" */}
        <Typography variant="caption" color="text.secondary">
          残り {remainingCount} 件
        </Typography>

        {/* when: hasCompleted, show: Button */}
        {hasCompleted && (
          <Button variant="text" size="small" onClick={clearCompleted}>
            完了済みを削除
          </Button>
        )}
      </Stack>
    </Card>
  );
}
