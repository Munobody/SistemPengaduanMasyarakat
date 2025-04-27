import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import RoleManagement from '@/components/admin/kelola/updated-user';

export const metadata = { title: `Admin Kelola | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function UpdatedUser(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
         <RoleManagement/>
        </Grid>
    </Grid>
  );
}
