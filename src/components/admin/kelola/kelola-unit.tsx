'use client';

import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
    isError: false,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    open: false,
    unitId: '',
    unitName: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        isError: true,
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
        isError: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        nama_unit: unitName.trim(),
        kepalaUnit: kepalaUnitId.trim(),
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/units`, payload, { headers });

      if (response.data.content) {
        handleClose();
        setFeedbackModal({
          open: true,
          title: 'Berhasil!',
          message: `Unit "${unitName}" berhasil ditambahkan ke sistem`,
          isError: false,
        });
        fetchUnits();
      }
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menyimpan unit',
        isError: true,
      });
    }
  };

  const handleUpdateUnit = async () => {
    if (!unitName.trim() || !currentUnit) return;

    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        nama_unit: unitName.trim(),
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`, payload, { headers });

      handleClose();
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Nama unit berhasil diubah menjadi "${unitName}"`,
        isError: false,
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal memperbarui nama unit',
        isError: true,
      });
    }
  };

  const handleUpdateKepalaUnit = async () => {
    if (!kepalaUnitId.trim() || !currentUnit) return;

    try {
      const token = localStorage.getItem('custom-auth-token');
      const payload = {
        kepalaUnit: kepalaUnitId.trim(),
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`, payload, { headers });

      handleCloseKepalaUnit();
      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Kepala unit untuk "${currentUnit.nama_unit}" berhasil diperbarui`,
        isError: false,
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message:
          error.response?.data?.errors?.[0]?.field === 'kepalaUnit'
            ? 'ID yang dimasukkan bukan merupakan ID Petugas. Silakan masukkan ID Petugas yang valid.'
            : error.response?.data?.message || 'Gagal memperbarui kepala unit',
        isError: true,
      });
    }
  };

  const handleDelete = (id: string, nama_unit: string) => {
    setDeleteConfirmation({
      open: true,
      unitId: id,
      unitName: nama_unit,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ids: JSON.stringify([deleteConfirmation.unitName]), // Changed from unitId to unitName
        },
      });

      setFeedbackModal({
        open: true,
        title: 'Berhasil!',
        message: `Unit "${deleteConfirmation.unitName}" berhasil dihapus`,
        isError: false,
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Gagal!',
        message: error.response?.data?.message || 'Gagal menghapus unit',
        isError: true,
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
    setFeedbackModal((prev) => ({ ...prev, open: false }));
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
          Kelola Unit
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
          Tambah Unit
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
                  width: '35%',
                }}
              >
                Nama Unit
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#003C43',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  width: '35%',
                }}
              >
                Kepala Unit
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  color: '#003C43',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  width: '30%',
                }}
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{unit.nama_unit}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
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
                      sx={{
                        color: '#135D66',
                        '&:hover': { backgroundColor: 'rgba(19, 93, 102, 0.1)' },
                      }}
                      title="Edit nama unit"
                    >
                      <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCurrentUnit(unit);
                        setKepalaUnitId('');
                        setOpenKepalaUnit(true);
                      }}
                      sx={{
                        color: '#135D66',
                        '&:hover': { backgroundColor: 'rgba(19, 93, 102, 0.1)' },
                      }}
                      title="Update kepala unit"
                    >
                      <SupervisorAccountIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(unit.id, unit.nama_unit)}
                      sx={{
                        color: '#B8001F',
                        '&:hover': { backgroundColor: 'rgba(184, 0, 31, 0.1)' },
                      }}
                      title="Hapus unit"
                    >
                      <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Belum ada unit yang ditambahkan
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
          <Button onClick={handleUpdateKepalaUnit} variant="contained" color="primary" disabled={!kepalaUnitId.trim()}>
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
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Apakah Anda yakin ingin menghapus unit "{deleteConfirmation.unitName}"? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation}>Batal</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
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
