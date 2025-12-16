import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import AppDrawer, { DRAWER_WIDTH } from './AppDrawer';
import AppHeader from './AppHeader';
import { Notification } from '../types';

interface MainLayoutProps {
  title: string;
  drawerOpen: boolean;
  onDrawerToggle: () => void;
  notifications?: Notification[];
  onNotificationClick?: (id: string) => void;
  showNotifications?: boolean;
  headerChildren?: ReactNode;
  children: ReactNode;
}

export default function MainLayout({
  title,
  drawerOpen,
  onDrawerToggle,
  notifications,
  onNotificationClick,
  showNotifications = false,
  headerChildren,
  children,
}: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppDrawer open={drawerOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <AppHeader
          title={title}
          drawerOpen={drawerOpen}
          onMenuClick={onDrawerToggle}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          showNotifications={showNotifications}
        >
          {headerChildren}
        </AppHeader>
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            padding: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
