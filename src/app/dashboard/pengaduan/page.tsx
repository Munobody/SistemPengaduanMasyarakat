'use client';

import Grid from '@mui/material/Grid';

import { LatestComplaints } from '@/components/dashboard/dashboard/tabel-pengaduan';
import PengaduanPage from '@/components/dashboard/pengaduan/pengaduan';
import { config } from '@/config';
import { Metadata } from 'next';

// export const metadata = { title: `Pengaduan Layanan | Mahasiswa ${config.site.name}` } satisfies Metadata;

export default function Page() {
  return (
    <>
      <PengaduanPage />
      {/* <Grid item lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid> */}
    </>
  );
}
