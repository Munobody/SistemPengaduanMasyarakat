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
  allowedRoles?: string[];
}

const rolePathMapping = {
  ADMIN: [paths.dashboard.admin, paths.dashboard.kelolakategori, paths.dashboard.kelolaunit, paths.dashboard.kelolawbs, paths.dashboard.usermanagement],
  PETUGAS: [paths.dashboard.petugas, paths.dashboard.kelola],
  PETUGAS_SUPER: [paths.dashboard.petugas, paths.dashboard.kelola, paths.dashboard.tambah],
  KEPALA_PETUGAS_UNIT: [paths.dashboard.petugas, paths.dashboard.kelola, paths.dashboard.tambah],
  PETUGAS_WBS: [paths.dashboard.dashboardwbs, paths.dashboard.kelolawbs],
  KEPALA_WBS: [paths.dashboard.dashboardwbs, paths.dashboard.kelolawbs, paths.dashboard.petugaswbs],
  MAHASISWA: [paths.dashboard.overview, paths.dashboard.pengaduan, paths.dashboard.account],
  DOSEN: [paths.dashboard.overview, paths.dashboard.pengaduan, paths.dashboard.wbs, paths.dashboard.account],
};

const fallbackPaths = {
  ADMIN: paths.dashboard.admin,
  PETUGAS: paths.dashboard.petugas,
  PETUGAS_SUPER: paths.dashboard.petugas,
  KEPALA_PETUGAS_UNIT: paths.dashboard.petugas,
  PETUGAS_WBS: paths.dashboard.dashboardwbs,
  KEPALA_WBS: paths.dashboard.dashboardwbs,
  MAHASISWA: paths.dashboard.overview,
  DOSEN: paths.dashboard.overview,
};

export function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useUsers();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkAccess = React.useCallback(() => {
    if (!user || !pathname) return false;

    const userRole = user.userLevel?.name;
    if (!userRole) return false;

    // Check against allowedRoles if specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      logger.debug(`[AuthGuard] Role ${userRole} not in allowed roles:`, allowedRoles);
      return false;
    }

    const allowedPaths = rolePathMapping[userRole as keyof typeof rolePathMapping] || [];
    const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));
    
    if (!isAllowed) {
      logger.debug(`[AuthGuard] Path ${pathname} not allowed for role ${userRole}`);
    }

    return isAllowed;
  }, [user, pathname, allowedRoles]);

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    // Debug logs
    logger.debug('[AuthGuard] Checking access...', {
      user: user?.userLevel?.name,
      pathname,
      allowedRoles,
      isLoading
    });

    if (!user) {
      logger.debug('[AuthGuard] No user found, redirecting to login');
      router.replace(paths.auth.signIn);
      return;
    }

    const userRole = user.userLevel?.name;
    if (!userRole) {
      logger.debug('[AuthGuard] No user role found, redirecting to login');
      router.replace(paths.auth.signIn);
      return;
    }

    if (!checkAccess()) {
      logger.debug('[AuthGuard] Access denied', {
        userRole,
        pathname,
        allowedRoles
      });
      
      toast.error('Anda tidak memiliki akses ke halaman ini');
      router.replace(fallbackPaths[userRole as keyof typeof fallbackPaths] || paths.home);
      return;
    }

    logger.debug('[AuthGuard] Access granted');
    setIsChecking(false);
  }, [user, error, isLoading, allowedRoles, router, checkAccess, pathname]);

  if (isChecking || isLoading) {
    return null;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return <>{children}</>;
}