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
import { Alert } from '@mui/material';
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
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalNotifications, setTotalNotifications] = React.useState<number>(0);
  const rowsPerPage = 5;

  const fetchNotifications = async (currentPage: number = page) => {
    try {
      const response = await api.get(
        `/notification?orderKey=createdAt&orderRule=desc&page=${currentPage}&rows=${rowsPerPage}`
      );
      setNotifications(response.data.content.entries);
      setUnreadCount(response.data.content.notRead);
      setTotalNotifications(response.data.content.total || response.data.content.entries.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notification/${notificationId}`, { isRead: true });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setError(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const allIds = notifications.map((notification) => notification.id);
      if (allIds.length === 0) return;
      const response = await api.delete(`/notification?ids=[${allIds.map((id) => `"${id}"`).join(',')}]`);
      if (response.status === 200) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalNotifications(0);
        setError(null);
      }
    } catch (error: any) {
      console.error('❌ Gagal menghapus semua notifikasi:', error.response?.data);
      const errorMessage =
        error.response?.data?.message || 'Terjadi kesalahan saat menghapus semua notifikasi';
      setError(errorMessage);
    }
  };

  const handleDeleteSelectedNotifications = async (selectedIds: string[]) => {
    try {
      const response = await api.delete(`/notification?ids=[${selectedIds.map((id) => `"${id}"`).join(',')}]`);
      if (response.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => !selectedIds.includes(notification.id))
        );
        const deletedUnreadCount = notifications.filter(
          (n) => selectedIds.includes(n.id) && !n.isRead
        ).length;
        setUnreadCount((prev) => Math.max(0, prev - deletedUnreadCount));
        setTotalNotifications((prev) => Math.max(0, prev - selectedIds.length));
        setError(null);
      }
    } catch (error: any) {
      console.error('❌ Gagal menghapus notifikasi terpilih:', error.response?.data);
      const errorMessage =
        error.response?.data?.message || 'Terjadi kesalahan saat menghapus notifikasi terpilih';
      setError(errorMessage);
    }
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage + 1);
    fetchNotifications(newPage + 1);
  };

  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsDayTime(hour >= 6 && hour < 18);

    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(page), 300000);

    return () => {
      clearInterval(interval);
    };
  }, [page]);

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
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />
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
        handleDeleteAllNotifications={handleDeleteAllNotifications}
        handleDeleteSelectedNotifications={handleDeleteSelectedNotifications}
        unreadCount={unreadCount}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        totalNotifications={totalNotifications}
        onPageChange={handlePageChange}
        error={error}
      />
    </React.Fragment>
  );
}