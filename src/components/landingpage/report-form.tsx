'use client';

import * as React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import { Delete, AttachFile } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportForm: React.FC = (): React.JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/units`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori`),
        ]);

        setUnits(unitResponse.data?.content?.entries.map((unit: { nama_unit: string }) => unit.nama_unit) || []);
        setCategories(categoryResponse.data?.content?.entries.map((category: { id: string; nama: string }) => ({ id: category.id, nama: category.nama })) || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };

    fetchData();
  }, []);

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
        const response = await axios.post(apiUrl, values, {
          headers: { 'Content-Type': 'application/json' },
        });
      
        if (response.status === 200) {
          toast.success('Laporan berhasil dikirim!');
          resetForm();
        } else {
          toast.error('Gagal mengirim laporan.');
        }
      } catch (error: any) {
        console.error('Error submitting form:', error.response?.data || error.message);
        toast.error(`Terjadi kesalahan: ${error.response?.data?.message || 'Coba lagi nanti.'}`);
      } finally {
        setLoading(false);
      }
    }
  });
  
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <Typography variant="h4" className="font-bold text-center text-black pb-10">
        SAMPAIKAN PENGADUAN LAYANAN ANDA
      </Typography>

      <Paper elevation={3} className="p-6 rounded-lg w-full max-w-lg bg-white">
        <Typography variant="h5" className="font-bold text-center pb-4 text-black">
          LAPORKAN!
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
          id='nama'
            fullWidth
            label="Nama"
            name="nama"
            variant="outlined"
            sx={{ mb: 2 }}
            value={formik.values.nama}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nama && Boolean(formik.errors.nama)}
            helperText={formik.touched.nama && formik.errors.nama}
          />

          <TextField
          id='judul'
            fullWidth
            label="Judul Laporan"
            name="judul"
            variant="outlined"
            sx={{ mb: 2 }}
            value={formik.values.judul}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.judul && Boolean(formik.errors.judul)}
            helperText={formik.touched.judul && formik.errors.judul}
          />

          <TextField
          id='deskripsi'
            fullWidth
            label="Isi Laporan"
            name="deskripsi"
            variant="outlined"
            multiline
            rows={4}
            sx={{ mb: 2 }}
            value={formik.values.deskripsi}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
            helperText={formik.touched.deskripsi && formik.errors.deskripsi}
          />

          <TextField
          id='no_telphone'
            fullWidth
            label="Nomor Whatsapp"
            name="no_telphone"
            variant="outlined"
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.nama} {/* Hanya menampilkan nama kategori */}
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
            sx={{ mb: 2 }}
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" className="text-gray-600 mb-1">Upload File</Typography>
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
              sx={{ mb: 2 }}
            />
            <Button variant="contained" component="label" sx={{ backgroundColor: '#FBBF24', color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#F59E0B' }, px: 4, py: 1, textTransform: 'none' }}>
              Pilih File
              <input type="file" hidden onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  formik.setFieldValue('filePendukung', event.target.files[0]);
                  setFileName(event.target.files[0].name);
                }
              }} />
            </Button>
          </Box>
          <Box className="flex justify-end">
            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#FBBF24', color: 'white', fontWeight: 'bold', px: 4, py: 1, textTransform: 'none', '&:hover': { backgroundColor: '#F59E0B' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'LAPOR!'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReportForm;
