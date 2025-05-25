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
  kategori?: Category;
  unitId: string;
  unit?: Unit;
  harapan_pelapor: string;
  createdAt: string;
  status: string;
  filePendukung: string;
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
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (open && complaint) {
      setCurrentComplaint(complaint);
    }
  }, [open, complaint]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategori?page=1&rows=100&orderKey=nama&orderRule=asc');
      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );
        setCategories(sortedCategories);
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat kategori:', error);
      throw error;
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get('/units?page=1&rows=100&orderKey=nama_unit&orderRule=asc');
      if (response.data.content?.entries) {
        setUnits(response.data.content.entries);
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat unit:', error);
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
        toast.error('Gagal memuat data');
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
    if (!currentComplaint || editedValues[field] === undefined) {
      toast.error('Tidak ada perubahan yang terdeteksi');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Menyimpan perubahan...');

    try {
      const complaintId = currentComplaint.id.trim();
      const payload = { [field]: editedValues[field] };

      const response = await api.put(`/pelaporan/${complaintId}`, payload);

      if (response.status === 200) {
        const updatedValue = response.data.content[field];
        const updatedComplaint = {
          ...currentComplaint,
          [field]: updatedValue,
        };

        if (field === 'kategoriId') {
          const category = categories.find(c => c.id === updatedValue);
          if (category) {
            updatedComplaint.kategori = category;
          }
        } else if (field === 'unitId') {
          const unit = units.find(u => u.id === updatedValue);
          if (unit) {
            updatedComplaint.unit = unit;
          }
        }

        setCurrentComplaint(updatedComplaint);
        onSave(field, updatedValue);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[field];
          return newValues;
        });

        toast.update(toastId, {
          render: 'Perubahan berhasil disimpan!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error: any) {
      console.error('❌ Update Error:', error);
      toast.update(toastId, {
        render: error.response?.data?.message || 'Gagal mengubah data',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentComplaint) return null;

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
                      value={editedValues.judul ?? currentComplaint.judul}
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
                      value={editedValues.deskripsi ?? currentComplaint.deskripsi}
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
                      value={editedValues.kategoriId ?? currentComplaint.kategoriId}
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
                      value={editedValues.unitId ?? currentComplaint.unitId}
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
                      value={editedValues.harapan_pelapor ?? currentComplaint.harapan_pelapor}
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
                    {editedValues.filePendukung || currentComplaint.filePendukung ? (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        File: <a href={editedValues.filePendukung ?? currentComplaint.filePendukung} target="_blank" rel="noopener noreferrer">Lihat File</a>
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
                    <Typography>{dayjs(currentComplaint.createdAt).format('dddd, DD MMMM YYYY')}</Typography>
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
                    <Typography>{currentComplaint.status}</Typography>
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