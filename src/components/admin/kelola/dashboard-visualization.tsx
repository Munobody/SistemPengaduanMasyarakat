'use client';

import React, { useEffect, useState, memo } from 'react';
import { Box, Card, CardContent, Grid, Typography, ButtonGroup, Button, useMediaQuery, useTheme } from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '@/lib/api/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Unit {
  id: string;
  nama_unit: string;
  jenis_unit: string;
  createdAt?: string;
  kepalaUnit?: {
    name: string;
  };
}

const AdminDashboardVisualization: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalPelaporan, setTotalPelaporan] = useState<number>(0);
  const [totalPelaporanMasyarakat, setTotalPelaporanMasyarakat] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'bulan' | 'hari'>('bulan');
  const [internalEntries, setInternalEntries] = useState<any[]>([]);
  const [masyarakatEntries, setMasyarakatEntries] = useState<any[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [internalData, setInternalData] = useState<number[]>([]);
  const [masyarakatData, setMasyarakatData] = useState<number[]>([]);
  const [totalInternalPelaporan, setTotalInternalPelaporan] = useState<number>(0);
  const [recentUnits, setRecentUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Total pelaporan & masyarakat
        const pelaporanCountResponse = await api.get('/pelaporan/count');
        const totalCount = pelaporanCountResponse.data.content.totalCount || 0;
        const totalMasyarakat = pelaporanCountResponse.data.content.totalCountMasyarakat || 0;
        
        setTotalPelaporan(totalCount);
        setTotalPelaporanMasyarakat(totalMasyarakat);
        setTotalInternalPelaporan(totalCount - totalMasyarakat); // Calculate internal reports

        // Data internal & masyarakat
        const [internalRes, masyarakatRes] = await Promise.all([
          api.get('/pelaporan?page=1&rows=365&orderKey=createdAt&orderRule=asc'),
          api.get('/pengaduan?page=1&rows=365&orderKey=createdAt&orderRule=asc'),
        ]);
        setInternalEntries(internalRes.data.content.entries || []);
        setMasyarakatEntries(masyarakatRes.data.content.entries || []);

        // Fetch units and filter recent ones
        const unitResponse = await api.get('/units?page=1&rows=100');
        const units = unitResponse.data.content.entries || [];
        
        // Filter units created within last month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const recent = units.filter((unit: Unit) => {
          if (!unit.createdAt) return false;
          const createdDate = new Date(unit.createdAt);
          return createdDate > oneMonthAgo;
        });

        setRecentUnits(recent);
        setTotalUnits(unitResponse.data.content.totalData || 0);

      } catch (error) {
        setTotalUnits(0);
        setTotalPelaporan(0);
        setTotalPelaporanMasyarakat(0);
        setTotalInternalPelaporan(0);
        setInternalEntries([]);
        setMasyarakatEntries([]);
        setRecentUnits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sinkronisasi label dan data untuk 2 line
  useEffect(() => {
    // Helper untuk group data
    function group(entries: any[], mode: 'bulan' | 'hari') {
      const map: Record<string, number> = {};
      entries.forEach((item) => {
        const date = new Date(item.createdAt);
        let key = '';
        if (mode === 'bulan') {
          key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else {
          key = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        map[key] = (map[key] || 0) + 1;
      });
      return map;
    }

    const mapInternal = group(internalEntries, groupBy);
    const mapMasyarakat = group(masyarakatEntries, groupBy);

    // Gabungkan semua label unik, urutkan
    const allLabels = Array.from(new Set([...Object.keys(mapInternal), ...Object.keys(mapMasyarakat)]));
    // Sort label by date
    allLabels.sort((a, b) => {
      // Convert label to Date for sorting
      const parse = (label: string) =>
        groupBy === 'bulan'
          ? new Date('01 ' + label) // e.g. "Jan 2025" => "01 Jan 2025"
          : new Date(label);
      return parse(a).getTime() - parse(b).getTime();
    });

    setTrendLabels(allLabels);
    setInternalData(allLabels.map((l) => mapInternal[l] || 0));
    setMasyarakatData(allLabels.map((l) => mapMasyarakat[l] || 0));
  }, [internalEntries, masyarakatEntries, groupBy]);

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={isMobile ? 2 : 3}>
          {[...Array(3)].map((_, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Skeleton height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: isMobile ? 2 : 4,
        px: isMobile ? 2 : 3,
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        '@media (max-width: 600px)': {
          px: 1,
          mt: 1,
        },
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        align="center"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#003C43',
          mb: isMobile ? 3 : 4,
          '@media (max-width: 600px)': {
            fontSize: '1.25rem',
          },
        }}
      >
        Dashboard Admin - Visualisasi Data Unit & Pelaporan
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ bgcolor: '#77B0AA', color: '#E3FEF7', minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Total Unit</Typography>
              <Typography variant="h3" align="center">{totalUnits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ bgcolor: '#135D66', color: '#E3FEF7', minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Total Pelaporan Internal</Typography>
              <Typography variant="h3" align="center">
                {totalPelaporan - totalPelaporanMasyarakat}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ bgcolor: '#003C43', color: '#E3FEF7', minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Total Pelaporan Masyarakat</Typography>
              <Typography variant="h3" align="center">{totalPelaporanMasyarakat}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#FFFFFF',
              minHeight: isMobile ? 250 : 300,
              '@media (max-width: 600px)': {
                minHeight: 200,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#003C43', fontWeight: 'bold' }}>
                  Tren Jumlah Laporan {groupBy === 'bulan' ? 'per Bulan' : 'per Hari'}
                </Typography>
                <ButtonGroup size="small">
                  <Button 
                    variant={groupBy === 'bulan' ? 'contained' : 'outlined'}
                    onClick={() => setGroupBy('bulan')}
                  >
                    Bulan
                  </Button>
                  <Button
                    variant={groupBy === 'hari' ? 'contained' : 'outlined'}
                    onClick={() => setGroupBy('hari')}
                  >
                    Hari
                  </Button>
                </ButtonGroup>
              </Box>
              <Box sx={{ height: isMobile ? 200 : 250 }}>
                {groupBy === 'bulan' ? (
                  <Bar
                    data={{
                      labels: trendLabels,
                      datasets: [
                        {
                          label: 'Pelaporan Internal',
                          data: internalData,
                          backgroundColor: '#135D66',
                          borderColor: '#135D66',
                          borderWidth: 1,
                        },
                        {
                          label: 'Pengaduan Masyarakat',
                          data: masyarakatData,
                          backgroundColor: '#77B0AA',
                          borderColor: '#77B0AA',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          display: true,
                          position: 'top',
                        }
                      },
                      scales: {
                        x: {
                          title: { 
                            display: true,
                            text: 'Bulan'
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Jumlah' }
                        }
                      }
                    }}
                  />
                ) : (
                  <Line
                    data={{
                      labels: trendLabels,
                      datasets: [
                        {
                          label: 'Pelaporan Internal',
                          data: internalData,
                          borderColor: '#135D66',
                          backgroundColor: '#135D66',
                          tension: 0.3,
                          pointRadius: 3,
                        },
                        {
                          label: 'Pengaduan Masyarakat',
                          data: masyarakatData,
                          borderColor: '#77B0AA',
                          backgroundColor: '#77B0AA',
                          tension: 0.3,
                          pointRadius: 3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          display: true,
                          position: 'top',
                        }
                      },
                      scales: {
                        x: {
                          title: { 
                            display: true,
                            text: 'Tanggal'
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Jumlah' }
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {recentUnits.length > 0 && (
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                bgcolor: '#FFFFFF',
                minHeight: isMobile ? 100 : 120,
                p: 2
              }}
            >
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ color: '#003C43', fontWeight: 'bold', mb: 2 }}
              >
                Unit Baru
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentUnits.map((unit) => (
                  <Box
                    key={unit.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: '#E3FEF7',
                      p: 1.5,
                      borderRadius: 1
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {unit.nama_unit}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {unit.jenis_unit} - {unit.kepalaUnit?.name || 'Belum ada kepala unit'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {unit.createdAt && new Date(unit.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
});

export default AdminDashboardVisualization;