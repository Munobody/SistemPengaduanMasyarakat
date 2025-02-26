"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Box,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/pelaporan`;

export default function PengaduanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [units, setUnits] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/units`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/kategori`),
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("custom-auth-token");
    console.log("Token yang digunakan:", token);

    if (!token) {
      toast.error("Anda harus login terlebih dahulu.");
      setLoading(false);
      return;
    }

    let fileUrl = "";
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const uploadResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.status === 200) {
          fileUrl = uploadResponse.data.content.secure_url;
        } else {
          throw new Error("Gagal mengunggah file.");
        }
      } catch (error: any) {
        console.error("Error uploading file:", error.response?.data || error.message);
        toast.error("Gagal mengunggah file.");
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(formRef.current!);
    const values = {
      judul: formData.get("title") as string,
      deskripsi: formData.get("description") as string,
      status: "PENDING",
      nameUnit: selectedUnit,
      response: "",
      kategoriId: selectedCategory,
      filePendukung: fileUrl,
      filePetugas: "",
    };

    console.log("Data yang dikirim:", values);

    try {
      const response = await axios.post(API_URL, values, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response dari server:", response);

      if (response.status === 201) {
        toast.success("Laporan berhasil dikirim!");
        console.log("Laporan berhasil dikirim:", values);
        formRef.current!.reset();
        setSelectedFile(null);
      } else {
        toast.error("Gagal mengirim laporan.");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error.response?.data || error.message);
      toast.error("Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="xl" sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 2, width: "80%" }}>
          <Typography sx={{ pb: 4 }} variant="h5" gutterBottom textAlign="center">
            Form Pengaduan
          </Typography>
          <form ref={formRef} onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <TextField fullWidth label="Judul Laporan" name="title" margin="normal" required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Isi Laporan" name="description" margin="normal" multiline rows={4} required />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  select 
                  label="Kategori" 
                  name="category" 
                  margin="normal" 
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.nama}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  select 
                  label="Unit" 
                  name="unit" 
                  margin="normal" 
                  required
                  value={selectedUnit} // ✅ Tambahkan value
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  {units.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Harapan Pelapor" name="expectation" margin="normal" multiline rows={2} required />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                  Upload File
                  <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </Button>
                {selectedFile && <Typography sx={{ mt: 2 }}>{selectedFile.name}</Typography>}
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ width: "30%", py: 1.5 }} disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
      {/* Tambahkan ToastContainer agar toast bisa muncul */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}