import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MainLayout from '../components/MainLayout';
import { Toast } from '../types';

export default function Settings() {
  // State from SBP
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Action: saveSettings
  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Settings saved:', {
        notificationsEnabled,
        emailNotifications,
        darkMode,
      });

      setToast({ message: '設定を保存しました', type: 'success' });
    } catch {
      setToast({ message: '設定の保存に失敗しました', type: 'error' });
    }
  };

  return (
    <MainLayout
      title="設定"
      drawerOpen={drawerOpen}
      onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
    >
      {/* Notification Settings */}
      <Typography variant="h5" gutterBottom>
        通知設定
      </Typography>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography>通知を有効にする</Typography>
              <Switch
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography>メール通知</Typography>
              <Switch
                checked={emailNotifications}
                disabled={!notificationsEnabled}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
        表示設定
      </Typography>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>ダークモード</Typography>
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleSaveSettings}>
          設定を保存
        </Button>
      </Box>

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
