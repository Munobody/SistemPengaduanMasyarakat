import { useEffect, useState } from 'react';
import {
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
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

import { Complaint } from './complaint';

interface Unit {
  nama_unit: string;
}

interface Category {
  id: string;
  nama: string;
}

interface EditComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSave: () => void;
  onChange: (updatedComplaint: Complaint) => void;
}

export const EditComplaintModal = ({ open, onClose, complaint, onSave, onChange }: EditComplaintModalProps) => {
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);

  const fetchCategories = async () => {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama&orderRule=asc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );

        setCategories(sortedCategories);
        console.log('📋 Daftar kategori:', sortedCategories);
        setTotalData(response.data.content.totalData);
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
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/units?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.content?.entries) {
        const unitList = response.data.content.entries.map((unit: Unit) => unit.nama_unit);
        setUnits(unitList);
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

  if (!complaint) return null;
  if (loading) return <CircularProgress />;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Pengaduan</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Judul</strong>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    value={complaint.title}
                    onChange={(e) => onChange({ ...complaint, title: e.target.value })}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Isi</strong>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    multiline
                    rows={4}
                    value={complaint.content}
                    onChange={(e) => onChange({ ...complaint, content: e.target.value })}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Kategori</strong>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    margin="dense"
                    value={complaint.category}
                    onChange={(e) => onChange({ ...complaint, category: e.target.value })}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.nama}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Unit Tertuju</strong>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    margin="dense"
                    value={complaint.targetUnit}
                    onChange={(e) => onChange({ ...complaint, targetUnit: e.target.value })}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    value={complaint.status}
                    disabled
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};
