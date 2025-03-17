"use client";

import Grid from "@mui/material/Grid";
import PengaduanPage from "@/components/dashboard/pengaduan/pengaduan";
import { LatestComplaints } from "@/components/dashboard/dashboard/complaint";

export default function Page() {
  return (
    <>
      <PengaduanPage />
      <Grid item lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid>
    </>
  );
}
