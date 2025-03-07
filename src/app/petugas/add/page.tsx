'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface FeedbackModal {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

export default function AddPetugasPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    no_identitas: '',
    program_studi: '',
    role: 'PETUGAS' // Default role for this form
  });

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    open: false,
    title: '',
    message: '',
    isError: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Mencoba mendaftarkan petugas:', formData);

    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Berhasil mendaftarkan petugas:', response.data);
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: 'Petugas berhasil ditambahkan',
        isError: false
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        no_identitas: '',
        program_studi: '',
        role: 'PETUGAS'
      });

    } catch (error: any) {
      console.error('❌ Gagal mendaftarkan petugas:', error.response?.data);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menambahkan petugas',
        isError: true
      });
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal(prev => ({ ...prev, open: false }));
    if (!feedbackModal.isError) {
      router.push('/petugas'); // Redirect to petugas list after successful addition
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardHeader title="Tambah Petugas Baru" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              required
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              required
              name="name"
              label="Nama Lengkap"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              required
              name="no_identitas"
              label="Nomor Identitas"
              value={formData.no_identitas}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              required
              name="program_studi"
              label="Program Studi"
              value={formData.program_studi}
              onChange={handleChange}
              fullWidth
            />
            
            <FormControl fullWidth disabled>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
              >
                <MenuItem value="PETUGAS">PETUGAS</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Tambah Petugas
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <Dialog 
        open={feedbackModal.open} 
        onClose={handleCloseFeedbackModal}
      >
        <DialogTitle sx={{ 
          color: feedbackModal.isError ? 'error.main' : 'success.main',
          fontWeight: 'bold'
        }}>
          {feedbackModal.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {feedbackModal.message}
          </DialogContentText>
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