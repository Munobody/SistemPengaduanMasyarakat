'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import { Badge, Box, CircularProgress, Grid, Typography } from '@mui/material';

import api from '@/lib/api/api';
import ComplaintInfo from '../dashboard/dashboard/complaint-info';
import LatestComplaints from '../dashboard/dashboard/VisualDashboard/latest-complaint';
import PieChart from '../dashboard/dashboard/VisualDashboard/chart';
import StatsCard from '../dashboard/dashboard/VisualDashboard/stats-card';


const COLORS = ['#3f51b5', '#f50057', '#00acc1', '#ff9800', '#4caf50', '#9c27b0'];

interface PengaduanEntry {
    id: string;
    judul: string;
    deskripsi: string;
    pihakTerlibat: string;
    tanggalKejadian: string;
    lokasi: string;
    kategoriId: string;
    unit: string;
    pelaporId: string;
    status: string;
    approvedBy: string | null;
    harapan_pelapor: string;
    filePendukung: string;
    response: string;
    filePetugas: string;
    kategori?: {
      id: string;
      nama: string;
      deskripsi: string | null;
    };
    createdAt: string; // Pastikan properti ini ada
    updatedAt: string; // Jika diperlukan
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

const ComplaintsVisualWbs: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get<ApiResponse>('/PelaporanWbs');
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

    const fetchNotifications = async () => {
      try {
        const response = await api.get<NotificationResponse>('/notification');
        if (isMounted) {
          setNotifications(response.data.content.entries);
          setUnreadCount(response.data.content.notRead);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.name) {
      setUserName(userData.name); // Set nama pengguna ke state
    }

    fetchData();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 300000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notification/${notificationId}`, { isRead: true });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', paddingTop: '0', marginTop: '0' }}>
          Selamat Datang {userName || 'Mahasiswa'} 👋
        </h2>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Pengaduan"
            value={processedData.totalCount}
            loading={loading}
            icon={<DescriptionIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Diselesaikan"
            value={processedData.completedCount}
            loading={loading}
            icon={<CheckCircleIcon fontSize="large" color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Tertunda"
            value={processedData.pendingCount}
            loading={loading}
            icon={<PendingIcon fontSize="large" color="warning" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Tingkat Penyelesaian"
            value={`${processedData.completionRate}%`}
            loading={loading}
            icon={<AssessmentIcon fontSize="large" color="primary" />}
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PieChart data={processedData.pieChartData} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ComplaintInfo />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <LatestComplaints complaints={data.content.entries} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintsVisualWbs;