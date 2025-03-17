import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { LatestComplaints } from '@/components/dashboard/dashboard/complaint';
import { PengaduanBelumSelesai } from '@/components/dashboard/dashboard/pengaduan-belum';
import { PengaduanSaya } from '@/components/dashboard/dashboard/pengaduan-saya';
import { PengaduanSelesai } from '@/components/dashboard/dashboard/pengaduan-selesai';
import { TotalPengaduan } from '@/components/dashboard/dashboard/total-pengaduan';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TotalPengaduan sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanSaya sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanSelesai sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanBelumSelesai sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid>
    </Grid>
  );
}
