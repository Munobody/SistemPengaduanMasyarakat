import * as React from 'react';
import { Box, Container, Typography } from '@mui/material';

import { Navbar } from '@/components/landingpage/navbar';
import ReportSummary from '@/components/landingpage/info-card';
import ReportForm from '@/components/landingpage/report-form';
import InformasiSection from '@/components/landingpage/information';
import { Metadata } from 'next';

export const metadata = { 
  title: 'Sistem Pengaduan Layanan',
  description: 'Sistem Pelaporan dan Pengaduan Masyarakat Universitas Syiah Kuala'
} satisfies Metadata;

export default function LandingPage(): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: "70vh", md: "100vh" },
          backgroundImage: 'url(/assets/bg-1.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Navbar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 6, md: 8 },
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h1"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.5rem', lg: '4rem' },
                letterSpacing: { xs: '0.5px', md: '1px' },
                lineHeight: 1.2,
                textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
                mb: { xs: 2, md: 3 },
                maxWidth: '85%',
                mx: 'auto',
              }}
            >
              SISTEM PENGADUAN & PELAPORAN MASYARAKAT
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.25rem' },
                textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                maxWidth: '70%',
                mx: 'auto',
              }}
            >
              UNIVERSITAS SYIAH KUALA
            </Typography>
          </Container>
        </Box>
        {/* Overlay for better text visibility */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 0,
          }}
        />
      </Box>

      {/* Report Summary Section */}
      <Box 
        component="section" 
        id="summary"
        sx={{ 
          py: { xs: 4, md: 6 },
          backgroundColor: '#f9f9f9',
        }}
      >
        <Container maxWidth="lg">
          <ReportSummary />
        </Container>
      </Box>

      {/* Report Form Section */}
      <Box 
        component="section" 
        id="form"
        sx={{ 
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <ReportForm />
        </Container>
      </Box>

      {/* Information Section */}
      <Container
        component="section"
        id="informasi"
        maxWidth="lg"
        sx={{ 
          mt: { xs: 3, md: 6 }, 
          mb: { xs: 4, md: 8 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <InformasiSection />
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          py: { xs: 3, md: 4 },
          px: { xs: 3, sm: 4, md: 6 },
          mt: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: '#000',
            fontWeight: 'bold',
            mb: { xs: 2, md: 0 },
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          © 2025 Sistem Pelaporan & Pengaduan Masyarakat
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/assets/logo-usk.png"
            alt="Logo USK"
            style={{ 
              height: '50px',
              maxHeight: '50px',
              maxWidth: '100%'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}