'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import api from '@/lib/api/api';
import { ViewComplaintModalWbs } from './modal/ViewComplaintModalWbs';

export interface ComplaintWbs {
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
  kategori: { id: string; nama: string };
  unit: string;
  status: string;
  response?: string;
  pihakTerlibat?: string;
  filePendukung?: string;
  filePetugas?: string;
  lokasi?: string;
}

export function TabelWbs() {
  const [complaints, setComplaints] = useState<ComplaintWbs[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ComplaintWbs | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const statusOrder: { [key: string]: number } = {
    PENDING: 1,
    PROCESS: 2,
    COMPLETED: 3,
    REJECTED: 4,
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/PelaporanWbs?page=${page}&rows=${pageSize}&search=${searchQuery}`);
      const data = response.data;
      if (data?.content) {
        const sortedComplaints = data.content.entries.sort((a: ComplaintWbs, b: ComplaintWbs) => {
          const statusComparison = statusOrder[a.status] - statusOrder[b.status];
          if (statusComparison !== 0) return statusComparison;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setComplaints(sortedComplaints);
        setTotalRows(data.content.totalRows || sortedComplaints.length);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data pengaduan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleDelete = async (row: ComplaintWbs) => {
    try {
      await api.delete(`/PelaporanWbs?ids=["${row.id}"]`);
      toast.success('Pengaduan berhasil dihapus.');
      fetchComplaints(); // Refresh the list after deletion
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pengaduan.');
    } finally {
      setMenuAnchor(null);
    }
  };

  const columns: any = [
    {
      field: 'judul',
      headerName: 'Judul Laporan',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params.row.judul ?? '-'}</span>,
    },
    {
      field: 'deskripsi',
      headerName: 'Isi Laporan',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params.row.deskripsi ?? '-'}</span>,
    },
    {
      field: 'createdAt',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <span>{params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY') : '-'}</span>
      ),
    },
    {
      field: 'kategori',
      headerName: 'Kategori',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params.row.kategori?.nama ?? '-'}</span>,
    },
    {
      field: 'unit',
      headerName: 'Unit Tertuju',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params.row.unit ?? '-'}</span>,
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
          {params.row.response ?? '-'}
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
        params.row.filePendukung ? (
          <IconButton size="small" href={params.row.filePendukung} target="_blank" title="Lihat File Pendukung">
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
        params.row.filePetugas ? (
          <IconButton size="small" href={params.row.filePetugas} target="_blank" title="Lihat File Petugas">
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
          params.row.status === 'PENDING'
            ? '#F59E0B'
            : params.row.status === 'PROCESS'
              ? '#3B82F6'
              : params.row.status === 'COMPLETED'
                ? '#10B981'
                : '#EF4444';
        return (
          <Chip
            label={params.row.status ?? '-'}
            sx={{
              color: textColor,
              fontWeight: 'bold',
              backgroundColor: 'transparent',
            }}
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
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem
              onClick={() => {
                selectedRow && handleViewOpen(selectedRow);
                setMenuAnchor(null);
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Lihat
            </MenuItem>
            {selectedRow?.status === 'COMPLETED' && (
              <MenuItem
                onClick={() => {
                  selectedRow && handleDelete(selectedRow);
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

  const mobileColumns: any = [
    {
      field: 'judul',
      headerName: 'Judul',
      flex: 1.5,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params: any) => (
        <Box sx={{ py: 1 }}>
          <span>{params.row.judul ?? '-'}</span>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <span>{params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY') : '-'}</span>
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
          params.row.status === 'PENDING'
            ? '#F59E0B'
            : params.row.status === 'PROCESS'
              ? '#3B82F6'
              : params.row.status === 'COMPLETED'
                ? '#10B981'
                : '#EF4444';
        return (
          <Chip
            label={params.row.status ?? '-'}
            sx={{
              color: textColor,
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              fontSize: '0.75rem',
            }}
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
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem
              onClick={() => {
                selectedRow && handleViewOpen(selectedRow);
                setMenuAnchor(null);
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Lihat
            </MenuItem>
            {selectedRow?.status === 'COMPLETED' && (
              <MenuItem
                onClick={() => {
                  selectedRow && handleDelete(selectedRow);
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

  const handleViewOpen = async (row: ComplaintWbs) => {
    try {
      const response = await api.get(`/PelaporanWbs/${row.id}`);
      const data = response.data.content;
      setSelectedRow({
        ...data,
        createdAt: dayjs(data.createdAt).format('MMM D, YYYY'),
        response: data.response || '-',
        filePendukung: data.filePendukung || '-',
        filePetugas: data.filePetugas || '-',
        lokasi: data.lokasi || '-',
      });
      setViewOpen(true);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat detail pengaduan.');
    }
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedRow(null);
  };

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
      ],
      ...complaints.map((c: ComplaintWbs) => [
        c.judul,
        c.deskripsi,
        c.createdAt ? dayjs(c.createdAt).format('DD/MM/YYYY') : '-',
        c.kategori?.nama,
        c.unit,
        c.status,
        c.response || '-',
        c.filePendukung || '-',
        c.filePetugas || '-',
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
      <CardHeader title="Tabel Pengaduan WBS" sx={{ textAlign: 'center' }} />
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Cari Judul Laporan"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: isMobile ? '70%' : '300px' }}
        />
        <IconButton onClick={handleExportCSV} title="Export CSV">
          <FileDownloadIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={complaints}
            columns={activeColumns}
            pageSizeOptions={[5, 10, 20]}
            pagination
            paginationMode="server"
            rowCount={totalRows}
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
            autoHeight
            slotProps={{
              toolbar: {
                sx: {
                  '& .MuiButtonBase-root': {
                    color: '#16404D',
                  },
                  '& .MuiIconButton-root': {
                    color: '#16404D',
                  },
                },
              },
            }}
          />
        )}
      </Box>
      <ViewComplaintModalWbs open={viewOpen} onClose={handleViewClose} complaint={selectedRow} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}