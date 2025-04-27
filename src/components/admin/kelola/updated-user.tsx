 'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
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

import api from '@/lib/api/api';

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
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
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

interface UserLevel {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const USER_LEVEL_NAMES = [
  'MAHASISWA',
  'DOSEN',
  'TENAGA_KEPENDIDIKAN',
  'ADMIN',
  'PETUGAS_SUPER',
  'PETUGAS',
  'KEPALA_PETUGAS_UNIT',
  'KEPALA_WBS',
  'PETUGAS_WBS',
] as const;

type UserLevelName = (typeof USER_LEVEL_NAMES)[number];

export const RoleManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<User[]>([]);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [selectedUserLevelName, setSelectedUserLevelName] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>(''); // State untuk pencarian
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    no_identitas: '',
    userLevelName: 'MAHASISWA' as UserLevelName,
  });
  const [selectedUserNoIdentitas, setSelectedUserNoIdentitas] = useState<string | null>(null);
  const [newUserLevelId, setNewUserLevelId] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users?page=1&rows=50');
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

  const fetchUserLevels = async () => {
    try {
      const response = await api.get('/user-level');
      if (response.data?.content?.entries) {
        setUserLevels(response.data.content.entries);
      }
    } catch (error) {
      console.error('Failed to load user levels:', error);
      toast.error('Failed to load user levels', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserLevels();
  }, []);

  const handleSubmitAddUser = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill all required fields', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/register', {
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

      setOpenAddUser(false);
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

  const handleOpenConfirmModal = (noIdentitas: string, newLevelId: string) => {
    setSelectedUserNoIdentitas(noIdentitas);
    setNewUserLevelId(newLevelId);
    setOpenConfirmModal(true);
  };

  const handleChangeUserLevel = async () => {
    if (!selectedUserNoIdentitas || !newUserLevelId) return;

    try {
      setLoading(true);
      await api.put(`/users/${selectedUserNoIdentitas}`, {
        userLevelId: newUserLevelId,
      });

      toast.success('User role updated successfully!', {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });

      setOpenConfirmModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
      toast.error(errorMessage, {
        position: isMobile ? 'top-center' : 'top-right',
        theme: 'colored',
      });
    } finally {
      setLoading(false);
      setSelectedUserNoIdentitas(null);
      setNewUserLevelId('');
    }
  };

  // Modifikasi filteredUsers untuk mendukung pencarian berdasarkan no_identitas
  const filteredUsers = users
    .filter((user) =>
      selectedUserLevelName === 'ALL' ? true : user.userLevel.name === selectedUserLevelName
    )
    .filter((user) =>
      searchQuery
        ? user.no_identitas?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <ThemeProvider theme={theme}>
      <Card
        sx={{
          backgroundColor: '#E3FEF7',
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: 3,
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#003C43',
              fontWeight: 'bold',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
            }}
          >
            User Management
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <TextField
              label="Search by ID Number"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                minWidth: isMobile ? '100%' : 200,
                backgroundColor: 'white',
                borderRadius: 1,
              }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: isMobile ? '100%' : 200,
                backgroundColor: 'white',
                borderRadius: 1,
              }}
            >
              <InputLabel>Filter Role</InputLabel>
              <Select
                value={selectedUserLevelName}
                label="Filter Role"
                onChange={(e) => setSelectedUserLevelName(e.target.value)}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                {USER_LEVEL_NAMES.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddUser(true)}
              sx={{
                backgroundColor: '#135D66',
                '&:hover': { backgroundColor: '#003C43' },
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#E3FEF7' }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    color: '#003C43',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}
                >
                  Name
                </TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>ID Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Manage Role</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={isMobile ? 2 : 4}>
                      <Skeleton variant="text" width="100%" height={30} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{user.name || '-'}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>{user.no_identitas || '-'}</TableCell>
                        <TableCell>
                          <FormControl
                            size="small"
                            sx={{
                              minWidth: isMobile ? '100%' : 150,
                              backgroundColor: 'white',
                              borderRadius: 1,
                            }}
                          >
                            <InputLabel>Change Role</InputLabel>
                            <Select
                              value={user.userLevelId}
                              label="Change Role"
                              onChange={(e) => handleOpenConfirmModal(user.no_identitas, e.target.value)}
                            >
                              {userLevels.map((level) => (
                                <MenuItem key={level.id} value={level.id}>
                                  {level.name.replace(/_/g, ' ')}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </>
                    )}
                    {isMobile && (
                      <TableCell>
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: '100%',
                            backgroundColor: 'white',
                            borderRadius: 1,
                          }}
                        >
                          <InputLabel>Change Role</InputLabel>
                          <Select
                            value={user.userLevelId}
                            label="Change Role"
                            onChange={(e) => handleOpenConfirmModal(user.no_identitas, e.target.value)}
                          >
                            {userLevels.map((level) => (
                              <MenuItem key={level.id} value={level.id}>
                                {level.name.replace(/_/g, ' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 4} align="center">
                    <Typography sx={{ color: 'text.secondary' }}>No users found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            labelRowsPerPage="Rows per page"
            sx={{
              backgroundColor: '#E3FEF7',
              '.MuiTablePagination-select': {
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
              '.MuiTablePagination-displayedRows': {
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            }}
          />
        </TableContainer>

        <Dialog
          open={openAddUser}
          onClose={() => setOpenAddUser(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: '#003C43' }}>Add New User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                label="ID Number"
                fullWidth
                value={formData.no_identitas}
                onChange={(e) => setFormData({ ...formData, no_identitas: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.userLevelName}
                  label="Role"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userLevelName: e.target.value as UserLevelName,
                    })
                  }
                >
                  {USER_LEVEL_NAMES.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenAddUser(false)}
              variant="outlined"
              sx={{ color: '#003C43', borderColor: '#003C43' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAddUser}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#135D66',
                '&:hover': { bgcolor: '#003C43' },
              }}
            >
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: '#003C43' }}>Confirm Role Change</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#003C43' }}>
              Apakah Anda yakin ingin mengubah role pada pengguna tersebut?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenConfirmModal(false)}
              variant="outlined"
              sx={{ color: '#003C43', borderColor: '#003C43' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeUserLevel}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#135D66',
                '&:hover': { bgcolor: '#003C43' },
              }}
            >
              {loading ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer />
      </Card>
    </ThemeProvider>
  );
};

export default RoleManagement;