'use client';

import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
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
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  no_identitas: string;
  program_studi: string;
  role: Role;
}

const ROLES = ['ALL', 'USER', 'ADMIN', 'PETUGAS_SUPER', 'PETUGAS', 'KEPALA_PETUGAS_UNIT'] as const;

type Role = (typeof ROLES)[number];

export function Register() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRole, setSelectedRole] = useState<Role>('ALL');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    no_identitas: '',
    program_studi: '',
    role: 'USER' as Role,
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users?page=1&rows=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.content?.entries) {
        setUsers(response.data.content.entries);
        console.log('📋 Daftar pengguna:', response.data.content.entries);
      }
    } catch (error: any) {
      console.error('❌ Gagal memuat daftar pengguna:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = (event: any) => {
    setSelectedRole(event.target.value as Role);
    setPage(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRoleSelect = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: event.target.value as Role,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Berhasil mendaftarkan pengguna');
      setOpen(false);
      fetchUsers();
      setFormData({
        email: '',
        password: '',
        name: '',
        no_identitas: '',
        program_studi: '',
        role: 'USER',
      });
    } catch (error: any) {
      console.error('❌ Gagal mendaftarkan pengguna:', error);
    }
  };

  const filteredUsers = users.filter((user) => (selectedRole === 'ALL' ? true : user.role === selectedRole));

  return (
    <Card>
      <CardHeader
        title="Kelola Pengguna"
        action={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter Role</InputLabel>
              <Select value={selectedRole} label="Filter Role" onChange={handleRoleChange}>
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role === 'ALL' ? 'Semua Role' : role.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Tambah User
            </Button>
          </Box>
        }
      />

      <TableContainer component={Paper}>
        <Table>
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
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.no_identitas}</TableCell>
                <TableCell>{user.program_studi}</TableCell>
                <TableCell>{user.role.replace(/_/g, ' ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
        />
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Tambah User Baru</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="name"
              label="Nama Lengkap"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="no_identitas"
              label="Nomor Identitas"
              value={formData.no_identitas}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="program_studi"
              label="Program Studi"
              value={formData.program_studi}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} label="Role" onChange={handleRoleSelect}>
                {ROLES.filter((role) => role !== 'ALL').map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Tambah
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
