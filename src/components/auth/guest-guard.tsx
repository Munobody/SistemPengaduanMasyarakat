'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUsers } from '@/hooks/use-user';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUsers();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (user) {
      if (user.userLevel?.name === 'PETUGAS') {
        logger.debug('[GuestGuard]: User is PETUGAS, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.userLevel?.name === 'ADMIN') {
        logger.debug('[GuestGuard]: User is ADMIN, redirecting to admin dashboard');
        router.replace(paths.dashboard.admin);
        return;
      }

      else if (user.userLevel?.name === 'KEPALA_PETUGAS_UNIT') {
        logger.debug('[GuestGuard]: User is KEPALA_PETUGAS_UNIT, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.userLevel?.name === 'PETUGAS_SUPER') {
        logger.debug('[GuestGuard]: User is PETUGAS_SUPER, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.userLevel?.name === 'PIMPINAN_UNIVERSITAS') {
        logger.debug('[GuestGuard]: User is PIMPINAN_UNOVERSITAS, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.userLevel?.name === 'PIMPINAN_UNIT') {
        logger.debug('[GuestGuard]: User is PIMPINAN_UNOVERSITAS, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.userLevel?.name === 'PETUGAS_WBS') {
        logger.debug('[GuestGuard]: User is PETUGAS_WBS, redirecting to petugaswbs dashboard');
        router.replace(paths.dashboard.dashboardwbs);
        return;
      }

      else if (user.userLevel?.name === 'KEPALA_WBS') {
        logger.debug('[GuestGuard]: User is PETUGAS_WBS, redirecting to petugaswbs dashboard');
        router.replace(paths.dashboard.dashboardwbs);
        return;
      }

      logger.debug('[GuestGuard]: User is logged in, redirecting to overview dashboard');
      router.replace(paths.dashboard.overview);
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
    });
  }, [user, error, isLoading]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <>{children}</>;
}
