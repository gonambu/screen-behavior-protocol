import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  TextField,
  Button,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTodos } from './TodoContext';

export function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, setTodos } = useTodos();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const todo = todos.find(t => t.id === id);

  useEffect(() => {
    if (todo) {
      setEditText(todo.text);
      setEditDescription(todo.description);
    }
  }, [todo]);

  if (!todo) {
    return (
      <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
        <Typography>タスクが見つかりません</Typography>
        <Button onClick={() => navigate('/todos')}>戻る</Button>
      </Card>
    );
  }

  const handleToggle = () => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    ));
  };

  const handleSave = () => {
    if (!editText.trim()) return;
    setTodos(todos.map(t =>
      t.id === id ? { ...t, text: editText.trim(), description: editDescription.trim(), updatedAt: new Date().toISOString() } : t
    ));
    setIsEditing(false);
  };

  const handleDelete = () => {
    setTodos(todos.filter(t => t.id !== id));
    setDeleteDialogOpen(false);
    navigate('/todos');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <IconButton onClick={() => navigate('/todos')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">タスク詳細</Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {isEditing ? (
          <Stack spacing={2}>
            <TextField
              label="タイトル"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              fullWidth
            />
            <TextField
              label="詳細（任意）"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSave} fullWidth disabled={!editText.trim()}>
                保存
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)} fullWidth>
                キャンセル
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox checked={todo.completed} onChange={handleToggle} />
              <Typography
                variant="h6"
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.disabled' : 'inherit',
                }}
              >
                {todo.text}
              </Typography>
            </Stack>

            {todo.description && (
              <Typography color="text.secondary">{todo.description}</Typography>
            )}

            <Divider />

            <Typography variant="caption" color="text.secondary">
              作成: {formatDate(todo.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              更新: {formatDate(todo.updatedAt)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setIsEditing(true)} fullWidth>
                編集
              </Button>
              <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} fullWidth>
                削除
              </Button>
            </Stack>
          </Stack>
        )}
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>このタスクを削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error">削除</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
