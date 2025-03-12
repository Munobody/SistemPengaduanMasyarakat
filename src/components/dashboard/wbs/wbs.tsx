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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/`;

const WBSReportForm = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [file, setFile] = useState<File | null>(null);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<KategoriWbs[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
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
    if (modalType === 'anonymous') {
      setIsAnonymous(true);
    } else if (modalType === 'statement') {
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

// First add this interface at the top with other interfaces
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
    response: string | null;
  };
  message: string;
  errors: string[];
}

// Then update the handleSubmit function
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

  // Validate required fields
  if (!formData.judul || !formData.deskripsi || !formData.lokasi || 
      !formData.pihakTerlibat || !category || !unit || !date) {
    toast.error("Semua field harus diisi.");
    return;
  }

  try {
    // Create the main request body exactly matching API expectations
    const requestBody = {
      judul: formData.judul.trim(),
      deskripsi: formData.deskripsi.trim(),
      lokasi: formData.lokasi.trim(),
      pihakTerlibat: formData.pihakTerlibat.trim(),
      kategoriId: category,
      tanggalKejadian: date.format('YYYY-MM-DD'),
      unit: unit,
      isAnonymous: Boolean(isAnonymous) // Ensure boolean type
    };

    // Debug log
    console.log('Request URL:', `${API_URL}PelaporanWbs`);
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Request Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const response = await axios.post<WBSResponse>(
      `${API_URL}PelaporanWbs`, 
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check both status and response data
    if (response.status === 200 && response.data?.content) {
      toast.success(response.data.message || 'Laporan WBS berhasil dikirim!');
      
      // Reset form
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
      setIsAnonymous(false);
      setIsStatementChecked(false);
    }
  } catch (error: any) {
    // Detailed error logging
    console.error('Full error object:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    if (error.response?.data?.message) {
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.response?.status === 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi nanti.');
    } else {
      toast.error('Gagal mengirim laporan WBS. Silakan coba lagi.');
    }
  }
};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          SAMPAIKAN PENGADUAN WBS ANDA
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '60%', display: 'grid', gap: '16px' }}>
          <TextField
            label="Judul Laporan"
            fullWidth
            required
            name="judul"
            value={formData.judul}
            onChange={handleChange}
          />
          <TextField
            label="Isi Laporan"
            fullWidth
            multiline
            rows={4}
            required
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
          />
            <FormControl fullWidth required variant="outlined">
            <InputLabel shrink>Unit Yang Dilapor</InputLabel>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              label="Unit Yang Dilapor"
              sx={{ textAlign: 'left' }}
            >
              {units.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </Select>
            </FormControl>

            <FormControl fullWidth required variant="outlined">
            <InputLabel shrink>Kategori Laporan</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              label="Kategori Laporan"
              sx={{ textAlign: 'left' }}
            >
              {categories.map((c: KategoriWbs) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Lokasi Kejadian"
            fullWidth
            required
            name="lokasi"
            value={formData.lokasi}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Nama Yang Dilaporkan"
            fullWidth
            required
            name="pihakTerlibat"
            value={formData.pihakTerlibat}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          
          <DatePicker
            label="Tanggal Kejadian"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            slotProps={{ textField: { fullWidth: true, required: true, InputLabelProps: { shrink: true } } }}
          />

          <Button variant="contained" component="label" color="warning">
            Choose File Here
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography variant="body2">File: {file.name}</Typography>}

          {/* RADIO BUTTON DENGAN KONFIRMASI */}
          <FormControl component="fieldset">
            <RadioGroup>
              <FormControlLabel
                value="anonymous"
                control={<Radio checked={isAnonymous} onChange={() => handleRadioChange('anonymous')} />}
                label="Rahasia Identitas"
              />
              <FormControlLabel
                value="statement"
                control={<Radio checked={isStatementChecked} onChange={() => handleRadioChange('statement')} />}
                label="Saya menyatakan bahwa laporan saya sah dan dapat dipertanggungjawabkan"
              />
            </RadioGroup>
          </FormControl>

          <Button type="submit" variant="contained" color="warning" fullWidth>
            LAPOR
          </Button>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />

        {/* MODAL KONFIRMASI */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Konfirmasi</DialogTitle>
          <DialogContent>
            <Typography>
              {modalType === 'anonymous' ? 'Apakah Anda yakin ingin merahasiakan identitas Anda?' :
                'Apakah Anda yakin bahwa laporan ini sah dan dapat dipertanggungjawabkan?'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="error">Tidak</Button>
            <Button onClick={handleConfirm} color="primary">Iya</Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default WBSReportForm;