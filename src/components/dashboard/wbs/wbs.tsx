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
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          axios.get(`${API_URL}units`),
          axios.get(`${API_URL}kategori`),
        ]);

        const unitList = unitResponse.data?.content?.entries.map((u: { nama_unit: string }) => u.nama_unit) || [];
        const categoryList = categoryResponse.data?.content?.entries.map((c: { id: string; nama: string }) => ({ id: c.id, nama: c.nama })) || [];

        setUnits(unitList);
        setCategories(categoryList);

        if (categoryList.length > 0) setCategory(categoryList[0].id);
        if (unitList.length > 0) setUnit(unitList[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data.');
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("custom-auth-token");
    console.log("Token yang digunakan:", token);

    if (!token) {
      toast.error("Anda harus login terlebih dahulu.");
      return;
    }

    const data = {
      ...formData,
      kategoriId: category,
      tanggalKejadian: date ? date.format('YYYY-MM-DD') : '',
    };

    try {
      const response = await axios.post(`${API_URL}PelaporanWbs`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success('Laporan berhasil dikirim!');
      } else {
        toast.error('Gagal mengirim laporan.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Terjadi kesalahan saat mengirim laporan.');
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
          <FormControl fullWidth required>
            <InputLabel>Unit Yang Dilapor</InputLabel>
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
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
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nama}</MenuItem>
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