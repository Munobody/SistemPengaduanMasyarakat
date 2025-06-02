import { Card, CardContent, Typography, Link, Box } from "@mui/material";
import Image from "next/image";

const InformasiSection = () => {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 2 }}>
      {/* Judul */}
      <Typography variant="h4" align="center" gutterBottom>
        Informasi Pengaduan Layanan & Masyarakat USK
      </Typography>

      {/* Tentang Pengaduan */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Apa itu Pengaduan Layanan & Masyarakat?
          </Typography>
          <Typography variant="body1">
            Sistem Pengaduan Layanan & Masyarakat Universitas Syiah Kuala (USK) adalah sarana resmi bagi mahasiswa, dosen, staf, dan masyarakat umum untuk menyampaikan keluhan, saran, atau aspirasi terkait layanan akademik, fasilitas kampus, maupun pelayanan publik di lingkungan USK.
          </Typography>
        </CardContent>
      </Card>

      {/* Cara Melapor */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Cara Melapor Pengaduan
          </Typography>
          <Typography variant="body1">
            1. Login menggunakan akun SIAKAD (untuk mahasiswa/dosen/staf) atau langsung mengisi formulir yang ada di halaman utama sebagai masyarakat umum.<br />
            2. Pilih menu <strong>Buat Pengaduan</strong> dan lengkapi formulir pengaduan sesuai kategori layanan.<br />
            3. Sertakan bukti pendukung jika diperlukan.<br />
            4. Pantau status pengaduan Anda secara berkala melalui dashboard.
          </Typography>
        </CardContent>
      </Card>

      {/* Layanan yang Dapat Diadukan */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Layanan yang Dapat Diadukan
          </Typography>
          <Typography variant="body1">
            • Layanan Akademik (perkuliahan, KRS, KHS, dll.)<br />
            • Fasilitas Kampus (gedung, laboratorium, internet, dll.)<br />
            • Pelayanan Administrasi (kepegawaian, keuangan, kemahasiswaan)<br />
            • Layanan Publik lainnya di lingkungan USK
          </Typography>
        </CardContent>
      </Card>

      {/* Kontak & Bantuan */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Kontak & Bantuan
          </Typography>
          <Typography variant="body1">
            Jika Anda membutuhkan bantuan terkait pengaduan, silakan hubungi:<br />
            <strong>Email:</strong> <Link href="mailto:pengaduan@usk.ac.id" color="primary" underline="hover">pengaduan@usk.ac.id</Link><br />
            <strong>WhatsApp:</strong> +62 811-6701-962<br />
            <strong>Jam Layanan:</strong> Senin–Jumat, 08.30–16.30 WIB
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Image src="/assets/logo-usk.png" alt="USK" width={200} height={100} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InformasiSection;