'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import { toast } from 'react-toastify';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUsers } from '@/hooks/use-user';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Make allowedRoles optional
}

const rolePathMapping = {
  ADMIN: [paths.dashboard.admin, paths.dashboard.adminkelola],
  PETUGAS: [paths.dashboard.petugas, paths.dashboard.kelola],
  KEPALA_PETUGAS_UNIT: [paths.dashboard.petugas, paths.dashboard.kelola, paths.dashboard.tambah],
  MAHASISWA: [
    paths.dashboard.overview,
  ],
  DOSEN: [
    paths.dashboard.overview,
  ],
};

export function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useUsers();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkAccess = React.useCallback(() => {
    if (!user || !pathname) return false;

    const userRole = user.role;
    // Add null check for userRole
    if (!userRole) return false;

    const allowedPaths = rolePathMapping[userRole as keyof typeof rolePathMapping] || [];
    return allowedPaths.some((path) => pathname.startsWith(path));
  }, [user, pathname]);

  React.useEffect(() => {
    if (isLoading) return;

    if (!user) {
      logger.debug('[AuthGuard]: No user found, redirecting to login');
      router.replace(paths.auth.signIn);
      return;
    }

    // Add null checks for user.role and allowedRoles
    if (!user.role || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
      logger.debug(`[AuthGuard]: User role ${user.role || 'undefined'} not allowed`);
      toast.error('Anda tidak memiliki akses ke halaman ini');
      
      switch (user.role) {
        case 'PETUGAS':
        case 'KEPALA_PETUGAS_UNIT':
          router.replace(paths.dashboard.petugas);
          break;
        case 'ADMIN':
          router.replace(paths.dashboard.admin);
          break;
        case 'MAHASISWA':
        case 'DOSEN':
          router.replace(paths.dashboard.overview);
          break;
        default:
          router.replace(paths.dashboard.overview);
      }
      return;
    }

    if (!checkAccess()) {
      logger.debug('[AuthGuard]: Path not allowed for user role');
      toast.error('Anda tidak memiliki akses ke halaman ini');

      // Redirect to appropriate dashboard
      switch (user.role) {
        case 'PETUGAS':
        case 'KEPALA_PETUGAS_UNIT':
          router.replace(paths.dashboard.petugas);
          break;
        case 'ADMIN':
          router.replace(paths.dashboard.admin);
          break;
        default:
          router.replace(paths.dashboard.overview);
      }
      return;
    }

    setIsChecking(false);
  }, [user, error, isLoading, allowedRoles, router, checkAccess]);

  if (isChecking || isLoading) {
    return null;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return <>{children}</>;
}
