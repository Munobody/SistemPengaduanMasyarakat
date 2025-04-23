'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';  
import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Skeleton,
} from '@mui/material';
import api from '@/lib/api/api';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
dayjs.locale('id'); 

interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  nameUnit: string;
  nama: string;
  no_telphone: string;
  approvedBy: string | null;
  harapan_pelapor: string | null;
  createdAt: string;
  filePendukung: string;
  response: string;
  status: string;
  filePetugas: string;
  pelapor: {
    no_telphone: string;
    nama: string;
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

const STATUS_ORDER = ['PENDING', 'PROCESS', 'REJECTED', 'COMPLETED'];

export function TabelPetugasMasyarakat() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Pengaduan[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Pengaduan[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalData, setTotalData] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [unitList, setUnitList] = useState<string[]>([]);
  const [viewDialog, setViewDialog] = useState<ViewComplaintDialog>({
    open: false,
    complaint: null,
  });
  const [isSuperOfficer, setIsSuperOfficer] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const checkUserRoleFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsSuperOfficer(parsedUser.userLevel?.name === 'PETUGAS_SUPER');
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
      const searchFilters: Record<string, string> = {};

      if (searchQuery) searchFilters.judul = searchQuery;
      if (selectedUnit) searchFilters.unit = selectedUnit;
      if (selectedStatus) searchFilters.status = selectedStatus;

      const response = await api.get('/pengaduan', {
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
        const uniqueUnits = Array.from(new Set(entries.map((e) => e.unit?.nama_unit).filter(Boolean)));
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
      setError(error.response?.data?.message || 'Gagal memuat data pengaduan');
      toast.error('Gagal memuat data pengaduan');
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
  };

  const sendOfficerAlert = async () => {
    if (!selectedComplaintId) return;
    
    setIsSendingAlert(true);
    try {
      const response = await api.post('/notification/OfficerAlert', {
        pengaduanId: selectedComplaintId
      });
      
      toast.success('Pengingat berhasil dikirim ke petugas unit', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error: any) {
      console.error('Gagal mengirim pengingat:', error);
      
      let errorMessage = 'Gagal mengirim pengingat';
      if (error.response?.data?.message === 'Validation Error' && 
          error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSendingAlert(false);
      handleCloseAlertDialog();
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
    let result = [...complaints];
    
    if (selectedUnit) {
      result = result.filter(complaint => 
        complaint.unit?.nama_unit === selectedUnit
      );
    }
    
    if (selectedStatus) {
      result = result.filter(complaint => 
        complaint.status.toUpperCase() === selectedStatus
      );
    }
    
    setFilteredComplaints(result);
  }, [complaints, selectedUnit, selectedStatus]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleViewComplaint = (complaint: Pengaduan, event: React.MouseEvent) => {
    event.stopPropagation();
    setViewDialog({
      open: true,
      complaint,
    });
  };

  const handleCloseView = () => {
    setViewDialog({
      open: false,
      complaint: null,
    });
  };

  const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUnit(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStatus(event.target.value);
    setPage(0);
  };

  const handleManageComplaint = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/petugas/kelola/${id}`);
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

  const renderSkeletonRows = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
        <TableCell align="right">
          <Skeleton variant="circular" width={40} height={40} />
        </TableCell>
      </TableRow>
    ));
  };

  if (error) {
    return (
      <>
        <Alert severity="error">{error}</Alert>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Card>
        <CardHeader
          title="Daftar Pengaduan Masyarakat"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              {loading ? (
                <>
                  <Skeleton variant="rectangular" width={200} height={40} />
                  <Skeleton variant="rectangular" width={200} height={40} />
                  <Skeleton variant="rectangular" width={300} height={40} />
                </>
              ) : (
                <>
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
                </>
              )}
            </Box>
          }
        />

        <TableContainer component={Paper}>
          {loading ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Judul</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>No. Telepon</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderSkeletonRows()}
              </TableBody>
            </Table>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>No. Telepon</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Tidak ada pengaduan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>{complaint.judul || '-'}</TableCell>
                        <TableCell>{complaint.nama || '-'}</TableCell>
                        <TableCell>
                          {complaint.no_telphone ? (
                            <a
                              href={`https://wa.me/${complaint.no_telphone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                              {complaint.no_telphone.replace(/^62/, '+62 ')}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{complaint.unit?.nama_unit || '-'}</TableCell>
                        <TableCell>{complaint.kategori?.nama || 'Tidak ada kategori'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.status} 
                            color={getStatusColor(complaint.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleViewComplaint(complaint, e)}
                            color="info"
                            title="Lihat detail"
                            sx={{ mr: 1 }}
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>

                          {isSuperOfficer && !['COMPLETED', 'REJECTED'].includes(complaint.status) && (
                            <Tooltip title="Ingatkan petugas unit">
                              <IconButton
                                onClick={() => handleOpenAlertDialog(complaint.id)}
                                color="warning"
                                sx={{ mr: 1 }}
                              >
                                <NotificationsActiveIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton
                            onClick={(e) => handleManageComplaint(complaint.id, e)}
                            color="primary"
                            title="Kelola pengaduan"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[12, 24, 36]}
                component="div"
                count={filteredComplaints.length}
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
          {viewDialog.complaint ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Judul Laporan
                </Typography>
                <Typography>{viewDialog.complaint.judul || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Deskripsi
                </Typography>
                <Typography>{viewDialog.complaint.deskripsi || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Kategori
                </Typography>
                <Typography>{viewDialog.complaint.kategori?.nama || 'Tidak ada kategori'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Unit
                </Typography>
                <Typography>{viewDialog.complaint.unit?.nama_unit || 'Tidak ada unit'}</Typography>
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

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Pelapor
                </Typography>
                <Typography>{viewDialog.complaint.nama || '-'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {viewDialog.complaint.no_telphone ? (
                    <a
                      href={`https://wa.me/${viewDialog.complaint.no_telphone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {viewDialog.complaint.no_telphone.replace(/^62/, '+62 ')}
                    </a>
                  ) : (
                    '-'
                  )}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Box key={index}>
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="80%" height={24} />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Tutup</Button>
          {viewDialog.complaint && (
            <Button
              variant="contained"
              onClick={(e) => {
                handleManageComplaint(viewDialog.complaint!.id, e);
                handleCloseView();
              }}
            >
              Kelola
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={alertDialogOpen} onClose={handleCloseAlertDialog}>
        <DialogTitle>Konfirmasi Pengingat</DialogTitle>
        <DialogContent>
          <Typography>Apakah anda yakin ingin mengingatkan petugas unit untuk menindaklanjuti pengaduan ini?</Typography>
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
    </>
  );
}