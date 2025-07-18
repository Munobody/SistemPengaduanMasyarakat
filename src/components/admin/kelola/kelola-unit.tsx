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
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api/api';

const JENIS_UNIT = ['FAKULTAS', 'UPT', 'DIREKTORAT', 'LEMBAGA'] as const;

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: typeof JENIS_UNIT[number];
  isActive: boolean;
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

interface DisableConfirmationProps {
  open: boolean;
  unitId: string;
  unitName: string;
  currentStatus: boolean;
}

export function KelolaUnit() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [units, setUnits] = useState<Unit[]>([]);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10, totalData: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const JENIS_UNIT = ['FAKULTAS', 'UPT', 'DIREKTORAT', 'LEMBAGA'] as const;

  interface DialogState {
    open: boolean;
    isEditing: boolean;
    currentUnit: Unit | null;
    unitName: string;
    kepalaUnitId: string;
    pimpinanUnitId: string;
    selectedJenisUnit: typeof JENIS_UNIT[number] | '';
  }

  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    isEditing: false,
    currentUnit: null,
    unitName: '',
    kepalaUnitId: '',
    pimpinanUnitId: '',
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

  const [disableConfirmation, setDisableConfirmation] = useState<DisableConfirmationProps>({
    open: false,
    unitId: '',
    unitName: '',
    currentStatus: true,
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

  const handleToggleStatus = (unit: Unit) => {
    setDisableConfirmation({
      open: true,
      unitId: unit.id,
      unitName: unit.nama_unit,
      currentStatus: unit.isActive,
    });
  };

const handleConfirmToggleStatus = async () => {
  try {
    const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/units/${disableConfirmation.unitId}`, {
      isActive: !disableConfirmation.currentStatus
    });

    // Update feedback based on API response
    if (response.data?.content) {
      setFeedbackModal({
        open: true,
        title: 'Success',
        message: response.data.message || `Unit "${disableConfirmation.unitName}" telah ${
          disableConfirmation.currentStatus ? 'dinonaktifkan' : 'diaktifkan'
        }.`,
        isError: false,
      });
      fetchUnits(); // Refresh the units list
    }
  } catch (error: any) {
    setFeedbackModal({
      open: true,
      title: 'Error',
      message: error.response?.data?.message || 'Gagal mengubah status unit',
      isError: true,
    });
  } finally {
    setDisableConfirmation({
      open: false,
      unitId: '',
      unitName: '',
      currentStatus: true,
    });
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
      // Update the PUT request body to match API format
      const updateBody = {
        nama_unit: unitName.trim(),
        kepalaUnitId: kepalaUnitId.trim() || currentUnit.kepalaUnit?.no_identitas
      };

      await api.put(`${process.env.NEXT_PUBLIC_API_URL}/units/${currentUnit.id}`, updateBody);
      setFeedbackModal({
        open: true,
        title: 'Success',
        message: `Unit "${unitName}" telah diperbarui.`,
        isError: false,
      });
    } else {
      const requestBody = {
        nama_unit: unitName.trim(),
        jenis_unit: selectedJenisUnit,
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
              <TableCell sx={{ fontWeight: 'bold', color: '#003C43' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#003C43' }}>
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton variant="text" width="100%" height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow
                  key={unit.id}
                  sx={{ opacity: unit.isActive ? 1 : 0.6 }}
                >
                  <TableCell>{unit.nama_unit}</TableCell>
                  <TableCell>{unit.jenis_unit}</TableCell>
                  <TableCell>{unit.kepalaUnit?.name || '-'}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: unit.isActive ? '#135D66' : '#D32F2F',
                      }}
                    >
                      {unit.isActive ? (
                        <>
                          <CheckCircleIcon fontSize="small" />
                          <Typography>Aktif</Typography>
                        </>
                      ) : (
                        <>
                          <BlockIcon fontSize="small" />
                          <Typography>Nonaktif</Typography>
                        </>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(unit)}>
                      <EditIcon sx={{ color: '#135D66' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(unit.id, unit.nama_unit)}>
                      <DeleteIcon sx={{ color: '#135D66' }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleStatus(unit)}
                      sx={{
                        '& svg': {
                          color: unit.isActive ? '#D32F2F' : '#135D66'
                        }
                      }}
                    >
                      {unit.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
                select
                label="Jenis Unit"
                fullWidth
                value={dialogState.selectedJenisUnit}
                onChange={(e) =>
                  setDialogState((prev) => ({ ...prev, selectedJenisUnit: e.target.value as typeof JENIS_UNIT[number] }))
                }
                sx={{ mb: 2 }}
              >
                {JENIS_UNIT.map((jenis) => (
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

      {/* Add Disable Confirmation Dialog */}
      <Dialog
        open={disableConfirmation.open}
        onClose={() => setDisableConfirmation(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ color: '#003C43' }}>
          {disableConfirmation.currentStatus ? 'Nonaktifkan Unit' : 'Aktifkan Unit'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {disableConfirmation.currentStatus
              ? `Apakah Anda yakin untuk menonaktifkan unit "${disableConfirmation.unitName}"?`
              : `Apakah Anda yakin untuk mengaktifkan kembali unit "${disableConfirmation.unitName}"?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDisableConfirmation(prev => ({ ...prev, open: false }))}
            sx={{ color: '#003C43' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmToggleStatus}
            variant="contained"
            sx={{
              backgroundColor: disableConfirmation.currentStatus ? '#D32F2F' : '#135D66',
              '&:hover': {
                backgroundColor: disableConfirmation.currentStatus ? '#b71c1c' : '#003C43'
              }
            }}
          >
            {disableConfirmation.currentStatus ? 'Nonaktifkan' : 'Aktifkan'}
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