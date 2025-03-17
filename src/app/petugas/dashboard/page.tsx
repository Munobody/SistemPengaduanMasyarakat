import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { PengaduanBelumSelesai } from '@/components/dashboard/dashboard/pengaduan-belum';
import { TabelPetugas } from '@/components/petugas/tabel-pengaduan-internal';
import { TabelPetugasMasyarakat } from '@/components/petugas/tabel-pengaduan-masyarakat';
import { TotalPengaduan } from '@/components/dashboard/dashboard/total-pengaduan';
import { PengaduanSelesai } from '@/components/dashboard/dashboard/pengaduan-selesai';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PetugasPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TotalPengaduan sx={{ height: '100%' }}  />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanSelesai sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <PengaduanBelumSelesai sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <TabelPetugas />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <TabelPetugasMasyarakat />
      </Grid>
    </Grid>
  );
}
