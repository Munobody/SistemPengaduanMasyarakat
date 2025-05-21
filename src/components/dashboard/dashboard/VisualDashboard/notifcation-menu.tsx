'use client';

import React, { useState, memo, useEffect } from 'react';
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
  onUnreadNotification?: () => void; 
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
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showUnreadNotification, setShowUnreadNotification] = useState(false);

    const handleUnreadNotification = () => {
      setShowUnreadNotification(true);
    };

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
      setSelectedIds([]);
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
        setIsSelecting(false);
      }
      handleCloseConfirmDialog();
      handleClose();
    };
    

    const getRelativeTime = (date: string) => {
      try {
        return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: id });
      } catch {
        return 'Baru saja';
      }
    };

    useEffect(() => {
      const unreadNotification = notifications.find((notification) => !notification.isRead);
      if (unreadNotification) {
        setExpanded(unreadNotification.id); // Automatically expand the first unread notification
      }
    }, [notifications]);

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ 
          maxHeight: isMobile ? '70vh' : '80vh',
          width: isMobile ? '90vw' : 400,
        }}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            maxWidth: isMobile ? '320px' : '100%',
            borderRadius: isMobile ? 0 : 2,
            boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
            px: isMobile ? 0.5 : 2,
            py: isMobile ? 0.5 : 1,
            marginTop: isMobile ? 0 : 1,
          },
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isMobile ? 'center' : 'right',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
      >
        {/* Wrap all children in a single Box to avoid Fragment issues */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Header */}
          <Box
            sx={{
              px: isMobile ? 0.5 : 2,
              py: isMobile ? 0.5 : 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: isSelecting ? '#FFF3E0' : 'transparent',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="#003C43" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              Notifikasi
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {unreadCount > 0 && (
                <Typography variant="caption" color="error" sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}>
                  {unreadCount} belum dibaca
                </Typography>
              )}
              {notifications.length > 0 && (
                <Button
                  size={isMobile ? 'small' : 'medium'}
                  variant="text"
                  color={isSelecting ? 'error' : 'primary'}
                  onClick={handleToggleSelectMode}
                  sx={{
                    minWidth: isMobile ? '60px' : '80px',
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                  }}
                >
                  {isSelecting ? 'Batal' : 'Pilih'}
                </Button>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mx: isMobile ? 0.5 : 2, mb: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {error}
            </Alert>
          )}

          {/* Notification List */}
          <Box
            sx={{
              maxHeight: isMobile ? '50vh' : 400,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '2px',
              },
            }}
          >
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
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: isMobile ? 0.5 : 1,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelecting && (
                      <Checkbox
                        checked={selectedIds.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        sx={{ p: 0, mr: 0.5 }}
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
                          fontSize: isMobile ? '0.75rem' : '0.8125rem',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: notification.isRead ? '#666' : '#003366',
                          fontSize: isMobile ? '0.625rem' : '0.6875rem',
                        }}
                      >
                        {getRelativeTime(notification.updatedAt)}
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
                          fontSize: isMobile ? '1rem' : '1.25rem',
                        }}
                      />
                    </IconButton>
                  </Box>
                  <Collapse in={expanded === notification.id}>
                    <Box sx={{ p: isMobile ? 0.5 : 1, backgroundColor: '#FFFFFF' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8125rem' }}>
                        {notification.message}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>
              ))
            ) : (
              <MenuItem>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8125rem' }}>
                  Tidak ada notifikasi
                </Typography>
              </MenuItem>
            )}
          </Box>

          {notifications.length > 0 && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', px: isMobile ? 0.5 : 0 }}>
                {selectedIds.length > 0 && (
                  <Button
                    onClick={() => handleOpenConfirmDialog('selected')}
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    sx={{
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    }}
                  >
                    Hapus {selectedIds.length} terpilih
                  </Button>
                )}
                <Button
                  onClick={() => handleOpenConfirmDialog('all')}
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  sx={{
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                  }}
                >
                  Hapus Semua
                </Button>
              </Box>
              <TablePagination
                component="div"
                count={totalNotifications}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                labelRowsPerPage=""
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
                sx={{
                  '.MuiTablePagination-toolbar': {
                    minHeight: isMobile ? 36 : 48,
                    padding: isMobile ? '0 2px' : '0 8px',
                  },
                  '.MuiTablePagination-displayedRows': {
                    fontSize: isMobile ? '0.625rem' : '0.6875rem',
                  },
                  '.MuiTablePagination-actions': {
                    marginLeft: isMobile ? 0.5 : 2,
                  },
                }}
              />
            </>
          )}
        </Box>

        

        {/* Dialog for confirmation */}
        <Dialog
          open={openConfirmDialog !== null}
          onClose={handleCloseConfirmDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 2 : 3,
              px: isMobile ? 0.5 : 2,
              py: isMobile ? 0.5 : 1,
            },
          }}
        >
          <DialogTitle sx={{ fontSize: isMobile ? '0.875rem' : '1.25rem', p: isMobile ? 1 : 2 }}>
            Hapus Notifikasi
          </DialogTitle>
          <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
            <Typography sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>
              {openConfirmDialog === 'all'
                ? 'Apakah Anda yakin ingin menghapus semua notifikasi?'
                : `Apakah Anda yakin ingin menghapus ${selectedIds.length} notifikasi terpilih?`}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
            <Button
              onClick={handleCloseConfirmDialog}
              color="primary"
              variant="outlined"
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.8125rem',
                minWidth: isMobile ? '80px' : '100px',
                p: isMobile ? '4px 12px' : '6px 16px',
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.8125rem',
                minWidth: isMobile ? '80px' : '100px',
                p: isMobile ? '4px 12px' : '6px 16px',
              }}
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </Menu>
    );
  }
);

export default NotificationMenu;