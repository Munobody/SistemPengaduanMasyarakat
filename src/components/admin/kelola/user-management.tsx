'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/api/api';
import { AclManagementModal } from './acl-modal';

interface User {
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
  'PIMPINAN_UNIVERSITAS',
] as const;

type UserLevelName = (typeof USER_LEVEL_NAMES)[number];

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [selectedUserLevelName, setSelectedUserLevelName] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [aclModalOpen, setAclModalOpen] = useState(false);
  const [selectedUserForAcl, setSelectedUserForAcl] = useState<{
    userLevelId: string;
    userLevelName: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user-level?page=1&rows=12`);
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

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedUserLevelName === 'ALL') return users;
    return users.filter((user) => user.name === selectedUserLevelName);
  }, [users, selectedUserLevelName]);

  const handleOpenAclModal = (user: User) => {
    setSelectedUserForAcl({
      userLevelId: user.id,
      userLevelName: user.name,
    });
    setAclModalOpen(true);
  };

  const handleCloseAclModal = () => {
    setAclModalOpen(false);
    setSelectedUserForAcl(null);
  };

  return (
    <Card sx={{ backgroundColor: '#E3FEF7', p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ color: '#003C43', fontWeight: 'bold', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Acces Control List</Typography>
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 200, backgroundColor: 'white', borderRadius: 1 }}>
          <Select value={selectedUserLevelName} onChange={(e) => setSelectedUserLevelName(e.target.value)} displayEmpty>
            <MenuItem value="ALL">All Roles</MenuItem>
            {USER_LEVEL_NAMES.map((role) => (
              <MenuItem key={role} value={role}>{role.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: 'white', borderRadius: 1, overflow: 'hidden' }}>
        <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43', fontSize: isMobile ? '0.875rem' : '1rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Manage Access</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={2}>
                    <Skeleton variant="text" width="100%" height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                      {user.name.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        onClick={() => handleOpenAclModal(user)}
                        startIcon={<SettingsIcon />}
                        sx={{
                          color: '#135D66',
                          borderColor: '#135D66',
                          '&:hover': {
                            borderColor: '#003C43',
                            backgroundColor: 'rgba(19, 93, 102, 0.1)',
                          },
                        }}
                      >
                        {isMobile ? '' : 'Manage Access'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography sx={{ color: 'text.secondary' }}>No users found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
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
      {selectedUserForAcl && (
        <AclManagementModal
          open={aclModalOpen}
          onClose={handleCloseAclModal}
          userLevelId={selectedUserForAcl.userLevelId}
          userLevelName={selectedUserForAcl.userLevelName}
        />
      )}
      <ToastContainer position={isMobile ? 'top-center' : 'top-right'} autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" limit={3} style={{ width: isMobile ? '90%' : undefined, maxWidth: '400px', marginTop: isMobile ? '1rem' : undefined }} />
    </Card>
  );
};

export default UserManagement;