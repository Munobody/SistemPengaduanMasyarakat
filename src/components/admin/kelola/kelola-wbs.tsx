'use client';

import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import api from '@/lib/api/api';

interface Category {
  id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteConfirmation {
  open: boolean;
  categoryId: string;
  categoryName: string;
}

interface FeedbackModal {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

export function KelolaKategoriWbs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    open: false,
    categoryId: '',
    categoryName: '',
  });
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    open: false,
    title: '',
    message: '',
    isError: false,
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategoriWbs', {
        params: {
          page: page + 1,
          rows: rowsPerPage,
          orderKey: 'nama',
          orderRule: 'asc',
        },
      });

      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );
        setCategories(sortedCategories);
        setTotalData(response.data.content.totalData);
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Gagal memuat kategori:', error.response?.data);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal memuat data kategori',
        isError: true,
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setFeedbackModal({
        open: true,
        title: 'Peringatan!',
        message: 'Nama kategori tidak boleh kosong',
        isError: true,
      });
      return;
    }

    try {
      const payload = { nama: categoryName.trim() };

      if (editMode && currentCategory) {
        const response = await api.put(`/kategoriWbs/${currentCategory.id}`, payload);
        setFeedbackModal({
          open: true,
          title: 'Berhasil!',
          message: `Kategori berhasil diubah menjadi "${categoryName}"`,
          isError: false,
        });
      } else {
        const response = await api.post('/kategoriWbs', payload);
        setCategories((prevCategories) => {
          const updatedCategories = [...prevCategories, response.data.content];
          return updatedCategories.sort((a, b) => a.nama.localeCompare(b.nama));
        });
        setFeedbackModal({
          open: true,
          title: 'Berhasil!',
          message: `Kategori "${categoryName}" berhasil ditambahkan`,
          isError: false,
        });
      }
      handleClose();
    } catch (error: any) {
      console.error('Error:', error.response?.data);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menyimpan kategori',
        isError: true,
      });
    }
  };

  const handleDelete = (id: string, nama: string) => {
    setDeleteConfirmation({
      open: true,
      categoryId: id,
      categoryName: nama,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete('/kategoriWbs', {
        params: {
          ids: JSON.stringify([deleteConfirmation.categoryId]),
        },
      });
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Kategori "${deleteConfirmation.categoryName}" berhasil dihapus`,
        isError: false,
      });
      fetchCategories();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menghapus kategori',
        isError: true,
      });
    } finally {
      setDeleteConfirmation({ open: false, categoryId: '', categoryName: '' });
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.nama);
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentCategory(null);
    setCategoryName('');
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, open: false }));
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({ open: false, categoryId: '', categoryName: '' });
  };

  return (
    <Card sx={{ backgroundColor: '#E3FEF7' }}>
      <CardHeader
        title="Kelola Kategori WBS"
        titleTypographyProps={{ color: '#003C43', fontWeight: 'bold' }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton onClick={() => setIsExpanded(!isExpanded)}>
              <ExpandMoreIcon sx={{ color: '#003C43' }} />
            </IconButton>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#135D66',
                '&:hover': { backgroundColor: '#003C43' },
              }}
              onClick={() => setOpen(true)}
            >
              Tambah Kategori
            </Button>
          </Box>
        }
      />

      <Collapse in={isExpanded}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#003C43', fontWeight: 'bold' }}>Nama Kategori</TableCell>
                <TableCell align="right" sx={{ color: '#003C43', fontWeight: 'bold' }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell sx={{ color: '#003C43' }}>{category.nama}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(category)}>
                      <EditIcon sx={{ color: '#135D66' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id, category.nama)}>
                      <DeleteIcon sx={{ color: '#B8001F' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25]}
            component="div"
            count={totalData}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ color: '#003C43' }}
          />
        </TableContainer>
      </Collapse>

      {/* Dialog untuk tambah/edit kategori */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: '#003C43', fontWeight: 'bold' }}>
          {editMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nama Kategori"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            sx={{ input: { color: '#003C43' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ color: '#135D66', '&:hover': { color: '#003C43' } }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#135D66',
              '&:hover': { backgroundColor: '#003C43' },
            }}
          >
            {editMode ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <Dialog open={deleteConfirmation.open} onClose={handleCloseDeleteConfirmation}>
        <DialogTitle sx={{ color: '#003C43', fontWeight: 'bold' }}>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#003C43' }}>
            Apakah Anda yakin ingin menghapus kategori "{deleteConfirmation.categoryName}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteConfirmation}
            sx={{ color: '#135D66', '&:hover': { color: '#003C43' } }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#135D66',
              '&:hover': { backgroundColor: '#003C43' },
            }}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog feedback */}
      <Dialog open={feedbackModal.open} onClose={handleCloseFeedbackModal}>
        <DialogTitle sx={{ color: '#003C43', fontWeight: 'bold' }}>{feedbackModal.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#003C43' }}>{feedbackModal.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFeedbackModal}
            sx={{
              color: feedbackModal.isError ? '#135D66' : '#003C43',
              '&:hover': { color: '#003C43' },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}