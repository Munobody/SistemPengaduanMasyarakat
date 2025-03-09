import { useEffect, useRef, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, CircularProgress, Container, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/pelaporan`;

// Update the Pengaduan interface
interface Pengaduan {
  id: string;
  judul: string;
  deskripsi: string;
  kategoriId: string;
  nameUnit: string;
  pelaporId: string;
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
}

// Update the component props to accept id
interface KelolaPengaduanPageProps {
  id?: string;
}

export default function KelolaPengaduanPage({ id }: KelolaPengaduanPageProps) {
  // Add new state for complaint data
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

  const statusOptions = ['PENDING', 'PROSES', 'SELESAI'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/units`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori`),
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
        const token = localStorage.getItem('custom-auth-token');
        const response = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.content) {
          const complaintData = response.data.content;
          console.log('📋 Raw complaint data:', complaintData); // Debug log
  
          // Ensure kategori data exists
          if (!complaintData.kategori) {
            // If kategori is missing, fetch it separately
            try {
              const kategoriResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/kategori/${complaintData.kategoriId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              
              if (kategoriResponse.data.content) {
                complaintData.kategori = {
                  id: kategoriResponse.data.content.id,
                  nama: kategoriResponse.data.content.nama,
                };
              }
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
        }
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

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      toast.error('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    let fileUrl = '';
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
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
      const response = await axios.post(API_URL, values, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

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

  // Update handleResponseSubmit to use complaint ID
  const handleResponseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complaint?.id) {
      toast.error('ID pengaduan tidak ditemukan');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      toast.error('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/pelaporan/${complaint.id}`,
        {
          status: selectedStatus,
          response: responseText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log('✅ Tanggapan berhasil diperbarui:', response.data);
        toast.success('Tanggapan berhasil diperbarui!');

        // Update local state
        setComplaint((prev) =>
          prev
            ? {
                ...prev,
                status: selectedStatus,
                response: responseText,
              }
            : null
        );

        // Reset form if needed
        responseFormRef.current?.reset();
        setResponseText('');
      }
    } catch (error: any) {
      console.error('❌ Gagal memperbarui tanggapan:', error.response?.data);
      toast.error(error.response?.data?.message || 'Gagal memperbarui tanggapan');
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
                    <Typography variant="body1">{complaint.nameUnit}</Typography>
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
