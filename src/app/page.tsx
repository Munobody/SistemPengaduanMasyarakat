import * as React from 'react';
import { Box } from '@mui/material';
import { ColourfulTextDemo } from '@/components/landingpage/colourfulltext';
import { Navbar } from '@/components/landingpage/navbar';
import ReportSummary from '@/components/landingpage/info-card';
import ReportForm from '@/components/landingpage/report-form';
import InformasiSection from '@/components/landingpage/information';

export default function LandingPage(): React.JSX.Element {
  return (
    <Box
      sx={{
        backgroundImage: 'url(/assets/bg.svg)',
        backgroundColor: '#E0F7FA', // Tambahkan warna latar belakang di bawah gambar
        backgroundSize: '100%',
        backgroundPosition: 'center',
        height: '100vh',
      }}
    >
      <Box>
        <Navbar />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          mt: 30,
          textShadow: '2px 2px 5px rgb(255, 255, 255)',
        }}
      >
        <ColourfulTextDemo />
        <Box sx={{ mt: 20 }}></Box>
      </Box>
      <Box>
        <ReportSummary />
      </Box>
      <Box>
        <ReportForm />
      </Box>
      <Box>
        <InformasiSection />
      </Box>
      
      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 10,
          pb: 5,
          borderTop: '1px solid black', // Changed to solid black border
          pt: 2,
          px: 5,
        }}
      >
        <Box
          sx={{
            color: '#00000',
            fontSize: '1 rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          © 2025 Sistem Pelaporan & Pengaduan Masyarakat
        </Box>
        <Box>
          <img
            src="/assets/logo-usk.png"
            alt="Logo USK"
            style={{ height: '50px' }}
          />
        </Box>
      </Box>
    </Box>
  );
}