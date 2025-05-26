'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Card,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import api from '@/lib/api/api';
import { EditComplaintModal } from './modal/EditComplaintModal';
import { ViewComplaintModal } from './modal/ViewComplaintModal';

// Define the Complaint interface
export interface Complaint {
  kategoriId: string;
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
  date?: string;
  nama: string;
  nameUnit: string;
  unitId: string;
  complaintType: string;
  response: string;
  status: string;
  filePendukung: string;
  filePetugas: string;
  harapan_pelapor: string;
  kategori?: { id: string; nama: string };
  unit?: { id: string; nama_unit: string };
}

const STATUS_ORDER = ['PENDING', 'PROCESS', 'COMPLETED', 'REJECTED'];

export function LatestComplaints() {
  const [complaints, setComplaints] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Complaint | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editedComplaint, setEditedComplaint] = useState<Complaint | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchComplaints = async () => {
    try {
      const adjustedPageSize = isMobile ? 5 : pageSize;
      const response = await api.get(`/pelaporan?page=${page}&rows=${adjustedPageSize}`);
      const data = response.data;
      if (data?.content) {
        const sortedEntries = data.content.entries.sort((a: Complaint, b: Complaint) => {
          const statusA = STATUS_ORDER.indexOf(a.status);
          const statusB = STATUS_ORDER.indexOf(b.status);
          if (statusA !== statusB) {
            return statusA - statusB;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        setComplaints({ ...data.content, entries: sortedEntries });
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data pengaduan.');
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    try {
      const response = await api.delete(`/pelaporan?ids=["${id}"]`, {});
      if (response.status === 200) {
        toast.success('Pengaduan berhasil dihapus!'); 
        fetchComplaints(); 
      }
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pengaduan.');
    }
  };

  const handleEditOpen = async (row: Complaint) => {
    try {
      const response = await api.get(`/pelaporan/${row.id}`);
      const data = response.data.content;
      setEditedComplaint({
        id: data.id,
        judul: data.judul || 'Tidak Ada Judul',
        deskripsi: data.deskripsi || 'Tidak Ada Deskripsi',
        createdAt: dayjs(data.createdAt).format('MMM D, YYYY'),
        nama: data.nama || '',
        nameUnit: data.unit?.nama_unit || '',
        unitId: data.unit?.id || '',
        kategoriId: data.kategori?.id || '',
        complaintType: 'Belum Ditentukan',
        status: data.status || 'PENDING',
        response: data.response || '',
        filePendukung: data.filePendukung || '',
        filePetugas: data.filePetugas || '',
        harapan_pelapor: data.harapan_pelapor || '-',
        kategori: data.kategori,
        unit: data.unit,
      });
      setEditOpen(true);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat detail pengaduan.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize, isMobile]);

  const columns: any = [
    {
      field: 'title',
      headerName: 'Judul Laporan',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.judul ?? '-'}</span>,
    },
    {
      field: 'content',
      headerName: 'Isi Laporan',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.deskripsi ?? '-'}</span>,
    },
    {
      field: 'date',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <span>{params?.row?.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY') : '-'}</span>
      ),
    },
    {
      field: 'category',
      headerName: 'Kategori',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.kategori?.nama ?? '-'}</span>,
    },
    {
      field: 'targetUnit',
      headerName: 'Unit Tertuju',
      FLEX: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.unit?.nama_unit ?? '-'}</span>,
    },
    {
      field: 'response',
      headerName: 'Tanggapan Petugas',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <span
          style={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            width: '100%',
            textAlign: 'center',
            padding: '8px',
          }}
        >
          {params?.row?.response ?? '-'}
        </span>
      ),
    },
    {
      field: 'filePendukung',
      headerName: 'File Pendukung',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) =>
        params?.row?.filePendukung ? (
          <IconButton size="small" href={params.value} target="_blank" title="Lihat File Pendukung">
            <AttachFileIcon />
          </IconButton>
        ) : (
          '-'
        ),
    },
    {
      field: 'filePetugas',
      headerName: 'File Petugas',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) =>
        params?.row?.filePetugas ? (
          <IconButton size="small" href={params.value} target="_blank" title="Lihat File Petugas">
            <AttachFileIcon />
          </IconButton>
        ) : (
          '-'
        ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => {
        const textColor =
          params?.row?.status === 'PENDING'
            ? '#F59E0B'
            : params?.row?.status === 'PROCESS'
            ? '#3B82F6'
            : params?.row?.status === 'COMPLETED'
            ? '#10B981'
            : '#EF4444';
        return (
          <Chip
            label={params.row?.status ?? '-'}
            sx={{ color: textColor, fontWeight: 'bold', backgroundColor: 'transparent' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      flex: 0.5,
      sortable: false,
      filterable: false,
      hideable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <IconButton
            onClick={(event) => {
              setMenuAnchor(event.currentTarget);
              setSelectedRow(params.row);
            }}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                if (selectedRow) handleViewOpen(selectedRow);
                handleMenuClose();
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ mr: 

 1 }} /> Lihat
            </MenuItem>
            {!['PROCESS', 'REJECTED', 'COMPLETED'].includes(selectedRow?.status ?? '-') && (
              <MenuItem
                onClick={() => {
                  if (selectedRow) handleEditOpen(selectedRow);
                  handleMenuClose();
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
            )}
            {(selectedRow?.status === 'COMPLETED' || selectedRow?.status === 'REJECTED') && (
              <MenuItem
                onClick={() => {
                  if (selectedRow) handleDeleteComplaint(selectedRow.id);
                  handleMenuClose();
                }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Hapus
              </MenuItem>
            )}
          </Menu>
        </Box>
      ),
    },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: Complaint) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(row);
  };

  const mobileColumns = [
    {
      field: 'title',
      headerName: 'Judul',
      flex: 1.5,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params: any) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params?.row?.judul ?? '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'date',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <span>{params?.row?.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY') : '-'}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => {
        const textColor =
          params?.row?.status === 'PENDING'
            ? '#F59E0B'
            : params?.row?.status === 'PROCESS'
            ? '#3B82F6'
            : params?.row?.status === 'COMPLETED'
            ? '#10B981'
            : '#EF4444';
        return (
          <Chip
            label={params.row?.status ?? '-'}
            sx={{ color: textColor, fontWeight: 'bold', backgroundColor: 'transparent', fontSize: '0.75rem' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      flex: 0.8,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={(event) => handleMenuClick(event, params.row)} size="small">
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                if (selectedRow) handleViewOpen(selectedRow);
                handleMenuClose();
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Lihat
            </MenuItem>
            {!['PROCESS', 'REJECTED', 'COMPLETED'].includes(selectedRow?.status ?? '-') && (
              <MenuItem
                onClick={() => {
                  if (selectedRow) handleEditOpen(selectedRow);
                  handleMenuClose();
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
            )}
            {(selectedRow?.status === 'COMPLETED' || selectedRow?.status === 'REJECTED') && (
              <MenuItem
                onClick={() => {
                  if (selectedRow) handleDeleteComplaint(selectedRow.id);
                  handleMenuClose();
                }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Hapus
              </MenuItem>
            )}
          </Menu>
        </Box>
      ),
    },
  ];

  const activeColumns = isMobile ? mobileColumns : columns;

  const handleViewOpen = async (row: Complaint) => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/${row.id}`, {});
      const data = response.data.content;
      setSelectedRow({
        id: data.id,
        judul: data.judul || 'Tidak Ada Judul',
        deskripsi: data.deskripsi || 'Tidak Ada Deskripsi',
        createdAt: dayjs(data.createdAt).format('MMM D, YYYY'),
        nama: data.nama || '',
        nameUnit: data.unit?.nama_unit || '',
        unitId: data.unit?.id || '',
        kategoriId: data.kategori?.id || '',
        complaintType: 'Belum Ditentukan',
        status: data.status || 'PENDING',
        response: data.response || '',
        filePendukung: data.filePendukung || '',
        filePetugas: data.filePetugas || '',
        harapan_pelapor: data.harapan_pelapor || '-',
        kategori: data.kategori,
        unit: data.unit,
      });
      setViewOpen(true);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat detail pengaduan.');
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRow(null);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedRow(null);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditedComplaint(null);
  };

  const handleSaveChanges = async (field: keyof Complaint, value: any) => {
    if (!selectedRow?.id) return;
    try {
      const response = await api.patch(`/pelaporan/${selectedRow.id}`, { [field]: value });
      if (response.status === 200) {
        toast.success('Pengaduan berhasil diperbarui!');
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengaduan.');
    }
  };

  const filteredComplaints = complaints?.entries?.filter((complaint: Complaint) =>
    complaint.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvContent = [
      [
        'Judul Laporan',
        'Isi Laporan',
        'Tanggal',
        'Kategori',
        'Unit Tertuju',
        'Status',
        'Tanggapan Petugas',
        'File Pendukung',
        'File Petugas',
        'Harapan Pelapor',
      ],
      ...complaints.entries.map((c: Complaint) => [
        c.judul,
        c.deskripsi,
        dayjs(c.createdAt).format('DD/MM/YYYY'),
        c.kategori?.nama || '-',
        c.unit?.nama_unit || '-',
        c.status,
        c.response || '-',
        c.filePendukung || '-',
        c.filePetugas || '-',
        c.harapan_pelapor || '-',
      ]),
    ]
      .map((e) => e.map((x: any) => `"${(x || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `pengaduan_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader title="Tabel Pengaduan Layanan" sx={{ textAlign: 'center' }} />
      <Divider />
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          label="Cari Judul Laporan"
          variant="outlined"
          size="small"
          fullWidth={isMobile}
          sx={{ width: isMobile ? '100%' : '300px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton
          onClick={handleExportCSV}
          sx={{ alignSelf: isMobile ? 'flex-end' : 'center', mt: isMobile ? 1 : 0 }}
        >
          <FileDownloadIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: isMobile ? 1 : 2,
          width: '100%',
          minHeight: isMobile ? '300px' : '400px',
          '& .MuiDataGrid-root': {
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(224, 224, 224, 0.4)' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#E3FEF7', borderBottom: 'none' },
            '& .MuiDataGrid-virtualScroller': { backgroundColor: '#ffffff' },
          },
        }}
      >
        {complaints ? (
          <DataGrid
            rows={filteredComplaints ?? []}
            columns={activeColumns}
            pageSizeOptions={[5, 10, 20, 100]}
            pagination
            paginationMode="server"
            rowCount={filteredComplaints?.length ?? 0}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1);
              setPageSize(model.pageSize);
            }}
            disableColumnMenu
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnSelector
            disableColumnResize
            disableColumnSorting
            autoHeight={false}
            slotProps={{
              toolbar: {
                sx: {
                  '& .MuiButtonBase-root': { color: '#16404D' },
                  '& .MuiIconButton-root': { color: '#16404D' },
                },
              },
              noRowsOverlay: {
                sx: {
                  fontSize: '1rem',
                  color: 'text.secondary',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
            }}
            localeText={{
              noRowsLabel: 'Belum Ada Pengaduan Yang Diajukan',
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', minHeight: isMobile ? '300px' : '400px' }}>
            <Skeleton variant="rectangular" height={40} width="100%" />
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={52} width="100%" />
            ))}
          </Box>
        )}
      </Box>

      <ViewComplaintModal open={viewOpen} onClose={handleViewClose} complaint={selectedRow} />
      <EditComplaintModal open={editOpen} onClose={handleEditClose} complaint={editedComplaint} onSave={handleSaveChanges} />
      <ToastContainer position="top-right" autoClose={3000} style={{ fontSize: isMobile ? '14px' : '16px' }} />
    </Card>
  );
}