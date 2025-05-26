'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import ComplaintsVisual from '@/components/dashboard/dashboard/visual-complaint';
import { TabelPetugas } from '@/components/petugas/tabel-pengaduan-internal';
import { TabelPetugasMasyarakat } from '@/components/petugas/tabel-pengaduan-masyarakat';
import { TabelPetugasWbs } from '@/components/petugaswbs/tabel-pengaduan-wbs';
import api from '@/lib/api/api';
import { useEffect, useState } from 'react';

interface Feature {
  id: string;
  name: string;
  actions: { name: string }[];
}

export default function PetugasPage(): React.JSX.Element {
  const [hasWbsAccess, setHasWbsAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkWbsAccess = async () => {
      try {
        const response = await api.get('/acl/features');
        
        const wbsFeature = response.data.content.find(
          (feature: Feature) => feature.name === 'PENGADUAN_WBS'
        );
        
        if (wbsFeature) {
          const requiredActions = ['read', 'update', 'delete'];
          const hasFullAccess = requiredActions.every(
            action => wbsFeature.actions.some((a: { name: string; }) => a.name === action)
          );
          setHasWbsAccess(hasFullAccess);
        }
      } catch (error) {
        setHasWbsAccess(false);
      }
    };

    checkWbsAccess();
  }, []);
  
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
      {hasWbsAccess && (
        <Grid lg={12} md={12} xs={12}>
          <TabelPetugasWbs />
        </Grid>
      )}
    </Grid>
  );
}