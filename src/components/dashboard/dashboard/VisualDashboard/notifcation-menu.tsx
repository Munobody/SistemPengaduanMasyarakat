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
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(notification => (
              <Accordion
                key={notification.id}
                expanded={expanded === notification.id}
                onChange={handleChange(notification.id)}
                sx={{ 
                  boxShadow: 'none', 
                  borderBottom: '1px solidrgb(0, 0, 0)',
                  backgroundColor: notification.isRead ? '#F1EFEC' : '#E3FEF7',
                  '&:hover': {
                    backgroundColor: notification.isRead ? '#F1EFEC' : '#E3FEF7',
                    opacity: 0.9
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${notification.id}-content`}
                  id={`panel-${notification.id}-header`}
                  onClick={() => markNotificationAsRead(notification.id)}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        color: notification.isRead ? '#030303' : '#003366'
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography 
                      variant="caption"
                      sx={{
                        color: notification.isRead ? '#030303' : '#003366'
                      }}
                    >
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#FFFFFF' }}>
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