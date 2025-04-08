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
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';

import 'react-toastify/dist/ReactToastify.css';

import api from '@/lib/api/api';

import { EditComplaintModal } from './modal/EditComplaintModal';
import { ViewComplaintModal } from './modal/ViewComplaintModal';

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
  kategori?: {
    id: string;
    nama: string;
  };
  unit?: {
    id: string;
    nama_unit: string;
  };
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
      const response = await api.get(`/pelaporan?page=${page}&rows=${pageSize}`);

      const data = response.data;
      if (data?.content) {
        setComplaints(data?.content);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data pengaduan.');
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    try {
      const response = await api.delete(`/pelaporan?ids=["${id}"]`, {
      });
  
      if (response.status === 200) {
        toast.success('Pengaduan berhasil dihapus!');
        fetchComplaints(); // Refresh data setelah penghapusan
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
        unit: data.unit
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
            ? '#F59E0B' // Kuning
            : params?.row?.status === 'PROCESS'
              ? '#3B82F6' // Biru
              : params?.row?.status === 'COMPLETED'
                ? '#10B981' // Hijau
                : '#EF4444'; // Merah

        return (
          <Chip
            label={params.row?.status ?? '-'}
            sx={{
              color: textColor,
              fontWeight: 'bold', // Opsional: agar lebih jelas
              backgroundColor: 'transparent', // Pastikan tidak ada background
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
             {(selectedRow?.status === 'COMPLETED' || selectedRow?.status === 'REJECTED') && (
            <MenuItem
              onClick={() => {
                selectedRow && handleDeleteComplaint(selectedRow.id);
                setMenuAnchor(null);
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Hapus
            </MenuItem>
          )}
            </Menu>
          </Box>
        );
      },
    },
  ];

  const handleViewOpen = async (row: Complaint) => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/${row.id}`, {
      });

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
        unit: data.unit
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
  const handleEditClose = () => {
    setEditOpen(false);
    setEditedComplaint(null);
  };

  const handleSaveChanges = async (field: keyof Complaint, value: any) => {
    if (!selectedRow?.id) return;
  
    try {
      const response = await api.patch(`/pelaporan/${selectedRow.id}`, {
        [field]: value
      });
  
      if (response.status === 200) {
        toast.success('Pengaduan berhasil diperbarui!');
        fetchComplaints(); // Refresh data after update
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
        complaint={editedComplaint} // Ensure editedComplaint contains the correct ID
        onSave={(field, value) => {
          console.log(`Field ${field} updated with value:`, value);
        }}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}
