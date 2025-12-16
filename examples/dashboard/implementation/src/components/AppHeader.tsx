import { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Notification } from '../types';
import { DRAWER_WIDTH } from './AppDrawer';

interface AppHeaderProps {
  title: string;
  drawerOpen: boolean;
  onMenuClick: () => void;
  notifications?: Notification[];
  onNotificationClick?: (id: string) => void;
  showNotifications?: boolean;
  children?: React.ReactNode;
}

export default function AppHeader({
  title,
  drawerOpen,
  onMenuClick,
  notifications = [],
  onNotificationClick,
  showNotifications = false,
  children,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationOpen = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleUserMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        width: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        ml: drawerOpen ? `${DRAWER_WIDTH}px` : 0,
        transition: (theme) =>
          theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {children}

        {showNotifications && (
          <>
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
            >
              {notifications.length === 0 ? (
                <MenuItem disabled>通知はありません</MenuItem>
              ) : (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => {
                      onNotificationClick?.(notification.id);
                      handleNotificationClose();
                    }}
                    sx={{
                      fontWeight: notification.read ? 'normal' : 'bold',
                    }}
                  >
                    <Typography noWrap sx={{ maxWidth: 250 }}>
                      {notification.title}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Menu>
          </>
        )}

        <IconButton color="inherit" onClick={handleUserMenuOpen}>
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              // Profile navigation placeholder
            }}
          >
            プロフィール
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              navigate('/settings');
            }}
          >
            設定
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
