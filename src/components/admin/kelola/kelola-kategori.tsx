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
import axios from 'axios';

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

export function KelolaKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
      const token = localStorage.getItem('custom-auth-token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/kategori?page=1&rows=100`, // Changed to use rows parameter
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.content?.entries) {
        // Sort categories alphabetically by name
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );
        setCategories(sortedCategories);
        console.log('📋 Daftar kategori:', sortedCategories);
      } else {
        setCategories([]);
        console.log('❕ Tidak ada kategori');
      }
    } catch (error: any) {
      console.error('❌ Gagal memuat kategori:', error.response?.data);
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
  }, []);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      console.log('❌ Validasi: Nama kategori kosong');
      setFeedbackModal({
        open: true,
        title: 'Peringatan!',
        message: 'Nama kategori tidak boleh kosong',
        isError: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        nama: categoryName.trim(),
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('📝 Mencoba', editMode ? 'mengubah' : 'menambah', 'kategori:', payload);

      if (editMode && currentCategory) {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/kategori/${currentCategory.id}`, payload, {
          headers,
        });
        console.log('✅ Berhasil mengubah kategori:', response.data);
        setFeedbackModal({
          open: true,
          title: 'Berhasil!',
          message: `Kategori berhasil diubah menjadi "${categoryName}"`,
          isError: false,
        });
      } else {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/kategori`, payload, { headers });

        console.log('✅ Berhasil menambah kategori:', response.data);
        fetchCategories();

        if (response.data.content) {
          const newCategory = response.data.content;
          setCategories((prevCategories) => {
            const updatedCategories = [...prevCategories, newCategory];
            return updatedCategories.sort((a, b) => a.nama.localeCompare(b.nama));
          });

          setFeedbackModal({
            open: true,
            title: 'Berhasil!',
            message: `Kategori "${categoryName}" berhasil ditambahkan`,
            isError: false,
          });
        }
      }
      handleClose();
    } catch (error: any) {
      console.error('❌ Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/kategori`, {
        headers: { Authorization: `Bearer ${token}` },
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
    <Card>
      <CardHeader
        title="Kelola Kategori"
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{
                transition: 'transform 0.3s',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              Tambah Kategori
            </Button>
          </Box>
        }
      />

      <Collapse in={isExpanded} timeout="auto">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama Kategori</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.nama}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(category)} color="primary" title="Edit kategori">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category.id, category.nama)}
                      color="error"
                      title="Hapus kategori"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.length}
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
      </Collapse>

      {/* Add/Edit Category Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nama Kategori"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!categoryName.trim()}>
            {editMode ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Apakah Anda yakin ingin menghapus kategori "{deleteConfirmation.categoryName}"? Tindakan ini tidak dapat
            dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation}>Batal</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={feedbackModal.open} onClose={handleCloseFeedbackModal} aria-labelledby="feedback-dialog-title">
        <DialogTitle
          id="feedback-dialog-title"
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
    </Card>
  );
}
