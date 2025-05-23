import { useEffect, useRef, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, CircularProgress, Container, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  pelaporId: string;
  NIK: string;
  status: string;
  approvedBy: string | null;
  harapan_pelapor: string | null;
  filePendukung: string;
  response: string;
  filePetugas: string;
  kategori?: {
    id: string;
    nama: string;
  };
  unit?: {
    id: string;
    nama_unit: string;
  }
}

interface KelolaPengaduanPageProps {
  id?: string;
}

export default function KelolaPengaduanPage({ id }: KelolaPengaduanPageProps) {
  const router = useRouter();
  const [complaint, setComplaint] = useState<Pengaduan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [responseText, setResponseText] = useState<string>('');
  const [petugasFile, setPetugasFile] = useState<File | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const formRef = useRef<HTMLFormElement>(null);
  const responseFormRef = useRef<HTMLFormElement>(null);

  const statusOptions = ['PENDING', 'PROCESS', 'REJECTED', 'COMPLETED'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          api.get('/units'),
          api.get('/kategori'),
        ]);

        const unitList = unitResponse.data?.content?.entries.map((unit: { nama_unit: string }) => unit.nama_unit) || [];
        const categoryList =
          categoryResponse.data?.content?.entries.map((category: { id: string; nama: string }) => ({
            id: category.id,
            nama: category.nama,
          })) || [];

        setUnits(unitList);
        setCategories(categoryList);

        if (categoryList.length > 0) setSelectedCategory(categoryList[0].id);
        if (unitList.length > 0) setSelectedUnit(unitList[0]);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await api.get(`/pelaporan/${id}`);
        const complaintData = response.data.content;

        if (!complaintData.kategori) {
          try {
            const kategoriResponse = await api.get(`/kategori/${complaintData.kategoriId}`);
            complaintData.kategori = kategoriResponse.data.content;
          } catch (error) {
            console.error('❌ Gagal memuat data kategori:', error);
          }
        }

        setComplaint(complaintData);
        setSelectedCategory(complaintData.kategoriId);
        setSelectedUnit(complaintData.nameUnit);
        setSelectedStatus(complaintData.status);
        setResponseText(complaintData.response || '');

        console.log('✅ Detail pengaduan dengan kategori:', complaintData);
      } catch (error: any) {
        console.error('❌ Gagal memuat detail pengaduan:', error.response?.data);
        toast.error('Gagal memuat detail pengaduan');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    let fileUrl = '';
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.status === 200) {
          fileUrl = uploadResponse.data.content.secure_url;
        } else {
          throw new Error('Gagal mengunggah file.');
        }
      } catch (error: any) {
        console.error('Error uploading file:', error.response?.data || error.message);
        toast.error('Gagal mengunggah file.');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(formRef.current!);
    const values = {
      judul: formData.get('title') as string,
      deskripsi: formData.get('description') as string,
      status: 'PENDING',
      nameUnit: selectedUnit,
      response: '',
      kategoriId: selectedCategory,
      filePendukung: fileUrl,
      filePetugas: '',
    };

    try {
      const response = await api.post('/pelaporan', values);

      if (response.status === 201) {
        toast.success('Laporan berhasil dikirim!');
        formRef.current!.reset();
        setSelectedFile(null);
      } else {
        toast.error('Gagal mengirim laporan.');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error.response?.data || error.message);
      toast.error('Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complaint?.id) {
      toast.error('ID pengaduan tidak ditemukan');
      return;
    }

    setLoading(true);

    try {
      let filePetugasUrl = '';
      if (petugasFile) {
        const formData = new FormData();
        formData.append('file', petugasFile);

        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.status === 200) {
          filePetugasUrl = uploadResponse.data.content.secure_url;
          console.log('✅ File berhasil diupload:', filePetugasUrl);
        } else {
          throw new Error('Gagal mengunggah file.');
        }
      }

      const payload = {
        status: selectedStatus === 'PROSES' ? 'PROCESS' : selectedStatus,
        response: responseText.trim(),
        filePetugas: filePetugasUrl || complaint.filePetugas || null,
      };

      console.log('📝 Mengirim tanggapan:', payload);

      const response = await api.put(`/pelaporan/${complaint.id}`, payload);

      if (response.status === 200) {
        console.log('✅ Tanggapan berhasil diperbarui:', response.data);
        toast.success('Tanggapan berhasil diperbarui!');
        setComplaint((prev) =>
          prev
            ? {
                ...prev,
                status: selectedStatus,
                response: responseText,
                filePetugas: filePetugasUrl || prev.filePetugas,
              }
            : null
        );

        setResponseText('');
        setPetugasFile(null);

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Gagal memperbarui tanggapan:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status code:', error.response?.status);
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui tanggapan. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Grid container spacing={4}>
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
                    {complaint.NIK ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                      NIK Pelapor
                      </Typography>
                      <Typography variant="body1">{complaint.NIK}</Typography>
                    </Grid>
                    ) : (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                      ID Pelapor
                      </Typography>
                      <Typography variant="body1">{complaint.pelaporId}</Typography>
                    </Grid>
                    )}

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
                    <Typography
                      variant="body1"
                      sx={{
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {complaint.deskripsi}
                    </Typography>
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
                    <Typography variant="body1">{complaint.unit?.nama_unit}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">{complaint.status}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Harapan Pelapor
                    </Typography>
                    <Typography variant="body1">{complaint.harapan_pelapor || '-'}</Typography>
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
                    id="status-select" 
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
                    id="response-text" 
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
                    <input
                      type="file"
                      hidden
                      id="file-upload" 
                      onChange={(e) => setPetugasFile(e.target.files?.[0] || null)}
                    />
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