// src/components/dashboard/dashboard/NotificationMenu.tsx
import React, { useState } from 'react';
import { Menu, MenuItem, Typography, Divider, Badge, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Notification } from '@/types/custom-notification';

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  anchorEl,
  handleClose,
  notifications,
  markNotificationAsRead,
  unreadCount
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      sx={{ maxHeight: 500, width: 400 }}
      PaperProps={{
        sx: { width: 400, maxWidth: '100%' }
      }}
    >
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Notifikasi
        </Typography>
        {unreadCount > 0 && (
          <Typography variant="caption" color="primary">
            {unreadCount} belum dibaca
          </Typography>
        )}
      </Box>
      <Divider />
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          notifications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by newest first
            .map(notification => (
              <Accordion
                key={notification.id}
                expanded={expanded === notification.id}
                onChange={handleChange(notification.id)}
                sx={{ boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${notification.id}-content`}
                  id={`panel-${notification.id}-header`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        color: notification.isRead ? 'textSecondary' : 'textPrimary'
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">
                    {notification.message}
                  </Typography>
                </AccordionDetails>
              </Accordion>
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
      <MenuItem sx={{ justifyContent: 'center' }}>
        <Typography variant="body2" color="primary">
          Lihat Semua Notifikasi
        </Typography>
      </MenuItem>
    </Menu>
  );
};

export default NotificationMenu;