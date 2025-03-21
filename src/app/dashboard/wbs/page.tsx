import { TabelWbs } from '@/components/dashboard/dashboard/tabel-wbs';
import WBSReportForm from '@/components/dashboard/wbs/wbs';
import { Grid } from '@mui/material';
import * as React from 'react';

export default function Page(): React.JSX.Element {
  return (
    <>
      <WBSReportForm />
      <Grid item lg={12} md={12} xs={12}>
        <TabelWbs />
      </Grid>
    </>
  );
}
