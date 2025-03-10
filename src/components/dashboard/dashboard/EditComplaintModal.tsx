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
  TextField,
  MenuItem,
} from '@mui/material';
import { Complaint } from './complaint';

interface EditComplaintModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSave: () => void;
  onChange: (updatedComplaint: Complaint) => void;
  categories: { id: string; nama: string }[];
  units: string[];
}

export const EditComplaintModal = ({
  open,
  onClose,
  complaint,
  onSave,
  onChange,
  categories,
  units,
}: EditComplaintModalProps) => {
  if (!complaint) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Pengaduan</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Judul</strong></TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    value={complaint.title}
                    onChange={(e) => onChange({ ...complaint, title: e.target.value })}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Isi</strong></TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    multiline
                    rows={4}
                    value={complaint.content}
                    onChange={(e) => onChange({ ...complaint, content: e.target.value })}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Kategori</strong></TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    margin="dense"
                    value={complaint.category}
                    onChange={(e) => onChange({ ...complaint, category: e.target.value })}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.nama}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Unit Tertuju</strong></TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    margin="dense"
                    value={complaint.targetUnit}
                    onChange={(e) => onChange({ ...complaint, targetUnit: e.target.value })}
                  >
                    {units.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    margin="dense"
                    value={complaint.status}
                    disabled
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};