'use client';

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Grid, Typography } from '@mui/material';
import api from '@/lib/api/api';

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
  isPublic?: boolean;
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
  const [hasPublicAccess, setHasPublicAccess] = useState<boolean>(false);
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
        const wbsAccess = permissions.some(p => 
          (p.subject === 'PENGADUAN_WBS' || p.subject === 'WBS') && 
          p.actions.includes('read')
        );
        
        // Check Public Complaint access
        const publicAccess = permissions.some(p => 
          p.subject === 'PENGADUAN_MASYARAKAT' && 
          p.actions.includes('read')
        );
        
        if (!isMounted) return;
        setHasWBSAccess(wbsAccess);
        setHasPublicAccess(publicAccess);

        const regularRes = await api.get<ApiResponse>('/pelaporan');
        
        let wbsEntries: PengaduanEntry[] = [];
        if (wbsAccess) {
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

        let publicEntries: PengaduanEntry[] = [];
        if (publicAccess) {
          try {
            const publicRes = await api.get<ApiResponse>('/pengaduan');
            publicEntries = (publicRes.data.content.entries || []).map(entry => ({
              ...entry,
              isPublic: true,
            }));
          } catch (publicError) {
            console.error('Error fetching public complaints:', publicError);
          }
        }

        // Merge all data
        const allEntries = [
          ...regularRes.data.content.entries, 
          ...wbsEntries,
          ...publicEntries
        ];
        
        const regularCount = regularRes.data.content.entries.length;
        const wbsCount = wbsEntries.length;
        const publicCount = publicEntries.length;

        if (isMounted) {
          setData({
            ...regularRes.data,
            content: {
              ...regularRes.data.content,
              entries: allEntries,
              totalData: regularCount + (wbsAccess ? wbsCount : 0) + (publicAccess ? publicCount : 0),
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
        publicCount: 0,
        regularCount: 0,
        totalCount: 0,
        completionRate: '0',
      };
    }

    const entries = data.content.entries;
    const regularEntries = entries.filter(entry => !entry.isWBS && !entry.isPublic);
    const wbsEntries = entries.filter(entry => entry.isWBS);
    const publicEntries = entries.filter(entry => entry.isPublic);

    // Count status for all complaint types
    const statusCounts: Record<string, number> = {};
    entries.forEach(entry => {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    });

    const completedCount = statusCounts['COMPLETED'] || 0;
    const pendingCount = statusCounts['PENDING'] || 0;
    const processCount = statusCounts['PROCESS'] || 0;
    const wbsCount = wbsEntries.length;
    const publicCount = publicEntries.length;
    const regularCount = regularEntries.length;
    const totalCount = entries.length;
    const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0';

    const statusLabels = Object.keys(statusCounts);
    const pieChartData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusLabels.map(key => statusCounts[key]),
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
      processCount,
      wbsCount,
      publicCount,
      regularCount,
      totalCount,
      completionRate,
    };
  }, [data, hasWBSAccess, hasPublicAccess]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <WelcomeMessage userName={userName} />
        <Typography>Loading data...</Typography>
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
        {/* Total Pengaduan (All types) */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Total Pengaduan"
              value={processedData.totalCount}
              icon={<DescriptionIcon fontSize="large" />}
              color="primary.main"
              backgroundColor="#E3FEF7" loading={false}            />
          </Suspense>
        </Grid>

        {/* Total Pengaduan Internal */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Pengaduan Layanan"
              value={processedData.regularCount}
              icon={<DescriptionIcon fontSize="large" />}
              color="info.main"
              backgroundColor="#E8F4FD" loading={false}            />
          </Suspense>
        </Grid>

        {/* Total Pengaduan WBS (only shown if has access) */}
        {hasWBSAccess && (
          <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
            <Suspense fallback={null}>
              <StatsCard
                title="Pengaduan WBS"
                value={processedData.wbsCount}
                icon={<SecurityIcon fontSize="large" />}
                color="secondary.main"
                backgroundColor="#EDE7F6" loading={false}              />
            </Suspense>
          </Grid>
        )}

        {/* Total Pengaduan Masyarakat (only shown if has access) */}
        {hasPublicAccess && (
          <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
            <Suspense fallback={null}>
              <StatsCard
                title="Pengaduan Masyarakat"
                value={processedData.publicCount}
                icon={<PeopleIcon fontSize="large" />}
                color="warning.main"
                backgroundColor="#FFF4E5" loading={false}              />
            </Suspense>
          </Grid>
        )}

        {/* Diselesaikan */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Diselesaikan"
              value={processedData.completedCount}
              icon={<CheckCircleIcon fontSize="large" />}
              color="success.main"
              backgroundColor="#E7F7ED" loading={false}            />
          </Suspense>
        </Grid>

        {/* Tertunda */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Tertunda"
              value={processedData.pendingCount}
              icon={<PendingIcon fontSize="large" />}
              color="warning.main"
              backgroundColor="#FFF4E5" loading={false}            />
          </Suspense>
        </Grid>

        {/* Dalam Proses */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Dalam Proses"
              value={processedData.processCount}
              icon={<AutorenewIcon fontSize="large" />}
              color="info.main"
              backgroundColor="#E8F4FD" loading={false}            />
          </Suspense>
        </Grid>

        {/* Tingkat Penyelesaian */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          <Suspense fallback={null}>
            <StatsCard
              title="Tingkat Penyelesaian"
              value={`${processedData.completionRate}%`}
              icon={<AssessmentIcon fontSize="large" />}
              color="primary.main"
              backgroundColor="#E3FEF7" loading={false}            />
          </Suspense>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            height: { xs: '400px', md: '600px' },
            overflow: 'auto' 
          }}>
            <Suspense fallback={null}>
              <PieChart data={processedData.pieChartData} />
            </Suspense>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6} sx={{ 
          mt: { xs: 2, md: 0 }
        }}>
          <Box sx={{ height: { xs: 'auto', md: '600px' } }}>
            <Suspense fallback={null}>
              <ComplaintInfo />
            </Suspense>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: { xs: 2, md: 3 } }}>
        <Grid item xs={12}>
          <Suspense fallback={null}>
            <LatestComplaints complaints={data.content.entries} />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintsVisual;