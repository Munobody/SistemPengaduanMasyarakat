import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { ReportUniv } from '@/components/dashboard/dashboard/report-univ';
import { PengaduanSelesa } from '@/components/dashboard/dashboard/pengaduan-selesai';
import { PengaduanBelumSelesai } from '@/components/dashboard/dashboard/pengaduan-belum';
import { Register } from '@/components/admin/kelola/register'; // Add this import

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PetugasPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <ReportUniv diff={12} trend="up" sx={{ height: '100%' }} value="10.000" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanSelesa sx={{ height: '100%' }} value={7} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanBelumSelesai sx={{ height: '100%' }} value="20" />
      </Grid>
      
      {/* Add Register table */}
      <Grid xs={12}>
        <Register />
      </Grid>
    </Grid>
  );
}