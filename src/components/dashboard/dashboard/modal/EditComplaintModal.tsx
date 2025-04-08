import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import api from '@/lib/api/api';

interface Unit {
  id: string;
  nama_unit: string;
}

interface Category {
  id: string;
  nama: string;
}

interface Complaint {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  unitId: string;
  harapan_pelapor: string;
  createdAt: string;
  status: string;
  filePendukung: string; // Add this field
}

interface EditComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSave: (field: keyof Complaint, value: any) => void;
}

export const EditComplaintModal = ({ open, onClose, complaint, onSave }: EditComplaintModalProps) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editedValues, setEditedValues] = useState<Partial<Complaint>>({});

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/kategori?page=1&rows=100&orderKey=nama&orderRule=asc`
      );

      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );

        setCategories(sortedCategories);
        console.log('📋 Daftar kategori:', sortedCategories);
      } else {
        setCategories([]);
        console.log('❕ Tidak ada kategori');
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat kategori:', error.response?.data);
      toast.error('Gagal memuat data kategori');
      throw error;
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/units?page=1&rows=100&orderKey=nama_unit&orderRule=asc`
      );

      if (response.data.content?.entries) {
        setUnits(response.data.content.entries);
        console.log('📋 Daftar unit:', response.data.content.entries);
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat unit:', error.response?.data);
      toast.error('Gagal memuat data unit');
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      setLoading(true);
      try {
        await Promise.all([fetchUnits(), fetchCategories()]);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleFieldChange = (field: keyof Complaint, value: any) => {
    setEditedValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field: keyof Complaint) => {
    if (!complaint || editedValues[field] === undefined) {
      console.error('❌ No changes detected or complaint is null.');
      return;
    }
  
    try {
      const complaintId = complaint.id.trim();
  
      // Prepare the payload with only the updated field
      const payload = { [field]: editedValues[field] };
  
      // Debug log to verify the payload
      console.log('🔍 Debugging Payload:', {
        complaintId,
        field,
        payload,
      });
  
      // Send the PUT request to update the complaint
      const response = await api.put(`/pelaporan/${complaintId}`, payload);
  
      // Handle the successful response
      if (response.status === 200 && response.data.message === "Successfully updated Pengaduan!") {
        toast.success(response.data.message || 'Berhasil mengubah data!');
  
        // Update the local state with the new value
        const updatedValue = response.data.content[field];
        onSave(field, updatedValue);
  
        // Clear the edited value for this field
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[field];
          return newValues;
        });
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ Update Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Internal Server Error',
        endpoint: error.config?.url,
        payload: error.config?.data,
        complaintId: complaint.id,
      });
  
      toast.error(
        error.response?.status === 400
          ? 'Validasi gagal. Periksa data yang Anda masukkan.'
          : error.response?.data?.message || 'Gagal mengubah data. Silakan coba lagi.'
      );
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Pengaduan</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {/* Judul */}
                <TableRow>
                  <TableCell width="30%">
                    <Typography variant="subtitle2" color="text.secondary">
                      Judul Laporan
                    </Typography>
                  </TableCell>
                  <TableCell width="50%">
                    <TextField
                      fullWidth
                      value={editedValues.judul ?? complaint.judul}
                      onChange={(e) => handleFieldChange('judul', e.target.value)}
                    />
                  </TableCell>
                  <TableCell width="20%">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('judul')}
                      disabled={editedValues.judul === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Deskripsi */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deskripsi
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editedValues.deskripsi ?? complaint.deskripsi}
                      onChange={(e) => handleFieldChange('deskripsi', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('deskripsi')}
                      disabled={editedValues.deskripsi === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Kategori */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kategori
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      value={editedValues.kategoriId ?? complaint.kategoriId}
                      onChange={(e) => handleFieldChange('kategoriId', e.target.value)}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.nama}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('kategoriId')}
                      disabled={editedValues.kategoriId === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Unit */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Unit
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      value={editedValues.unitId ?? complaint.unitId}
                      onChange={(e) => handleFieldChange('unitId', e.target.value)}
                    >
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.nama_unit}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('unitId')}
                      disabled={editedValues.unitId === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Harapan Pelapor */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Harapan Pelapor
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editedValues.harapan_pelapor ?? complaint.harapan_pelapor}
                      onChange={(e) => handleFieldChange('harapan_pelapor', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('harapan_pelapor')}
                      disabled={editedValues.harapan_pelapor === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Pendukung
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const fileUrl = URL.createObjectURL(file); // Replace with actual upload logic
                          handleFieldChange('filePendukung', fileUrl);
                        }
                      }}
                    />
                    {editedValues.filePendukung || complaint.filePendukung ? (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        File: <a href={editedValues.filePendukung ?? complaint.filePendukung} target="_blank" rel="noopener noreferrer">Lihat File</a>
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1 }}>Tidak ada file</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveField('filePendukung')}
                      disabled={editedValues.filePendukung === undefined}
                      sx={{ backgroundColor: '#003C43', '&:hover': { backgroundColor: '#135D66' } }}
                    >
                      Simpan
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Created At - Read Only */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tanggal Dibuat
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Typography>{dayjs(complaint.createdAt).format('dddd, DD MMMM YYYY HH:mm')}</Typography>
                  </TableCell>
                </TableRow>

                {/* Status - Read Only */}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Typography>{complaint.status}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#135D66' }}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};