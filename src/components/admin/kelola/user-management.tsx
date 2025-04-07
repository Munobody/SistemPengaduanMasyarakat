'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

import api from '@/lib/api/api';

import { AclManagementModal } from './acl-modal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003C43',
      light: '#135D66',
      dark: '#77B0AA',
      contrastText: '#E3FEF7',
    },
    secondary: {
      main: '#77B0AA',
      contrastText: '#003C43',
    },
    background: {
      default: '#E3FEF7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#003C43',
      secondary: '#135D66',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#003C43',
          color: '#E3FEF7',
          fontWeight: 'bold',
        },
        body: {
          color: '#003C43',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 60, 67, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#135D66',
          },
        },
        outlinedPrimary: {
          color: '#003C43',
          borderColor: '#003C43',
          '&:hover': {
            backgroundColor: 'rgba(0, 60, 67, 0.08)',
            borderColor: '#135D66',
          },
        },
      },
    },
  },
});

interface User {
  id: string;
  email: string;
  name: string;
  no_identitas: string;
  userLevelId: string;
  userLevel: {
    name: string;
  };
}

const USER_LEVEL_NAMES = [
  'MAHASISWA',
  'DOSEN',
  'TENAGA_KEPENDIDIKAN',
  'ADMIN',
  'PETUGAS_SUPER',
  'PETUGAS',
  'KEPALA_PETUGAS_UNIT',
] as const;

type UserLevelName = (typeof USER_LEVEL_NAMES)[number];

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [selectedUserLevelName, setSelectedUserLevelName] = useState<string>('ALL');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    no_identitas: '',
    userLevelName: 'MAHASISWA' as UserLevelName,
  });
  const [aclModalOpen, setAclModalOpen] = useState(false);
  const [selectedUserForAcl, setSelectedUserForAcl] = useState<{
    userLevelId: string;
    userLevelName: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=1&rows=50`);
      if (response.data?.content?.entries) {
        setUsers(response.data.content.entries);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load user data', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill all required fields', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
      return;
    }

    try {
      setLoading(true);
      await api.post(`/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        no_identitas: formData.no_identitas,
        userLevelName: formData.userLevelName,
      });

      toast.success('User added successfully!', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });

      setOpen(false);
      fetchUsers();

      setFormData({
        email: '',
        password: '',
        name: '',
        no_identitas: '',
        userLevelName: 'MAHASISWA',
      });
    } catch (error: any) {
      console.error('Failed to register user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add user';
      toast.error(errorMessage, {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAclModal = (user: User) => {
    setSelectedUserForAcl({
      userLevelId: user.userLevelId,
      userLevelName: user.userLevel.name,
    });
    setAclModalOpen(true);
  };

  const filteredUsers =
    selectedUserLevelName === 'ALL' ? users : users.filter((user) => user.userLevel.name === selectedUserLevelName);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          p: isMobile ? 1 : 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <CardHeader
            title={
              <Typography variant={isMobile ? 'h6' : 'h5'} color="text.primary">
                User Management
              </Typography>
            }
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 1,
                  alignItems: 'center',
                  mt: isMobile ? 1 : 0,
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <FormControl
                  sx={{
                    minWidth: isMobile ? '100%' : 200,
                    '& .MuiInputLabel-root': {
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    },
                  }}
                  size="small"
                >
                  <InputLabel>Filter Role</InputLabel>
                  <Select
                    value={selectedUserLevelName}
                    label="Filter Role"
                    onChange={(e) => setSelectedUserLevelName(e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: '#E3FEF7',
                      '& .MuiSelect-select': {
                        fontSize: isMobile ? '0.875rem' : '1rem',
                      },
                    }}
                  >
                    <MenuItem value="ALL" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                      All Roles
                    </MenuItem>
                    {USER_LEVEL_NAMES.map((level) => (
                      <MenuItem
                        key={level}
                        value={level}
                        sx={{
                          fontSize: isMobile ? '0.875rem' : '1rem',
                          whiteSpace: 'normal',
                        }}
                      >
                        {level.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon fontSize={isMobile ? 'small' : 'medium'} />}
                  onClick={() => setOpen(true)}
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    backgroundColor: '#135D66',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    '&:hover': { backgroundColor: '#003C43' },
                  }}
                >
                  {isMobile ? 'Add' : 'Add User'}
                </Button>
              </Box>
            }
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
              '& .MuiCardHeader-action': {
                mt: isMobile ? 1 : 0,
                width: '100%',
              },
            }}
          />

          <TableContainer
            component={Paper}
            sx={{
              maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)',
              overflow: 'auto',
              '& .MuiTableCell-root': {
                px: isMobile ? 1 : 2,
                py: isMobile ? 0.5 : 1.5,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                '&:last-child': {
                  pr: isMobile ? 1 : 2,
                },
              },
            }}
          >
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>Email</TableCell>
                      <TableCell>ID Number</TableCell>
                    </>
                  )}
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && !filteredUsers.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id || Math.random()} hover>
                      <TableCell>{user.name || '-'}</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell sx={{ wordBreak: 'break-word' }}>{user.email || '-'}</TableCell>
                          <TableCell>{user.no_identitas || '-'}</TableCell>
                        </>
                      )}
                      <TableCell>
                        {isMobile ? user.userLevel.name.split('_')[0] : user.userLevel.name.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size={isMobile ? 'small' : 'medium'}
                          startIcon={isMobile ? <SettingsIcon fontSize="small" /> : undefined}
                          onClick={() => handleOpenAclModal(user)}
                          sx={{
                            minWidth: isMobile ? 60 : 100,
                            fontSize: isMobile ? '0.7rem' : '0.8125rem',
                            p: isMobile ? '4px 8px' : '6px 16px',
                          }}
                        >
                          {isMobile ? '' : 'Manage Acces'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No user data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
              }
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                },
              }}
            />
          </TableContainer>

          <Dialog
            open={open}
            onClose={() => !loading && setOpen(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                minWidth: isMobile ? '100%' : '600px',
                borderRadius: isMobile ? 0 : '12px',
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <DialogTitle
              sx={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                py: isMobile ? 1 : 2,
                px: isMobile ? 2 : 3,
              }}
            >
              Add New User
            </DialogTitle>
            <DialogContent dividers sx={{ p: isMobile ? 1 : 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? 1 : 2,
                  pt: 1,
                }}
              >
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                  InputProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                  InputProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                />
                <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                  InputProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                />
                <TextField
                  label="ID Number"
                  value={formData.no_identitas}
                  onChange={(e) => setFormData({ ...formData, no_identitas: e.target.value })}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                  InputProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: isMobile ? '0.875rem' : '1rem' },
                  }}
                />
                <FormControl
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                >
                  <InputLabel sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>Role</InputLabel>
                  <Select
                    value={formData.userLevelName}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, userLevelName: e.target.value as UserLevelName })}
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: isMobile ? '0.875rem' : '1rem',
                      },
                    }}
                  >
                    {USER_LEVEL_NAMES.map((level) => (
                      <MenuItem key={level} value={level} sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                        {level.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                p: isMobile ? 1 : 2,
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() => setOpen(false)}
                variant="outlined"
                sx={{
                  minWidth: isMobile ? 80 : 120,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                }}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  minWidth: isMobile ? 80 : 120,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                }}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
              >
                {loading ? <CircularProgress size={isMobile ? 16 : 24} color="inherit" /> : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </Card>

        {selectedUserForAcl && (
          <AclManagementModal
            open={aclModalOpen}
            onClose={() => setAclModalOpen(false)}
            userLevelId={selectedUserForAcl.userLevelId}
            userLevelName={selectedUserForAcl.userLevelName}
          />
        )}

        <ToastContainer
          position={isMobile ? 'top-center' : 'top-right'}
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Box>
    </ThemeProvider>
  );
};

export default UserManagement;
