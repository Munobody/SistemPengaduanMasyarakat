import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { config } from '@/config';
import ComplaintsVisual from '@/components/dashboard/dashboard/visual-complaint';
import { TabelPetugas } from '@/components/petugas/tabel-pengaduan-internal';
import { TabelPetugasMasyarakat } from '@/components/petugas/tabel-pengaduan-masyarakat';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function PetugasPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <ComplaintsVisual />
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
