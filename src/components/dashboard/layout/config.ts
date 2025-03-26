import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie', userLevel: ['MAHASISWA', 'DOSEN'] },
  { key: 'Pengaduan', title: 'Pengaduan', href: paths.dashboard.pengaduan, icon: 'users', userLevel: ['MAHASISWA', 'DOSEN'] },
  { key: 'Whistle Blowing System', title: 'Whistle Blowing System', href: paths.dashboard.wbs, icon: 'plugs-connected', userLevel: ['DOSEN'] },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six', userLevel: ['MAHASISWA', 'DOSEN'] },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user', userLevel: ['MAHASISWA', 'DOSEN'] },
  { key: 'dashboardpetugas', title: 'Dashboard', href: paths.dashboard.petugas, icon: 'chart-pie', userLevel: ['PETUGAS', 'KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'] },
  { key: 'kelolapage', title: 'Kelola', href: paths.dashboard.kelola, icon: 'users', userLevel: ['PETUGAS', 'KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'] },
  { key: 'dashboardadmin', title: 'Dashboard', href: paths.dashboard.admin, icon: 'chart-pie', userLevel: ['ADMIN'] },
  { key: 'kelola', title: 'Kelola', href: paths.dashboard.adminkelola, icon: 'users', userLevel: ['ADMIN'] },
  { key: 'add', title: 'Tambah Petugas', href: paths.dashboard.tambah, icon: 'users', userLevel: ['KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'] },
  { key: 'dashboardpetugaswbs', title: 'Dashboard', href: paths.dashboard.dashboardwbs, icon: 'chart-pie', userLevel: ['PETUGAS_WBS', 'KEPALA_WBS'] },
  { key: 'kelola', title: 'Kelola', href: paths.dashboard.kelolawbs, icon: 'users', userLevel: ['PETUGAS_WBS', 'KEPALA_WBS'] },
  { key: 'addwbs', title: 'Tambah Petugas', href: paths.dashboard.petugaswbs, icon: 'users', userLevel: ['KEPALA_WBS'] },
] satisfies NavItemConfig[];