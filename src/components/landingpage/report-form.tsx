'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { AttachFile, Delete } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/api/api';

interface Category {
  id: string;
  nama: string;
}

interface Unit {
  id: string;
  nama_unit: string;
}

const ReportForm: React.FC = (): React.JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileName, setFileName] = useState('');
  const [rowsPerPage] = useState(100);
  const [page] = useState(0);

  // Memoize data fetching to prevent unnecessary re-renders
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchUnits(), fetchCategories()]);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };

    fetchData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        `/kategori?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama&orderRule=asc`
      );

      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );
        setCategories(sortedCategories);
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Gagal memuat kategori:', error.response?.data);
      toast.error('Gagal memuat data kategori');
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get(
        `/units?page=1&rows=12&orderKey=nama_unit&orderRule=asc`
      );

      if (response.data.content?.entries) {
        const unitList = response.data.content.entries.map((unit: Unit) => ({
          id: unit.id,
          nama_unit: unit.nama_unit,
        }));
        setUnits(unitList);
      } else {
        setUnits([]);
      }
    } catch (error: any) {
      console.error('Gagal memuat unit:', error.response?.data || error.message);
      toast.error('Gagal memuat data unit');
    }
  };

  const formik = useFormik({
    initialValues: {
      judul: '',
      deskripsi: '',
      status: 'PENDING',
      unitId: '',
      response: '',
      kategoriId: '',
      nama: '',
      no_telphone: '',
      harapan_pelapor: '',
      filePendukung: null as File | null,
    },
    validationSchema: Yup.object({
      nama: Yup.string().required('Nama wajib diisi'),
      judul: Yup.string().required('Judul laporan wajib diisi'),
      deskripsi: Yup.string().required('Isi laporan wajib diisi'),
      no_telphone: Yup.string()
        .matches(/^62\d{9,13}$/, 'Nomor WhatsApp harus diawali dengan 62 dan berisi 9-13 digit')
        .required('Nomor WhatsApp wajib diisi'),
      kategoriId: Yup.string().required('Pilih kategori laporan'),
      unitId: Yup.string().required('Pilih unit yang dilapor'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/pengaduan`;

      try {
        let fileUrl = '';
        if (values.filePendukung) {
          const formData = new FormData();
          formData.append('file', values.filePendukung);

          const uploadResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadResponse.status === 200) {
            fileUrl = uploadResponse.data.content.secure_url;
          } else {
            throw new Error('Gagal mengunggah file.');
          }
        }

        const dataToSend = {
          judul: values.judul.trim(),
          deskripsi: values.deskripsi.trim(),
          status: 'PENDING',
          unitId: values.unitId,
          response: '',
          kategoriId: values.kategoriId,
          nama: values.nama.trim(),
          no_telphone: values.no_telphone.trim(),
          harapan_pelapor: values.harapan_pelapor.trim() || '',
          filePendukung: fileUrl,
          filePetugas: '',
        };

        const response = await axios.post(apiUrl, dataToSend, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          toast.success('Laporan berhasil dikirim!');
          resetForm();
          setFileName('');
        } else {
          toast.error('Gagal mengirim laporan.');
        }
      } catch (error: any) {
        console.error('Error submitting form:', error.response?.data || error.message);
        toast.error(`Terjadi kesalahan: ${error.response?.data?.message || 'Coba lagi nanti.'}`);
      } finally {
        setLoading(false);
      }
    },
  });

  // Responsive text sizes
  const getResponsiveFontSize = () => {
    if (isMobile) return '1rem';
    if (isTablet) return '1.1rem';
    return '1.2rem';
  };

  const responsiveFontSize = getResponsiveFontSize();

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-4">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Paper
        elevation={3}
        sx={{ 
          width: '100%',
          maxWidth: '800px',
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold', 
            textAlign: 'center', 
            pb: 3,
            color: 'text.primary',
            fontSize: isMobile ? '1.5rem' : '2rem'
          }}
        >
          LAPORKAN!
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          {/* Nama Field */}
          <TextField
            id="nama"
            fullWidth
            label="Nama"
            name="nama"
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#135D66' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#135D66' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            value={formik.values.nama}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nama && Boolean(formik.errors.nama)}
            helperText={formik.touched.nama && formik.errors.nama}
          />

          {/* Judul Laporan Field */}
          <TextField
            id="judul"
            fullWidth
            label="Judul Laporan"
            name="judul"
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            value={formik.values.judul}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.judul && Boolean(formik.errors.judul)}
            helperText={formik.touched.judul && formik.errors.judul}
          />

          {/* Deskripsi Field */}
          <TextField
            id="deskripsi"
            fullWidth
            label="Isi Laporan"
            name="deskripsi"
            variant="outlined"
            multiline
            rows={isMobile ? 3 : 4}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            value={formik.values.deskripsi}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
            helperText={formik.touched.deskripsi && formik.errors.deskripsi}
          />

          {/* Harapan Pelapor Field */}
          <TextField
            id="harapan_pelapor"
            fullWidth
            label="Harapan Pelapor"
            name="harapan_pelapor"
            variant="outlined"
            multiline
            rows={isMobile ? 2 : 2}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            value={formik.values.harapan_pelapor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.harapan_pelapor && Boolean(formik.errors.harapan_pelapor)}
            helperText={formik.touched.harapan_pelapor && formik.errors.harapan_pelapor}
          />

          {/* Nomor WhatsApp Field */}
          <TextField
            id="no_telphone"
            fullWidth
            label="Nomor Whatsapp"
            name="no_telphone"
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            value={formik.values.no_telphone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.no_telphone && Boolean(formik.errors.no_telphone)}
            helperText={formik.touched.no_telphone && formik.errors.no_telphone}
          />

          {/* Kategori Field */}
          <TextField
            id="kategoriId"
            fullWidth
            label="Kategori Laporan"
            name="kategoriId"
            select
            value={formik.values.kategoriId || ''}
            onChange={(event) => formik.setFieldValue('kategoriId', event.target.value)}
            onBlur={formik.handleBlur}
            error={formik.touched.kategoriId && Boolean(formik.errors.kategoriId)}
            helperText={formik.touched.kategoriId && formik.errors.kategoriId}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: isMobile ? 200 : 300,
                  },
                },
              },
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
          >
            {categories.map((category) => (
              <MenuItem 
                key={category.id} 
                value={category.id}
                sx={{ fontSize: responsiveFontSize }}
              >
                {category.nama}
              </MenuItem>
            ))}
          </TextField>

          {/* Unit Field */}
          <TextField
            id="unitId"
            fullWidth
            label="Unit Yang Dilapor"
            name="unitId"
            select
            value={formik.values.unitId || ''}
            onChange={(event) => formik.setFieldValue('unitId', event.target.value)}
            onBlur={formik.handleBlur}
            error={formik.touched.unitId && Boolean(formik.errors.unitId)}
            helperText={formik.touched.unitId && formik.errors.unitId}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#16404D' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: '#16404D' 
              },
            }}
            InputLabelProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: isMobile ? 200 : 300,
                  },
                },
              },
            }}
            InputProps={{ 
              style: { 
                fontSize: responsiveFontSize 
              } 
            }}
          >
            {units.map((unit) => (
              <MenuItem 
                key={unit.id} 
                value={unit.id}
                sx={{ fontSize: responsiveFontSize }}
              >
                {unit.nama_unit}
              </MenuItem>
            ))}
          </TextField>

          {/* File Upload Section */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                mb: 1,
                fontSize: responsiveFontSize
              }}
            >
              Upload File
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={fileName}
              placeholder="Belum ada file yang dipilih"
              InputProps={{
                readOnly: true,
                startAdornment: fileName && <AttachFile sx={{ color: '#FBBF24', mr: 1 }} />,
                endAdornment: fileName && (
                  <IconButton
                    onClick={() => {
                      formik.setFieldValue('filePendukung', null);
                      setFileName('');
                    }}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <Delete color="error" />
                  </IconButton>
                ),
                style: { fontSize: responsiveFontSize }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  borderColor: '#16404D' 
                },
              }}
            />
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: '#003C43',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#135D66' },
                px: isMobile ? 2 : 4,
                py: 1,
                textTransform: 'none',
                fontSize: responsiveFontSize,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Pilih File
              <input
                type="file"
                hidden
                onChange={(event) => {
                  if (event.target.files && event.target.files[0]) {
                    formik.setFieldValue('filePendukung', event.target.files[0]);
                    setFileName(event.target.files[0].name);
                  }
                }}
              />
            </Button>
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#003C43',
                color: 'white',
                fontWeight: 'bold',
                px: isMobile ? 3 : 4,
                py: 1,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#135D66' },
                fontSize: responsiveFontSize,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  color="inherit" 
                  sx={{ 
                    mr: isMobile ? 1 : 2 
                  }} 
                />
              ) : null}
              {loading ? (isMobile ? 'Mengirim...' : 'Sedang Mengirim...') : 'LAPOR!'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReportForm;