import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { config } from '@/config';
import { KelolaUnit } from '@/components/admin/kelola/kelola-unit';

export const metadata = { title: `Admin Kelola | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function KelolaPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <KelolaUnit />
      </Grid>
    </Grid>
  );
}
