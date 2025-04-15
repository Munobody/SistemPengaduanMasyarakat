'use client';

import React, { useEffect, useState, memo } from 'react';
import { Box, Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '@/lib/api/api'; // Asumsi API sudah diatur

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardVisualization: React.FC = memo(() => {
  const [units, setUnits] = useState<{ id: string; nama_unit: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse] = await Promise.all([
          api.get('/units?page=1&rows=12&orderKey=nama_unit&orderRule=asc'),
          api.get('/kategori?page=1&rows=12&orderKey=nama&orderRule=asc'),
        ]);

        setUnits(unitResponse.data.content.entries || []);
        setCategories(categoryResponse.data.content.entries || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.name) {
      setUserName(userData.name); // Set nama pengguna ke state
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Data untuk grafik batang (bar chart)
  const barChartData = {
    labels: ['Units', 'Categories'],
    datasets: [
      {
        label: 'Jumlah',
        data: [units.length, categories.length],
        backgroundColor: ['#77B0AA', '#135D66'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Perbandingan Jumlah Unit dan Kategori',
      },
    },
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 4, px: 3 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#003C43',
          mb: 4,
        }}
      >
        Selamat Datang, {userName}!
      </Typography>
      <Grid container spacing={3}>
        {/* Total Unit */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ bgcolor: '#77B0AA', color: '#E3FEF7', minHeight: 150 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Total Unit
              </Typography>
              <Typography variant="h3" align="center">
                {units.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Kategori */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ bgcolor: '#135D66', color: '#E3FEF7', minHeight: 150 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Total Kategori
              </Typography>
              <Typography variant="h3" align="center">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Grafik Perbandingan */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ bgcolor: '#E3FEF7', minHeight: 300 }}>
            <CardContent>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ color: '#003C43', fontWeight: 'bold' }}
              >
                Grafik Perbandingan Unit dan Kategori
              </Typography>
              <Bar data={barChartData} options={barChartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default DashboardVisualization;