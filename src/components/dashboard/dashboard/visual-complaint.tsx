'use client';

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SecurityIcon from '@mui/icons-material/Security';
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
  isWBS?: boolean;
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

interface AclResponse {
  content: {
    userLevelId: string;
    permissions: {
      subject: string;
      actions: string[];
    }[];
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
  const [hasWBSAccess, setHasWBSAccess] = useState<boolean>(false);
  const [userLevelId, setUserLevelId] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData?.name && userData.name !== userName) {
      setUserName(userData.name);
    }
    if (userData?.userLevelId && userData.userLevelId !== userLevelId) {
      setUserLevelId(userData.userLevelId);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAclAndData = async () => {
      if (!userLevelId) return;

      try {
        // 1. Fetch ACL permissions first
        const aclRes = await api.get<AclResponse>(`/acl/${userLevelId}`);
        const permissions = aclRes.data.content.permissions;
        
        // Check WBS access based on permissions
        const hasAccess = permissions.some(p => 
          (p.subject === 'PENGADUAN_WBS' || p.subject === 'WBS') && 
          p.actions.includes('read')
        );
        
        if (!isMounted) return;
        setHasWBSAccess(hasAccess);

        // 2. Fetch complaint data based on permissions
        const regularRes = await api.get<ApiResponse>('/pelaporan');
        
        let wbsEntries: PengaduanEntry[] = [];
        if (hasAccess) {
          try {
            const wbsRes = await api.get<ApiResponse>('/PelaporanWbs?page=0&rows=1000');
            wbsEntries = (wbsRes.data.content.entries || []).map(entry => ({
              ...entry,
              isWBS: true,
            }));
          } catch (wbsError) {
            console.error('Error fetching WBS data:', wbsError);
          }
        }

        // Merge data
        const allEntries = [...regularRes.data.content.entries, ...wbsEntries];
        const regularCount = regularRes.data.content.entries.length;
        const wbsCount = wbsEntries.length;

        if (isMounted) {
          setData({
            ...regularRes.data,
            content: {
              ...regularRes.data.content,
              entries: allEntries,
              totalData: hasAccess ? regularCount + wbsCount : regularCount,
            },
          });
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

    fetchAclAndData();

    return () => {
      isMounted = false;
    };
  }, [userLevelId]);

  const processedData = useMemo(() => {
    if (!data || !data.content?.entries) {
      return {
        statusCounts: {},
        pieChartData: { labels: [], datasets: [] },
        completedCount: 0,
        pendingCount: 0,
        processCount: 0,
        wbsCount: 0,
        regularCount: 0,
        totalCount: 0,
        completionRate: '0',
      };
    }

    const entries = data.content.entries;
    const regularEntries = entries.filter(entry => !entry.isWBS);
    const wbsEntries = entries.filter(entry => entry.isWBS);

    // Count status for regular complaints
    const regularStatusCounts: Record<string, number> = {};
    regularEntries.forEach(entry => {
      regularStatusCounts[entry.status] = (regularStatusCounts[entry.status] || 0) + 1;
    });

    // Count status for WBS complaints
    const wbsStatusCounts: Record<string, number> = {};
    if (hasWBSAccess) {
      wbsEntries.forEach(entry => {
        wbsStatusCounts[entry.status] = (wbsStatusCounts[entry.status] || 0) + 1;
      });
    }

    const completedCount = (regularStatusCounts['COMPLETED'] || 0) + (wbsStatusCounts['COMPLETED'] || 0);
    const pendingCount = (regularStatusCounts['PENDING'] || 0) + (wbsStatusCounts['PENDING'] || 0);
    const processCount = (regularStatusCounts['PROCESS'] || 0) + (wbsStatusCounts['PROCESS'] || 0);
    const wbsCount = wbsEntries.length;
    const regularCount = regularEntries.length;
    const totalCount = regularCount + (hasWBSAccess ? wbsCount : 0);
    const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0';

    const allLabels = Object.keys(regularStatusCounts)
      .concat(hasWBSAccess ? Object.keys(wbsStatusCounts) : []);
    const statusLabels = allLabels.filter((label, index) => allLabels.indexOf(label) === index);

    const pieChartData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusLabels.map(key => 
            (regularStatusCounts[key] || 0) + (hasWBSAccess ? (wbsStatusCounts[key] || 0) : 0)
          ),
          backgroundColor: COLORS.slice(0, statusLabels.length),
          borderWidth: 1,
        },
      ],
    };

    return {
      statusCounts: regularStatusCounts,
      pieChartData,
      completedCount,
      pendingCount,
      processCount,
      wbsCount,
      regularCount,
      totalCount,
      completionRate,
    };
  }, [data, hasWBSAccess]);

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
        {/* Total Pengaduan (Reguler + WBS) */}
        <Grid item xs={12} sm={6} md={hasWBSAccess ? 3 : 4} sx={{ minHeight: 150 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
            <StatsCard
              title="Total Pengaduan"
              value={processedData.totalCount}
              loading={loading}
              icon={<DescriptionIcon fontSize="large" />}
              color="primary.main"
              backgroundColor="#E3FEF7"
            />
          </Suspense>
        </Grid>

        {/* Total Pengaduan WBS (only shown if has access) */}
        {hasWBSAccess && (
          <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
            <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
              <StatsCard
                title="Pengaduan WBS"
                value={processedData.wbsCount}
                loading={loading}
                icon={<SecurityIcon fontSize="large" />}
                color="secondary.main"
                backgroundColor="#EDE7F6"
              />
            </Suspense>
          </Grid>
        )}

        {/* Diselesaikan */}
        <Grid item xs={12} sm={6} md={hasWBSAccess ? 3 : 4} sx={{ minHeight: 150 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
            <StatsCard
              title="Diselesaikan"
              value={processedData.completedCount}
              loading={loading}
              icon={<CheckCircleIcon fontSize="large" />}
              color="success.main"
              backgroundColor="#E7F7ED"
            />
          </Suspense>
        </Grid>

        {/* Tertunda */}
        <Grid item xs={12} sm={6} md={hasWBSAccess ? 3 : 4} sx={{ minHeight: 150 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
            <StatsCard
              title="Tertunda"
              value={processedData.pendingCount}
              loading={loading}
              icon={<PendingIcon fontSize="large" />}
              color="warning.main"
              backgroundColor="#FFF4E5"
            />
          </Suspense>
        </Grid>

        {/* Dalam Proses */}
        <Grid item xs={12} sm={6} md={hasWBSAccess ? 3 : 4} sx={{ minHeight: 150 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
            <StatsCard
              title="Dalam Proses"
              value={processedData.processCount}
              loading={loading}
              icon={<AutorenewIcon fontSize="large" />}
              color="info.main"
              backgroundColor="#E8F4FD"
            />
          </Suspense>
        </Grid>

        {/* Tingkat Penyelesaian */}
        <Grid item xs={12} sm={6} md={hasWBSAccess ? 3 : 4} sx={{ minHeight: 150 }}>
          <Suspense fallback={<Skeleton variant="rectangular" height={120} width="100%" />}>
            <StatsCard
              title="Tingkat Penyelesaian"
              value={`${processedData.completionRate}%`}
              loading={loading}
              icon={<AssessmentIcon fontSize="large" />}
              color="primary.main"
              backgroundColor="#E3FEF7"
            />
          </Suspense>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {/* Hilangkan minHeight dan sesuaikan height responsif */}
    <Box sx={{ 
      height: { xs: '400px', md: '600px' }, // Lebih pendek di mobile
      overflow: 'auto' 
    }}>
      <Suspense fallback={<Skeleton variant="rectangular" height="100%" width="100%" />}>
        <PieChart data={processedData.pieChartData} loading={loading} />
      </Suspense>
    </Box>
  </Grid>
  
  <Grid item xs={12} md={6} sx={{ 
    mt: { xs: 2, md: 0 } // Margin top hanya di mobile
  }}>
    {/* Sesuaikan height untuk mobile */}
    <Box sx={{ height: { xs: 'auto', md: '600px' } }}>
      <Suspense fallback={<Skeleton variant="rectangular" height="100%" width="100%" />}>
        <ComplaintInfo />
      </Suspense>
    </Box>
  </Grid>
</Grid>

{/* Latest Complaints dengan margin top yang lebih kecil di mobile */}
<Grid container spacing={3} sx={{ mt: { xs: 2, md: 3 } }}>
  <Grid item xs={12}>
    <Suspense fallback={<Skeleton variant="rectangular" height={300} width="100%" />}>
      <LatestComplaints 
        complaints={hasWBSAccess ? data.content.entries : data.content.entries.filter(e => !e.isWBS)} 
        loading={loading}
      />
    </Suspense>
  </Grid>
</Grid>
    </Box>
  );
};

export default ComplaintsVisual;