'use client';

import React, { useEffect, useState, memo } from 'react';
import { Box, Card, CardContent, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '@/lib/api/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Unit {
  id: string;
  nama_unit: string;
}

interface Category {
  id: string;
  nama: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  createdAt?: string;
}

interface Complaint {
  id: string;
  judul: string;
  deskripsi: string;
  status: string;
  pelaporId: string;
  unitId: string;
  response: string;
  kategoriId: string;
  createdAt: string;
  updatedAt: string;
  nama: string;
  tipePengaduan: string;
}

interface ApiResponse<T> {
  content: {
    entries: T[];
    totalData: number;
    totalPage: number;
  };
  message: string;
  errors: any[];
}

const AdminDashboardVisualization: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, categoryResponse, userResponse, publicComplaintResponse, userComplaintResponse] = await Promise.all([
          api.get<ApiResponse<Unit>>('/units?page=1&rows=12&orderKey=nama_unit&orderRule=asc'),
          api.get<ApiResponse<Category>>('/kategori?page=1&rows=12&orderKey=nama&orderRule=asc'),
          api.get<ApiResponse<User>>('/users?page=1&rows=50'),
          api.get<ApiResponse<Complaint>>('/pengaduan?page=1&rows=50'), // Public complaints
          api.get<ApiResponse<Complaint>>('/pelaporan?page=1&rows=50'), // User complaints
        ]);

        const publicComplaints = publicComplaintResponse.data.content.entries || [];
        const userComplaints = userComplaintResponse.data.content.entries || [];
        const combinedComplaints = [...publicComplaints, ...userComplaints];

        setUnits(unitResponse.data.content.entries || []);
        setCategories(categoryResponse.data.content.entries || []);
        setUsers(userResponse.data.content.entries || []);
        setComplaints(combinedComplaints);
        console.log('Fetched public complaints from /pengaduan:', publicComplaints);
        console.log('Fetched user complaints from /pelaporan:', userComplaints);
        console.log('Combined complaints:', combinedComplaints);
      } catch (error: any) {
        console.error('Error fetching data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.name) {
      setUserName(userData.name);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: isMobile ? 2 : 3,
          minHeight: '100vh',
          bgcolor: '#FFFFFF',
        }}
      >
        <Skeleton
          height={isMobile ? 30 : 40}
          width={isMobile ? '80%' : '50%'}
          baseColor="#77B0AA"
          highlightColor="#E3FEF7"
        />
        <Grid container spacing={isMobile ? 2 : 3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Skeleton
                height={isMobile ? 120 : 150}
                width="100%"
                baseColor="#77B0AA"
                highlightColor="#E3FEF7"
              />
            </Grid>
          ))}
        </Grid>
        <Skeleton
          height={isMobile ? 250 : 300}
          width="100%"
          baseColor="#77B0AA"
          highlightColor="#E3FEF7"
        />
      </Box>
    );
  }

  const userComplaints = complaints.filter((c) => c.tipePengaduan.toUpperCase() === 'USER');
  const publicComplaints = complaints.filter((c) => c.tipePengaduan.toUpperCase() === 'MASYARAKAT');
  const barChartData: ChartData<'bar'> = {
    labels: ['Unit', 'Kategori', 'Pengguna', 'Pengaduan Layanan', 'Pelaporan Masyarakat'],
    datasets: [
      {
        label: 'Jumlah',
        data: [
          units.length,
          categories.length,
          users.length,
          userComplaints.length,
          publicComplaints.length,
        ],
        backgroundColor: ['#77B0AA', '#135D66', '#003C43', '#1A3C34', '#2E8B57'],
        borderColor: ['#77B0AA', '#135D66', '#003C43', '#1A3C34', '#2E8B57'],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: isMobile ? 12 : 14,
          },
          color: '#003C43',
        },
      },
      title: {
        display: true,
        text: 'Perbandingan Jumlah Unit, Kategori, Pengguna, dan Pelaporan',
        color: '#003C43',
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: '#003C43',
        titleColor: '#E3FEF7',
        bodyColor: '#E3FEF7',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#003C43',
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        grid: {
          color: '#77B0AA',
        },
      },
      x: {
        ticks: {
          color: '#003C43',
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const processComplaintsByDate = (complaints: Complaint[]) => {
    return complaints.reduce((acc, complaint) => {
      if (!complaint.createdAt) {
        console.warn('Missing createdAt for complaint:', complaint);
        return acc;
      }
      try {
        const date = new Date(complaint.createdAt);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date for complaint:', complaint);
          return acc;
        }
        const day = date.toISOString().split('T')[0]; 
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      } catch (error) {
        console.warn('Error parsing date for complaint:', complaint, error);
        return acc;
      }
    }, {} as Record<string, number>);
  };

  const dailyUserComplaints = processComplaintsByDate(userComplaints);
  const dailyPublicComplaints = processComplaintsByDate(publicComplaints);
  console.log('User Complaints Count:', userComplaints.length, dailyUserComplaints);
  console.log('Public Complaints Count:', publicComplaints.length, dailyPublicComplaints);


  const getDateRange = (complaintDates: string[]) => {
    if (!complaintDates.length) return [];
    const dates = complaintDates.map((d) => new Date(d));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const dateArray = [];
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  };

  const allDates = Array.from(
    new Set([
      ...Object.keys(dailyUserComplaints),
      ...Object.keys(dailyPublicComplaints),
    ])
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const dateLabels = getDateRange(allDates).length > 0 ? getDateRange(allDates) : ['No Data'];

  const lineChartData: ChartData<'line'> = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Pengaduan Layanan',
        data: dateLabels.map((day) => dailyUserComplaints[day] || 0),
        borderColor: '#003C43',
        backgroundColor: '#003C43',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pelaporan Masyarakat',
        data: dateLabels.map((day) => dailyPublicComplaints[day] || 0),
        borderColor: '#2E8B57',
        backgroundColor: '#2E8B57',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: isMobile ? 12 : 14,
          },
          color: '#003C43',
        },
      },
      title: {
        display: true,
        text: 'Tren Jumlah Pelaporan per Hari',
        color: '#003C43',
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: '#003C43',
        titleColor: '#E3FEF7',
        bodyColor: '#E3FEF7',
        callbacks: {
          title: (tooltipItems) => {
            const date = new Date(tooltipItems[0].label);
            return date.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#003C43',
          font: {
            size: isMobile ? 10 : 12,
          },
          stepSize: 1,
        },
        grid: {
          color: '#77B0AA',
        },
      },
      x: {
        ticks: {
          color: '#003C43',
          font: {
            size: isMobile ? 10 : 12,
          },
          maxTicksLimit: isMobile ? 5 : 10,
          callback: (value, index, values) => {
            const date = new Date(dateLabels[index]);
            return date.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
            });
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };
  const userRoleDistribution = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const recentUsers = users
    .filter((user) => user.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

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
        Dashboard Admin - Selamat Datang, {userName}!
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#77B0AA',
              color: '#E3FEF7',
              minHeight: isMobile ? 120 : 150,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{ '@media (max-width: 600px)': { fontSize: '1rem' } }}
              >
                Total Unit
              </Typography>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                align="center"
                sx={{ '@media (max-width: 600px)': { fontSize: '1.5rem' } }}
              >
                {units.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#135D66',
              color: '#E3FEF7',
              minHeight: isMobile ? 120 : 150,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{ '@media (max-width: 600px)': { fontSize: '1rem' } }}
              >
                Total Kategori
              </Typography>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                align="center"
                sx={{ '@media (max-width: 600px)': { fontSize: '1.5rem' } }}
              >
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#003C43',
              color: '#E3FEF7',
              minHeight: isMobile ? 120 : 150,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{ '@media (max-width: 600px)': { fontSize: '1rem' } }}
              >
                Total Pengguna
              </Typography>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                align="center"
                sx={{ '@media (max-width: 600px)': { fontSize: '1.5rem' } }}
              >
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#1A3C34',
              color: '#E3FEF7',
              minHeight: isMobile ? 120 : 150,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{ '@media (max-width: 600px)': { fontSize: '1rem' } }}
              >
                Total Pelaporan
              </Typography>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                align="center"
                sx={{ '@media (max-width: 600px)': { fontSize: '1.5rem' } }}
              >
                {complaints.length}
              </Typography>
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
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{
                  color: '#003C43',
                  fontWeight: 'bold',
                  '@media (max-width: 600px)': {
                    fontSize: '1rem',
                  },
                }}
              >
                Grafik Perbandingan Data
              </Typography>
              <Box sx={{ height: isMobile ? 200 : 250 }}>
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
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
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{
                  color: '#003C43',
                  fontWeight: 'bold',
                  '@media (max-width: 600px)': {
                    fontSize: '1rem',
                  },
                }}
              >
                Tren Jumlah Pelaporan per Hari
              </Typography>
              {dateLabels.length === 1 && dateLabels[0] === 'No Data' ? (
                <Typography align="center" sx={{ color: '#135D66', mt: 2 }}>
                  Tidak ada data pelaporan untuk ditampilkan.
                </Typography>
              ) : (
                <Box sx={{ height: isMobile ? 200 : 250 }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              bgcolor: '#FFFFFF',
              minHeight: isMobile ? 200 : 250,
              '@media (max-width: 600px)': {
                minHeight: 180,
              },
            }}
          >
            <CardContent>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                align="center"
                gutterBottom
                sx={{
                  color: '#003C43',
                  fontWeight: 'bold',
                  '@media (max-width: 600px)': {
                    fontSize: '1rem',
                  },
                }}
              >
                Aktivitas Terbaru
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        bgcolor: '#E3FEF7',
                        color: '#000000',
                        p: isMobile ? 1 : 1.5,
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant={isMobile ? 'body2' : 'body1'}
                        sx={{ '@media (max-width: 600px)': { fontSize: '0.75rem' } }}
                      >
                        {user.name} ({user.role})
                      </Typography>
                      <Typography
                        variant={isMobile ? 'body2' : 'body1'}
                        sx={{ '@media (max-width: 600px)': { fontSize: '0.75rem' } }}
                      >
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('id-ID')
                          : 'N/A'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant={isMobile ? 'body2' : 'body1'}
                    align="center"
                    sx={{ color: '#135D66' }}
                  >
                    Tidak ada aktivitas terbaru.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default AdminDashboardVisualization;