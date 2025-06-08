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


export interface Complaint {
  kategoriId: string;
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
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

interface ViewComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

export const ViewComplaintModal = ({ open, onClose, complaint }: ViewComplaintModalProps) => {
  if (!complaint) return null;
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
                <TableCell>{complaint.nameUnit || '-'}</TableCell>
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
                  border: 'none', 
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
                    <IconButton 
                      href={complaint.filePendukung} 
                      target="_blank"
                      title="Buka File Pendukung"
                    >
                      <AttachFileIcon />
                    </IconButton>
                  ) : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>File Petugas</strong></TableCell>
                <TableCell>
                  {complaint.filePetugas ? (
                    <IconButton 
                      href={complaint.filePetugas} 
                      target="_blank"
                      title="Buka File Petugas"
                    >
                      <AttachFileIcon />
                    </IconButton>
                  ) : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Harapan Pelapor</strong></TableCell>
                <TableCell>{complaint.harapan_pelapor || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#16404D' }} >Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};
