"use client";
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress,
  useMediaQuery,
  Theme
} from '@mui/material';

interface CardProps {
  title: string;
  subtitle: string;
  loading: boolean;
}

const InfoCard: React.FC<CardProps> = ({ title, subtitle, loading }) => {
  return (
    <Card sx={{ 
      width: '100%', 
      height: '100%',
      textAlign: 'center', 
      border: '2px solid #4A628A', 
      boxShadow: 3, 
      borderRadius: 2, 
      backgroundColor: '#E0F7FA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <CardContent>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mt={1}>
              {subtitle}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ReportSummary: React.FC = () => {
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));
  
  const [totalLaporan, setTotalLaporan] = useState<number | null>(null);
  const [displayLaporan, setDisplayLaporan] = useState<number>(0);
  const [totalKategori, setTotalKategori] = useState<number | null>(null);
  const [displayKategori, setDisplayKategori] = useState<number>(0);
  const [totalUnit, setTotalUnit] = useState<number | null>(null);
  const [displayUnit, setDisplayUnit] = useState<number>(0);
  const [countdown, setCountdown] = useState(86400);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from both endpoints
        const  [pelaporanResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/count`)
        ]);

        const [pelaporanData] = await Promise.all([
          pelaporanResponse.json()
        ]);

        // Calculate total from both endpoints
        const totalPelaporan = pelaporanData.content?.totalCount || 0;
        setTotalLaporan(totalPelaporan);

        const kategoriResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori`);
        const kategoriData = await kategoriResponse.json();
        if (kategoriData.content?.totalData !== undefined) {
          setTotalKategori(kategoriData.content.totalData);
        }

        // Fetch units
        const unitResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`);
        const unitData = await unitResponse.json();
        if (unitData.content?.totalData !== undefined) {
          setTotalUnit(unitData.content.totalData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        if (totalLaporan !== null) {
          setDisplayLaporan((prev) => 
            prev < totalLaporan ? prev + Math.max(1, Math.ceil(totalLaporan / 100)) : totalLaporan
          );
        }
        if (totalKategori !== null) {
          setDisplayKategori((prev) => 
            prev < totalKategori ? prev + Math.max(1, Math.ceil(totalKategori / 100)) : totalKategori
          );
        }
        if (totalUnit !== null) {
          setDisplayUnit((prev) => 
            prev < totalUnit ? prev + Math.max(1, Math.ceil(totalUnit / 100)) : totalUnit
          );
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [loading, totalLaporan, totalKategori, totalUnit]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      p={isSmallScreen ? 2 : 4}
      width="100%"
      position="relative"
    >
      <Typography 
        variant={isSmallScreen ? "h5" : "h4"} 
        fontWeight="bold" 
        color="black" 
        sx={{ textAlign: 'center' }} 
        mb={isSmallScreen ? 2 : 4}
      >
        JUMLAH LAPORAN PENGADUAN LAYANAN USK
      </Typography>
      
      <Card sx={{ 
        textAlign: 'center', 
        border: '2px solid #4A628A', 
        boxShadow: 3, 
        borderRadius: 2, 
        p: isSmallScreen ? 2 : 4, 
        mb: isSmallScreen ? 3 : 6, 
        width: '100%', 
        maxWidth: 400, 
        backgroundColor: '#E0F7FA' 
      }}>
        <CardContent>
          <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="600" color="black">
            JUMLAH LAPORAN SEKARANG
          </Typography>
          <Typography variant={isSmallScreen ? "h4" : "h3"} fontWeight="bold" mt={2} color="black">
            {loading ? <CircularProgress size={isSmallScreen ? 32 : 48} /> : displayLaporan}
          </Typography>
        </CardContent>
      </Card>

      <Grid 
        container 
        spacing={isSmallScreen ? 1 : 2} 
        justifyContent="center"
        width="100%"
        maxWidth="1200px"
      >
        <Grid item xs={12} sm={6} md={4} width="100%">
          <InfoCard 
            title={displayKategori.toString()} 
            subtitle="Kategori" 
            loading={loading} 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} width="100%">
          <InfoCard 
            title={displayUnit.toString()} 
            subtitle="Unit Pelayan Terpadu" 
            loading={loading} 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} width="100%">
          <InfoCard 
            title="XXX" 
            subtitle="Lembaga" 
            loading={loading} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportSummary;