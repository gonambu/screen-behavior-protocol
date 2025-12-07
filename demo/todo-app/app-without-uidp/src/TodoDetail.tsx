import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  TextField,
  Button,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTodos } from './TodoContext';

export function TodoDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { todos, setTodos } = useTodos();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const todo = todos.find(t => t.id === id);

  useEffect(() => {
    if (todo) {
      setEditText(todo.text);
      setEditDescription(todo.description);
    }
  }, [todo]);

  // 「存在しない場合」の処理は図に無いので簡易的に
  if (!todo) {
    return (
      <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
        <Typography>タスクが見つかりません</Typography>
        <Button onClick={() => navigate('/')}>戻る</Button>
      </Card>
    );
  }

  const handleToggle = () => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
    ));
  };

  const handleSave = () => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, text: editText, description: editDescription, updatedAt: new Date() } : t
    ));
    setIsEditing(false);
  };

  // 要件：削除（確認ダイアログ付き）
  // → 図には具体的なダイアログデザインが無いのでwindow.confirmを使用
  const handleDelete = () => {
    if (window.confirm('このタスクを削除しますか？')) {
      setTodos(todos.filter(t => t.id !== id));
      navigate('/');
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
      {/* ワイヤーフレーム：戻るボタンとタイトル */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">タスク詳細</Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {isEditing ? (
        // 編集モード
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
            <Button variant="contained" onClick={handleSave} fullWidth>
              保存
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)} fullWidth>
              キャンセル
            </Button>
          </Stack>
        </Stack>
      ) : (
        // 表示モード
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
            <Button variant="outlined" color="error" onClick={handleDelete} fullWidth>
              削除
            </Button>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
