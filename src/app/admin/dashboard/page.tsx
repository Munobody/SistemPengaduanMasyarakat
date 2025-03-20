import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Register } from '@/components/admin/kelola/register'; // Add this import

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PetugasPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Register />
      </Grid>
    </Grid>
  );
}
