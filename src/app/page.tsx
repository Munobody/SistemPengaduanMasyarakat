import * as React from 'react';
import { Box, Container, Typography } from '@mui/material';

import { Navbar } from '@/components/landingpage/navbar';
import ReportSummary from '@/components/landingpage/info-card';
import ReportForm from '@/components/landingpage/report-form';
import InformasiSection from '@/components/landingpage/information';

export default function LandingPage(): React.JSX.Element {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: "50vh", md: "100vh" },
          backgroundImage: 'url(/assets/bg-1.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Navbar />
        <Box sx={{ textAlign: 'center', mt: { xs: 2, md: 4 }, pt: { xs: 10, md: 20 } }}>
        <Typography 
          variant="h4" 
          fontWeight="700" 
          color="white" 
          sx={{ 
            pt: { xs: 5, md: 0 },
            fontSize: { xs: '1.5rem', md: '2.5rem' } 
          }}
        >
          SISTEM PENGADUAN & PELAPORAN MASYARAKAT
        </Typography>
        <Typography 
          variant="h5" 
          fontWeight="600" 
          color="white"
          sx={{ 
            fontSize: { xs: '1.25rem', md: '2.25rem' } 
          }}
        >
          UNIVERSITAS SYIAH KUALA
        </Typography>
        </Box>
      </Box>
      <Box>
        <ReportSummary />
      </Box>
      <ReportForm />
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 10 }, px: { xs: 2, md: 0 }, flexGrow: 1 }}>
        <InformasiSection />
      </Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 10,
          pb: 5,
          borderTop: '1px solid black',
          pt: 2,
          px: 5,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            color: '#000',
            fontSize: '1rem',
            fontWeight: 'bold',
            mb: { xs: 2, md: 0 },
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