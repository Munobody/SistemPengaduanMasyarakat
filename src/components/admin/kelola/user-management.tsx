'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardHeader, 
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
  useTheme
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddIcon from '@mui/icons-material/Add';
import api from '@/lib/api/api';

// Custom color palette theme
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
  id?: string;
  email?: string;
  name?: string;
  no_identitas?: string;
  program_studi?: string;
  userLevelName?: string;
}

const USER_LEVEL_NAMES = [
  'MAHASISWA', 
  'DOSEN', 
  'TENAGA_KEPENDIDIKAN', 
  'ADMIN', 
  'PETUGAS_SUPER', 
  'PETUGAS', 
  'KEPALA_PETUGAS_UNIT'
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
    program_studi: '',
    userLevelName: 'MAHASISWA' as UserLevelName,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=1&rows=50`);
      if (response.data?.content?.entries) {
        setUsers(response.data.content.entries);
      }
    } catch (error) {
      console.error('Gagal memuat daftar pengguna:', error);
      toast.error('Gagal memuat data pengguna', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
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
      toast.error('Silakan lengkapi semua field yang wajib', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
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
        program_studi: formData.program_studi,
        userLevelName: formData.userLevelName
      });

      toast.success('Pengguna berhasil ditambahkan!', {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
      
      setOpen(false);
      fetchUsers();
      
      setFormData({
        email: '',
        password: '',
        name: '',
        no_identitas: '',
        program_studi: '',
        userLevelName: 'MAHASISWA',
      });
    } catch (error: any) {
      console.error('Gagal mendaftarkan pengguna:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan pengguna';
      toast.error(errorMessage, {
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = selectedUserLevelName === 'ALL' 
    ? users 
    : users.filter(user => user.userLevelName === selectedUserLevelName);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        p: isMobile ? 1 : 3, 
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}>
        <Card elevation={3} sx={{ 
          borderRadius: 2, 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <CardHeader
            title={
              <Typography variant={isMobile ? "h6" : "h5"} color="text.primary">
                Kelola Pengguna
              </Typography>
            }
            action={
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: 2, 
                alignItems: 'center',
                mt: isMobile ? 2 : 0,
                width: isMobile ? '100%' : 'auto'
              }}>
                <FormControl sx={{ minWidth: isMobile ? '100%' : 200 }} size="small">
                  <InputLabel>Filter Role</InputLabel>
                  <Select 
                    value={selectedUserLevelName}
                    label="Filter Role"
                    onChange={(e) => setSelectedUserLevelName(e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: '#E3FEF7',
                    }}
                  >
                    <MenuItem value="ALL">Semua Role</MenuItem>
                    {USER_LEVEL_NAMES.map((level) => (
                      <MenuItem 
                        key={level} 
                        value={level}
                        sx={{ whiteSpace: 'normal' }}
                      >
                        {level.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => setOpen(true)}
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': { 
                      backgroundColor: theme.palette.primary.light 
                    }
                  }}
                >
                  {isMobile ? 'Tambah' : 'Tambah User'}
                </Button>
              </Box>
            }
            sx={{
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 1 : 0,
              py: isMobile ? 2 : 3,
            }}
          />

          <TableContainer 
            component={Paper} 
            sx={{ 
              maxHeight: 'calc(100vh - 300px)', 
              overflow: 'auto',
              '& .MuiTableCell-root': {
                px: isMobile ? 1 : 2,
                py: isMobile ? 1 : 1.5,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          >
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>No. Identitas</TableCell>
                  <TableCell>Program Studi</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id || Math.random()} hover>
                        <TableCell>{user.name || '-'}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{user.email || '-'}</TableCell>
                        <TableCell>{user.no_identitas || '-'}</TableCell>
                        <TableCell>{user.program_studi || '-'}</TableCell>
                        <TableCell>
                          {user.userLevelName?.replace(/_/g, ' ') || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        Tidak ada data pengguna
                      </Typography>
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
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
              }
              sx={{
                borderTop: '1px solid rgba(224, 224, 224, 1)',
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
                backgroundColor: theme.palette.background.paper
              }
            }}
          >
            <DialogTitle sx={{ 
              fontSize: isMobile ? '1.1rem' : '1.2rem', 
              fontWeight: 'bold', 
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              py: isMobile ? 1.5 : 2,
            }}>
              Tambah User Baru
            </DialogTitle>
            <DialogContent dividers sx={{ p: isMobile ? 1 : 3 }}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? 2 : 3,
                pt: 1,
              }}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                />
                <TextField
                  label="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                />
                <TextField
                  label="Nomor Identitas"
                  value={formData.no_identitas}
                  onChange={(e) => setFormData({...formData, no_identitas: e.target.value})}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                />
                <TextField
                  label="Program Studi"
                  value={formData.program_studi}
                  onChange={(e) => setFormData({...formData, program_studi: e.target.value})}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                />
                <FormControl 
                  fullWidth 
                  required 
                  margin="normal" 
                  size="small"
                  sx={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.userLevelName}
                    label="Role"
                    onChange={(e) => setFormData({...formData, userLevelName: e.target.value as UserLevelName})}
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
            <DialogActions sx={{ p: isMobile ? 1 : 3 }}>
              <Button 
                onClick={() => setOpen(false)} 
                variant="outlined"
                sx={{ 
                  minWidth: 120,
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main
                }}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
              >
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                sx={{ 
                  minWidth: 120,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: theme.palette.primary.light 
                  }
                }}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
        <ToastContainer 
          position={isMobile ? "top-center" : "top-right"}
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