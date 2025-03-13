'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { AttachFile, Delete } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';

import 'react-toastify/dist/ReactToastify.css';

// Update the interfaces
interface Category {
  id: string;
  nama: string;
}

interface Unit {
  id: string;
  nama_unit: string;
}

const ReportForm: React.FC = (): React.JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileName, setFileName] = useState('');
  const [rowsPerPage] = useState(100); // Set high to get all categories
  const [page] = useState(0);
  const [totalData, setTotalData] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([fetchUnits(), fetchCategories()]);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };

    fetchData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/kategori?page=${page + 1}&rows=${rowsPerPage}&orderKey=nama&orderRule=asc`
      );

      if (response.data.content?.entries) {
        const sortedCategories = response.data.content.entries.sort((a: Category, b: Category) =>
          a.nama.localeCompare(b.nama)
        );

        setCategories(sortedCategories);
        console.log('📋 Daftar kategori:', sortedCategories);
        setTotalData(response.data.content.totalData);
      } else {
        setCategories([]);
        console.log('❕ Tidak ada kategori');
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat kategori:', error.response?.data);
      toast.error('Gagal memuat data kategori');
      throw error;
    }
  };


  const fetchUnits = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/units?page=1&rows=100&orderKey=nama_unit&orderRule=asc`
      );

      if (response.data.content?.entries) {
        setUnits(response.data.content.entries.map((unit: Unit) => unit.nama_unit));
        console.log('📋 Daftar unit:', response.data.content.entries);
      }
      return response;
    } catch (error: any) {
      console.error('❌ Gagal memuat unit:', error.response?.data);
      toast.error('Gagal memuat data unit');
      throw error;
    }
  };

  const formik = useFormik({
    initialValues: {
      judul: '',
      deskripsi: '',
      status: 'PENDING',
      nameUnit: '',
      response: '',
      kategoriId: '',
      nama: '',
      no_telphone: '',
      harapan_pelapor: '', 
      filePendukung: null as File | null, // File tidak dikirim dalam JSON
    },
    validationSchema: Yup.object({
      nama: Yup.string().required('Nama wajib diisi'),
      judul: Yup.string().required('Judul laporan wajib diisi'),
      deskripsi: Yup.string().required('Isi laporan wajib diisi'),
      no_telphone: Yup.string()
        .matches(/^62\d{9,13}$/, 'Nomor WhatsApp harus diawali dengan 62 dan berisi 9-13 digit')
        .required('Nomor WhatsApp wajib diisi'),
      kategoriId: Yup.string().required('Pilih kategori laporan'),
      nameUnit: Yup.string().required('Pilih unit yang dilapor'),
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
          ...values,
          filePendukung: fileUrl,
        };

        const response = await axios.post(apiUrl, dataToSend, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          toast.success('Laporan berhasil dikirim!');
          console.log('Laporan berhasil dikirim:', dataToSend);
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

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <Typography variant="h4" className="font-bold text-center text-black pb-10">
        SAMPAIKAN PENGADUAN LAYANAN ANDA
      </Typography>

      <Paper
        elevation={3}
        className="p-6 rounded-lg w-full"
        sx={{ maxWidth: { xs: '100%', md: '800px' }, p: { xs: 4, md: 6 } }}
      >
        <Typography variant="h5" className="font-bold text-center pb-4 text-black">
          LAPORKAN!
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            id="nama"
            fullWidth
            label="Nama"
            name="nama"
            variant="outlined"
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
            value={formik.values.nama}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nama && Boolean(formik.errors.nama)}
            helperText={formik.touched.nama && formik.errors.nama}
          />

          <TextField
            id="judul"
            fullWidth
            label="Judul Laporan"
            name="judul"
            variant="outlined"
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
            value={formik.values.judul}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.judul && Boolean(formik.errors.judul)}
            helperText={formik.touched.judul && formik.errors.judul}
          />

          <TextField
            id="deskripsi"
            fullWidth
            label="Isi Laporan"
            name="deskripsi"
            variant="outlined"
            multiline
            rows={4}
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
            value={formik.values.deskripsi}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
            helperText={formik.touched.deskripsi && formik.errors.deskripsi}
          />

          <TextField
            id="harapan_pelapor"
            fullWidth
            label="Harapan Pelapor"
            name="harapan_pelapor"
            variant="outlined"
            multiline
            rows={2}
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
            value={formik.values.harapan_pelapor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.harapan_pelapor && Boolean(formik.errors.harapan_pelapor)}
            helperText={formik.touched.harapan_pelapor && formik.errors.harapan_pelapor}
          />

          <TextField
            id="no_telphone"
            fullWidth
            label="Nomor Whatsapp"
            name="no_telphone"
            variant="outlined"
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
            value={formik.values.no_telphone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.no_telphone && Boolean(formik.errors.no_telphone)}
            helperText={formik.touched.no_telphone && formik.errors.no_telphone}
          />

          <TextField
            id="kategoriId"
            fullWidth
            label="Kategori Laporan"
            name="kategoriId"
            select
            value={formik.values.kategoriId || ''}
            onChange={(event) => formik.setFieldValue('kategoriId', event.target.value)} // Pastikan yang dikirim adalah ID
            onBlur={formik.handleBlur}
            error={formik.touched.kategoriId && Boolean(formik.errors.kategoriId)}
            helperText={formik.touched.kategoriId && formik.errors.kategoriId}
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.nama}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="nameUnit"
            fullWidth
            label="Unit Yang Dilapor"
            name="nameUnit"
            select
            value={formik.values.nameUnit}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nameUnit && Boolean(formik.errors.nameUnit)}
            helperText={formik.touched.nameUnit && formik.errors.nameUnit}
            sx={{
              mb: 2,
              fontSize: '1.2rem',
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
            }}
            InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            InputProps={{ style: { fontSize: '1.2rem' } }}
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" className="text-gray-600 mb-1">
              Upload File
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={fileName}
              placeholder="Belum ada file yang dipilih"
              InputProps={{
                readOnly: true,
                startAdornment: fileName && <AttachFile sx={{ color: '#FBBF24' }} />,
                endAdornment: fileName && (
                  <IconButton
                    onClick={() => {
                      formik.setFieldValue('filePendukung', null);
                      setFileName('');
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                ),
              }}
              sx={{
                mb: 2,
                fontSize: '1.2rem',
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
              }}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
            />
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: '#578FCA',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#7AB2D3' },
                px: 4,
                py: 1,
                textTransform: 'none',
                fontSize: '1.2rem',
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
          <Box className="flex justify-end">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#087163',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#A6CDC6' },
                fontSize: '1.2rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'LAPOR!'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReportForm;
