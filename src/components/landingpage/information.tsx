import { Card, CardContent, Typography, Link, Box } from "@mui/material";
import Image from "next/image";

const InformasiSection = () => {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 2 }}>
      {/* Judul */}
      <Typography variant="h4" align="center" gutterBottom>
        Informasi
      </Typography>

      {/* Survey Section */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Login
          </Typography>
          <Typography variant="body1">
            1. Setiap Mahasiswa, Dosen, Dan Staff diharapkan melakukan Login terlebih dahulu{" "}
            <Link href="#" color="blue" underline="hover">klik disini</Link>
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Image src="/assets/logo-usk.png" alt="Survey" width={400} height={300} />
          </Box>
        </CardContent>
      </Card>

      {/* Layanan UPT TIK */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            Layanan UPT TIK
          </Typography>
          <Typography variant="body1">
            Hari Senin hingga Jumat, kami siap membantu Anda dalam mengatasi segala masalah terkait layanan teknologi informasi. Layanan kami tersedia pada:
          </Typography>
          <Typography variant="body1">
            • Pukul 08.30 - 12.00 WIB <br />
            • Pukul 14.00 - 16.30 WIB
          </Typography>
          <Typography variant="body1">
            <strong>Hubungi:</strong>
          </Typography>
          <Typography variant="body2">
            • No. Telp: +628116701962 <br />
            • No. WhatsApp: +628516303969 <br />
            • Email: <Link href="mailto:helpdesk.ict@usk.ac.id" color="primary" underline="hover">helpdesk.ict@usk.ac.id</Link>
          </Typography>
        </CardContent>
      </Card>

      {/* UP3AI Section */}
      <Card sx={{ mb: 3, backgroundColor: "#D1F8EF" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#1976d2" }}>
            UP3AI (Unit Pengembangan Program Pendamping Mata Kuliah Agama Islam)
          </Typography>
          <Typography variant="body1">
            Mahasiswa Baru USK diwajibkan mengikuti UP3AI (Unit Pengembangan Program Pendamping Mata Kuliah Agama Islam). Untuk Jadwal Test Penjajakan Baca Alquran dapat dilihat melalui{" "}
            <Link href="https://up3ai.usk.ac.id" target="_blank" color="primary" underline="hover">
              up3ai.usk.ac.id
            </Link> atau Fan Page FB: UP3AI Universitas Syiah Kuala.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InformasiSection;
