import { useEffect, useRef, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, CircularProgress, Container, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { useRouter } from 'next/navigation';

import api from '@/lib/api/api'; // Asumsi token sudah dikelola di sini

interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  pihakTerlibat: string;
  tanggalKejadian: string;
  lokasi: string;
  kategoriId: string;
  unit: string;
  pelaporId: string;
  status: string;
  approvedBy: string | null;
  response: string;
  filePendukung: string;
  filePetugas: string | null;
  createdAt: string;
  updatedAt: string;
  kategori?: {
    id: string;
    nama: string;
  };
}

interface KelolaPengaduanWbsPageProps {
  id?: string;
}

export default function KelolaPengaduanWbsPage({ id }: KelolaPengaduanWbsPageProps) {
  const router = useRouter();
  const [complaint, setComplaint] = useState<Pengaduan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [responseText, setResponseText] = useState<string>('');
  const [petugasFile, setPetugasFile] = useState<File | null>(null);
  const responseFormRef = useRef<HTMLFormElement>(null);

  const statusOptions = ['PENDING', 'PROCESS', 'REJECTED', 'COMPLETED'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await api.get(`PelaporanWbs/${id}`);
        const complaintData = response.data.content;

        if (!complaintData.kategori) {
          const kategoriResponse = await api.get(`kategori/${complaintData.kategoriId}`);
          complaintData.kategori = kategoriResponse.data.content;
        }

        setComplaint(complaintData);
        setSelectedStatus(complaintData.status);
        setResponseText(complaintData.response || '');
      } catch (error: any) {
        console.error('Gagal memuat detail pengaduan:', error.response?.data || error.message);
        toast.error('Gagal memuat detail pengaduan');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // Fungsi untuk mengupload file
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return uploadResponse.data.content.secure_url;
    } catch (error: any) {
      console.error('Gagal mengunggah file:', error.response?.data || error.message);
      toast.error('Gagal mengunggah file');
      throw error;
    }
  };

  // Handle submit tanggapan
  const handleResponseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint?.id) {
      toast.error('ID pengaduan tidak ditemukan');
      return;
    }

    setLoading(true);

    try {
      let filePetugasUrl = complaint.filePetugas;

      // Upload file petugas jika ada
      if (petugasFile) {
        filePetugasUrl = await handleFileUpload(petugasFile);
      }

      // Payload untuk mengupdate status dan response
      const payload = {
        status: selectedStatus,
        response: responseText.trim(),
        filePetugas: filePetugasUrl || null,
      };

      // Kirim permintaan PUT ke endpoint /PelaporanWbs/:id
      const response = await api.put(`PelaporanWbs/${complaint.id}`, payload);

      if (response.status === 200) {
        toast.success('Status dan tanggapan berhasil diperbarui!');

        // Redirect ke dashboard setelah berhasil
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Gagal memperbarui status dan tanggapan:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Gagal memperbarui status dan tanggapan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Grid container spacing={4}>
          {/* Detail Pengaduan */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 6, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom textAlign="center" sx={{ pb: 4 }}>
                Detail Pengaduan
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : complaint ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID Pelapor
                    </Typography>
                    <Typography variant="body1">{complaint.pelaporId}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Judul Laporan
                    </Typography>
                    <Typography variant="body1">{complaint.judul}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deskripsi
                    </Typography>
                    <Typography variant="body1" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {complaint.deskripsi}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pihak Terlibat
                    </Typography>
                    <Typography variant="body1">{complaint.pihakTerlibat}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tanggal Kejadian
                    </Typography>
                    <Typography variant="body1">{formatDate(complaint.tanggalKejadian)}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lokasi
                    </Typography>
                    <Typography variant="body1">{complaint.lokasi}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kategori
                    </Typography>
                    <Typography variant="body1">{complaint.kategori?.nama || 'Tidak ada kategori'}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Unit
                    </Typography>
                    <Typography variant="body1">{complaint.unit}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">{complaint.status}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tanggapan Petugas
                    </Typography>
                    <Typography variant="body1">{complaint.response || '-'}</Typography>
                  </Grid>

                  {complaint.filePendukung && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        File Pendukung
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        href={complaint.filePendukung}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<AttachFileIcon />}
                        sx={{ mt: 1 }}
                      >
                        Lihat File
                      </Button>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography color="text.secondary" align="center">
                  Data pengaduan tidak ditemukan
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Form Pengelolaan */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 6, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom textAlign="center" sx={{ pb: 4 }}>
                Form Pengelolaan Laporan
              </Typography>
              <form ref={responseFormRef} onSubmit={handleResponseSubmit}>
                <Grid container spacing={2} direction="column">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      margin="normal"
                      required
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tanggapan Petugas"
                      multiline
                      rows={4}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      margin="normal"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<AttachFileIcon />}
                      sx={{ bgcolor: '#4A628A', '&:hover': { bgcolor: '#3A4F6A' } }}
                    >
                      Upload File Hasil
                      <input type="file" hidden onChange={(e) => setPetugasFile(e.target.files?.[0] || null)} />
                    </Button>
                    {petugasFile && <Typography sx={{ mt: 2 }}>File terpilih: {petugasFile.name}</Typography>}
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          width: '30%',
                          py: 1.5,
                          bgcolor: '#4A628A',
                          '&:hover': { bgcolor: '#3A4F6A' },
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Mengirim...' : 'Kirim Tanggapan'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
