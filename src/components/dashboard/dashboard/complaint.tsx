"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import dayjs from "dayjs";

export interface Complaint {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  targetUnit: string;
  complaintType: string;
  status: string;
}

export function LatestComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Complaint | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editedComplaint, setEditedComplaint] = useState<Complaint | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);

  // Fetch data from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        console.log("Fetching complaints...");
        const token = localStorage.getItem("custom-auth-token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pelaporan?page=${page}&rows=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
        console.log("API Response:", data);

        if (data?.content?.entries) {
          setComplaints(
            data.content.entries.map((entry: any) => ({
              id: entry.id,
              title: entry.judul || "Tidak Ada Judul",
              content: entry.deskripsi || "Tidak Ada Deskripsi",
              date: dayjs(entry.createdAt).format("MMM D, YYYY"),
              category: entry.kategori?.nama || "Tidak Ada",
              targetUnit: entry.unit?.nama_unit || "Tidak Ada",
              complaintType: "Belum Ditentukan",
              status: entry.status || "UNKNOWN",
            }))
          );
          setTotalData(data.content.totalData || 0);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, [page, pageSize]);

  // Search filter
  const filteredComplaints = complaints.filter((complaint) =>
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: "title", headerName: "Judul Laporan", flex: 1, headerAlign: "center", align: "center" },
    { field: "content", headerName: "Isi Laporan", flex: 2, headerAlign: "center", align: "center" },
    {
      field: "date",
      headerName: "Tanggal",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    { field: "category", headerName: "Kategori", flex: 1, headerAlign: "center", align: "center" },
    { field: "targetUnit", headerName: "Unit Tertuju", flex: 1, headerAlign: "center", align: "center" },
    { field: "complaintType", headerName: "Jenis Pengaduan", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Chip
          label={params.value}
          sx={{
            backgroundColor: params.value === "PENDING" ? "#F59E0B" : "#14B8A6",
            color: "white",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Aksi",
      flex: 0.5,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
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
          >
            <MenuItem onClick={() => { selectedRow && handleViewOpen(selectedRow); setMenuAnchor(null); }}>
              <VisibilityIcon fontSize="small" /> Lihat
            </MenuItem>
            <MenuItem onClick={() => { selectedRow && handleEditOpen(selectedRow); setMenuAnchor(null); }}>
              <EditIcon fontSize="small" /> Edit
            </MenuItem>
          </Menu>
        </>
      ),
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

  const handleEditOpen = (row: Complaint) => {
    setEditedComplaint(row);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditedComplaint(null);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Judul Laporan", "Isi Laporan", "Tanggal", "Kategori", "Unit Tertuju", "Jenis Pengaduan", "Status"],
      ...complaints.map((c) => [c.title, c.content, c.date, c.category, c.targetUnit, c.complaintType, c.status]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "complaints.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Card>
      <CardHeader title="Tabel Pengaduan Saya" sx={{ textAlign: "center" }} />
      <Divider />
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
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
      <Box sx={{ p: 2, height: 500, width: "100%" }}>
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
        />
      </Box>
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Detail Pengaduan</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Judul</strong></TableCell>
                    <TableCell>{selectedRow.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Isi</strong></TableCell>
                    <TableCell>{selectedRow.content}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Tanggal</strong></TableCell>
                    <TableCell>{selectedRow.date}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell>{selectedRow.category}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Unit Tertuju</strong></TableCell>
                    <TableCell>{selectedRow.targetUnit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Jenis Pengaduan</strong></TableCell>
                    <TableCell>{selectedRow.complaintType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>{selectedRow.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Pengaduan</DialogTitle>
        <DialogContent>
          {editedComplaint && (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Judul</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.title}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, title: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Isi</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.content}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, content: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.category}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, category: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Unit Tertuju</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.targetUnit}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, targetUnit: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Jenis Pengaduan</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.complaintType}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, complaintType: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        margin="dense"
                        value={editedComplaint.status}
                        onChange={(e) => setEditedComplaint({ ...editedComplaint, status: e.target.value })}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Batal</Button>
          <Button onClick={() => { /* Tambahkan logika untuk menyimpan perubahan */ }}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}