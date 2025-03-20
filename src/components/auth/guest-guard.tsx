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
      if (user.role === 'PETUGAS') {
        logger.debug('[GuestGuard]: User is PETUGAS, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.role === 'ADMIN') {
        logger.debug('[GuestGuard]: User is ADMIN, redirecting to admin dashboard');
        router.replace(paths.dashboard.admin);
        return;
      }

      else if (user.role === 'KEPALA_PETUGAS_UNIT') {
        logger.debug('[GuestGuard]: User is KEPALA_PETUGAS_UNIT, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
        return;
      }

      else if (user.role === 'PETUGAS_SUPER') {
        logger.debug('[GuestGuard]: User is PETUGAS_SUPER, redirecting to petugas dashboard');
        router.replace(paths.dashboard.petugas);
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
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [user, error, isLoading]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <>{children}</>;
}
