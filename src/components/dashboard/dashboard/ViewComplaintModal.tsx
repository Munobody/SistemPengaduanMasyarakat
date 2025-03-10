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
  Chip,
  Typography,
} from '@mui/material';
import { Complaint } from './complaint';

interface ViewComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

export const ViewComplaintModal = ({ open, onClose, complaint }: ViewComplaintModalProps) => {
  if (!complaint) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detail Pengaduan</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Judul</strong></TableCell>
                <TableCell>{complaint.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Isi</strong></TableCell>
                <TableCell>{complaint.content}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Tanggal</strong></TableCell>
                <TableCell>{complaint.date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Kategori</strong></TableCell>
                <TableCell>{complaint.category}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Unit Tertuju</strong></TableCell>
                <TableCell>{complaint.targetUnit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell>
                  <Chip
                    label={complaint.status}
                    sx={{
                      backgroundColor: 
                        complaint.status === "PENDING" ? "#F59E0B" : 
                        complaint.status === "PROCESS" ? "#3B82F6" :
                        complaint.status === "SELESAI" ? "#10B981" : "#EF4444",
                      color: "white",
                    }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Tanggapan Petugas</strong></TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      whiteSpace: 'pre-wrap',
                      color: complaint.response === '-' ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {complaint.response}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};