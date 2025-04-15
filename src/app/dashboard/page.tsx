'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { LatestComplaints } from '@/components/dashboard/dashboard/tabel-pengaduan';
import ComplaintsVisual from '@/components/dashboard/dashboard/visual-complaint';
import { TabelWbs } from '@/components/dashboard/dashboard/tabel-wbs';
import api from '@/lib/api/api';

interface Permission {
  subject: string;
  actions: string[];
}

interface AclResponse {
  content: {
    userLevelId: string;
    permissions: Permission[];
  };
  message: string;
  errors: string[];
}

export default function Page(): React.JSX.Element {
  const [userLevel, setUserLevel] = React.useState<string | null>(null);
  const [hasWbsPermission, setHasWbsPermission] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkPermissions = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserLevel(parsedUser?.userLevel?.name || null);

          // Check WBS permissions
          if (parsedUser?.userLevelId) {
            const response = await api.get<AclResponse>(`/acl/${parsedUser.userLevelId}`);
            const permissions = response.data.content.permissions;
            
            // Check if user has WBS read permission
            const wbsPermission = permissions.find(p => p.subject === 'PENGADUAN_WBS');
            setHasWbsPermission(!!wbsPermission && wbsPermission.actions.includes('read'));
          }
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <ComplaintsVisual />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestComplaints />
      </Grid>
      {hasWbsPermission && (
        <Grid lg={12} md={12} xs={12}>
          <TabelWbs />
        </Grid>
      )}
    </Grid>
  );
}