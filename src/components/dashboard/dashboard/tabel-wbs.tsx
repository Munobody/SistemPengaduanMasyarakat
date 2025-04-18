'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  const [complaints, setComplaints] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ComplaintWbs | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editedComplaint, setEditedComplaint] = useState<ComplaintWbs | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useMediaQuery('(max-width:600px)'); // Detect mobile screen size

  const fetchComplaints = async () => {
    try {
      const response = await api.get(`/PelaporanWbs?page=${page}&rows=${pageSize}`);

      const data = response.data;
      if (data?.content) {
        setComplaints(data?.content);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data pengaduan.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize]);

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
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.unit ?? '-'}</span>,
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
      renderCell: (params: any) => {
        return (
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
            </Menu>
          </Box>
        );
      },
    },
  ];

  const mobileColumns: any = [
    {
      field: 'title',
      headerName: 'Judul',
      flex: 1.5,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params: any) => (
        <Box sx={{ py: 1 }}>
          <span>{params?.row?.judul ?? '-'}</span>
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
          </Menu>
        </Box>
      ),
    },
  ];

  const activeColumns = isMobile ? mobileColumns : columns; // Use mobileColumns for mobile view

  const handleViewOpen = async (row: ComplaintWbs) => {
    try {
      const response = await api.get(`/PelaporanWbs/${row.id}`);
      const data = response.data.content;

      setSelectedRow({
        id: data.id,
        judul: data.judul,
        deskripsi: data.deskripsi,
        createdAt: dayjs(data.createdAt).format('MMM D, YYYY'),
        kategori: data.kategori,
        unit: data.unit,
        status: data.status,
        pihakTerlibat: data.pihakTerlibat,
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

  const filteredComplaints = complaints?.entries?.filter((complaint: ComplaintWbs) =>
    complaint.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedRow(null);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditedComplaint(null);
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
        'Harapan Pelapor',
      ],
      ...complaints.map((c: any) => [
        c.title,
        c.content,
        c.date,
        c.category,
        c.targetUnit,
        c.status,
        c.response,
        c.filePendukung || '-',
        c.filePetugas || '-',
        c.harapan_pelapor,
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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Cari Judul Laporan"
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton onClick={handleExportCSV} sx={{ ml: 2 }}>
          <FileDownloadIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, width: '100%' }}>
        <DataGrid
          rows={filteredComplaints ?? []}
          columns={activeColumns}
          pageSizeOptions={[5, 10, 20]}
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
      </Box>
      <ViewComplaintModalWbs open={viewOpen} onClose={handleViewClose} complaint={selectedRow} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}
