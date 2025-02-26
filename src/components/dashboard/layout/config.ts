import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie', roles: ['ADMIN', 'MAHASISWA','DOSEN'] },
  { key: 'Pengaduan', title: 'Pengaduan', href: paths.dashboard.customers, icon: 'users',roles: [ 'MAHASISWA','DOSEN'] },
  { key: 'Whistle Blowing System', title: 'Whistle Blowing System', href: paths.dashboard.wbs, icon: 'plugs-connected', roles: ['ADMIN','DOSEN'] },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six',roles: [ 'MAHASISWA','DOSEN'] },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' ,roles: [ 'MAHASISWA','DOSEN']},
] satisfies NavItemConfig[];
