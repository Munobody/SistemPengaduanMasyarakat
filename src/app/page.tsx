import * as React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      scrollBehavior: 'smooth'
    }}>
      <Box
        component="section"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: '80vh', sm: '90vh', md: '100vh' },
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
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 8, sm: 10, md: 12 },
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
                fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                letterSpacing: { xs: '0.5px', md: '1px' },
                lineHeight: 1.3,
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                mb: { xs: 3, md: 4 },
                maxWidth: '90%',
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
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                textShadow: '1px 1px 4px rgba(0,0,0,0.4)',
                maxWidth: '80%',
                mx: 'auto',
                mb: { xs: 4, md: 6 },
              }}
            >
              UNIVERSITAS SYIAH KUALA
            </Typography>
          </Container>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.25)',
            zIndex: 0,
          }}
        />
      </Box>

      {/* Divider between hero and form section */}
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.12)', borderWidth: 1, mx: 'auto', width: '90%' }} />

      <Box 
        component="section" 
        id="form"
        sx={{ 
          py: { xs: 6, sm: 8, md: 10 },
          backgroundColor: '#ffffff',
        }}
      >
        <Container maxWidth="md">
          <ReportForm />
        </Container>
      </Box>

      {/* Divider between form and summary sections */}
      <Divider sx={{ 
        borderColor: 'rgba(0,0,0,0.12)', 
        borderWidth: 1, 
        mx: 'auto', 
        width: '90%',
        my: 2 
      }} />

      <Box 
        component="section" 
        id="summary"
        sx={{ 
          py: { xs: 6, sm: 8, md: 10 },
          backgroundColor: '#ffffff',
        }}
      >
        <Container maxWidth="xl">
          <ReportSummary />
        </Container>
      </Box>

      {/* Divider between summary and informasi sections */}
      <Divider sx={{ 
        borderColor: 'rgba(0,0,0,0.12)', 
        borderWidth: 1, 
        mx: 'auto', 
        width: '90%',
        my: 2 
      }} />

      <Box
        component="section"
        id="informasi"
        sx={{ 
          py: { xs: 6, sm: 8, md: 10 },
          backgroundColor: '#ffffff',
        }}
      >
        <Container maxWidth="lg">
          <InformasiSection />
        </Container>
      </Box>

      {/* Divider before footer */}
      <Divider sx={{ 
        borderColor: 'rgba(0,0,0,0.12)', 
        borderWidth: 1, 
        mx: 'auto', 
        width: '100%',
        mt: 2 
      }} />

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          py: { xs: 4, sm: 5 },
          px: { xs: 3, sm: 4, md: 6 },
          mt: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mb: { xs: 3, sm: 0 } }}>
          <Typography
            variant="body1"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            © 2025 Sistem Pelaporan & Pengaduan Masyarakat
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#555',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              mt: 1,
            }}
          >
            Universitas Syiah Kuala | Contact: info@usk.ac.id
          </Typography>
        </Box>
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
              height: '60px',
              maxHeight: '60px',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}