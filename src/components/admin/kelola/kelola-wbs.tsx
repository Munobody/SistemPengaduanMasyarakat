'use client';

import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
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
  Typography,
  useMediaQuery,
  useTheme,
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Card
      sx={{
        backgroundColor: '#E3FEF7',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#003C43',
            fontWeight: 'bold',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
          }}
        >
          Kelola Kategori WBS
        </Typography>

        <Button
          variant="contained"
          sx={{
            backgroundColor: '#135D66',
            '&:hover': { backgroundColor: '#003C43' },
            width: isMobile ? '100%' : 'auto',
          }}
          onClick={() => setOpen(true)}
        >
          Tambah Kategori WBS
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#E3FEF7' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#003C43',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              >
                Nama Kategori WBS
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  color: '#003C43',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{category.nama}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(category)}
                      sx={{
                        color: '#135D66',
                        '&:hover': { backgroundColor: 'rgba(19, 93, 102, 0.1)' },
                      }}
                      title="Edit kategori"
                    >
                      <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category.id, category.nama)}
                      sx={{
                        color: '#B8001F',
                        '&:hover': { backgroundColor: 'rgba(184, 0, 31, 0.1)' },
                      }}
                      title="Hapus kategori"
                    >
                      <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Belum ada kategori WBS yang ditambahkan
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
          labelRowsPerPage="Baris per halaman"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
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
          <Button onClick={handleClose} sx={{ color: '#135D66', '&:hover': { color: '#003C43' } }}>
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
          <Button onClick={handleCloseDeleteConfirmation} sx={{ color: '#135D66', '&:hover': { color: '#003C43' } }}>
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
