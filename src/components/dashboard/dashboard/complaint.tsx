'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
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
} from '@mui/material';
import { DataGrid, } from '@mui/x-data-grid';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { EditComplaintModal } from './EditComplaintModal';
import { ViewComplaintModal } from './ViewComplaintModal';

export interface Complaint {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  targetUnit: string;
  complaintType: string;
  response: string;
  status: string;
  filePendukung: string;
  filePetugas: string;
  harapan_pelapor: string;
}

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

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu.');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan?page=${page}&rows=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.content) {
        setComplaints(data?.content);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data pengaduan.');
    }
  };

  // Update the handleEditOpen function mapping
  const handleEditOpen = async (row: Complaint) => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu.');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/${row.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.content;
      console.log('Edit complaint data:', data); // Debug log
      setEditedComplaint({
        id: data.id,
        title: data.judul || 'Tidak Ada Judul',
        content: data.deskripsi || 'Tidak Ada Deskripsi',
        date: dayjs(data.createdAt).format('MMM D, YYYY'),
        category: data.kategori?.id || '',
        targetUnit: data.unit?.nama_unit || '',
        complaintType: 'Belum Ditentukan',
        status: data.status || 'PENDING',
        response: data.response || '',
        filePendukung: data.filePendukung || '',
        filePetugas: data.filePetugas || '', // Changed null to empty string
        harapan_pelapor: data.harapan_pelapor || '-',
      });
      setEditOpen(true);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat detail pengaduan.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize]);

  const columns: any = [
    { field: 'title',
       headerName: 'Judul Laporan',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span>{params?.row?.judul ?? '-'}</span>,
    },
    { field: 'content', 
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
      renderCell: (params: any) => <span>{params?.row?.createdAt ?? '-'}</span>,
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
      renderCell: (params: any) => <span>{params?.row?.nameUnit ?? '-'}</span>,
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
      renderCell: (params: any) => ( 
        params?.row?.filePendukung ? (
          <IconButton size="small" href={params.value} target="_blank" title="Lihat File Pendukung">
        <AttachFileIcon />
          </IconButton>
        ) : '-'
      ),
        },
        {
      field: 'filePetugas', 
      headerName: 'File Petugas',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        params?.row?.filePetugas ? (
        <IconButton size="small" href={params.value} target="_blank" title="Lihat File Petugas">
          <AttachFileIcon />
        </IconButton>
        ) : '-'
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => {
        const backgroundColor =
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
              backgroundColor: backgroundColor,
              color: 'white',
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

                {!['PROCESS', 'REJECTED', 'COMPLETED'].includes(selectedRow?.status ?? '-') && (
                <MenuItem
                  onClick={() => {
                  selectedRow && handleEditOpen(selectedRow);
                  setMenuAnchor(null);
                  }}
                >
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                )}
            </Menu>
          </Box>
        );
      },
    },
  ];

  const handleViewOpen = (row: Complaint) => {
    setSelectedRow(row);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedRow(null);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditedComplaint(null);
  };

  const handleSaveChanges = async () => {
    if (!editedComplaint) return;

    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu.');
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/pelaporan/${editedComplaint.id}`,
        {
          judul: editedComplaint.title,
          deskripsi: editedComplaint.content,
          kategoriId: editedComplaint.category,
          nameUnit: editedComplaint.targetUnit,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Pengaduan berhasil diperbarui!');
        setEditOpen(false);
        setEditedComplaint(null);
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengaduan.');
    }
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
      <CardHeader title="Tabel Pengaduan Saya" sx={{ textAlign: 'center' }} />
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
      <Box sx={{ p: 2, height: 500, width: '100%' }}>
        <DataGrid
          rows={complaints?.entries ?? []}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          pagination
          paginationMode="server"
          rowCount={complaints?.totalData ?? 0}
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
      <ViewComplaintModal open={viewOpen} onClose={handleViewClose} complaint={selectedRow} />

      <EditComplaintModal
        open={editOpen}
        onClose={handleEditClose}
        complaint={editedComplaint}
        onSave={handleSaveChanges}
        onChange={setEditedComplaint}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}
