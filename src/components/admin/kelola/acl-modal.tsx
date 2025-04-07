'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '@/lib/api/api';

interface Feature {
  id: string;
  name: string;
  actions: {
    name: string;
  }[];
}

interface Permission {
  subject: string;
  actions: string[];
}

interface AclModalProps {
  open: boolean;
  onClose: () => void;
  userLevelId: string;
  userLevelName: string;
}

export const AclManagementModal: React.FC<AclModalProps> = ({
  open,
  onClose,
  userLevelId,
  userLevelName
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open && userLevelId) {
      fetchFeatures();
      fetchCurrentAcl();
    }
  }, [open, userLevelId]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/acl/features');
      if (response.data?.content) {
        setFeatures(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
      toast.error('Failed to load features', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAcl = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/acl/${userLevelId}`);
      if (response.data?.content?.permissions) {
        setPermissions(response.data.content.permissions);
        
        const initialSelected: Record<string, string[]> = {};
        response.data.content.permissions.forEach((perm: Permission) => {
          initialSelected[perm.subject] = perm.actions;
        });
        setSelectedPermissions(initialSelected);
      }
    } catch (error) {
      console.error('Failed to fetch current ACL:', error);
      toast.error('Failed to load current permissions', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (featureName: string, actionName: string) => {
    setSelectedPermissions(prev => {
      const currentActions = prev[featureName] || [];
      const newActions = currentActions.includes(actionName)
        ? currentActions.filter(a => a !== actionName)
        : [...currentActions, actionName];
      
      return {
        ...prev,
        [featureName]: newActions
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const permissionsToSubmit = Object.entries(selectedPermissions)
        .filter(([_, actions]) => actions.length > 0)
        .map(([subject, actions]) => ({
          subject,
          action: actions
        }));

      await api.post('/acl', {
        userLevelId,
        permissions: permissionsToSubmit
      });

      toast.success('Permissions updated successfully!', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
      onClose();
    } catch (error) {
      console.error('Failed to update permissions:', error);
      toast.error('Failed to update permissions', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minWidth: isMobile ? '100%' : '800px',
          borderRadius: isMobile ? 0 : '12px',
          backgroundColor: theme.palette.background.paper
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: isMobile ? '1rem' : '1.25rem',
        fontWeight: 'bold', 
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: isMobile ? 1 : 2,
        px: isMobile ? 2 : 3
      }}>
        Manage Permissions: {userLevelName.replace(/_/g, ' ')}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: isMobile ? 1 : 2 }}>
        {loading && !features.length ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={isMobile ? 24 : 32} />
          </Box>
        ) : (
          <Box sx={{ 
            maxHeight: isMobile ? 'calc(100vh - 180px)' : '60vh',
            overflow: 'auto',
            pr: isMobile ? 0 : 1
          }}>
            {features.map((feature) => (
              <Box key={feature.id} mb={2}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}>
                  {feature.name.replace(/_/g, ' ')}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <FormGroup sx={{ 
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: 'wrap',
                  '& .MuiFormControlLabel-root': {
                    mb: isMobile ? 0.5 : 0,
                    mr: isMobile ? 0 : 2,
                    minWidth: isMobile ? '100%' : 120
                  }
                }}>
                  {feature.actions.map((action) => (
                    <FormControlLabel
                      key={`${feature.name}-${action.name}`}
                      control={
                        <Checkbox
                          checked={selectedPermissions[feature.name]?.includes(action.name) || false}
                          onChange={() => handlePermissionChange(feature.name, action.name)}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={action.name}
                      sx={{ 
                        '& .MuiTypography-root': {
                          fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }
                      }}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: isMobile ? 1 : 2,
        justifyContent: 'space-between'
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            minWidth: isMobile ? 80 : 120,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            minWidth: isMobile ? 80 : 120,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          {loading ? (
            <CircularProgress size={isMobile ? 16 : 24} color="inherit" />
          ) : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};