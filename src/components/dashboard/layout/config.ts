import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie', roles: [ 'MAHASISWA','DOSEN'] },
  { key: 'Pengaduan', title: 'Pengaduan', href: paths.dashboard.pengaduan, icon: 'users',roles: [ 'MAHASISWA','DOSEN'] },
  { key: 'Whistle Blowing System', title: 'Whistle Blowing System', href: paths.dashboard.wbs, icon: 'plugs-connected', roles: ['DOSEN'] },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six',roles: [ 'MAHASISWA','DOSEN'] },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' ,roles: [ 'MAHASISWA','DOSEN']},
  { key: 'dashboardpetugas', title: 'Dashboard', href: paths.dashboard.petugas, icon: 'chart-pie', roles: ['PETUGAS', 'KEPALA_PETUGAS_UNIT','PETUGAS_SUPER'] },
  { key: 'kelolapage', title: 'Kelola', href: paths.dashboard.kelola, icon: 'users', roles: ['PETUGAS', 'KEPALA_PETUGAS_UNIT','PETUGAS_SUPER'] },
  { key: 'dashboardadmin', title: 'Dashboard', href: paths.dashboard.admin, icon: 'chart-pie', roles: ['ADMIN', '',''] },
  { key: 'kelola', title: 'Kelola', href: paths.dashboard.adminkelola, icon: 'users', roles: ['ADMIN', '',''] },
  { key: 'add', title: 'Tambah Petugas', href: paths.dashboard.tambah, icon: 'users', roles: ['KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER',''] },
] satisfies NavItemConfig[];
