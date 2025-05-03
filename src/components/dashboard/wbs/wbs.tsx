'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '@/lib/api/api';

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: string; // Ensure this is explicitly typed as string
}

interface Category {
  id: string;
  nama: string;
}

const WBSReportForm = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [jenisUnitOptions, setJenisUnitOptions] = useState<string[]>([]);
  const [selectedJenisUnit, setSelectedJenisUnit] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    lokasi: '',
    pihakTerlibat: '',
    kategoriId: '',
    tanggalKejadian: dayjs().format('YYYY-MM-DD'),
  });

  // Fetch data for units and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          api.get('/units?page=1&rows=100&orderKey=nama_unit&orderRule=asc'),
          api.get('/kategoriWbs'),
        ]);

        const unitList: Unit[] = unitResponse.data?.content?.entries || [];
        const categoryList = categoryResponse.data?.content?.entries || [];
        const uniqueJenisUnit = Array.from(new Set(unitList.map((unit) => unit.jenis_unit))).sort();

        setJenisUnitOptions(uniqueJenisUnit);
        setUnits(unitList);
        setCategories(categoryList);
        setCategories(categoryList.map((category: any) => ({ id: category.id, nama: category.nama })));

        // Set default selections
        if (categoryList.length > 0) setSelectedCategory(categoryList[0].id);
        if (uniqueJenisUnit.length > 0) setSelectedJenisUnit(uniqueJenisUnit[0]);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedJenisUnit) {
      const filtered = units.filter((unit) => unit.jenis_unit === selectedJenisUnit);
      setFilteredUnits(filtered);
      setSelectedUnit(filtered.length > 0 ? filtered[0].id : '');
    } else {
      setFilteredUnits([]);
      setSelectedUnit('');
    }
  }, [selectedJenisUnit, units]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    let fileUrl = '';

    if (file) {
      const uploadData = new FormData();
      uploadData.append('file', file);

      try {
        const uploadResponse = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
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

    const requestBody = {
      ...formData,
      kategoriId: selectedCategory,
      tanggalKejadian: date?.format('YYYY-MM-DD'),
      unit: selectedUnit,
      filePendukung: fileUrl,
    };

    try {
      const response = await api.post('/PelaporanWbs', requestBody);

      if (response.status === 201) {
        toast.success('Laporan WBS berhasil dikirim!');
        setFormData({
          judul: '',
          deskripsi: '',
          lokasi: '',
          pihakTerlibat: '',
          kategoriId: '',
          tanggalKejadian: dayjs().format('YYYY-MM-DD'),
        });
        setSelectedCategory('');
        setSelectedUnit('');
        setDate(dayjs());
        setFile(null);
      } else {
        throw new Error(response.data.message || 'Gagal mengirim laporan.');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error.response?.data || error.message);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        flexGrow: 1, 
        bgcolor: '#E3FEF7',
        minHeight: '100vh', 
        py: { xs: 2, sm: 4 } 
      }}>
        <Container maxWidth="lg">
          {/* Form Header Section */}
          <Box sx={{ 
            mb: 4,
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 1,
            borderLeft: '4px solid #135D66'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#003C43', 
              fontWeight: 600,
              textAlign: 'center' 
            }}>
              Form Pengaduan WBS
            </Typography>
            <Typography variant="body1" sx={{ 
              mt: 2,
              color: 'text.secondary',
              textAlign: 'center' 
            }}>
              Silahkan isi form pengaduan di bawah ini dengan lengkap dan jelas
            </Typography>
          </Box>

          {/* Main Form Section */}
          <Paper elevation={3} sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: 2,
            bgcolor: 'white'
          }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Judul & Deskripsi Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#135D66',
                    mb: 2,
                    borderBottom: '2px solid #E3FEF7',
                    pb: 1
                  }}>
                    Detail Laporan
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Judul Laporan"
                        name="judul"
                        required
                        value={formData.judul}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#135D66',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Isi Laporan"
                        name="deskripsi"
                        multiline
                        rows={4}
                        required
                        value={formData.deskripsi}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#135D66',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Unit Selection Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#135D66',
                    mb: 2,
                    borderBottom: '2px solid #E3FEF7',
                    pb: 1
                  }}>
                    Informasi Unit
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Jenis Unit</InputLabel>
                        <Select
                          value={selectedJenisUnit}
                          onChange={(e) => setSelectedJenisUnit(e.target.value)}
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#135D66',
                            },
                          }}
                        >
                          {jenisUnitOptions.map((jenis) => (
                            <MenuItem key={jenis} value={jenis}>
                              {jenis}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required disabled={!selectedJenisUnit}>
                        <InputLabel>Unit Yang Dilapor</InputLabel>
                        <Select
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#135D66',
                            },
                          }}
                        >
                          {filteredUnits.map((unit) => (
                            <MenuItem key={unit.id} value={unit.id}>
                              {unit.nama_unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Additional Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#135D66',
                    mb: 2,
                    borderBottom: '2px solid #E3FEF7',
                    pb: 1
                  }}>
                    Informasi Tambahan
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Kategori Laporan</InputLabel>
                        <Select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#135D66',
                            },
                          }}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.nama}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Tanggal Kejadian"
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Lokasi Kejadian"
                        name="lokasi"
                        required
                        value={formData.lokasi}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nama Yang Dilaporkan"
                        name="pihakTerlibat"
                        required
                        value={formData.pihakTerlibat}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* File Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#135D66',
                    mb: 2,
                    borderBottom: '2px solid #E3FEF7',
                    pb: 1
                  }}>
                    Dokumen Pendukung
                  </Typography>
                  <Box sx={{ 
                    border: '2px dashed #135D66',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center'
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        color: '#135D66',
                        borderColor: '#135D66',
                        '&:hover': {
                          borderColor: '#003C43',
                          bgcolor: 'rgba(19, 93, 102, 0.1)',
                        },
                      }}
                    >
                      Upload File
                      <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {file && (
                      <Typography sx={{ mt: 2, color: '#135D66' }}>
                        File terpilih: {file.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4 
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#135D66',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#003C43',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#77B0AA',
                    },
                  }}
                >
                  {loading ? 'Mengirim...' : 'Kirim Laporan'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default WBSReportForm;