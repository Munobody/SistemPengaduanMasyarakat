import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { ReportUniv } from '@/components/dashboard/dashboard/report-univ';
import { PengaduanSelesa } from '@/components/dashboard/dashboard/pengaduan-selesai';
import { PengaduanBelumSelesai } from '@/components/dashboard/dashboard/pengaduan-belum';
import { KelolaKategori } from '@/components/admin/kelola/kelola-kategori';
import { KelolaUnit } from '@/components/admin/kelola/kelola-unit';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function KelolaPage(): React.JSX.Element {

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <KelolaKategori />
      </Grid>
      <Grid xs={12}>
        <KelolaUnit />
      </Grid>
    </Grid>
  );
}