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
  DialogContentText,
  TextField,
  IconButton,
  Collapse,
  TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface KepalaUnit {
  id: string;
  name: string;
  email: string;
  no_identitas: string;
  role: string;
  unitId?: string;
}

interface Unit {
  id: string;
  nama_unit: string;
  kepalaUnit?: KepalaUnit;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteConfirmation {
    open: boolean;
    unitId: string;
    unitName: string;
  }

interface FeedbackModal {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

export function KelolaUnit() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [openKepalaUnit, setOpenKepalaUnit] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [kepalaUnitId, setKepalaUnitId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    open: false,
    title: '',
    message: '',
    isError: false
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    open: false,
    unitId: '',
    unitName: ''
  });

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/units?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.content?.entries) {
        setUnits(response.data.content.entries);
        setTotalData(response.data.content.totalData);
        console.log('📋 Daftar unit:', response.data.content.entries);
      } else {
        setUnits([]);
        console.log('❕ Tidak ada unit');
      }
    } catch (error: any) {
      console.error('❌ Gagal memuat unit:', error.response?.data);
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal memuat data unit',
        isError: true
      });
    }
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchUnits();
  }, [page, rowsPerPage]);

  const handleSubmit = async () => {
    if (!unitName.trim() || !kepalaUnitId.trim()) {
      setFeedbackModal({
        open: true,
        title: 'Peringatan!',
        message: 'Nama unit dan ID kepala unit harus diisi',
        isError: true
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = { 
        nama_unit: unitName.trim(),
        kepalaUnit: kepalaUnitId.trim()
      };
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/units`,
        payload,
        { headers }
      );
      
      if (response.data.content) {
        handleClose();
        setFeedbackModal({
          open: true,
          title: 'Berhasil!',
          message: `Unit "${unitName}" berhasil ditambahkan ke sistem`,
          isError: false
        });
        fetchUnits();
      }
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menyimpan unit',
        isError: true
      });
    }
  };

  const handleUpdateUnit = async () => {
    if (!unitName.trim() || !currentUnit) return;
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        nama_unit: unitName.trim()
      };
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`,
        payload,
        { headers }
      );
  
      handleClose();
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Nama unit berhasil diubah menjadi "${unitName}"`,
        isError: false
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal memperbarui nama unit',
        isError: true
      });
    }
  };

  const handleUpdateKepalaUnit = async () => {
    if (!kepalaUnitId.trim() || !currentUnit) return;
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        kepalaUnit: kepalaUnitId.trim()
      };
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`,
        payload,
        { headers }
      );
  
      handleCloseKepalaUnit();
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Kepala unit untuk "${currentUnit.nama_unit}" berhasil diperbarui`,
        isError: false
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.errors?.[0]?.field === 'kepalaUnit'
          ? 'ID yang dimasukkan bukan merupakan ID Petugas. Silakan masukkan ID Petugas yang valid.'
          : error.response?.data?.message || 'Gagal memperbarui kepala unit',
        isError: true
      });
    }
  };

  const handleDelete = (id: string, nama_unit: string) => {
    setDeleteConfirmation({
      open: true,
      unitId: id,
      unitName: nama_unit
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/units`,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          },
          params: {
            ids: JSON.stringify([deleteConfirmation.unitName]) // Changed from unitId to unitName
          }
        }
      );
  
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Unit "${deleteConfirmation.unitName}" berhasil dihapus`,
        isError: false
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menghapus unit',
        isError: true
      });
    } finally {
      setDeleteConfirmation({ open: false, unitId: '', unitName: '' });
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({ open: false, unitId: '', unitName: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setUnitName('');
    setCurrentUnit(null);
    setIsEditingName(false);
  };

  const handleCloseKepalaUnit = () => {
    setOpenKepalaUnit(false);
    setKepalaUnitId('');
    setCurrentUnit(null);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal(prev => ({ ...prev, open: false }));
  };

  return (
    <Card sx={{ backgroundColor: '#E3FEF7' }}>
      <CardHeader
        title="Kelola Unit"
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
              Tambah Unit
            </Button>
          </Box>
        }
      />

<Collapse in={isExpanded} timeout="auto">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama Unit</TableCell>
                <TableCell>Kepala Unit</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.nama_unit}</TableCell>
                  <TableCell>
                    {unit.kepalaUnit?.name || unit.kepalaUnit?.no_identitas || '-'}
                  </TableCell>
                  <TableCell align="right">
                  <IconButton 
                      onClick={() => {
                        setCurrentUnit(unit);
                        setUnitName(unit.nama_unit);
                        setIsEditingName(true);
                        setOpen(true);
                      }}
                      color="primary"
                      title="Edit nama unit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => {
                        setCurrentUnit(unit);
                        setKepalaUnitId('');
                        setOpenKepalaUnit(true);
                      }}
                      color="primary"
                      title="Update kepala unit"
                    >
                      <SupervisorAccountIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(unit.id, unit.nama_unit)}
                      color="error"
                      title="Hapus unit"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Tidak ada unit
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalData}
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

      <Dialog open={open} onClose={handleClose}>
  <DialogTitle>{isEditingName ? 'Edit Nama Unit' : 'Tambah Unit Baru'}</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Nama Unit"
      fullWidth
      value={unitName}
      onChange={(e) => setUnitName(e.target.value)}
    />
    {!isEditingName && (
      <TextField
        margin="dense"
        label="ID Kepala Unit"
        fullWidth
        value={kepalaUnitId}
        onChange={(e) => setKepalaUnitId(e.target.value)}
        placeholder="Contoh: 1010101"
        helperText="Masukkan ID kepala unit"
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Batal</Button>
    <Button 
      onClick={isEditingName ? handleUpdateUnit : handleSubmit} 
      variant="contained" 
      color="primary"
      disabled={!unitName.trim() || (!isEditingName && !kepalaUnitId.trim())}
    >
      {isEditingName ? 'Simpan' : 'Tambah'}
    </Button>
  </DialogActions>
</Dialog>

      {/* Kepala Unit Update Dialog */}
      <Dialog open={openKepalaUnit} onClose={handleCloseKepalaUnit}>
        <DialogTitle>Update Kepala Unit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID Kepala Unit"
            fullWidth
            value={kepalaUnitId}
            onChange={(e) => setKepalaUnitId(e.target.value)}
            placeholder="Contoh: 1010101"
            helperText="Masukkan ID kepala unit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseKepalaUnit}>Batal</Button>
          <Button 
            onClick={handleUpdateKepalaUnit} 
            variant="contained" 
            color="primary"
            disabled={!kepalaUnitId.trim()}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ color: 'error.main' }}
        >
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Apakah Anda yakin ingin menghapus unit "{deleteConfirmation.unitName}"? 
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation}>
            Batal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={feedbackModal.open}
        onClose={handleCloseFeedbackModal}
        aria-labelledby="feedback-dialog-title"
      >
        <DialogTitle 
          id="feedback-dialog-title"
          sx={{ 
            color: feedbackModal.isError ? 'error.main' : 'success.main',
            fontWeight: 'bold'
          }}
        >
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
            color={feedbackModal.isError ? "error" : "primary"} 
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