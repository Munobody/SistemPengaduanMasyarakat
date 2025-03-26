import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';

import { AuthGuard } from '@/components/auth/auth-guard'; // Import the AuthGuard
import UserManagement from '@/components/admin/kelola/user-management';

export const metadata = { title: `Admin Management | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function AdminManagementPage(): React.JSX.Element {
  return (
      <Grid container spacing={3}>
        <Grid xs={12}>
         <UserManagement/>
        </Grid>
      </Grid>
  );
}