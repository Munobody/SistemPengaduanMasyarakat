import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { KelolaKategori } from '@/components/admin/kelola/kelola-kategori';
import { KelolaUnit } from '@/components/admin/kelola/kelola-unit';
import { KelolaKategoriWbs } from '@/components/admin/kelola/kelola-wbs';
import UserManagement from '@/components/admin/kelola/user-management';

export const metadata = { title: `Admin Kelola | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function KelolaPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <KelolaKategori />
      </Grid>
      <Grid xs={12}>
        <KelolaUnit />
      </Grid>
      <Grid xs={12}>
        <KelolaKategoriWbs />
      </Grid>
      <Grid xs={12}>
         <UserManagement/>
        </Grid>
    </Grid>
  );
}
