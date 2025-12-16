import { useState, useMemo } from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../components/MainLayout';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { DataItem, DataItemForm, DataItemStatus, Toast } from '../types';
import { mockDataItems, generateId } from '../services/mockData';

export default function DataManagement() {
  // State from SBP
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [items, setItems] = useState<DataItem[]>(mockDataItems);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState<DataItemForm>({
    name: '',
    value: 0,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Computed: canSaveEdit - form.name is not empty AND form.value > 0
  const canSaveEdit = useMemo(
    () => editForm.name.trim() !== '' && editForm.value > 0,
    [editForm.name, editForm.value]
  );

  // Action: Open edit modal for new item
  const handleNewItem = () => {
    setSelectedItem(null);
    setEditForm({ name: '', value: 0, status: 'active' });
    setEditModalOpen(true);
  };

  // Action: Open edit modal for existing item
  const handleEditItem = (item: DataItem) => {
    setSelectedItem(item);
    setEditForm({ name: item.name, value: item.value, status: item.status });
    setEditModalOpen(true);
  };

  // Action: Open delete confirmation
  const handleDeleteClick = (item: DataItem) => {
    setSelectedItem(item);
    setDeleteConfirmOpen(true);
  };

  // Action: saveItem
  const handleSaveItem = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (selectedItem === null) {
        // Create new item
        const newItem: DataItem = {
          id: generateId(),
          name: editForm.name,
          value: editForm.value,
          status: editForm.status,
          updatedAt: new Date(),
        };
        setItems((prev) => [...prev, newItem]);
      } else {
        // Update existing item
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  name: editForm.name,
                  value: editForm.value,
                  status: editForm.status,
                  updatedAt: new Date(),
                }
              : item
          )
        );
      }
      setEditModalOpen(false);
      setToast({ message: '保存しました', type: 'success' });
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Action: deleteItem
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setDeleteConfirmOpen(false);
      setSelectedItem(null);
      setToast({ message: '削除しました', type: 'success' });
    } catch {
      setToast({ message: '削除に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof DataItemForm, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout
      title="データ管理"
      drawerOpen={drawerOpen}
      onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      headerChildren={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewItem}
          sx={{ ml: 2 }}
        >
          新規作成
        </Button>
      }
    >
      {/* Data Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>値</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.value.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusChip status={item.status} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(item)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedItem === null ? '新規作成' : '編集'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="名前"
              value={editForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={editForm.name.trim() === ''}
              helperText={editForm.name.trim() === '' ? '名前は必須です' : ''}
              fullWidth
            />
            <TextField
              label="値"
              type="number"
              value={editForm.value}
              onChange={(e) => handleFormChange('value', Number(e.target.value))}
              error={editForm.value <= 0}
              helperText={editForm.value <= 0 ? '0より大きい値を入力してください' : ''}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>ステータス</InputLabel>
              <Select
                value={editForm.status}
                label="ステータス"
                onChange={(e) =>
                  handleFormChange('status', e.target.value as DataItemStatus)
                }
              >
                <MenuItem value="active">有効</MenuItem>
                <MenuItem value="inactive">無効</MenuItem>
                <MenuItem value="pending">保留</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            disabled={!canSaveEdit || loading}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="削除確認"
        message={`「${selectedItem?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Toast / Snackbar */}
      <Snackbar
        open={toast !== null}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
      >
        <Alert
          severity={toast?.type}
          onClose={() => setToast(null)}
          sx={{ width: '100%' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
