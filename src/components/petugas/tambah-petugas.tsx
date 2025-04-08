'use client';

import { useState } from 'react';
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
} from '@mui/material';
import axios from 'axios';
import api from '@/lib/api/api';

interface FeedbackModal {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

// Add unit ID prop to component
interface AddPetugasPageProps {
  unitId: string;
}

export default function AddPetugasPage({ unitId }: AddPetugasPageProps) {
  const router = useRouter();
  const [petugasId, setPetugasId] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    open: false,
    title: '',
    message: '',
    isError: false,
  });

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

    try {
      const endpoint = `/units/petugas`;

      console.log('📝 Mencoba menambahkan petugas:', {
        petugasIds: [petugasId.trim()],
      });

      const response = await api.post(
        endpoint,
        {
          petugasIds: [petugasId.trim()],
        },
      );

      console.log('✅ Berhasil menambahkan petugas:', response.data);
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: 'Petugas berhasil ditambahkan ke unit',
        isError: false,
      });

      // Reset form
      setPetugasId('');
    } catch (error: any) {
      console.error('❌ Gagal menambahkan petugas:', error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 500 ? 'Terjadi kesalahan server' : 'Gagal menambahkan petugas ke unit');

      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: errorMessage,
        isError: true,
      });
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, open: false }));
    if (!feedbackModal.isError) {
      router.push('/petugas/add'); // Redirect to petugas list after successful addition
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardHeader title="Tambah Petugas ke Unit" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              name="petugasId"
              label="ID Petugas"
              value={petugasId}
              onChange={(e) => setPetugasId(e.target.value)}
              fullWidth
              helperText="Masukkan ID Petugas yang akan ditambahkan ke unit"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                backgroundColor: '#135D66',
                '&:hover': {
                  backgroundColor: '#77B0AA',
                },
              }}
            >
              Tambah Petugas
            </Button>
          </Box>
        </CardContent>
      </Card>

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
