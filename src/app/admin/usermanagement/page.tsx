import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { config } from '@/config';
import UserManagement from '@/components/admin/kelola/user-management';

export const metadata = { title: `Admin Kelola | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function KelolaPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
         <UserManagement/>
        </Grid>
    </Grid>
  );
}
