'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  Container,
  Grid,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/`;

const WBSReportForm = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<KategoriWbs[]>([]);
  // const [isAnonymous, setIsAnonymous] = useState(false);
  const [isStatementChecked, setIsStatementChecked] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    lokasi: '',
    pihakTerlibat: '',
    kategoriId: '',
    tanggalKejadian: dayjs().format('YYYY-MM-DD'),
  });
  interface KategoriWbs {
    id: string;
    nama: string;
    deskripsi: string | null;
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          toast.error('Anda harus login terlebih dahulu.');
          return;
        }
  
        const [unitResponse, kategoriWbsResponse] = await Promise.all([
          axios.get(`${API_URL}units`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}kategoriWbs`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
  
        const unitList = unitResponse.data?.content?.entries.map(
          (u: { nama_unit: string }) => u.nama_unit
        ) || [];
  
        const kategoriWbsList = kategoriWbsResponse.data?.content?.entries || [];
  
        setUnits(unitList);
        setCategories(kategoriWbsList);
  
        // Set default values if available
        if (kategoriWbsList.length > 0) {
          setCategory(kategoriWbsList[0].id);
        }
        if (unitList.length > 0) {
          setUnit(unitList[0]);
        }
  
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data kategori dan unit.');
      }
    };
  
    fetchData();
  }, []);

  const handleRadioChange = (type: string) => {
    setModalType(type);
    setOpenModal(true);
  };

  const handleConfirm = () => {
    // if (modalType === 'anonymous') {
    //   setIsAnonymous(true);
    // }
     if (modalType === 'statement') {
      setIsStatementChecked(true);
    }
    setOpenModal(false);
  };

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

interface WBSResponse {
  content: {
    id: string;
    judul: string;
    deskripsi: string;
    pihakTerlibat: string;
    tanggalKejadian: string;
    lokasi: string;
    kategoriId: string;
    unit: string;
    pelaporId: string;
    petugasWBSId: string | null;
    status: string;
    approvedBy: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  errors: string[];
}

// Then update the handleSubmit function
// Replace the handleSubmit function with this implementation
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!isStatementChecked) {
    toast.error("Anda harus menyetujui pernyataan pertanggungjawaban.");
    return;
  }

  const token = localStorage.getItem("custom-auth-token");
  if (!token) {
    toast.error("Anda harus login terlebih dahulu.");
    return;
  }
  
  if (!formData.judul || !formData.deskripsi || !formData.lokasi || 
      !formData.pihakTerlibat || !category || !unit || !date) {
    toast.error("Semua field harus diisi.");
    return;
  }

  // Prepare the request body that EXACTLY matches the example
  const requestBody = {
    judul: formData.judul.trim(),
    deskripsi: formData.deskripsi.trim(),
    lokasi: formData.lokasi.trim(),
    pihakTerlibat: formData.pihakTerlibat.trim(),
    kategoriId: category,
    tanggalKejadian: date.format('YYYY-MM-DD'),
    unit: unit
  };

  console.log('Request body:', requestBody);

  try {
    // Use native fetch API instead of axios
    const response = await fetch(`${API_URL}PelaporanWbs`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    console.log('Response:', responseData);

    if (!response.ok) {
      console.error('Server error:', responseData);
      if (responseData.message) {
        toast.error(`Error: ${responseData.message}`);
      } else if (responseData.errors && responseData.errors.length > 0) {
        toast.error(`Validation errors: ${responseData.errors.join(', ')}`);
      } else {
        toast.error(`Error ${response.status}: ${response.statusText}`);
      }
      return;
    }

    toast.success(responseData.message || 'Laporan WBS berhasil dikirim!');
    
    // Handle file upload if present
    if (file && responseData.content && responseData.content.id) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wbsId', responseData.content.id);
      
      const uploadResponse = await fetch(`${API_URL}upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        toast.warning('Laporan berhasil dikirim, tetapi terjadi kesalahan saat mengunggah file.');
      } else {
        toast.success('File berhasil diunggah.');
      }
    }
    
    // Reset form after successful submission
    setFormData({
      judul: '',
      deskripsi: '',
      lokasi: '',
      pihakTerlibat: '',
      kategoriId: '',
      tanggalKejadian: dayjs().format('YYYY-MM-DD'),
    });
    setCategory('');
    setUnit('');
    setDate(dayjs());
    setFile(null);
    setIsStatementChecked(false);
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error('Terjadi kesalahan. Silakan coba lagi.');
  }
};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Container maxWidth="xl" sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
          <Paper elevation={3} sx={{ p: 6, borderRadius: 2, width: "80%" }}>
            <Typography sx={{ pb: 4 }} variant="h5" gutterBottom textAlign="center">
              Form Pengaduan
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <TextField 
                  fullWidth label="Judul Laporan" 
                  name="judul" 
                  margin="normal" 
                  required value={formData.judul} 
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    fontSize: '1.2rem',
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                  }}/> 
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                  fullWidth label="Isi Laporan" 
                  name="deskripsi"
                  margin="normal" 
                  multiline rows={4} 
                  required value={formData.deskripsi} 
                  onChange={handleChange} 
                  sx={{
                    mb: 2,
                    fontSize: '1.2rem',
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                  }}/>
                </Grid>
                <Grid item xs={12}>
  <FormControl 
    fullWidth 
    required 
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#16404D" },
        "&:hover fieldset": { borderColor: "#16404D" },
        "&.Mui-focused fieldset": { borderColor: "#16404D" },
      },
      "& .MuiInputLabel-root": {
        color: "#16404D", 
      },
      "& .MuiInputLabel-shrink": {
        backgroundColor: "white",
        paddingX: "4px",
        marginLeft: "-4px",
      }
    }}
  >
    <InputLabel shrink>Unit Yang Dilapor</InputLabel>
    <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
      {units.map((u) => (
        <MenuItem key={u} value={u}>{u}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

<Grid item xs={12}>
  <FormControl 
    fullWidth 
    required 
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#16404D" },
        "&:hover fieldset": { borderColor: "#16404D" },
        "&.Mui-focused fieldset": { borderColor: "#16404D" },
      },
      "& .MuiInputLabel-root": {
        color: "#16404D", 
      },
      "& .MuiInputLabel-shrink": {
        backgroundColor: "white",
        paddingX: "4px",
        marginLeft: "-4px",
      }
    }}
  >
    <InputLabel shrink>Kategori Laporan</InputLabel>
    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
      {categories.map((c) => (
        <MenuItem key={c.id} value={c.id}>{c.nama}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

                <Grid item xs={12}>
                  <TextField 
                  fullWidth label="Lokasi Kejadian" 
                  name="lokasi" 
                  required value={formData.lokasi} 
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    fontSize: '1.2rem',
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                  }}/> 
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                  fullWidth label="Nama Yang Dilaporkan" 
                  name="pihakTerlibat" 
                  required value={formData.pihakTerlibat} 
                  onChange={handleChange} 
                  sx={{
                  mb: 2,
                  fontSize: '1.2rem',
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                      }}/>
                </Grid>
                <Grid item xs={12}>
                  <DatePicker 
                  label="Tanggal Kejadian" 
                  value={date} 
                  onChange={(newDate) => setDate(newDate)} 
                  sx={{
                  mb: 2,
                  fontSize: '1.2rem',
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}/>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} sx={{ bgcolor: '#006A67', '&:hover': { bgcolor: '#0F2B33' } }}>
                    Upload File
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                  {file && <Typography sx={{ mt: 2 }}>{file.name}</Typography>}
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <RadioGroup>
                      <FormControlLabel value="statement" control={<Radio checked={isStatementChecked} onChange={() => handleRadioChange('statement')} />} label="Saya menyatakan bahwa laporan saya sah dan dapat dipertanggungjawabkan" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button type="submit" variant="contained" sx={{ width: "30%", py: 1.5, bgcolor: '#4A628A', '&:hover': { bgcolor: '#3A4F6A' } }} disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
        <ToastContainer position="top-right" autoClose={3000} />
        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Konfirmasi</DialogTitle>
          <DialogContent>
            <Typography>
              {modalType === 'anonymous' ? 'Apakah Anda yakin ingin merahasiakan identitas Anda?' : 'Apakah Anda yakin bahwa laporan ini sah dan dapat dipertanggungjawabkan?'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="error">Tidak</Button>
            <Button onClick={handleConfirm} color="primary">Iya</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default WBSReportForm;