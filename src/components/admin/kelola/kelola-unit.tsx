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
  const [searchQuery, setSearchQuery] = useState('');

  interface DialogState {
    open: boolean;
    isEditing: boolean;
    currentUnit: Unit | null;
    unitName: string;
    kepalaUnitId: string;
    pimpinanUnitId: string; // Add this
    selectedJenisUnit: string;
  }

  // Update the initial state in your component
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    isEditing: false,
    currentUnit: null,
    unitName: '',
    kepalaUnitId: '',
    pimpinanUnitId: '', // Add this
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
    let url = `${process.env.NEXT_PUBLIC_API_URL}/units?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`;

    // Add search filter if query exists
    if (searchQuery.trim()) {
      url += `&searchFilters=${JSON.stringify({ nama_unit: searchQuery.trim() })}`;
    }

    const response = await api.get(url);

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
}, [pagination.page, pagination.rowsPerPage, searchQuery]);

// Add debounced search
const debouncedSearch = useCallback(
  debounce((value: string) => {
    setSearchQuery(value);
  }, 500),
  []
);

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
      pimpinanUnitId: '',
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
      pimpinanUnitId: '',
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
  const {
    unitName,
    kepalaUnitId,
    pimpinanUnitId,
    selectedJenisUnit,
    isEditing,
    currentUnit,
  } = dialogState;

  if (
    !unitName.trim() ||
    (!isEditing && (!kepalaUnitId.trim() || !pimpinanUnitId.trim() || !selectedJenisUnit.trim()))
  ) {
    setFeedbackModal({
      open: true,
      title: 'Warning',
      message: 'Semua field harus diisi.',
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
        message: `Unit "${unitName}" telah diperbarui.`,
        isError: false,
      });
    } else {
      const requestBody = {
        nama_unit: unitName.trim(),
        jenis_unit: selectedJenisUnit.trim(),
        kepalaUnit: kepalaUnitId.trim(),
        pimpinanUnitId: pimpinanUnitId.trim()
      };

      await api.post(`${process.env.NEXT_PUBLIC_API_URL}/units`, requestBody);
      setFeedbackModal({
        open: true,
        title: 'Success',
        message: `Unit "${unitName}" telah ditambahkan.`,
        isError: false,
      });
    }
    fetchUnits();
    handleCloseDialog();
  } catch (error: any) {
    setFeedbackModal({
      open: true,
      title: 'Error',
      message: error.response?.data?.message || 'Gagal menyimpan unit',
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

      {/* Replace Filter Section with Search */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          label="Cari Unit"
          placeholder="Masukkan nama unit..."
          fullWidth
          onChange={(e) => debouncedSearch(e.target.value)}
          sx={{
            maxWidth: 300,
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: 'white', borderRadius: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Nama Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Jenis Unit</TableCell>
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
                  <TableCell colSpan={4}>
                    <Skeleton variant="text" width="100%" height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.nama_unit}</TableCell>
                  <TableCell>{unit.jenis_unit}</TableCell>
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
                <TableCell colSpan={4} align="center">
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

      {/* Add/Edit Dialog */}
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
            sx={{ mb: 2, mt: 2 }}
          />
          {!dialogState.isEditing && (
            <>
              <TextField
                label="ID Kepala Unit"
                fullWidth
                value={dialogState.kepalaUnitId}
                onChange={(e) =>
                  setDialogState((prev) => ({ ...prev, kepalaUnitId: e.target.value }))
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="ID Pimpinan Unit"
                fullWidth
                value={dialogState.pimpinanUnitId}
                onChange={(e) =>
                  setDialogState((prev) => ({ ...prev, pimpinanUnitId: e.target.value }))
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

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, unitId: '', unitName: '' })}
      >
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

      <Dialog
        open={feedbackModal.open}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
      >
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

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}