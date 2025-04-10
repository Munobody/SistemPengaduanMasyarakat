'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { LatestComplaints } from '@/components/dashboard/dashboard/tabel-pengaduan';

import { config } from '@/config';
import ComplaintsVisual from '@/components/dashboard/dashboard/visual-complaint';
import { TabelWbs } from '@/components/dashboard/dashboard/tabel-wbs';

// export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [userLevel, setUserLevel] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Ambil data user dari localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserLevel(parsedUser?.userLevel?.name || null);
    }
  }, []);

  if (userLevel === null) {
    return <div>Loading...</div>; // Tampilkan loading jika data belum tersedia
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <ComplaintsVisual />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid>
      {/* Tampilkan TabelWbs hanya jika userLevel bukan "MAHASISWA" */}
      {userLevel !== "MAHASISWA" && (
        <Grid lg={12} md={12} xs={12}>
          <TabelWbs />
        </Grid>
      )}
    </Grid>
  );
}