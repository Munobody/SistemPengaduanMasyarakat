import React from 'react';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';

const ComplaintInfo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = [
    'Login ke sistem menggunakan akun SIAKAD (mahasiswa/dosen/staf) atau pilih opsi pengaduan masyarakat umum.',
    'Klik menu "Buat Pengaduan" pada dashboard.',
    'Isi formulir pengaduan secara lengkap, pilih kategori layanan, dan tuliskan kronologi permasalahan.',
    'Unggah bukti pendukung (jika ada) untuk memperkuat laporan Anda.',
    'Kirim pengaduan dan catat nomor tiket pengaduan yang diberikan sistem.',
    'Pantau status dan tindak lanjut pengaduan Anda secara berkala melalui dashboard.',
    'Jika diperlukan, admin/petugas akan menghubungi Anda untuk klarifikasi lebih lanjut.'
  ];

  return (
    <Paper
      sx={{
        p: isMobile ? 2 : 5,
        mx: 'auto',
        boxSizing: 'border-box',
        backgroundColor: '#E3FEF7',
        height: '100%',
        overflow: 'auto',
        maxHeight: { xs: 400, md: 600 }, // agar responsif dan tidak terpotong di mobile
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        gutterBottom
        sx={{ color: '#003C43', textAlign: 'center' }}
      >
        Tata Cara Pengaduan
      </Typography>
      <Box sx={{ position: 'relative', mt: 4, flex: 1 }}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
              alignItems: 'center',
              position: 'relative',
              mb: isMobile ? 2 : 4,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#77B0AA',
                color: '#E3FEF7',
                borderRadius: '50%',
                width: isMobile ? 28 : 40,
                height: isMobile ? 28 : 40,
                fontSize: isMobile ? 16 : 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                mr: index % 2 === 0 ? (isMobile ? 1 : 2) : 0,
                ml: index % 2 !== 0 ? (isMobile ? 1 : 2) : 0,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>
            <Typography
              sx={{
                backgroundColor: '#F6FFFC',
                color: '#135D66',
                p: isMobile ? 1.2 : 2,
                borderRadius: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
                maxWidth: isMobile ? '80%' : '60%',
                fontSize: isMobile ? 14 : 16,
                ml: index % 2 === 0 ? 2 : 0,
                mr: index % 2 !== 0 ? 2 : 0,
              }}
            >
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ComplaintInfo;