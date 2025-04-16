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
import api from '@/lib/api/api';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/`;

const WBSReportForm = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<KategoriWbs[]>([]);
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
        const [unitResponse, categoryResponse] = await Promise.all([
          api.get("/units"), 
          api.get("/kategoriWbs"),
        ]);

        const unitList = unitResponse.data?.content?.entries.map((unit: { nama_unit: string }) => unit.nama_unit) || [];
        const categoryList = categoryResponse.data?.content?.entries.map((category: { id: string; nama: string }) => ({ id: category.id, nama: category.nama })) || [];

        setUnits(unitList);
        setCategories(categoryList);

        // ✅ Set nilai default jika ada data
        if (categoryList.length > 0) setSelectedCategory(categoryList[0].id);
        if (unitList.length > 0) setSelectedUnit(unitList[0]);
      } catch (error: any) {
        console.error("Error fetching data:", error.response?.data || error.message);
        toast.error("Gagal memuat data.");
      }
    };

    fetchData();
  }, []);

  const handleRadioChange = (type: string) => {
    setModalType(type);
    setOpenModal(true);
  };

  const handleConfirm = () => {
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
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
  
    let fileUrl = "";
  
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        if (uploadResponse.status === 200) {
          fileUrl = uploadResponse.data.content.secure_url;
          console.log("✅ File berhasil diunggah:", fileUrl);
        } else {
          throw new Error("Gagal mengunggah file.");
        }
      } catch (error: any) {
        console.error("❌ Error uploading file:", error.response?.data || error.message);
        toast.error("Gagal mengunggah file.");
        setLoading(false);
        return;
      }
    }
  
    const requestBody = {
      judul: formData.judul.trim(),
      deskripsi: formData.deskripsi.trim(),
      lokasi: formData.lokasi.trim(),
      pihakTerlibat: formData.pihakTerlibat.trim(),
      kategoriId: category,
      tanggalKejadian: date?.format('YYYY-MM-DD'),
      unit: unit,
      filePendukung: fileUrl, 
    };
  
    console.log("📝 Data yang akan dikirim:", JSON.stringify(requestBody, null, 2));
  
    try {
      const response = await api.post("/PelaporanWbs", requestBody);
  
      if (response.status === 201) {
        console.log("✅ Laporan berhasil dikirim:", response.data);
        toast.success(response.data.message || 'Laporan WBS berhasil dikirim!');
  
        // Reset form setelah berhasil
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
      } else {
        throw new Error(response.data.message || "Gagal mengirim laporan.");
      }
    } catch (error: any) {
      console.error('❌ Error submitting form:', error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        // Jika ada error validasi, tampilkan semua pesan error
        toast.error(`Validation errors: ${error.response.data.errors.join(', ')}`);
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4, md: 6 }, borderRadius: 2, width: "100%", maxWidth: "800px" }}>
            <Typography sx={{ pb: 4 }} variant="h5" gutterBottom textAlign="center">
              Form Pengaduan
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth label="Judul Laporan" 
                    name="judul" 
                    margin="normal" 
                    required value={formData.judul} 
                    onChange={handleChange}
                    sx={{
                      mb: 2,
                      fontSize: '1rem',
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}
                  /> 
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
                      fontSize: '1rem',
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    required 
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#16404D" },
                        "&:hover fieldset": { borderColor: "#16404D" },
                        "&.Mui-focused fieldset": { borderColor: "#16404D" },
                      },
                      "& .MuiInputLabel-root": { color: "#16404D" },
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
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    required 
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#16404D" },
                        "&:hover fieldset": { borderColor: "#16404D" },
                        "&.Mui-focused fieldset": { borderColor: "#16404D" },
                      },
                      "& .MuiInputLabel-root": { color: "#16404D" },
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
                      fontSize: '1rem',
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}
                  /> 
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth label="Nama Yang Dilaporkan" 
                    name="pihakTerlibat" 
                    required value={formData.pihakTerlibat} 
                    onChange={handleChange} 
                    sx={{
                      mb: 2,
                      fontSize: '1rem',
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker 
                    label="Tanggal Kejadian" 
                    value={date} 
                    onChange={(newDate) => setDate(newDate)} 
                    sx={{
                      mb: 2,
                      fontSize: '1rem',
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16404D' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#16404D' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Button type="submit" variant="contained" sx={{ width: { xs: "100%", sm: "50%", md: "30%" }, py: 1.5, bgcolor: '#3A4F6A', '&:hover': { bgcolor: '#4A7EB0' } }} disabled={loading}>
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