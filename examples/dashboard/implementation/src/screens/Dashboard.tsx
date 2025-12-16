import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MainLayout from '../components/MainLayout';
import { Notification } from '../types';
import { mockNotifications } from '../services/mockData';

// Tab panel wrapper component
interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  current: string;
}

function TabPanel({ children, value, current }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== current} sx={{ pt: 3 }}>
      {value === current && children}
    </Box>
  );
}

// Overview Tab Content
function OverviewTab() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              売上
            </Typography>
            <Typography variant="h4">¥1,234,567</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              ユーザー数
            </Typography>
            <Typography variant="h4">5,678</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              注文数
            </Typography>
            <Typography variant="h4">890</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// Sales Tab Content
function SalesTab() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        売上分析
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                月間売上
              </Typography>
              <Typography variant="h3">¥12,345,678</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                前月比
              </Typography>
              <Typography variant="h3" color="success.main">
                +15.3%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography sx={{ mt: 3 }} color="text.secondary">
        売上推移グラフがここに表示されます
      </Typography>
    </Box>
  );
}

// Users Tab Content
function UsersTab() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ユーザー分析
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                総ユーザー数
              </Typography>
              <Typography variant="h3">25,678</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                アクティブ
              </Typography>
              <Typography variant="h3">8,234</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                リテンション
              </Typography>
              <Typography variant="h3">78.5%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Dashboard() {
  // State from SBP: drawerOpen, notificationOpen, userMenuOpen, notifications, activeTab
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('overview');

  // Computed: unreadCount
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Action: openNotification
  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  console.log('Unread notifications:', unreadCount);

  return (
    <MainLayout
      title="ダッシュボード"
      drawerOpen={drawerOpen}
      onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      showNotifications
    >
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="概要" value="overview" />
        <Tab label="売上" value="sales" />
        <Tab label="ユーザー" value="users" />
      </Tabs>

      <TabPanel value="overview" current={activeTab}>
        <OverviewTab />
      </TabPanel>
      <TabPanel value="sales" current={activeTab}>
        <SalesTab />
      </TabPanel>
      <TabPanel value="users" current={activeTab}>
        <UsersTab />
      </TabPanel>
    </MainLayout>
  );
}
