'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import api from '@/lib/api/api';
import NotificationMenu from '../dashboard/VisualDashboard/notifcation-menu';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  type: string;
  pengaduanId: string;
  pengaduanMasyarakatId: string | null;
  pelaporanWBSId: string | null;
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const [isDayTime, setIsDayTime] = React.useState<boolean>(true);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  // Fungsi untuk mengambil notifikasi
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notification');
      setNotifications(response.data.content.entries);
      setUnreadCount(response.data.content.notRead);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Fungsi untuk menandai notifikasi sebagai sudah dibaca
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notification/${notificationId}`, { isRead: true });
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Gunakan useEffect untuk mengambil notifikasi secara berkala
  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsDayTime(hour >= 6 && hour < 18);
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {/* Tambahkan tombol notifikasi di sini */}
            <Tooltip title="Notifikasi">
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
      <NotificationMenu
        anchorEl={notificationAnchorEl}
        handleClose={handleNotificationClose}
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
        unreadCount={unreadCount}
      />
    </React.Fragment>
  );
}