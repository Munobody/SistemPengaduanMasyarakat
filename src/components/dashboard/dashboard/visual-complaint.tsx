'use client';

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { Box, Grid, Typography } from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { format } from 'date-fns';
import api from '@/lib/api/api';
import StatsCard from './VisualDashboard/stats-card';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ComplaintInfo = lazy(() => import('./complaint-info'));
const PieChart = lazy(() => import('./VisualDashboard/chart'));
const LatestComplaints = lazy(() => import('./VisualDashboard/latest-complaint'));

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

interface Unit {
  id: string;
  kode: string;
  nama_unit: string;
  jenis_unit: string;
}

interface UnitResponse {
  content: {
    entries: Unit[];
    totalData: number;
    totalPage: number;
  };
  message: string;
  errors: string[];
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
    Selamat Datang
  </Typography>
));

const StatsCardSkeleton = () => (
  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, minHeight: 150 }}>
    <Skeleton circle width={40} height={40} />
    <Skeleton height={20} width="60%" style={{ marginTop: 8 }} />
    <Skeleton height={30} width="40%" style={{ marginTop: 8 }} />
  </Box>
);

// Skeleton for PieChart
const PieChartSkeleton = () => (
  <Box sx={{ height: { xs: '400px', md: '600px' }, p: 2 }}>
    <Skeleton circle width="100%" height="100%" />
  </Box>
);

// Skeleton for ComplaintInfo
const ComplaintInfoSkeleton = () => (
  <Box sx={{ height: { xs: 'auto', md: '600px' }, p: 2 }}>
    <Skeleton height={40} width="80%" style={{ marginBottom: 16 }} />
    <Skeleton height={20} count={5} style={{ marginBottom: 8 }} />
  </Box>
);

// Skeleton for LatestComplaints
const LatestComplaintsSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton height={40} width="50%" style={{ marginBottom: 16 }} />
    {Array(3)
      .fill(0)
      .map((_, index) => (
        <Skeleton key={index} height={60} style={{ marginBottom: 8 }} />
      ))}
  </Box>
);

function getDateRangeFilter(start: Date | null, end: Date | null) {
  if (!start || !end) return '';
  const formatDateForFilter = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  };
  return `&rangedFilters=[{"key": "createdAt", "start": "${formatDateForFilter(start)}","end": "${formatDateForFilter(end)}"}]`;
}

const ComplaintsVisual: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [hasWBSAccess, setHasWBSAccess] = useState<boolean>(false);
  const [hasPublicAccess, setHasPublicAccess] = useState<boolean>(false);
  const [userLevelId, setUserLevelId] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [uniqueJenisUnit, setUniqueJenisUnit] = useState<string[]>([]);
  const [selectedJenisUnit, setSelectedJenisUnit] = useState<string>('');
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [isPimpinanUniversitas, setIsPimpinanUniversitas] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isPimpinanUnit, setIsPimpinanUnit] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setIsPimpinanUniversitas(userData?.userLevel?.name === 'PIMPINAN_UNIVERSITAS');
    setIsPimpinanUnit(userData?.userLevel?.name === 'PIMPINAN_UNIT');
  }, []);

  useEffect(() => {
    let isMounted = true;

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
        const aclRes = await api.get<AclResponse>(`/acl/${userLevelId}`);
        const permissions = aclRes.data.content.permissions;

        const wbsAccess = permissions.some(
          (p) => (p.subject === 'PENGADUAN_WBS' || p.subject === 'WBS') && p.actions.includes('read')
        );

        const publicAccess = permissions.some(
          (p) => p.subject === 'PENGADUAN_MASYARAKAT' && p.actions.includes('read')
        );

        if (!isMounted) return;
        setHasWBSAccess(wbsAccess);
        setHasPublicAccess(publicAccess);

        const regularRes = await api.get<ApiResponse>('/pelaporan');

        let wbsEntries: PengaduanEntry[] = [];
        if (wbsAccess) {
          try {
            const wbsRes = await api.get<ApiResponse>('/PelaporanWbs?page=0&rows=1000');
            wbsEntries = (wbsRes.data.content.entries || []).map((entry) => ({
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
            publicEntries = (publicRes.data.content.entries || []).map((entry) => ({
              ...entry,
              isPublic: true,
            }));
          } catch (publicError) {
            console.error('Error fetching public complaints:', publicError);
          }
        }

        const allEntries = [
          ...regularRes.data.content.entries,
          ...(wbsAccess ? wbsEntries : []),
          ...(publicAccess ? publicEntries : []),
        ];

        const regularCount = regularRes.data.content.entries.length;
        const wbsCount = wbsAccess ? wbsEntries.length : 0;
        const publicCount = publicAccess ? publicEntries.length : 0;

        if (isMounted) {
          setData({
            ...regularRes.data,
            content: {
              ...regularRes.data.content,
              entries: allEntries,
              totalData: regularCount + wbsCount + publicCount,
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

  useEffect(() => {
    const fetchUnits = async () => {
      if (!isPimpinanUniversitas) return;

      try {
        const response = await api.get<UnitResponse>('/units?page=1&rows=50');
        const allUnits = response.data.content.entries;
        setUnits(allUnits);

        const uniqueTypes = Array.from(new Set(allUnits.map((unit) => unit.jenis_unit)));
        setUniqueJenisUnit(uniqueTypes);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, [isPimpinanUniversitas]);


const handleUnitChange = async (event: SelectChangeEvent) => {
  const unitId = event.target.value;
  setSelectedUnitId(unitId);

  setLoading(true);
  try {
    const dateFilter = startDate && endDate ? getDateRangeFilter(startDate, endDate) : '';
    const unitFilter = unitId ? `filters={"unitId":"${unitId}"}` : '';
    const separator = unitFilter && dateFilter ? '&' : '';
    const query = unitFilter + (separator + dateFilter);

    const regularRes = await api.get<ApiResponse>(`/pelaporan?${query}`);
    
    let publicEntries: PengaduanEntry[] = [];
    if (hasPublicAccess) {
      try {
        const publicRes = await api.get<ApiResponse>(`/pengaduan?${query}`);
        publicEntries = (publicRes.data.content.entries || []).map((entry) => ({
          ...entry,
          isPublic: true,
        }));
      } catch (publicError) {
        console.error('Error fetching public complaints:', publicError);
      }
    }

    const allEntries = [...regularRes.data.content.entries, ...publicEntries];

    setData({
      ...regularRes.data,
      content: {
        ...regularRes.data.content,
        entries: allEntries,
        totalData: allEntries.length,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    setError('Failed to fetch data');
  } finally {
    setLoading(false);
  }
};

  const handleJenisUnitChange = async (event: SelectChangeEvent) => {
    const jenisUnit = event.target.value;
    setSelectedJenisUnit(jenisUnit);
    setSelectedUnitId('');

    if (!jenisUnit) {
      setLoading(true);
      try {
        const regularRes = await api.get<ApiResponse>('/pelaporan');
        let wbsEntries: PengaduanEntry[] = [];
        let publicEntries: PengaduanEntry[] = [];

        if (hasWBSAccess) {
          try {
            const wbsRes = await api.get<ApiResponse>('/PelaporanWbs?page=0&rows=1000');
            wbsEntries = (wbsRes.data.content.entries || []).map((entry) => ({
              ...entry,
              isWBS: true,
            }));
          } catch (wbsError) {
            console.error('Error fetching WBS data:', wbsError);
          }
        }

        if (hasPublicAccess) {
          try {
            const publicRes = await api.get<ApiResponse>('/pengaduan');
            publicEntries = (publicRes.data.content.entries || []).map((entry) => ({
              ...entry,
              isPublic: true,
            }));
          } catch (publicError) {
            console.error('Error fetching public complaints:', publicError);
          }
        }

        const allEntries = [...regularRes.data.content.entries, ...wbsEntries, ...publicEntries];

        setData({
          ...regularRes.data,
          content: {
            ...regularRes.data.content,
            entries: allEntries,
            totalData: allEntries.length,
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    const filtered = units.filter((unit) => unit.jenis_unit === jenisUnit);
    setFilteredUnits(filtered);
  };
    const handleDateChange = async () => {
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const dateRangeFilter = getDateRangeFilter(startDate, endDate);

        // Fetch both internal and public complaints in parallel
        const promises = [api.get<ApiResponse>(`/pelaporan?${dateRangeFilter}`)];
        
        if (hasPublicAccess) {
          promises.push(api.get<ApiResponse>(`/pengaduan?${dateRangeFilter}`));
        }

        const [regularRes, publicRes] = await Promise.all(promises);
        
        let allEntries = [...regularRes.data.content.entries];
        
        if (hasPublicAccess && publicRes) {
          const publicEntries = publicRes.data.content.entries.map(entry => ({
            ...entry,
            isPublic: true
          }));
          allEntries = [...allEntries, ...publicEntries];
        }

        setData({
          ...regularRes.data,
          content: {
            ...regularRes.data.content,
            entries: allEntries,
            totalData: allEntries.length,
          },
        });
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

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
    const regularEntries = entries.filter((entry) => !entry.isWBS && !entry.isPublic);
    const wbsEntries = hasWBSAccess ? entries.filter((entry) => entry.isWBS) : [];
    const publicEntries = hasPublicAccess ? entries.filter((entry) => entry.isPublic) : [];

    const statusCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    });

    const formatDateForFilter = (date: Date) => {
      return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    };
    function getDateRangeFilter(start: Date | null, end: Date | null) {
      if (!start || !end) return '';
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      
      return `rangedFilters=[{"key": "createdAt", "start": "${format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}","end": "${format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}"}]`;
    }

    const completedCount = statusCounts['COMPLETED'] || 0;
    const pendingCount = statusCounts['PENDING'] || 0;
    const processCount = statusCounts['PROCESS'] || 0;
    const wbsCount = wbsEntries.length;
    const publicCount = publicEntries.length;
    const regularCount = regularEntries.length;
    const totalCount = regularCount + wbsCount + publicCount;
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
      processCount,
      wbsCount,
      publicCount,
      regularCount,
      totalCount,
      completionRate,
    };
  }, [data, hasWBSAccess, hasPublicAccess]);

  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0 }}>
        <Box sx={{ mb: 3, pt: 0 }}>
          {loading ? <Skeleton width={300} height={40} /> : <WelcomeMessage userName={userName} />}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {(isPimpinanUniversitas || isPimpinanUnit) && (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
                setEndDate(null);
              }}
              slotProps={{
                textField: {
              size: 'small',
              helperText: 'Pilih tanggal awal'
                }
              }}
            />
            <DatePicker
              value={endDate}
              onChange={(newValue) => {
                if (startDate && newValue) {
              setEndDate(newValue);
              const fetchData = async () => {
                setLoading(true);
                try {
                  const dateRangeFilter = getDateRangeFilter(startDate, newValue);

                  const regularRes = await api.get<ApiResponse>(`/pelaporan?${dateRangeFilter}`);

                  let allEntries = [...regularRes.data.content.entries];
                  if (hasPublicAccess) {
                try {
                  const publicRes = await api.get<ApiResponse>(`/pengaduan?${dateRangeFilter}`);
                  const publicEntries = publicRes.data.content.entries.map(entry => ({
                    ...entry,
                    isPublic: true
                  }));
                  allEntries = [...allEntries, ...publicEntries];
                } catch (publicError) {
                  console.error('Error fetching public complaints:', publicError);
                }
                  }

                  setData({
                ...regularRes.data,
                content: {
                  ...regularRes.data.content,
                  entries: allEntries,
                  totalData: allEntries.length,
                },
                  });
                } catch (error) {
                  console.error('Error fetching data:', error);
                  setError('Failed to fetch data');
                } finally {
                  setLoading(false);
                }
              };

              fetchData();
                }
              }}
              minDate={startDate || undefined}
              disabled={!startDate}
              slotProps={{
                textField: {
              size: 'small',
              helperText: 'Pilih tanggal akhir'
                }
              }}
            />
              </Box>
            </LocalizationProvider>
          </Grid>
            )}

            {isPimpinanUniversitas && (
            <>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControl fullWidth sx={{ display: 'flex', justifyContent: 'center' }}>
              <InputLabel sx={{ transform: 'translate(14px, 8px) scale(1)' }}>Jenis Unit</InputLabel>
              <Select
                value={selectedJenisUnit}
                onChange={handleJenisUnitChange}
                label="Jenis Unit"
                size="small"
                sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  paddingY: '8px'
                }
                }}
              >
                <MenuItem value="">
                <em>Semua Unit</em>
                </MenuItem>
                {uniqueJenisUnit.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
                ))}
              </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControl fullWidth sx={{ display: 'flex', justifyContent: 'center' }}>
              <InputLabel sx={{ transform: 'translate(14px, 8px) scale(1)' }}>Nama Unit</InputLabel>
              <Select
                value={selectedUnitId}
                onChange={handleUnitChange}
                label="Nama Unit"
                disabled={!selectedJenisUnit}
                size="small"
                sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  paddingY: '8px'
                }
                }}
              >
                <MenuItem value="">
                <em>Pilih Unit</em>
                </MenuItem>
                {filteredUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.nama_unit}
                </MenuItem>
                ))}
              </Select>
              </FormControl>
            </Grid>
            </>
            )}
          </Grid>
        </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Total Pengaduan"
                value={processedData.totalCount}
                icon={<DescriptionIcon fontSize="large" />}
                color="primary.main"
                backgroundColor="#E3FEF7"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>

        {/* Total Pengaduan Internal */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Pengaduan Layanan"
                value={processedData.regularCount}
                icon={<DescriptionIcon fontSize="large" />}
                color="info.main"
                backgroundColor="#E8F4FD"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>

        {/* Total Pengaduan WBS */}
        {hasWBSAccess && (
          <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <Suspense fallback={<StatsCardSkeleton />}>
                <StatsCard
                  title="Pengaduan WBS"
                  value={processedData.wbsCount}
                  icon={<SecurityIcon fontSize="large" />}
                  color="secondary.main"
                  backgroundColor="#EDE7F6"
                  loading={loading}
                />
              </Suspense>
            )}
          </Grid>
        )}

        {/* Total Pengaduan Masyarakat */}
        {hasPublicAccess && (
          <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <Suspense fallback={<StatsCardSkeleton />}>
                <StatsCard
                  title="Pengaduan Masyarakat"
                  value={processedData.publicCount}
                  icon={<PeopleIcon fontSize="large" />}
                  color="warning.main"
                  backgroundColor="#FFF4E5"
                  loading={loading}
                />
              </Suspense>
            )}
          </Grid>
        )}

        {/* Diselesaikan */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Diselesaikan"
                value={processedData.completedCount}
                icon={<CheckCircleIcon fontSize="large" />}
                color="success.main"
                backgroundColor="#E7F7ED"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>

        {/* Tertunda */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Tertunda"
                value={processedData.pendingCount}
                icon={<PendingIcon fontSize="large" />}
                color="warning.main"
                backgroundColor="#FFF4E5"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>

        {/* Dalam Proses */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Dalam Proses"
                value={processedData.processCount}
                icon={<AutorenewIcon fontSize="large" />}
                color="info.main"
                backgroundColor="#E8F4FD"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>

        {/* Tingkat Penyelesaian */}
        <Grid item xs={12} sm={6} md={3} sx={{ minHeight: 150 }}>
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <Suspense fallback={<StatsCardSkeleton />}>
              <StatsCard
                title="Tingkat Penyelesaian"
                value={`${processedData.completionRate}%`}
                icon={<AssessmentIcon fontSize="large" />}
                color="primary.main"
                backgroundColor="#E3FEF7"
                loading={loading}
              />
            </Suspense>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: { xs: '400px', md: '600px' }, overflow: 'auto' }}>
            {loading ? (
              <PieChartSkeleton />
            ) : (
              <Suspense fallback={<PieChartSkeleton />}>
                <PieChart data={processedData.pieChartData} />
              </Suspense>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6} sx={{ mt: { xs: 2, md: 0 } }}>
          <Box sx={{ height: { xs: 'auto', md: '600px' } }}>
            {loading ? (
              <ComplaintInfoSkeleton />
            ) : (
              <Suspense fallback={<ComplaintInfoSkeleton />}>
                <ComplaintInfo />
              </Suspense>
            )}
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: { xs: 2, md: 3 } }}>
        <Grid item xs={12}>
          {loading ? (
            <LatestComplaintsSkeleton />
          ) : (
            <Suspense fallback={<LatestComplaintsSkeleton />}>
              <LatestComplaints complaints={data?.content.entries || []} />
            </Suspense>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintsVisual;
