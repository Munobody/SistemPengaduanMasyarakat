import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface ComplaintWbs {
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
  kategori: { id: string; nama: string };
  unit: string;
  status: string;
  response?: string;
  filePendukung?: string;
  pihakTerlibat?: string;
  filePetugas?: string;
  lokasi?: string;
}

interface ViewComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: ComplaintWbs | null;
}

export const ViewComplaintModalWbs = ({ open, onClose, complaint }: ViewComplaintModalProps) => {
  if (!complaint) return null;

  // Warna berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B'; // Kuning
      case 'PROCESS':
        return '#3B82F6'; // Biru
      case 'COMPLETED':
        return '#10B981'; // Hijau
      default:
        return '#EF4444'; // Merah
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detail Pengaduan</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Judul</strong></TableCell>
                <TableCell>{complaint.judul || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Isi Laporan</strong></TableCell>
                <TableCell>{complaint.deskripsi || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Tanggal</strong></TableCell>
                <TableCell>{complaint.createdAt || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Kategori</strong></TableCell>
                <TableCell>{complaint.kategori?.nama || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Unit Tertuju</strong></TableCell>
                <TableCell>{complaint.unit || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Pihak Terlibat</strong></TableCell>
                <TableCell>{complaint.pihakTerlibat || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell>
                  <Chip
                    label={complaint.status}
                    sx={{
                      color: getStatusColor(complaint.status),
                      backgroundColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Tanggapan Petugas</strong></TableCell>
                <TableCell>{complaint.response || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>File Pendukung</strong></TableCell>
                <TableCell>
                  {complaint.filePendukung ? (
                    <IconButton href={complaint.filePendukung} target="_blank" title="Buka File Pendukung">
                      <AttachFileIcon />
                    </IconButton>
                  ) : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>File Petugas</strong></TableCell>
                <TableCell>
                  {complaint.filePetugas ? (
                    <IconButton href={complaint.filePetugas} target="_blank" title="Buka File Petugas">
                      <AttachFileIcon />
                    </IconButton>
                  ) : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Lokasi Kejadian</strong></TableCell>
                <TableCell>{complaint.lokasi || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#16404D' }}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};