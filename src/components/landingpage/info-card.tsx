"use client";
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Skeleton,
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
      minHeight: 120,
      textAlign: 'center', 
      border: '2px solid #4A628A', 
      boxShadow: 3, 
      borderRadius: 2, 
      backgroundColor: '#E0F7FA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)'
      }
    }}>
      <CardContent>
        {loading ? (
          <>
            <Skeleton 
              variant="text" 
              width="60%" 
              height={32} 
              sx={{ mx: 'auto', bgcolor: 'grey.300' }} 
            />
            <Skeleton 
              variant="text" 
              width="40%" 
              height={24} 
              sx={{ mx: 'auto', mt: 1, bgcolor: 'grey.300' }} 
            />
          </>
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
  const [totalLaporanMasyarakat, setTotalLaporanMasyarakat] = useState<number | null>(null);
  const [displayTotalLaporan, setDisplayTotalLaporan] = useState<number>(0);
  const [totalKategori, setTotalKategori] = useState<number | null>(null);
  const [displayKategori, setDisplayKategori] = useState<number>(0);
  const [totalUnit, setTotalUnit] = useState<number | null>(null);
  const [displayUnit, setDisplayUnit] = useState<number>(0);
  const [totalUnitTerpadu, setTotalUnitTerpadu] = useState<number | null>(null);
  const [displayUnitTerpadu, setDisplayUnitTerpadu] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from all endpoints
        const [pelaporanResponse, kategoriResponse, unitResponse, unitTerpaduResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/count`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/unit-terpadu`)
        ]);

        const [pelaporanData, kategoriData, unitData, unitTerpaduData] = await Promise.all([
          pelaporanResponse.json(),
          kategoriResponse.json(),
          unitResponse.json(),
          unitTerpaduResponse.json()
        ]);

        // Set data from pelaporan endpoint
        const internalCount = pelaporanData.content?.totalCount || 0;
        const masyarakatCount = pelaporanData.content?.totalCountMasyarakat || 0;
        
        setTotalLaporan(internalCount);
        setTotalLaporanMasyarakat(masyarakatCount);
        
        // Set other data
        setTotalKategori(kategoriData.content?.totalData || 0);
        setTotalUnit(unitData.content?.totalData || 0);
        setTotalUnitTerpadu(unitTerpaduData.content?.totalData || 0);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && totalLaporan !== null && totalLaporanMasyarakat !== null) {
      const combinedTotal = totalLaporan + totalLaporanMasyarakat;
      
      const interval = setInterval(() => {
        // Animasi penambahan angka untuk total gabungan
        setDisplayTotalLaporan(prev => 
          prev < combinedTotal ? prev + Math.max(1, Math.ceil(combinedTotal / 100)) : combinedTotal
        );
        
        // Animasi untuk kategori
        if (totalKategori !== null) {
          setDisplayKategori(prev => 
            prev < totalKategori ? prev + Math.max(1, Math.ceil(totalKategori / 100)) : totalKategori
          );
        }
        
        // Animasi untuk unit
        if (totalUnit !== null) {
          setDisplayUnit(prev => 
            prev < totalUnit ? prev + Math.max(1, Math.ceil(totalUnit / 100)) : totalUnit
          );
        }

        // Animasi untuk unit terpadu
        if (totalUnitTerpadu !== null) {
          setDisplayUnitTerpadu(prev => 
            prev < totalUnitTerpadu ? prev + Math.max(1, Math.ceil(totalUnitTerpadu / 100)) : totalUnitTerpadu
          );
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [loading, totalLaporan, totalLaporanMasyarakat, totalKategori, totalUnit, totalUnitTerpadu]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      p={isSmallScreen ? 2 : isMediumScreen ? 3 : 4}
      width="100%"
      bgcolor="#FFFFFF"
    >
      {loading ? (
        <Skeleton 
          variant="text" 
          width={isSmallScreen ? '80%' : '60%'} 
          height={isSmallScreen ? 40 : 48} 
          sx={{ mb: isSmallScreen ? 2 : 4, bgcolor: 'grey.300' }} 
        />
      ) : (
        <Typography 
          variant={isSmallScreen ? "h5" : isMediumScreen ? "h4" : "h3"} 
          fontWeight="bold" 
          color="black" 
          sx={{ textAlign: 'center', mb: isSmallScreen ? 3 : 4 }} 
        >
          Instansi Terhubung
        </Typography>
      )}
      
      <Grid 
        container 
        spacing={isSmallScreen ? 2 : isMediumScreen ? 3 : 4} 
        justifyContent="center"
        width="100%"
        maxWidth={isSmallScreen ? '100%' : isMediumScreen ? '900px' : '1200px'}
      >
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard 
            title={displayKategori.toString()} 
            subtitle="Direktorat" 
            loading={loading} 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard 
            title={displayUnit.toString()} 
            subtitle="Fakultas" 
            loading={loading} 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard 
            title={displayUnitTerpadu.toString()} 
            subtitle="Unit Pelayanan Terpadu" 
            loading={loading} 
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
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