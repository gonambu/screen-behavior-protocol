import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  TextField,
  Button,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTodos } from '../context/TodoContext';
import type { TodoForm } from '../types';

export function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, updateTodo, deleteTodo } = useTodos();

  // computed: todo (find: todos, where: id equals params.id)
  const todo = useMemo(() => todos.find((t) => t.id === id), [todos, id]);

  // computed: notFound (check: todo is null)
  const notFound = todo == null;

  // state: isEditing (type: boolean, initial: false)
  const [isEditing, setIsEditing] = useState(false);

  // state: form (type: form, schema: TodoForm, initialFrom: todo)
  const [form, setForm] = useState<TodoForm>({
    text: '',
    description: '',
  });

  // Sync form with todo when entering edit mode
  useEffect(() => {
    if (todo && isEditing) {
      setForm({
        text: todo.text,
        description: todo.description || '',
      });
    }
  }, [todo, isEditing]);

  // Confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // actions.toggleComplete
  const handleToggleComplete = () => {
    if (todo) {
      updateTodo(todo.id, { completed: !todo.completed });
    }
  };

  // actions.startEdit
  const handleStartEdit = () => {
    if (todo) {
      setForm({
        text: todo.text,
        description: todo.description || '',
      });
      setIsEditing(true);
    }
  };

  // actions.cancelEdit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // actions.save
  const handleSave = () => {
    if (todo && form.text.trim()) {
      updateTodo(todo.id, {
        text: form.text,
        description: form.description,
      });
      setIsEditing(false);
      setToast({ open: true, message: '保存しました', severity: 'success' });
    }
  };

  // actions.delete (with confirm dialog)
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todo) {
      deleteTodo(todo.id);
      setDeleteDialogOpen(false);
      setToast({ open: true, message: '削除しました', severity: 'success' });
      navigate('/todos');
    }
  };

  // Format datetime helper
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <>
      <Card
        sx={{
          maxWidth: 480,
          margin: 'auto',
          padding: 3,
        }}
      >
        {/* Header: Stack with back button and title */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <IconButton onClick={() => navigate('/todos')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">タスク詳細</Typography>
          <Box width={40} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* when: notFound */}
        {notFound ? (
          <Stack spacing={2}>
            <Typography color="error" align="center">
              タスクが見つかりません
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => navigate('/todos')}>
              一覧に戻る
            </Button>
          </Stack>
        ) : (
          /* when: not notFound */
          <>
            {/* match: isEditing */}
            {!isEditing ? (
              /* cases: false - View mode */
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox checked={todo.completed} onChange={handleToggleComplete} />
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    {todo.text}
                  </Typography>
                </Stack>

                {/* when: todo.description is not empty */}
                {todo.description && (
                  <Typography color="text.secondary">{todo.description}</Typography>
                )}

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  作成: {formatDateTime(todo.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  更新: {formatDateTime(todo.updatedAt)}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="contained" sx={{ flex: 1 }} onClick={handleStartEdit}>
                    編集
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleDelete}>
                    削除
                  </Button>
                </Stack>
              </Stack>
            ) : (
              /* cases: true - Edit mode */
              <Stack spacing={2}>
                <TextField
                  label="タイトル"
                  value={form.text}
                  onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                  error={!form.text.trim()}
                  fullWidth
                />
                <TextField
                  label="詳細（任意）"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  fullWidth
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    sx={{ flex: 1 }}
                    disabled={!form.text.trim()}
                    onClick={handleSave}
                  >
                    保存
                  </Button>
                  <Button variant="outlined" onClick={handleCancelEdit}>
                    キャンセル
                  </Button>
                </Stack>
              </Stack>
            )}
          </>
        )}
      </Card>

      {/* Confirm dialog for delete */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>タスクの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>このタスクを削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
