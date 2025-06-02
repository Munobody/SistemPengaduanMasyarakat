'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
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
  Tooltip,
  CircularProgress,
} from '@mui/material';
import api from '@/lib/api/api';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { usePermission } from '@/hooks/use-permission';
dayjs.locale('id');

interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  nameUnit: string;
  pelaporId: string;
  status: string;
  approvedBy: string | null;
  harapan_pelapor: string | null;
  filePendukung: string;
  response: string;
  filePetugas: string;
  createdAt: string;
  pelapor: {
    name: string;
    no_identitas: string;
    program_studi: string;
  };
  unit: {
    nama_unit: string;
  };
  kategori: {
    nama: string;
  };
}

interface ViewComplaintDialog {
  open: boolean;
  complaint: Pengaduan | null;
}

interface MessageModal {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const STATUS_ORDER = ['PENDING', 'PROCESS', 'REJECTED', 'COMPLETED'];

export function TabelPetugas() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Pengaduan[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Pengaduan[]>([]);
  const [unitList, setUnitList] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalData, setTotalData] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewDialog, setViewDialog] = useState<ViewComplaintDialog>({
    open: false,
    complaint: null,
  });
  const [isSuperOfficer, setIsSuperOfficer] = useState(false);
  const [isPimpinanUniversitas, setIsPimpinanUniversitas] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [messageModal, setMessageModal] = useState<MessageModal>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { hasPermission } = usePermission();
  const canViewIdentity = hasPermission('PENGADUAN', 'viewIdentitas');
  const canManageUsers = hasPermission('USER', 'manage');
  const [isPimpinanUnit, setIsPimpinanUnit] = useState(false);


  const checkUserRoleFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsSuperOfficer(parsedUser.userLevel?.name === 'PETUGAS_SUPER');
          setIsPimpinanUniversitas(parsedUser.userLevel?.name === 'PIMPINAN_UNIVERSITAS');
          setIsPimpinanUnit(parsedUser.userLevel?.name === 'PIMPINAN_UNIT'); 
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchFilters = searchQuery ? { judul: searchQuery } : {};

      const response = await api.get('/pelaporan', {
        params: {
          page: page + 1,
          rows: rowsPerPage,
          searchFilters: JSON.stringify(searchFilters),
          orderKey: 'judul',
          orderRule: 'asc',
        },
      });

      if (response.data.content?.entries) {
        const entries: Pengaduan[] = response.data.content.entries;
        const uniqueUnits = Array.from(new Set(entries.map((e) => e.unit.nama_unit)));
        setUnitList(uniqueUnits);

        const sortedEntries = entries.sort((a, b) => {
          const statusA = STATUS_ORDER.indexOf(a.status.toUpperCase());
          const statusB = STATUS_ORDER.indexOf(b.status.toUpperCase());

          if (statusA !== statusB) {
            return statusA - statusB;
          }

          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        setComplaints(sortedEntries);
        setTotalData(response.data.content.totalData);
      } else {
        setComplaints([]);
        setTotalData(0);
      }
    } catch (error: any) {
      console.error('❌ Gagal memuat pengaduan:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Gagal memuat data pengaduan';
      setError(errorMessage);
      setMessageModal({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAlertDialog = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setAlertDialogOpen(true);
  };

  const handleCloseAlertDialog = () => {
    setAlertDialogOpen(false);
    setSelectedComplaintId(null);
    setIsSendingAlert(false);
  };

  const handleCloseMessageModal = () => {
    setMessageModal({ open: false, message: '', severity: 'success' });
  };

  const sendOfficerAlert = useCallback(async () => {
    if (!selectedComplaintId || isSendingAlert) return;

    setIsSendingAlert(true);
    try {
      await api.post('/notification/OfficerAlert', {
        pengaduanId: selectedComplaintId,
      });

      setMessageModal({
        open: true,
        message: 'Berhasil memberikan peringatan ke petugas tertuju',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Gagal mengirim pengingat:', error);

      let errorMessage = 'Gagal mengirim pengingat';
      if (error.response?.data?.message === 'Validation Error' && error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessageModal({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsSendingAlert(false);
      handleCloseAlertDialog();
    }
  }, [selectedComplaintId, isSendingAlert]);

  const handleDeleteComplaint = async (id: string) => {
    try {
      const response = await api.delete('/pelaporan', { data: { ids: [id] } });
      if (response.status === 200) {
        setMessageModal({
          open: true,
          message: 'Berhasil menghapus pengaduan',
          severity: 'success',
        });
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('❌ Gagal menghapus pengaduan:', error.response?.data);
      setMessageModal({
        open: true,
        message: 'Terjadi kesalahan saat menghapus pengaduan',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    checkUserRoleFromLocalStorage();
    fetchComplaints();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchComplaints();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    let result = complaints;

    if (selectedUnit) {
      result = result.filter((c) => c.unit.nama_unit === selectedUnit);
    }

    if (selectedStatus) {
      result = result.filter((c) => c.status.toUpperCase() === selectedStatus);
    }

    setFilteredComplaints(result);
  }, [selectedUnit, selectedStatus, complaints]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUnit(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStatus(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'PROCESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewComplaint = (complaint: Pengaduan, event: React.MouseEvent) => {
    event.stopPropagation();
    setViewDialog({ open: true, complaint });
  };

  const handleManageComplaint = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/petugas/kelola/${id}`);
  };

  const handleCloseView = () => {
    setViewDialog({ open: false, complaint: null });
  };

  if (error) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Daftar Pengaduan Internal"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                size="small"
                value={selectedUnit}
                onChange={handleUnitChange}
                SelectProps={{ displayEmpty: true }}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Semua Unit</MenuItem>
                {unitList.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                value={selectedStatus}
                onChange={handleStatusChange}
                SelectProps={{ displayEmpty: true }}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESS">Proses</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
              <TextField
                placeholder="Cari berdasarkan judul..."
                value={searchQuery}
                onChange={handleSearch}
                size="small"
                sx={{ width: 300 }}
              />
            </Box>
          }
        />
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} />
              ))}
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    {canViewIdentity && (
                    <TableCell>Pelapor</TableCell>
                    )}
                    <TableCell>Unit</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Tanggal Pengaduan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Tidak ada pengaduan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>{complaint.judul}</TableCell>
                        {canViewIdentity && (
                        <TableCell>
                          <div>{complaint.pelapor.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'gray' }}>
                            {complaint.pelapor.program_studi}
                          </div>
                        </TableCell>
                        )}
                        <TableCell>{complaint.unit.nama_unit}</TableCell>
                        <TableCell>{complaint.kategori.nama}</TableCell>
                        <TableCell>
                          {dayjs(complaint.createdAt).format('dddd, DD MMMM YYYY')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.status}
                            color={getStatusColor(complaint.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Lihat detail">
                            <IconButton
                              onClick={(e) => handleViewComplaint(complaint, e)}
                              color="info"
                              sx={{ mr: 1 }}
                            >
                              <RemoveRedEyeIcon />
                            </IconButton>
                          </Tooltip>

                          {(isSuperOfficer || isPimpinanUniversitas) && !['COMPLETED', 'REJECTED'].includes(complaint.status.toUpperCase()) && (
                          <Tooltip title="Ingatkan petugas unit">
                            <IconButton
                              onClick={() => handleOpenAlertDialog(complaint.id)}
                              color="warning"
                              sx={{ mr: 1 }}
                              disabled={isSendingAlert}
                            >
                              <NotificationsActiveIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        
                            {(!isPimpinanUniversitas && !isPimpinanUnit) && (
                            <>
                              {complaint.status !== 'COMPLETED' ? (
                              <Tooltip title="Kelola pengaduan">
                                <IconButton
                                onClick={(e) => handleManageComplaint(complaint.id, e)}
                                color="primary"
                                >
                                <EditIcon />
                                </IconButton>
                              </Tooltip>
                              ) : (
                              <Tooltip title="Hapus pengaduan">
                                <IconButton
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                color="error"
                                >
                                <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                              )}
                            </>
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[12, 24, 36]}
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
            </>
          )}
        </TableContainer>
      </Card>

      <Dialog open={viewDialog.open} onClose={handleCloseView} maxWidth="md" fullWidth>
        <DialogTitle>Detail Pengaduan</DialogTitle>
        <DialogContent dividers>
          {viewDialog.complaint && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {canViewIdentity && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  ID Pelapor
                </Typography>
                <Typography>{viewDialog.complaint.pelaporId}</Typography>
              </Box>
              )}
              {canViewIdentity && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nama Pelapor
                </Typography>
                <Typography>{viewDialog.complaint.pelapor.name}</Typography>
              </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Judul Laporan
                </Typography>
                <Typography>{viewDialog.complaint.judul}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Deskripsi
                </Typography>
                <Typography>{viewDialog.complaint.deskripsi}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Kategori
                </Typography>
                <Typography>{viewDialog.complaint.kategori.nama}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Unit
                </Typography>
                <Typography>{viewDialog.complaint.unit.nama_unit}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={viewDialog.complaint.status}
                  color={getStatusColor(viewDialog.complaint.status)}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tanggal Dibuat
                </Typography>
                <Typography>
                  {viewDialog.complaint.createdAt
                    ? dayjs(viewDialog.complaint.createdAt).format('dddd, DD MMMM YYYY HH:mm')
                    : '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Harapan Pelapor
                </Typography>
                <Typography>{viewDialog.complaint.harapan_pelapor || '-'}</Typography>
              </Box>

              {viewDialog.complaint.filePendukung && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    File Pendukung
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href={viewDialog.complaint.filePendukung}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Tutup</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={alertDialogOpen} onClose={handleCloseAlertDialog}>
        <DialogTitle>Konfirmasi Pengingat</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah anda yakin ingin mengingatkan petugas unit untuk menindaklanjuti pengaduan ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDialog} disabled={isSendingAlert}>
            Batal
          </Button>
          <Button
            onClick={sendOfficerAlert}
            color="primary"
            variant="contained"
            disabled={isSendingAlert}
          >
            {isSendingAlert ? <CircularProgress size={24} /> : 'Kirim Pengingat'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={messageModal.open} onClose={handleCloseMessageModal} maxWidth="sm" fullWidth>
        <DialogTitle>{messageModal.severity === 'success' ? 'Sukses' : 'Error'}</DialogTitle>
        <DialogContent>
          <Typography>{messageModal.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageModal} color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}