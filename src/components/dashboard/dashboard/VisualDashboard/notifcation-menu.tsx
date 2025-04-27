'use client';

import React, { useState, memo } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Collapse,
  TablePagination,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useDrag } from '@use-gesture/react';
import { Notification } from '@/types/custom-notification';

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;
  handleDeleteAllNotifications?: () => void;
  handleDeleteSelectedNotifications?: (selectedIds: string[]) => void;
  page: number;
  rowsPerPage: number;
  totalNotifications: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  error: string | null;
}

const NotificationMenu: React.FC<NotificationMenuProps> = memo(
  ({
    anchorEl,
    handleClose,
    notifications,
    markNotificationAsRead,
    unreadCount,
    handleDeleteAllNotifications,
    handleDeleteSelectedNotifications,
    page,
    rowsPerPage,
    totalNotifications,
    onPageChange,
    error,
  }) => {
    const [expanded, setExpanded] = useState<string | false>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState<'all' | 'selected' | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

    const handleSelectNotification = (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
      );
    };

    const handleToggleSelectMode = () => {
      setIsSelecting((prev) => !prev);
      setSelectedIds([]); // Reset selected IDs when toggling mode
    };

    const handleOpenConfirmDialog = (type: 'all' | 'selected') => {
      setOpenConfirmDialog(type);
    };

    const handleCloseConfirmDialog = () => {
      setOpenConfirmDialog(null);
    };

    const handleConfirmDelete = () => {
      if (openConfirmDialog === 'all') {
        handleDeleteAllNotifications?.();
      } else if (openConfirmDialog === 'selected') {
        handleDeleteSelectedNotifications?.(selectedIds);
        setSelectedIds([]);
        setIsSelecting(false); // Exit select mode after deletion
      }
      handleCloseConfirmDialog();
      handleClose();
    };

    const handleSwipeDelete = (id: string) => {
      handleDeleteSelectedNotifications?.([id]);
      setSwipeOffset((prev) => {
        const newOffset = { ...prev };
        delete newOffset[id];
        return newOffset;
      });
    };

    const getRelativeTime = (date: string) => {
      try {
        return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: id });
      } catch {
        return 'Baru saja';
      }
    };

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ maxHeight: 600, width: isMobile ? '100%' : 400 }}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            maxWidth: '100%',
            borderRadius: isMobile ? 0 : 2,
            boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="#003C43">
            Notifikasi
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {unreadCount > 0 && (
              <Typography variant="caption" color="error">
                {unreadCount} belum dibaca
              </Typography>
            )}
            {notifications.length > 0 && (
              <Button
                size="small"
                variant="text"
                color={isSelecting ? 'error' : 'primary'}
                onClick={handleToggleSelectMode}
              >
                {isSelecting ? 'Batal' : 'Pilih'}
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: notification.isRead ? '#FFFFFF' : '#E3FEF7',
                  '&:hover': {
                    backgroundColor: notification.isRead ? '#F5F5F5' : '#D1ECE5',
                  },
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                  transform: `translateX(${swipeOffset[notification.id] || 0}px)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                {...(isMobile && !isSelecting
                  ? useDrag(
                      ({ movement: [mx], last }) => {
                        if (last) {
                          if (mx < -100) {
                            handleSwipeDelete(notification.id);
                          } else {
                            setSwipeOffset((prev) => ({ ...prev, [notification.id]: 0 }));
                          }
                        } else {
                          if (mx < 0) {
                            setSwipeOffset((prev) => ({ ...prev, [notification.id]: mx }));
                          }
                        }
                      },
                      { axis: 'x' }
                    ).bind(0)
                  : {})}
              >
                {isMobile && !isSelecting && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '60px',
                      backgroundColor: '#D32F2F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `translateX(${Math.min(0, 60 + (swipeOffset[notification.id] || 0))}px)`,
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <DeleteIcon sx={{ color: '#FFFFFF' }} />
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    cursor: 'pointer',
                  }}
                >
                  {isSelecting && (
                    <Checkbox
                      checked={selectedIds.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      sx={{ p: 0, mr: 1 }}
                    />
                  )}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                    onClick={() => {
                      if (!isSelecting) {
                        markNotificationAsRead(notification.id);
                        handleChange(notification.id)({} as React.SyntheticEvent, expanded !== notification.id);
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        color: notification.isRead ? '#030303' : '#003366',
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: notification.isRead ? '#666' : '#003366',
                      }}
                    >
                      {getRelativeTime(notification.id)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleChange(notification.id)({} as React.SyntheticEvent, expanded !== notification.id)
                    }
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: expanded === notification.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#003C43',
                      }}
                    />
                  </IconButton>
                </Box>
                <Collapse in={expanded === notification.id}>
                  <Box sx={{ p: 1, backgroundColor: '#FFFFFF' }}>
                    <Typography variant="body2" color="textSecondary">
                      {notification.message}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            ))
          ) : (
            <MenuItem>
              <Typography variant="body2" color="textSecondary">
                Tidak ada notifikasi
              </Typography>
            </MenuItem>
          )}
        </Box>
        <Divider />
        {notifications.length > 0 && (
          <>
            {!isMobile && (
              <MenuItem
                onClick={() => handleOpenConfirmDialog('all')}
                sx={{ justifyContent: 'center' }}
              >
                <Typography variant="body2" color="error">
                  Hapus Semua Notifikasi
                </Typography>
              </MenuItem>
            )}
            {selectedIds.length > 0 && (
              <MenuItem
                onClick={() => handleOpenConfirmDialog('selected')}
                sx={{ justifyContent: 'center' }}
              >
                <Typography variant="body2" color="error">
                  Hapus {selectedIds.length} Notifikasi Terpilih
                </Typography>
              </MenuItem>
            )}
            <TablePagination
              component="div"
              count={totalNotifications}
              page={page}
              onPageChange={onPageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage=""
              sx={{
                '.MuiTablePagination-toolbar': {
                  minHeight: 36,
                  padding: '0 8px',
                },
                '.MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                },
              }}
            />
          </>
        )}
        <Dialog
          open={openConfirmDialog !== null}
          onClose={handleCloseConfirmDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Hapus Notifikasi</DialogTitle>
          <DialogContent>
            <Typography>
              {openConfirmDialog === 'all'
                ? 'Apakah Anda yakin ingin menghapus semua notifikasi?'
                : `Apakah Anda yakin ingin menghapus ${selectedIds.length} notifikasi terpilih?`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="primary">
              Batal
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </Menu>
    );
  }
);

export default NotificationMenu;