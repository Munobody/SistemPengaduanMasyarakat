"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, CircularProgress } from '@mui/material';

interface CardProps {
  title: string;
  subtitle: string;
  loading: boolean;
}

const InfoCard: React.FC<CardProps> = ({ title, subtitle, loading }) => {
  return (
    <Card sx={{ width: '100%', textAlign: 'center', border: '2px solid #4A628A', boxShadow: 3, borderRadius: 2, backgroundColor: '#E0F7FA' }}>
      <CardContent>
        {loading ? (
          <CircularProgress />
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
  const [totalLaporan, setTotalLaporan] = useState<number | null>(null);
  const [displayLaporan, setDisplayLaporan] = useState<number>(0);
  const [totalKategori, setTotalKategori] = useState<number | null>(null);
  const [displayKategori, setDisplayKategori] = useState<number>(0);
  const [totalUnit, setTotalUnit] = useState<number | null>(null);
  const [displayUnit, setDisplayUnit] = useState<number>(0);
  const [countdown, setCountdown] = useState(86400); // 24 jam dalam detik
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan/count`);
        const data = await response.json();
        console.log('Laporan response:', data);
        if (data.content) {
          const total = data.content.totalCount + data.content.totalCountMasyarakat;
          setTotalLaporan(total);
        }
      } catch (error) {
        console.error('Error fetching laporan:', error);
      }
    };

    const fetchKategori = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori`);
        const data = await response.json();
        console.log('Kategori response:', data);
        if (data.content?.totalData !== undefined) {
          setTotalKategori(data.content.totalData);
        }
      } catch (error) {
        console.error('Error fetching kategori:', error);
      }
    };

    const fetchUnit = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`);
        const data = await response.json();
        console.log('Unit response:', data);
        if (data.content?.totalData !== undefined) {
          setTotalUnit(data.content.totalData);
        }
      } catch (error) {
        console.error('Error fetching unit:', error);
      }
    };

    fetchLaporan();
    fetchKategori();
    fetchUnit();
  }, []);

  useEffect(() => {
    if (totalLaporan !== null && totalKategori !== null && totalUnit !== null) {
      setLoading(false);
    }
  }, [totalLaporan, totalKategori, totalUnit]);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setDisplayLaporan((prev) => (prev < totalLaporan! ? prev + Math.ceil(totalLaporan! / 100) : totalLaporan!));
        setDisplayKategori((prev) => (prev < totalKategori! ? prev + Math.ceil(totalKategori! / 100) : totalKategori!));
        setDisplayUnit((prev) => (prev < totalUnit! ? prev + Math.ceil(totalUnit! / 100) : totalUnit!));
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Typography variant="h4" fontWeight="bold" color="black" sx={{ textAlign: 'center' }} mb={4}>
        JUMLAH LAPORAN PENGADUAN
      </Typography>
      <Card sx={{ textAlign: 'center', border: '2px solid #4A628A', boxShadow: 3, borderRadius: 2, p: 4, mb: 6, width: '100%', maxWidth: 400, backgroundColor: '#E0F7FA' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" color="black">
            JUMLAH LAPORAN SEKARANG
          </Typography>
          <Typography variant="h3" fontWeight="bold" mt={2} color="black">
            {loading ? <CircularProgress /> : displayLaporan}
          </Typography>
        </CardContent>
      </Card>
      <Typography variant="h5" color="white" fontWeight="bold" mb={3}>
        Reset Data dalam: {formatTime(countdown)}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title={displayKategori.toString()} subtitle="Kategori" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title={displayUnit.toString()} subtitle="Unit Pelayan Terpadu" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title="XXX" subtitle="Lembaga" loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportSummary;