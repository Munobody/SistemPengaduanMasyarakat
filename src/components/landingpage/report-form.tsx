'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { AttachFile, Delete } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/api/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Category {
  id: string;
  nama: string;
}

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: string;
}

interface UnitType {
  type: string;
  label: string;
}

const ReportForm: React.FC = (): React.JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState(false);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileName, setFileName] = useState('');
  const [rowsPerPage] = useState(100);
  const [page] = useState(0);

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

function showFirstFieldError(errors: Record<string, any>) {
  if (!errors) return;
  const fieldNames: Record<string, string> = {
    NIK: 'NIK',
    nama: 'Nama',
    judul: 'Judul Laporan',
    deskripsi: 'Isi Laporan',
    kategoriId: 'Kategori Laporan',
    jenisUnit: 'Jenis Unit',
    unitId: 'Unit',
    filePendukung: 'File Pendukung',
    harapan_pelapor: 'Harapan Pelapor',
    no_telphone: 'Nomor WhatsApp',
  };
  const firstErrorField = Object.keys(errors)[0];
  const fieldLabel = fieldNames[firstErrorField] || firstErrorField;
  toast.error(`Terjadi kesalahan pada field: ${fieldLabel}`);
}

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
        `/units?page=1&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`
      );

      if (response.data.content?.entries) {
        const unitsData: Unit[] = response.data.content.entries.map((unit: Unit) => ({
          id: unit.id,
          nama_unit: unit.nama_unit,
          jenis_unit: unit.jenis_unit,
        }));
        
        setAllUnits(unitsData);
        const uniqueTypes: string[] = Array.from(new Set(unitsData.map(unit => unit.jenis_unit)));
        
        const types: UnitType[] = uniqueTypes.map(type => ({
          type,
          label: type === 'FAKULTAS' ? 'Fakultas' : 
                 type === 'LEMBAGA' ? 'Lembaga' :
                 type === 'UPT' ? 'Unit Pelayanan Terpadu' : 
                 type === 'DIREKTORAT' ? 'Direktorat' : type,
        }));
        
        setUnitTypes(types);
      } else {
        setAllUnits([]);
        setUnitTypes([]);
      }
    } catch (error: any) {
      console.error('Gagal memuat unit:', error.response?.data || error.message);
      toast.error('Gagal memuat data unit');
    }
  };

  const handleUnitTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedType = event.target.value;
    formik.setFieldValue('jenisUnit', selectedType);
    formik.setFieldValue('unitId', ''); 
    
    if (selectedType) {
      const filtered = allUnits.filter(unit => unit.jenis_unit === selectedType);
      setFilteredUnits(filtered);
    } else {
      setFilteredUnits([]);
    }
  };

  const formik = useFormik({
    initialValues: {
      NIK: '',
      judul: '',
      deskripsi: '',
      status: 'PENDING',
      jenisUnit: '',
      unitId: '',
      response: '',
      kategoriId: '',
      nama: '',
      no_telphone: '',
      harapan_pelapor: '',
      filePendukung: null as File | null,
    },
    validationSchema: Yup.object({
      NIK: Yup.string()
        .required('NIK wajib diisi')
        .matches(/^\d{16}$/, 'NIK harus terdiri dari 16 digit angka')
        .test(
          'valid-nik',
          'Format NIK tidak valid',
          (value) => {
            if (!value) return false;
            if (!/^\d{16}$/.test(value)) return false;
            const prov = value.substring(0, 2);
            const kota = value.substring(2, 4);
            const kec = value.substring(4, 6);
            if (
              prov === '00' ||
              kota === '00' ||
              kec === '00' ||
              Number(prov) < 1 || Number(prov) > 99 ||
              Number(kota) < 1 || Number(kota) > 99 ||
              Number(kec) < 1 || Number(kec) > 99
            ) {
              return false;
            }
            return true;
          }
        ),
      nama: Yup.string().required('Nama wajib diisi'),
      judul: Yup.string().required('Judul laporan wajib diisi'),
      deskripsi: Yup.string().required('Isi laporan wajib diisi'),
      kategoriId: Yup.string().required('Pilih kategori laporan'),
      jenisUnit: Yup.string().required('Pilih jenis unit terlebih dahulu'),
      unitId: Yup.string().required('Pilih unit'),
      filePendukung: Yup.mixed<File>()
        .nullable()
        .test(
          'fileSize',
          'Ukuran file maksimum 1MB',
          (value) => {
            if (!value) return true;
            if (value instanceof File) {
              return value.size <= 1024 * 1024;
            }
            return false;
          }
        ),
      harapan_pelapor: Yup.string().nullable(),
    }),
    onSubmit: async (values, { resetForm, validateForm }) => {
      setLoading(true);

      const errors = await validateForm();
      if (Object.keys(errors).length > 0) {
        showFirstFieldError(errors);
        setLoading(false);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/pengaduan`;

      try {
        let fileUrl = '';
        if (values.filePendukung) {
          const formData = new FormData();
          formData.append('file', values.filePendukung);

          const uploadResponse = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadResponse.status === 200) {
            fileUrl = uploadResponse.data.content.secure_url;
          } else {
            throw new Error('Gagal mengunggah file.');
          }
        }

        const dataToSend = {
          NIK: values.NIK.trim(),
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

        const response = await api.post(apiUrl, dataToSend, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          toast.success('Laporan berhasil dikirim!');
          resetForm();
          setFileName('');
          setFilteredUnits([]);
        } else {
          toast.error('Gagal mengirim laporan.');
        }
      } 
      catch (error: any) {

  if (
    error.response?.status === 400 &&
    error.response.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    const apiFieldErrors: Record<string, string> = {};
    error.response.data.errors.forEach((err: { field: string; message: string }) => {
      apiFieldErrors[err.field] = err.message;
    });
    formik.setErrors(apiFieldErrors);
    const firstField = error.response.data.errors[0]?.field;
    const fieldNames: Record<string, string> = {
      NIK: 'NIK',
      nama: 'Nama',
      judul: 'Judul Laporan',
      deskripsi: 'Isi Laporan',
      kategoriId: 'Kategori Laporan',
      jenisUnit: 'Jenis Unit',
      unitId: 'Unit',
      filePendukung: 'File Pendukung',
      harapan_pelapor: 'Harapan Pelapor',
      no_telphone: 'Nomor WhatsApp',
    };
    const fieldLabel = fieldNames[firstField] || firstField;
    toast.error(`Terjadi kesalahan pada field: ${fieldLabel}`);
  } else {
    toast.error(`Terjadi kesalahan: ${error.response?.data?.message || 'Coba lagi nanti.'}`);
  }
}
      setLoading(false);
    },
    enableReinitialize: true,
  });

  const getResponsiveFontSize = () => {
    if (isMobile) return '0.875rem';
    if (isTablet) return '1rem';
    return '1.125rem';
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
          maxWidth: { xs: '100%', sm: '600px', md: '800px' },
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold', 
            textAlign: 'center', 
            pb: { xs: 2, sm: 3 },
            color: '#003C43',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
          }}
        >
          Sampaikan Laporan Anda
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Box mb={2}>
            <TextField
              id="nik-field"
              fullWidth
              label="NIK"
              name="NIK"
              variant="outlined"
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              inputProps={{ 
          inputMode: 'numeric', 
          pattern: '[0-9]*', 
          maxLength: 16,
          minLength: 16,
          autoComplete: 'off'
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
              }}
              InputProps={{ style: { fontSize: responsiveFontSize } }}
              value={formik.values.NIK}
              onChange={(e) => {
          const onlyDigits = e.target.value.replace(/\D/g, '');
          formik.setFieldValue('NIK', onlyDigits.slice(0, 16));
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.NIK && Boolean(formik.errors.NIK)}
              required
            />
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
              Masukkan NIK Anda
            </Typography>
          </Box>
          <Box mb={2}>
            <TextField
              id="nama-field"
              fullWidth
              label="Nama"
              name="nama"
              variant="outlined"
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              inputProps={{
          maxLength: 100,
          autoComplete: 'off',
          pattern: "^[a-zA-Z\\s.'-]+$"
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
              }}
              InputProps={{ 
          style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.nama}
              onChange={(e) => {
          const value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
          formik.setFieldValue('nama', value);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.nama && Boolean(formik.errors.nama)}
              required
            />
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
              Masukkan Nama lengkap Anda
            </Typography>
          </Box>


          <Box mb={2}>
            <TextField
              id="no-telp-field"
              fullWidth
              label="Nomor WhatsApp"
              name="no_telphone"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  borderColor: '#135D66' 
                },
                '& .MuiInputLabel-root.Mui-focused': { 
                  color: '#135D66' 
                },
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
              }}
              InputProps={{
                style: { fontSize: responsiveFontSize },
                startAdornment: (
                  <span style={{ marginRight: 4, color: '#135D66', fontWeight: 500 }}>+62</span>
                ),
              }}
              value={
                formik.values.no_telphone.replace(/^(\+62|62|0)/, '')
              }
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.slice(0, 13);
                formik.setFieldValue('no_telphone', '+62' + value);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.no_telphone && Boolean(formik.errors.no_telphone)}
              required
              helperText={
                formik.touched.no_telphone && formik.errors.no_telphone
                  ? formik.errors.no_telphone
                  : '(contoh: +62 81234567890)'
              }
            />
          </Box>
          <Box mb={2}>
            <TextField
              id="judul-field"
              fullWidth
              label="Judul Laporan"
              name="judul"
              variant="outlined"
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              inputProps={{ 
          maxLength: 50,
          autoComplete: 'off'
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
              }}
              InputProps={{ 
          style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.judul}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.judul && Boolean(formik.errors.judul)}
              helperText={
          (formik.touched.judul && formik.errors.judul) ||
          `${formik.values.judul?.length || 0}/50 karakter`
              }
              required
            />
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
            </Typography>
          </Box>
          <Box mb={2}>
            <TextField
              id="deskripsi-field"
              fullWidth
              label="Isi Laporan"
              name="deskripsi"
              variant="outlined"
              multiline
              rows={isMobile ? 3 : 4}
              inputProps={{ maxLength: 150, minLength: 10, autoComplete: 'off' }}
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
              }}
              InputProps={{ 
          style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.deskripsi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
              helperText={
          (formik.touched.deskripsi && formik.errors.deskripsi) ||
          `${formik.values.deskripsi?.length || 0}/150 karakter`
              }
              required
            />
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
              {/* Jelaskan secara rinci isi laporan Anda (10-150 karakter) */}
            </Typography>
          </Box>
          <Box mb={2}>
            <TextField
              id="harapan-pelapor-field"
              fullWidth
              label="Harapan Pelapor"
              name="harapan_pelapor"
              variant="outlined"
              multiline
              rows={isMobile ? 2 : 3}
              inputProps={{ maxLength: 100, autoComplete: 'off' }}
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              InputLabelProps={{ 
          style: { fontSize: responsiveFontSize } 
              }}
              InputProps={{ 
          style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.harapan_pelapor}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.harapan_pelapor && Boolean(formik.errors.harapan_pelapor)}
              helperText={
          (formik.touched.harapan_pelapor && formik.errors.harapan_pelapor) || 
          `${formik.values.harapan_pelapor?.length || 0}/100 karakter`
              }
            />
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
            </Typography>
          </Box>
          <Box mb={2}>
            <TextField
              id="kategori-field"
              fullWidth
              label="Kategori Laporan"
              name="kategoriId"
              select
              value={formik.values.kategoriId || ''}
              onChange={(event) => formik.setFieldValue('kategoriId', event.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.kategoriId && Boolean(formik.errors.kategoriId)}
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
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
          style: { fontSize: responsiveFontSize } 
              }}
              required
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
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
            </Typography>
          </Box>

          {/* Unit Type Field */}
          <Box mb={2}>
            <TextField
              id="jenis-unit-field"
              fullWidth
              label="Jenis Unit"
              name="jenisUnit"
              select
              value={formik.values.jenisUnit || ''}
              onChange={handleUnitTypeChange}
              onBlur={formik.handleBlur}
              error={formik.touched.jenisUnit && Boolean(formik.errors.jenisUnit)}
              sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: '#135D66' 
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: '#135D66' 
          },
              }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
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
          style: { fontSize: responsiveFontSize } 
              }}
              required
            >
              <MenuItem value="" sx={{ fontSize: responsiveFontSize }}>
          <em>Pilih Jenis Unit</em>
              </MenuItem>
              {unitTypes.map((type) => (
          <MenuItem 
            key={type.type} 
            value={type.type}
            sx={{ fontSize: responsiveFontSize }}
          >
            {type.label}
          </MenuItem>
              ))}
            </TextField>
            <Typography 
              variant="body2" 
              sx={{ 
          color: '#003C43', 
          mt: 0.5,
          fontSize: '0.75rem',
              }}
            >
              Pilih jenis unit terkait laporan
            </Typography>
          </Box>

          {/* Unit Field */}
          {formik.values.jenisUnit && (
            <Box mb={2}>
              <TextField
          id="unit-field"
          fullWidth
          label="Pilih Unit"
          name="unitId"
          select
          value={formik.values.unitId || ''}
          onChange={(event) => formik.setFieldValue('unitId', event.target.value)}
          onBlur={formik.handleBlur}
          error={formik.touched.unitId && Boolean(formik.errors.unitId)}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
              borderColor: '#135D66' 
            },
            '& .MuiInputLabel-root.Mui-focused': { 
              color: '#135D66' 
            },
          }}
              InputLabelProps={{
                  sx: {
                    '& .MuiInputLabel-asterisk': {
                      color: 'red', fontSize: responsiveFontSize,
                    },
                  },
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
            style: { fontSize: responsiveFontSize } 
          }}
          required
              >
          <MenuItem value="" sx={{ fontSize: responsiveFontSize }}>
            <em>Pilih Unit</em>
          </MenuItem>
          {filteredUnits.map((unit) => (
            <MenuItem 
              key={unit.id} 
              value={unit.id}
              sx={{ fontSize: responsiveFontSize }}
            >
              {unit.nama_unit}
            </MenuItem>
          ))}
              </TextField>
              <Typography 
          variant="body2" 
          sx={{ 
            color: '#003C43', 
            mt: 0.5,
            fontSize: '0.75rem',
          }}
              >
          Pilih unit spesifik terkait laporan
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography
              variant="body2"
              sx={{
          color: '#003C43',
          mb: 1,
          fontSize: responsiveFontSize,
          fontWeight: 'bold',
              }}
            >
              Upload File Pendukung (Opsional)
            </Typography>
            <Box
              sx={{
          border: '2px dashed #135D66',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: '#E3FEF7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
              }}
            >
              {fileName ? (
          <>
            <AttachFile sx={{ color: '#FBBF24', fontSize: 40, mb: 1 }} />
            <Typography
              variant="body2"
              sx={{
                color: '#003C43',
                fontSize: responsiveFontSize,
                mb: 1,
              }}
            >
              {fileName}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                formik.setFieldValue('filePendukung', null);
                setFileName('');
                formik.setFieldError('filePendukung', undefined);
              }}
              sx={{
                textTransform: 'none',
                fontSize: responsiveFontSize,
              }}
            >
              Hapus File
            </Button>
          </>
              ) : (
          <>
            <CloudUploadIcon sx={{ color: '#135D66', fontSize: 50, mb: 2 }} />
            <Typography
              variant="body2"
              sx={{
                color: '#003C43',
                fontSize: responsiveFontSize,
                mb: 2,
              }}
            >
              Seret dan lepaskan file di sini, atau klik tombol di bawah untuk memilih file.
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: '#003C43',
                color: '#E3FEF7',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#135D66' },
                px: { xs: 2, sm: 4 },
                py: 1,
                textTransform: 'none',
                fontSize: responsiveFontSize,
              }}
            >
              Pilih File
              <input
                id="file-input"
                type="file"
                hidden
                accept="image/jpeg,image/png,image/jpg"
                onChange={(event) => {
            if (event.target.files && event.target.files[0]) {
              const file = event.target.files[0];
              const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/jpg',
              ];
              if (!allowedTypes.includes(file.type)) {
                formik.setFieldError('filePendukung', 'Tipe file tidak didukung. Hanya JPG, JPEG, PNG.');
                setFileName('');
                return;
              }
              if (file.size > 1024 * 1024) {
                formik.setFieldError('filePendukung', 'Ukuran file maksimum 1MB.');
                setFileName('');
                return;
              }
              formik.setFieldValue('filePendukung', file);
              setFileName(file.name);
              formik.setFieldError('filePendukung', undefined);
            }
                }}
                aria-hidden="true"
              />
            </Button>
          </>
              )}
              {formik.errors.filePendukung && (
          <Typography
            variant="body2"
            sx={{
              color: 'red',
              mt: 2,
              fontSize: '0.85rem',
              animation: 'shake 0.2s 2',
              '@keyframes shake': {
                '0%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-5px)' },
                '50%': { transform: 'translateX(5px)' },
                '75%': { transform: 'translateX(-5px)' },
                '100%': { transform: 'translateX(0)' },
              },
            }}
          >
            {formik.errors.filePendukung}
          </Typography>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
          color: '#003C43',
          mt: 1,
          fontSize: '0.75rem',
              }}
            >
              Maksimum ukuran file 1MB. Format yang didukung: JPG, JPEG, dan PNG
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
          backgroundColor: '#003C43',
          color: '#E3FEF7',
          fontWeight: 'bold',
          px: { xs: 3, sm: 4 },
          py: 1,
          textTransform: 'none',
          '&:hover': { backgroundColor: '#135D66' },
          fontSize: responsiveFontSize,
          width: { xs: '100%', sm: 'auto' },
              }}
            >
              {loading ? (
          <CircularProgress 
            size={20} 
            color="inherit" 
            sx={{ mr: { xs: 1, sm: 2 } }} 
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