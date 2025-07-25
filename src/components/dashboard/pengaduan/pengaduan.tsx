import { useEffect, useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import 'react-toastify/dist/ReactToastify.css';

import api from '@/lib/api/api';

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: string;
}

interface Category {
  id: string;
  nama: string;
}

export default function PengaduanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedJenisUnit, setSelectedJenisUnit] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [jenisUnitOptions, setJenisUnitOptions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectation, setExpectation] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [rowsPerPage] = useState(100);

  const textFieldProps = {
    sx: {
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor: '#16404D',
        },
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#16404D',
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          api.get(`/units?page=1&rows=${rowsPerPage}&orderKey=nama_unit&orderRule=asc`),
          api.get('/kategori'),
        ]);
        const unitList: Unit[] = unitResponse.data?.content?.entries || [];
        const categoryList: Category[] = categoryResponse.data?.content?.entries || [];
        const uniqueJenisUnit = Array.from(new Set(unitList.map((unit) => unit.jenis_unit))).sort();
        setJenisUnitOptions(uniqueJenisUnit);
        setUnits(unitList);
        setCategories(categoryList);
        // Jangan set selectedCategory/selectedJenisUnit di sini, biarkan user memilih sendiri
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error('Gagal memuat data.');
      }
    };
    fetchData();
  }, [rowsPerPage]);

  useEffect(() => {
    if (selectedJenisUnit) {
      const filtered = units.filter((unit) => unit.jenis_unit === selectedJenisUnit);
      setFilteredUnits(filtered);
    } else {
      setFilteredUnits([]);
      setSelectedUnit('');
    }
  }, [selectedJenisUnit, units]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSize = file.size / 1024 / 1024; // MB
      if (fileSize > 1) {
        setFileError('Ukuran file tidak boleh lebih dari 1MB');
        setSelectedFile(null);
        return;
      }
      setFileError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});

    let fileUrl = '';
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.status === 200) {
          fileUrl = uploadResponse.data.content.secure_url;
        } else {
          throw new Error('Gagal mengunggah file.');
        }
      } catch (error: any) {
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
      unitId: selectedUnit,
      kategoriId: selectedCategory,
      harapan_pelapor: formData.get('expectation') as string,
      filePendukung: fileUrl,
      response: '',
      filePetugas: '',
    };

    try {
      const response = await api.post('/pelaporan', values);

      if (response.status === 201) {
        toast.success('Laporan berhasil dikirim!');
        // Reset semua field ke kosong
        formRef.current!.reset();
        setTitle('');
        setDescription('');
        setExpectation('');
        setSelectedFile(null);
        setSelectedCategory('');
        setSelectedJenisUnit('');
        setSelectedUnit('');
      }
    } catch (error: any) {
      if (
        error.response?.status === 400 &&
        error.response.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const apiFieldErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: { field: string; message: string }) => {
          apiFieldErrors[err.field] = err.message;
        });
        setFieldErrors(apiFieldErrors);
        toast.error(error.response.data.errors[0]?.message || 'Terjadi kesalahan validasi');
      } else {
        toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileSize = file.size / 1024 / 1024; // MB
      if (fileSize > 1) {
        setFileError('Ukuran file tidak boleh lebih dari 1MB');
        setSelectedFile(null);
        return;
      }
      setFileError('');
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
  });

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: isMobile ? 2 : 4,
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          maxWidth: isMobile ? '100%' : '800px',
          mx: 'auto',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            flex: 1,
            bgcolor: '#E3FEF7',
            borderLeft: '4px solid #135D66',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
            }}
          >
            <InfoOutlinedIcon
              sx={{
                color: '#135D66',
                fontSize: isMobile ? '1.5rem' : '2rem',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#135D66',
                fontSize: isMobile ? '1.1rem' : '1.35rem',
                fontWeight: 600,
              }}
            >
              Panduan Pengaduan
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: 1.8,
            }}
          >
            • Pastikan pengaduan yang Anda sampaikan belum pernah dilaporkan sebelumnya
            <br />
            • Lengkapi semua informasi yang diperlukan dengan jelas dan akurat
            <br />
            • Sertakan bukti pendukung jika ada (foto, dokumen, dll)
            <br />• Ukuran file maksimal adalah 1MB
          </Typography>
        </Paper>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 2 : isTablet ? 4 : 6,
            borderRadius: 2,
            width: isMobile ? '100%' : isTablet ? '90%' : '80%',
          }}
        >
          <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom textAlign="center" sx={{ pb: isMobile ? 2 : 4 }}>
            Form Pengaduan
          </Typography>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{ width: '100%' }}
            onChange={() => {
              if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
            }}
          >
            <Grid container spacing={isMobile ? 1 : 2} direction="column">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Judul Laporan"
                  name="title"
                  margin="normal"
                  required
                  size={isMobile ? 'small' : 'medium'}
                  {...textFieldProps}
                  inputProps={{ maxLength: 50 }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  helperText={
                    fieldErrors['pengaduan']
                      ? fieldErrors['pengaduan']
                      : `${title.length} / 50 karakter`
                  }
                  error={!!fieldErrors['pengaduan']}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                >
                  Masukkan judul laporan yang singkat dan jelas
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Isi Laporan"
                  name="description"
                  margin="normal"
                  placeholder="Ceritakan terkait pengaduan ini?"
                  multiline
                  rows={isMobile ? 3 : 4}
                  required
                  size={isMobile ? 'small' : 'medium'}
                  {...textFieldProps}
                  inputProps={{ maxLength: 150 }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText={`${
                    description.length || 0
                  } / 150 karakter`}
                  error={!!fieldErrors['description']}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                >
                  Jelaskan detail pengaduan dengan lengkap dan akurat
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Kategori"
                  name="category"
                  margin="normal"
                  required
                  size={isMobile ? 'small' : 'medium'}
                  {...textFieldProps}
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (fieldErrors['category']) setFieldErrors((prev) => ({ ...prev, category: '' }));
                  }}
                  error={!!fieldErrors['category']}
                  helperText={fieldErrors['category'] || 'Pilih kategori yang sesuai dengan pengaduan Anda'}
                >
                  <MenuItem value="">Pilih Kategori</MenuItem>
                  {categories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.nama}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                >
                  Pilih kategori yang sesuai dengan pengaduan Anda
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Jenis Unit"
                  name="jenis_unit"
                  margin="normal"
                  required
                  size={isMobile ? 'small' : 'medium'}
                  {...textFieldProps}
                  value={selectedJenisUnit}
                  onChange={(e) => {
                    setSelectedJenisUnit(e.target.value);
                    setSelectedUnit('');
                    if (fieldErrors['jenis_unit']) setFieldErrors((prev) => ({ ...prev, jenis_unit: '' }));
                  }}
                  error={!!fieldErrors['jenis_unit']}
                  helperText={fieldErrors['jenis_unit'] || 'Pilih jenis unit terlebih dahulu sebelum memilih unit'}
                >
                  <MenuItem value="">Pilih Jenis Unit</MenuItem>
                  {jenisUnitOptions.map((jenis) => (
                    <MenuItem key={jenis} value={jenis}>
                      {jenis}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                >
                  Pilih jenis unit terlebih dahulu sebelum memilih unit
                </Typography>
              </Grid>

              {selectedJenisUnit && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Unit"
                    name="unit"
                    margin="normal"
                    required
                    size={isMobile ? 'small' : 'medium'}
                    {...textFieldProps}
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      if (fieldErrors['unit']) setFieldErrors((prev) => ({ ...prev, unit: '' }));
                    }}
                    error={!!fieldErrors['unit']}
                    helperText={fieldErrors['unit'] || 'Pilih unit yang terkait dengan pengaduan Anda'}
                  >
                    <MenuItem value="">Pilih Unit</MenuItem>
                    {filteredUnits.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.nama_unit}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                  >
                    Pilih unit yang terkait dengan pengaduan Anda
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Harapan Pelapor"
                  name="expectation"
                  margin="normal"
                  multiline
                  rows={isMobile ? 2 : 3}
                  required
                  size={isMobile ? 'small' : 'medium'}
                  {...textFieldProps}
                  placeholder="Apa harapan Anda terkait pengaduan ini?"
                  inputProps={{ maxLength: 150 }}
                  value={expectation}
                  onChange={(e) => setExpectation(e.target.value)}
                  helperText={`${expectation.length || 0} / 150 karakter`}
                  error={!!fieldErrors['expectation']}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                >
                  Tulis harapan Anda terhadap penyelesaian pengaduan ini
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#135D66',
                    mb: 2,
                    borderBottom: '2px solid #E3FEF7',
                    pb: 1,
                  }}
                >
                  Dokumen Pendukung
                </Typography>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed #135D66',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#003C43',
                      bgcolor: 'rgba(19, 93, 102, 0.1)',
                    },
                  }}
                >
                  <input
                    {...getInputProps()}
                    accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                  />
                  <CloudUploadIcon sx={{ fontSize: '3rem', color: '#135D66' }} />
                  <Typography sx={{ mt: 2, color: '#135D66' }}>
                    Seret dan lepaskan file di sini, atau klik untuk memilih file
                  </Typography>
                  <Typography sx={{ mt: 1, color: '#135D66', fontSize: '0.9rem' }}>
                    Hanya menerima file PNG, JPG, JPEG. Maksimal 1MB.
                  </Typography>
                  {selectedFile && (
                    <Typography sx={{ mt: 2, color: '#135D66' }}>
                      File terpilih: {selectedFile.name}
                    </Typography>
                  )}
                  {fileError && (
                    <Typography sx={{ mt: 1, color: 'error.main' }}>
                      {fileError}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: isMobile ? 2 : 4,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  width: isMobile ? '100%' : '30%',
                  py: isMobile ? 1 : 1.5,
                  bgcolor: '#79D7BE',
                  color: '#000000',
                  '&:hover': { bgcolor: '#B9E5E8' },
                }}
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} style={{ fontSize: isMobile ? '14px' : '16px' }} />
    </Box>
  );
}