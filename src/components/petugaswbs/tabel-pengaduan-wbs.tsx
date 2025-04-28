'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '@/lib/api/api';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { toast } from 'react-toastify';

dayjs.locale('id');

interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  unit: string;
  pihakTerlibat: string;
  status: string;
  approvedBy: string | null;
  lokasi: string | null;
  filePendukung: string;
  response: string;
  filePetugas: string;
  tanggalKejadian: string;
  createdAt: string;
  units: {
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

export function TabelPetugasWbs() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Pengaduan[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalData, setTotalData] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewDialog, setViewDialog] = useState<ViewComplaintDialog>({
    open: false,
    complaint: null,
  });

  const fetchUnits = async () => {
    try {
      const response = await api.get('/units'); // Adjust endpoint as needed
      const unitList = response.data.map((unit: any) => unit.nama_unit);
      setUnits(['All', ...unitList]);
    } catch (error) {
      console.error('❌ Failed to fetch units:', error);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: any = {};
      if (searchQuery) filters.judul = searchQuery;
      if (selectedUnit && selectedUnit !== 'All') filters.unit = selectedUnit;

      const response = await api.get(`/PelaporanWbs`, {
        params: {
          page: page + 1,
          rows: rowsPerPage,
          searchFilters: JSON.stringify(filters),
          orderKey: 'createdAt',
          orderRule: 'desc', // We'll handle status sorting client-side
        },
      });

      if (response.data.content?.entries) {
        const sortedComplaints = response.data.content.entries.sort((a: Pengaduan, b: Pengaduan) => {
          const statusOrder = ['PENDING', 'PROCESS', 'COMPLETED', 'REJECTED'];
          const statusA = statusOrder.indexOf(a.status.toUpperCase());
          const statusB = statusOrder.indexOf(b.status.toUpperCase());

          if (statusA !== statusB) {
            return statusA - statusB;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setComplaints(sortedComplaints);
        setTotalData(response.data.content.totalData);
        console.log('📋 Daftar pengaduan Internal:', sortedComplaints);
      } else {
        setComplaints([]);
        setTotalData(0);
      }
    } catch (error: any) {
      console.error('❌ Gagal memuat pengaduan:', error.response?.data);
      setError(error.response?.data?.message || 'Gagal memuat data pengaduan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchComplaints();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, rowsPerPage, searchQuery, selectedUnit]);

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

  const handleUnitChange = (event: any) => {
    setSelectedUnit(event.target.value);
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

  const handleDeleteComplaint = async (id: string) => {
    if (!id) return;

    try {
      const response = await api.delete(`/PelaporanWbs?ids=["${id}"]`);

      if (response.status === 200) {
        toast.success('Pengaduan berhasil dihapus');
        fetchComplaints();
      } else {
        toast.error('Gagal menghapus pengaduan');
      }
    } catch (error: any) {
      console.error('❌ Gagal menghapus pengaduan:', error.response?.data);
      toast.error('Terjadi kesalahan saat menghapus pengaduan');
    }
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

  const handleManageComplaint = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/petugaswbs/kelola/${id}`);
    console.log('🔧 Mengelola pengaduan:', id);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Daftar Pengaduan Whistle Blowing System"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Filter Unit</InputLabel>
                <Select
                  value={selectedUnit}
                  onChange={handleUnitChange}
                  label="Filter Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Judul</TableCell>
                  <TableCell>Pihak Terlibat</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    <TableCell>Pihak Terlibat</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Tidak ada pengaduan
                      </TableCell>
                    </TableRow>
                  ) : (
                    complaints.map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>{complaint.judul}</TableCell>
                        <TableCell>
                          <Box>
                            <div>{complaint.pihakTerlibat}</div>
                            <div style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              {complaint.pihakTerlibat}
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>{complaint.unit}</TableCell>
                        <TableCell>{complaint.kategori.nama}</TableCell>
                        <TableCell>
                          <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
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
                          {complaint.status !== 'COMPLETED' ? (
                            <IconButton
                              onClick={(e) => handleManageComplaint(complaint.id, e)}
                              color="primary"
                              title="Kelola pengaduan"
                            >
                              <EditIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => handleDeleteComplaint(complaint.id)}
                              color="error"
                              title="Hapus pengaduan"
                            >
                              <DeleteIcon />
                            </IconButton>
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
                <Typography>{viewDialog.complaint.unit}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Pihak Terlibat
                </Typography>
                <Typography>{viewDialog.complaint.pihakTerlibat}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tanggal Kejadian
                </Typography>
                <Typography>
                  {dayjs(viewDialog.complaint.tanggalKejadian).format('DD MMMM YYYY')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tanggal Dibuat
                </Typography>
                <Typography>
                  {dayjs(viewDialog.complaint.createdAt).format('DD MMMM YYYY HH:mm')}
                </Typography>
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
                  Lokasi Kejadian
                </Typography>
                <Typography>{viewDialog.complaint.lokasi || '-'}</Typography>
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
          <Button
            variant="contained"
            onClick={(e) => {
              handleManageComplaint(viewDialog.complaint!.id, e);
              handleCloseView();
            }}
          >
            Kelola
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}