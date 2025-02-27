import * as React from 'react';
import { Box, Container } from '@mui/material';
import { ColourfulTextDemo } from '@/components/landingpage/colourfulltext';
import { Navbar } from '@/components/landingpage/navbar';
import ReportSummary from '@/components/landingpage/info-card';
import ReportForm from '@/components/landingpage/report-form';
import InformasiSection from '@/components/landingpage/information';

export default function LandingPage(): React.JSX.Element {
  return (
    <Box>
      <Box
        sx={{
          display: { xs: 'flex' },
          flexDirection: 'column',
          gridTemplateColumns: '1fr 1fr',
          minHeight: { xs: "50vh", md: "100vh" },
          backgroundImage: 'url(/assets/bg-1.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Navbar />
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: { xs: 10, md: 30 }, flexGrow: 1 }}>
          <ColourfulTextDemo />
        </Container>
      </Box>
      <Box 
        // sx={{
        //   display: { xs: 'flex' },
        //   flexDirection: 'column',
        //   gridTemplateColumns: '1fr 1fr',
        //   // background: 'linear-gradient(to bottom, #08554B 0%, #098475 50%, rgba(255, 255, 255, 0.9) 90%, white 100%)',
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
        >
          <ReportSummary />
      </Box>
        <ReportForm />
      
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 10 }, px: { xs: 2, md: 0 }, flexGrow: 1 }}>
        <InformasiSection />
      </Container>
      
      {/* Footer */}
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