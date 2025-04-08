import { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '@/lib/api/api';

interface Petugas {
  id: string;
  email: string;
  no_identitas: string;
  name: string;
  no_telphone: string | null;
  createdAt: string;
  updatedAt: string;
  unit_petugas: {
    id: string;
    nama_unit: string;
  };
  userLevel: {
    name: string;
  };
}

interface PetugasTableProps {
  unitId: string;
  currentUserId: string; // ID pengguna saat ini (kepala_petugas_unit)
}

export default function PetugasTable({ unitId, currentUserId }: PetugasTableProps) {
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState<Petugas | null>(null);

  const fetchPetugas = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await api.get(`/units/petugas/unit`, {
        params: {
          unitId,
        },
      });

      setPetugasList(response.data.content.entries || []);
    } catch (error: any) {
      console.error('❌ Gagal memuat data petugas:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (petugas: Petugas) => {
    setSelectedPetugas(petugas);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPetugas) return;

    if (selectedPetugas.no_identitas === currentUserId) {
      toast.error('Anda tidak dapat menghapus diri sendiri!');
      setOpenDialog(false);
      return;
    }

    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await api.put(
        `/units/petugas`,
        {
          petugasIds: [selectedPetugas.no_identitas], // Gunakan no_identitas
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPetugasList((prev) => prev.filter((petugas) => petugas.no_identitas !== selectedPetugas.no_identitas));
        toast.success(response.data.message || 'Petugas berhasil dihapus.');
      } else {
        toast.error('Gagal menghapus petugas.');
      }
    } catch (error: any) {
      console.error('❌ Gagal menghapus petugas:', error.response?.data || error.message);
      toast.error('Gagal menghapus petugas.');
    } finally {
      setOpenDialog(false);
      setSelectedPetugas(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
    setSelectedPetugas(null);
  };

  useEffect(() => {
    fetchPetugas();
  }, [unitId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (petugasList.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, fontSize: '1.2rem' }}>
        Tidak ada petugas yang terdaftar untuk unit ini.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', mt: 4, p: 2 }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <TableContainer sx={{ maxHeight: '80vh', overflowX: 'auto' }}>
          <Table
            stickyHeader
            sx={{
              minWidth: 650,
              '& .MuiTableCell-root': {
                fontSize: '1rem',
                padding: '16px 24px',
                wordBreak: 'break-word',
              },
            }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nama</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>No Identitas</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {petugasList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((petugas) => (
                <TableRow hover key={petugas.no_identitas}>
                  <TableCell>{petugas.name}</TableCell>
                  <TableCell>{petugas.email}</TableCell>
                  <TableCell>{petugas.no_identitas}</TableCell>
                  <TableCell>{petugas.userLevel.name}</TableCell>
                  <TableCell>{petugas.unit_petugas.nama_unit}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(petugas)}
                      size="medium"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={petugasList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '1rem',
            },
          }}
        />
      </Paper>

      {/* Modal Konfirmasi */}
      <Dialog open={openDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus petugas dengan No Identitas{' '}
            <strong>{selectedPetugas?.no_identitas}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Batal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}