'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Card, CardHeader, Chip, Divider, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
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
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Complaint | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editedComplaint, setEditedComplaint] = useState<Complaint | null>(null);
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);

  useEffect(() => {
    const fetchUnitsAndCategories = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          toast.error('Anda harus login terlebih dahulu.');
          return;
        }

        const [unitResponse, categoryResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const unitList = unitResponse.data?.content?.entries.map((unit: { nama_unit: string }) => unit.nama_unit) || [];
        const categoryList =
          categoryResponse.data?.content?.entries.map((category: { id: string; nama: string }) => ({
            id: category.id,
            nama: category.nama,
          })) || [];

        setUnits(unitList);
        setCategories(categoryList);
      } catch (error: any) {
        console.error('Error fetching units and categories:', error);
        toast.error(error.response?.data?.message || 'Gagal memuat data unit dan kategori.');
      }
    };

    fetchUnitsAndCategories();
  }, []);

// Update the fetchComplaints function mapping
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
    if (data?.content?.entries) {
      setComplaints(
        data.content.entries.map((entry: any) => ({
          id: entry.id,
          title: entry.judul || 'Tidak Ada Judul',
          content: entry.deskripsi || 'Tidak Ada Deskripsi',
          date: dayjs(entry.createdAt).format('MMM D, YYYY'),
          category: entry.kategori?.nama || 'Tidak Ada',
          targetUnit: entry.unit?.nama_unit || 'Tidak Ada',
          complaintType: 'Belum Ditentukan',
          status: entry.status || 'PENDING',
          response: entry.response || '-',
          filePendukung: entry.filePendukung || '',
          filePetugas: entry.filePetugas || '', // Changed null to empty string for consistency
          harapan_pelapor: entry.harapan_pelapor || '-'
        }))
      );
      console.log('Fetched complaints:', data.content.entries); // Debug log
      setTotalData(data.content.totalData || 0);
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
      harapan_pelapor: data.harapan_pelapor || '-'
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

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Judul Laporan', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'content', headerName: 'Isi Laporan', flex: 2, headerAlign: 'center', align: 'center' },
    {
      field: 'date',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    { field: 'category', headerName: 'Kategori', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'targetUnit', headerName: 'Unit Tertuju', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          sx={{
            backgroundColor:
              params.value === 'PENDING'
                ? '#F59E0B'
                : params.value === 'PROSES'
                  ? '#3B82F6'
                  : params.value === 'SELESAI'
                    ? '#10B981'
                    : '#EF4444',
            color: 'white',
          }}
        />
      ),
    },
    {
      field: 'response',
      headerName: 'Tanggapan Petugas',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal', 
          wordWrap: 'break-word',
          width: '100%',
          textAlign: 'center',
          padding: '8px'
        }}>
          {params.value || '-'}
        </div>
      ),
    },
    {
      field: 'filePendukung',
      headerName: 'File Pendukung',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        params.value ? (
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
      renderCell: (params) =>
        params.value ? (
          <IconButton size="small" href={params.value} target="_blank" title="Lihat File Petugas">
            <AttachFileIcon />
          </IconButton>
        ) : (
          '-'
        ),
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      flex: 0.5,
      sortable: false,
      filterable: false, // Add this
      hideable: false,  // Add this
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
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
            <MenuItem
              onClick={() => {
                selectedRow && handleEditOpen(selectedRow);
                setMenuAnchor(null);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
          </Menu>
        </Box>
      ),
    }
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
        'Harapan Pelapor'
      ],
      ...complaints.map((c) => [
        c.title,
        c.content,
        c.date,
        c.category,
        c.targetUnit,
        c.status,
        c.response,
        c.filePendukung || '-',
        c.filePetugas || '-',
        c.harapan_pelapor
      ]),
    ]
      .map((e) => e.map(x => `"${(x || '').toString().replace(/"/g, '""')}"`).join(','))
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
          rows={filteredComplaints}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          pagination
          paginationMode="server"
          rowCount={totalData}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          disableColumnMenu
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
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
        categories={categories}
        units={units}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}
