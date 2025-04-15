'use client';

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import { Box, Grid, Skeleton, Typography } from '@mui/material';

import api from '@/lib/api/api';

// Lazy load components
const ComplaintInfo = lazy(() => import('./complaint-info'));
const PieChart = lazy(() => import('./VisualDashboard/chart'));
const LatestComplaints = lazy(() => import('./VisualDashboard/latest-complaint'));
const StatsCard = lazy(() => import('./VisualDashboard/stats-card'));

const COLORS = ['#3f51b5', '#f50057', '#00acc1', '#ff9800', '#4caf50', '#9c27b0'];

interface PengaduanEntry {
  id: string;
  judul: string;
  deskripsi: string;
  nameUnit: string;
  pelaporId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  harapan_pelapor: string;
  filePendukung: string;
  response: string;
  filePetugas: string;
}

interface ApiResponse {
  content: {
    entries: PengaduanEntry[];
    totalData: number;
    totalPage: number;
  };
  message: string;
  errors: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  type: string;
  pengaduanId: string;
  pengaduanMasyarakatId: string | null;
  pelaporanWBSId: string | null;
}

export interface NotificationResponse {
  content: {
    entries: Notification[];
    notRead: number;
    totalData: number;
    totalPage: number;
  };
  message: string;
  errors: string[];
}

const WelcomeMessage = React.memo(({ userName }: { userName: string }) => (
  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', pt: 0, mt: 0 }}>
    Selamat Datang {userName || 'Mahasiswa'} !
  </Typography>
));

const ComplaintsVisual: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get<ApiResponse>('/pelaporan');
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch data');
          console.error('Error fetching data:', err);
          setLoading(false);
        }
      }
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.name && userData.name !== userName) {
      setUserName(userData.name);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userName]);

  const processedData = useMemo(() => {
    if (!data || !data.content || !data.content.entries) {
      return {
        statusCounts: {},
        pieChartData: { labels: [], datasets: [] },
        completedCount: 0,
        pendingCount: 0,
        totalCount: 0,
        completionRate: '0',
      };
    }

    const entries = data.content.entries;

    const statusCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    });

    const completedCount = statusCounts['COMPLETED'] || 0;
    const pendingCount = statusCounts['PENDING'] || 0;
    const totalCount = entries.length;
    const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0';

    const statusLabels = Object.keys(statusCounts);
    const pieChartData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusLabels.map((key) => statusCounts[key]),
          backgroundColor: COLORS.slice(0, statusLabels.length),
          borderWidth: 1,
        },
      ],
    };

    return {
      statusCounts,
      pieChartData,
      completedCount,
      pendingCount,
      totalCount,
      completionRate,
    };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} width="100%" />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={300} width="100%" />
        </Box>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error || 'No data available'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, pt: 0 }}>
        <WelcomeMessage userName={userName} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ minHeight: 150 }}>
            <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
              {index === 0 && (
                <StatsCard
                  title="Total Pengaduan"
                  value={processedData.totalCount}
                  loading={loading}
                  icon={<DescriptionIcon fontSize="large" color="primary" />}
                />
              )}
              {index === 1 && (
                <StatsCard
                  title="Diselesaikan"
                  value={processedData.completedCount}
                  loading={loading}
                  icon={<CheckCircleIcon fontSize="large" color="success" />}
                  color="success.main"
                />
              )}
              {index === 2 && (
                <StatsCard
                  title="Tertunda"
                  value={processedData.pendingCount}
                  loading={loading}
                  icon={<PendingIcon fontSize="large" color="warning" />}
                  color="warning.main"
                />
              )}
              {index === 3 && (
                <StatsCard
                  title="Tingkat Penyelesaian"
                  value={`${processedData.completionRate}%`}
                  loading={loading}
                  icon={<AssessmentIcon fontSize="large" color="primary" />}
                  color="primary.main"
                />
              )}
            </Suspense>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sx={{ minHeight: 600 }}>
          <Box sx={{ height: 600, overflow: 'auto' }}>
            <Suspense fallback={<Skeleton variant="rectangular" height={300} width="100%" />}>
              <PieChart data={processedData.pieChartData} loading={loading} />
            </Suspense>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ minHeight: 600 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={300} width="100%" />}>
            <ComplaintInfo />
          </Suspense>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} sx={{ minHeight: 300 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={300} width="100%" />}>
            <LatestComplaints complaints={data.content.entries} loading={loading} />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintsVisual;
