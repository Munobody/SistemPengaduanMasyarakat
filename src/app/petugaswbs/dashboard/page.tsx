import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { TabelPetugasWbs } from '@/components/petugaswbs/tabel-pengaduan-wbs';
import ComplaintsVisualWbs from '@/components/petugaswbs/complaint-visual-wbs';

export const metadata = { title: ` Dashboard Petugas WBS | ${config.site.name}` } satisfies Metadata;

export default function PetugasPage(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <ComplaintsVisualWbs />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <TabelPetugasWbs />
      </Grid>
    </Grid>
  );
}
