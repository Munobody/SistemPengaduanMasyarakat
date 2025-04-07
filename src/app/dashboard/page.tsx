import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';
import { LatestComplaints } from '@/components/dashboard/dashboard/tabel-pengaduan';

import { config } from '@/config';
import ComplaintsVisual from '@/components/dashboard/dashboard/visual-complaint';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <ComplaintsVisual />
        {/* <LatestComplaints />   */}
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid>
    </Grid>
  );
}
