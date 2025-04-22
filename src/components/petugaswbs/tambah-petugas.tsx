'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/lib/api/api';

interface FeedbackModal {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

interface PetugasWbs {
  id: string;
  kepalaWBSId: string;
  petugasId: string;
  isActive: boolean;
}

interface AddPetugasPageProps {
  unitId: string;
}

export default function AddPetugasWbsPage({ unitId }: AddPetugasPageProps) {
  const router = useRouter();
  const [petugasId, setPetugasId] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    open: false,
    title: '',
    message: '',
    isError: false,
  });
  const [petugasList, setPetugasList] = useState<PetugasWbs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ambil daftar petugas aktif saat komponen dimuat
  useEffect(() => {
    fetchPetugasList();
  }, []);

  const fetchPetugasList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/PetugasWbs'); // Gunakan api.get
      setPetugasList(response.data.content.entries || []); // Akses `content.entries`
    } catch (error) {
      console.error('Gagal mengambil daftar petugas:', error);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: 'Terjadi kesalahan saat mengambil daftar petugas',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petugasId.trim()) {
      setFeedbackModal({
        open: true,
        title: 'Peringatan!',
        message: 'ID Petugas tidak boleh kosong',
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/PetugasWbs', {
        petugasId: petugasId.trim(),
      });

      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: 'Petugas WBS berhasil ditambahkan',
        isError: false,
      });

      // Reset form dan refresh daftar petugas
      setPetugasId('');
      fetchPetugasList();
    } catch (error: any) {
      console.error('❌ Gagal menambahkan petugas WBS:', error.response?.data);

      const errorMessages = error.response?.data?.errors
        ? error.response.data.errors.map((err: { field: string; message: string }) => `${err.field} ${err.message}`).join(', ')
        : 'Terjadi kesalahan saat menambahkan petugas WBS';

      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: errorMessages,
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePetugas = async (id: string) => {
    try {
      const response = await api.delete(`/PetugasWbs?ids=["${id}"]`);

      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: 'Petugas WBS berhasil dihapus',
        isError: false,
      });

      // Refresh daftar petugas setelah menghapus
      fetchPetugasList();
    } catch (error) {
      console.error('❌ Gagal menghapus petugas WBS:', error);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: 'Terjadi kesalahan saat menghapus petugas WBS',
        isError: true,
      });
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, open: false }));
    // if (!feedbackModal.isError) {
    //   router.push('/petugaswbs/add'); // Redirect to petugas list after successful addition
    // }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card>
        <CardHeader title="Tambah Petugas WBS" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              name="petugasId"
              label="ID Petugas"
              value={petugasId}
              onChange={(e) => setPetugasId(e.target.value)}
              fullWidth
              helperText="Masukkan ID Petugas yang akan ditambahkan sebagai Petugas WBS"
            />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Tambah Petugas WBS'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Daftar Petugas WBS Aktif
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Petugas</TableCell>
                <TableCell>ID Kepala WBS</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                petugasList.map((petugas) => (
                  <TableRow key={petugas.id}>
                    <TableCell>{petugas.petugasId}</TableCell>
                    <TableCell>{petugas.kepalaWBSId}</TableCell>
                    <TableCell>{petugas.isActive ? 'Aktif' : 'Tidak Aktif'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeletePetugas(petugas.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={feedbackModal.open} onClose={handleCloseFeedbackModal}>
        <DialogTitle
          sx={{
            color: feedbackModal.isError ? 'error.main' : 'success.main',
            fontWeight: 'bold',
          }}
        >
          {feedbackModal.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{feedbackModal.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFeedbackModal}
            color={feedbackModal.isError ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}