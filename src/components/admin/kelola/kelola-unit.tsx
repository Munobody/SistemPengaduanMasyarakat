'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  Paper,
  Skeleton,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '@/lib/api/api';

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: string;
  kepalaUnit?: {
    id: string;
    name: string;
    no_identitas: string;
  };
}

interface FeedbackModalProps {
  open: boolean;
  title: string;
  message: string;
  isError: boolean;
}

interface DeleteConfirmationProps {
  open: boolean;
  unitId: string;
  unitName: string;
}

export function KelolaUnit() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [units, setUnits] = useState<Unit[]>([]);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10, totalData: 0 });
  const [loading, setLoading] = useState(false);

  const [dialogState, setDialogState] = useState({
    open: false,
    isEditing: false,
    currentUnit: null as Unit | null,
    unitName: '',
    kepalaUnitId: '',
    selectedJenisUnit: '',
  });

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalProps>({
    open: false,
    title: '',
    message: '',
    isError: false,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationProps>({
    open: false,
    unitId: '',
    unitName: '',
  });

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const { page, rowsPerPage } = pagination;
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/units?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`
      );

      if (response.data.content?.entries) {
        setUnits(response.data.content.entries);
        setPagination((prev) => ({
          ...prev,
          totalData: response.data.content.totalData,
        }));
      } else {
        setUnits([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch units:', error.response?.data);
      setFeedbackModal({
        open: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to fetch units',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.rowsPerPage]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleOpenDialog = (unit?: Unit) => {
    setDialogState({
      open: true,
      isEditing: !!unit,
      currentUnit: unit || null,
      unitName: unit?.nama_unit || '',
      kepalaUnitId: unit?.kepalaUnit?.no_identitas || '',
      selectedJenisUnit: unit?.jenis_unit || '',
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      isEditing: false,
      currentUnit: null,
      unitName: '',
      kepalaUnitId: '',
      selectedJenisUnit: '',
    });
  };

  const handleDelete = (unitId: string, unitName: string) => {
    setDeleteConfirmation({ open: true, unitId, unitName });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
        params: { ids: JSON.stringify([deleteConfirmation.unitId]) },
      });
      setFeedbackModal({
        open: true,
        title: 'Success',
        message: `Unit "${deleteConfirmation.unitName}" has been deleted.`,
        isError: false,
      });
      fetchUnits();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete unit',
        isError: true,
      });
    } finally {
      setDeleteConfirmation({ open: false, unitId: '', unitName: '' });
    }
  };

  const handleSubmit = async () => {
    const { unitName, kepalaUnitId, selectedJenisUnit, isEditing, currentUnit } = dialogState;

    if (!unitName.trim() || (!isEditing && (!kepalaUnitId.trim() || !selectedJenisUnit.trim()))) {
      setFeedbackModal({
        open: true,
        title: 'Warning',
        message: 'All fields are required.',
        isError: true,
      });
      return;
    }

    try {
      if (isEditing && currentUnit) {
        await api.put(`${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`, {
          nama_unit: unitName.trim(),
        });
        setFeedbackModal({
          open: true,
          title: 'Success',
          message: `Unit "${unitName}" has been updated.`,
          isError: false,
        });
      } else {
        await api.post(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
          nama_unit: unitName.trim(),
          jenis_unit: selectedJenisUnit.trim(),
          kepalaUnit: kepalaUnitId.trim(),
        });
        setFeedbackModal({
          open: true,
          title: 'Success',
          message: `Unit "${unitName}" has been added.`,
          isError: false,
        });
      }
      fetchUnits();
      handleCloseDialog();
    } catch (error: any) {
      setFeedbackModal({
        open: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save unit',
        isError: true,
      });
    }
  };

  return (
    <Card sx={{ backgroundColor: '#E3FEF7', p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#003C43', fontWeight: 'bold' }}>
          Kelola Unit
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#135D66', '&:hover': { backgroundColor: '#003C43' } }}
          onClick={() => handleOpenDialog()}
        >
          Tambah Unit
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: 'white', borderRadius: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Nama Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Kepala Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#003C43' }}>
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={3}>
                    <Skeleton variant="text" width="100%" height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.nama_unit}</TableCell>
                  <TableCell>{unit.kepalaUnit?.name || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(unit)}>
                      <EditIcon sx={{ color: '#135D66' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(unit.id, unit.nama_unit)}>
                      <DeleteIcon sx={{ color: '#135D66' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No units found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25]}
          component="div"
          count={pagination.totalData}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(_, newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
          onRowsPerPageChange={(e) =>
            setPagination({ ...pagination, rowsPerPage: parseInt(e.target.value, 10), page: 0 })
          }
          sx={{
            backgroundColor: '#E3FEF7',
            '.MuiTablePagination-select': { fontSize: '0.875rem' },
            '.MuiTablePagination-displayedRows': { fontSize: '0.875rem' },
          }}
        />
      </TableContainer>

      {/* Dialogs */}
      <Dialog open={dialogState.open} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: '#003C43' }}>
          {dialogState.isEditing ? 'Edit Unit' : 'Tambah Unit'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nama Unit"
            fullWidth
            value={dialogState.unitName}
            onChange={(e) => setDialogState((prev) => ({ ...prev, unitName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          {!dialogState.isEditing && (
            <>
              <TextField
                select
                label="Jenis Unit"
                fullWidth
                value={dialogState.selectedJenisUnit}
                onChange={(e) =>
                  setDialogState((prev) => ({ ...prev, selectedJenisUnit: e.target.value }))
                }
                sx={{ mb: 2 }}
              >
                {['FAKULTAS', 'UPT', 'DIREKTORAT', 'LEMBAGA'].map((jenis) => (
                  <MenuItem key={jenis} value={jenis}>
                    {jenis}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ID Kepala Unit"
                fullWidth
                value={dialogState.kepalaUnitId}
                onChange={(e) =>
                  setDialogState((prev) => ({ ...prev, kepalaUnitId: e.target.value }))
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#003C43' }}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: '#135D66', '&:hover': { backgroundColor: '#003C43' } }}
          >
            {dialogState.isEditing ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmation.open} onClose={() => setDeleteConfirmation({ open: false, unitId: '', unitName: '' })}>
        <DialogTitle sx={{ color: '#003C43' }}>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus unit "{deleteConfirmation.unitName}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, unitId: '', unitName: '' })}
            sx={{ color: '#003C43' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ backgroundColor: '#135D66', '&:hover': { backgroundColor: '#003C43' } }}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={feedbackModal.open} onClose={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}>
        <DialogTitle sx={{ color: feedbackModal.isError ? '#D32F2F' : '#003C43' }}>
          {feedbackModal.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{feedbackModal.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
            sx={{ color: '#003C43' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}