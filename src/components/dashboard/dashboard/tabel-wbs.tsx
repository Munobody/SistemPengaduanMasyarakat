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
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
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

export function TabelWbs(): JSX.Element {
  const [complaints, setComplaints] = useState<ComplaintWbs[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ComplaintWbs | null>(null);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const statusOrder: Record<string, number> = {
    PENDING: 1,
    PROCESS: 2,
    COMPLETED: 3,
    REJECTED: 4,
  };

  const fetchComplaints = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get(`/PelaporanWbs?page=${page}&rows=${pageSize}&search=${searchQuery}`);
      const data = response.data;

      if (data?.content?.entries) {
        const sortedComplaints = data.content.entries.sort((a: ComplaintWbs, b: ComplaintWbs) => {
          const statusComparison = statusOrder[a.status] - statusOrder[b.status];
          if (statusComparison !== 0) return statusComparison;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setComplaints(sortedComplaints);
        setTotalRows(data.content.totalRows || sortedComplaints.length);
      } else {
        setComplaints([]);
        setTotalRows(0);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal memuat data pengaduan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect((): void => {
    void fetchComplaints();
  }, [page, pageSize, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleDelete = async (row: ComplaintWbs): Promise<void> => {
    try {
      await api.delete(`/PelaporanWbs?ids=["${row.id}"]`);
      toast.success('Pengaduan berhasil dihapus.');
      void fetchComplaints();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal menghapus pengaduan.');
      }
    } finally {
      setMenuAnchor(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'judul',
      headerName: 'Judul Laporan',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <span>{params.row.judul ?? '-'}</span>,
    },
    {
      field: 'deskripsi',
      headerName: 'Isi Laporan',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <span>{params.row.deskripsi ?? '-'}</span>,
    },
    {
      field: 'createdAt',
      headerName: 'Tanggal',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span>{params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY') : '-'}</span>
      ),
    },
    {
      field: 'kategori',
      headerName: 'Kategori',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <span>{params.row.kategori?.nama ?? '-'}</span>,
    },
    {
      field: 'unit',
      headerName: 'Unit Tertuju',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <span>{params.row.unit ?? '-'}</span>,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
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

  const handleViewOpen = async (row: ComplaintWbs): Promise<void> => {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal memuat detail pengaduan.');
      }
    }
  };

  const handleViewClose = (): void => {
    setViewOpen(false);
    setSelectedRow(null);
  };

  const handlePaginationChange = (model: GridPaginationModel): void => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
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
      </Box>
      <Box sx={{ p: 2, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={complaints}
            columns={columns}
            pageSizeOptions={[5, 10, 20, 100]}
            pagination
            paginationMode="server"
            rowCount={totalRows}
            onPaginationModelChange={handlePaginationChange}
            disableColumnMenu
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnSelector
            disableColumnResize
            disableColumnSorting
            autoHeight
          />
        )}
      </Box>
      <ViewComplaintModalWbs open={viewOpen} onClose={handleViewClose} complaint={selectedRow} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Card>
  );
}