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
        .matches(/^\d{16}$/, 'NIK harus terdiri dari 16 digit')
        .required('NIK wajib diisi'),
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
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
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
      } catch (error: any) {
        console.error('Error submitting form:', error.response?.data || error.message);
        toast.error(`Terjadi kesalahan: ${error.response?.data?.message || 'Coba lagi nanti.'}`);
      } finally {
        setLoading(false);
      }
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

        <form onSubmit={formik.handleSubmit}>
          {/* NIK  Field */}
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
              InputLabelProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              InputProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.NIK}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.NIK && Boolean(formik.errors.NIK)}
              helperText={formik.touched.NIK && formik.errors.NIK}
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

          {/* Nama Field */}
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
              InputLabelProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              InputProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.nama}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nama && Boolean(formik.errors.nama)}
              helperText={formik.touched.nama && formik.errors.nama}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#003C43', 
                mt: 0.5,
                fontSize: '0.75rem',
              }}
            >
              Masukkan nama lengkap Anda
            </Typography>
          </Box>

          {/* Nomor WhatsApp Field */}
            <Box mb={2}>
              <Typography
                variant="body2"
                sx={{
                  color: '#003C43',
                  mb: 1,
                  fontSize: responsiveFontSize,
                  fontWeight: 'bold',
                }}
              >
                Nomor WhatsApp
              </Typography>
              <PhoneInput
                international
                defaultCountry="ID"
                value={formik.values.no_telphone}
                onChange={(value) => formik.setFieldValue('no_telphone', value || '')}
                inputComponent="input"
                style={{
                  width: '100%',
                  fontSize: responsiveFontSize,
                  borderColor: formik.touched.no_telphone && formik.errors.no_telphone ? 'red' : '#135D66',
                  borderRadius: '4px',
                  padding: '10px',
                  border: '1px solid',
                }}
              />
              {formik.touched.no_telphone && formik.errors.no_telphone && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'red',
                    mt: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {formik.errors.no_telphone}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  color: '#003C43',
                  mt: 1,
                  fontSize: '0.75rem',
                }}
              >
                Nomor harus diawali dengan kode negara (contoh: +62 81234567890)
              </Typography>
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
              InputLabelProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              InputProps={{ 
                style: { fontSize: responsiveFontSize } 
              }}
              value={formik.values.judul}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.judul && Boolean(formik.errors.judul)}
              helperText={formik.touched.judul && formik.errors.judul}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#003C43', 
                mt: 0.5,
                fontSize: '0.75rem',
              }}
            >
              Masukkan judul singkat yang menggambarkan laporan
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
              inputProps={{ maxLength: 150 }}
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
              value={formik.values.deskripsi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
              helperText={
              (formik.touched.deskripsi && formik.errors.deskripsi) ||
              `${formik.values.deskripsi?.length || 0}/150 kata`
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
              Jelaskan secara rinci isi laporan Anda (maksimal 150 kata)
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
              inputProps={{ maxLength: 100 }}
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
              `${formik.values.harapan_pelapor?.length || 0}/100 kata`
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
              Tulis harapan atau solusi yang Anda inginkan (maksimal 100 kata, opsional)
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
              helperText={formik.touched.kategoriId && formik.errors.kategoriId}
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
              Pilih kategori yang sesuai dengan laporan Anda
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
              helperText={formik.touched.jenisUnit && formik.errors.jenisUnit}
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
                helperText={formik.touched.unitId && formik.errors.unitId}
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
          {/* File Upload Section */}
          {/* File Upload Section */}
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
            onChange={(event) => {
              if (event.target.files && event.target.files[0]) {
                formik.setFieldValue('filePendukung', event.target.files[0]);
                setFileName(event.target.files[0].name);
              }
            }}
            aria-hidden="true"
          />
        </Button>
      </>
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
    Maksimum ukuran file 1MB (opsional)
  </Typography>
</Box>

          {/* Submit Button */}
          {formik.isValid && (
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
)}
        </form>
      </Paper>
    </Box>
  );
};

export default ReportForm;