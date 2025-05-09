import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import DashboardVisualization from '@/components/admin/kelola/dashboard-visualization';

export const metadata = { title: `Admin Management | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function AdminManagementPage(): React.JSX.Element {
  return (
      <Grid container spacing={3}>
        <Grid xs={12}>
         <DashboardVisualization/>
        </Grid>
      </Grid>
  );
}