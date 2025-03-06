'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast } from 'react-toastify';
import axios from 'axios';

interface Category {
  id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
}

export function KelolaKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.content.entries);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat data kategori');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = { 
        nama: categoryName.trim() 
      };
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      if (editMode && currentCategory) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/kategori/${currentCategory.id}`,
          payload,
          { headers }
        );
        toast.success('Kategori berhasil diperbarui');
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/kategori`,
          payload,
          { headers }
        );
        
        if (response.data.content) {
          setCategories(prev => [...prev, response.data.content]);
          toast.success(response.data.message || 'Kategori berhasil ditambahkan');
        }
      }
      handleClose();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        const token = localStorage.getItem('custom-auth-token');
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/kategori`, 
          {
            headers: { 
              Authorization: `Bearer ${token}` 
            },
            params: {
              ids: JSON.stringify([id])
            }
          }
        );
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
      }
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
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
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.nama}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!categoryName.trim()}
          >
            {editMode ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}