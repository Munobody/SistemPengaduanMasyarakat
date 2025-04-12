import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  // Kategori: Dashboard
  {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',  // Updated icon
    userLevel: ['MAHASISWA', 'DOSEN'],
    category: 'Dashboard',
  },
  {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',  // Updated icon
    userLevel: ['PETUGAS', 'KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'],
    category: 'Dashboard',
  },
  {
    key: 'dashboardadmin',
    title: 'Dashboard Admin',
    href: paths.dashboard.admin,
    icon: 'chart-pie',
    userLevel: ['ADMIN'],
    category: 'Dashboard',
  },
  {
    key: 'dashboardpetugaswbs',
    title: 'Dashboard WBS',
    href: paths.dashboard.dashboardwbs,
    icon: 'chart-bar',  // Updated icon
    userLevel: ['PETUGAS_WBS', 'KEPALA_WBS'],
    category: 'Dashboard',
  },

  // Kategori: Pengaduan
  {
    key: 'pengaduan',
    title: 'Pengaduan',
    href: paths.dashboard.pengaduan,
    icon: 'note-pencil',  // Updated icon
    userLevel: ['MAHASISWA', 'DOSEN'],
    category: 'Pengaduan',
  },
  {
    key: 'whistleblowing',
    title: 'Whistle Blowing System',
    href: paths.dashboard.wbs,
    icon: 'bell-ringing',  // Updated icon
    userLevel: ['DOSEN'],
    category: 'Pengaduan',
  },

  // Kategori: Kelola
  {
    key: 'kelolapage',
    title: 'Kelola',
    href: paths.dashboard.kelola,
    icon: 'gear-six',  // Updated icon
    userLevel: ['PETUGAS', 'KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'],
    category: 'Kelola',
  },
  {
    key: 'kelolakategori',
    title: 'Kategori',
    href: paths.dashboard.kelolakategori,
    icon: 'category',  // Updated icon
    userLevel: ['ADMIN'],
    category: 'Kelola',
  },
  {
    key: 'kelolakategoriwbs',
    title: 'Kategori WBS',
    href: paths.dashboard.kelolakategoriwbs,
    icon: 'privacy-tip',  // Updated icon
    userLevel: ['ADMIN'],
    category: 'Kelola',
  },
  {
    key: 'kelolaunit',
    title: 'Unit',
    href: paths.dashboard.kelolaunit,
    icon: 'buildings',  // Updated icon
    userLevel: ['ADMIN'],
    category: 'Kelola',
  },
  {
    key: 'kelolauser',
    title: 'User Management',
    href: paths.dashboard.usermanagement,
    icon: 'user-circle',  // Updated icon
    userLevel: ['ADMIN'],
    category: 'Kelola',
  },
  {
    key: 'kelolawbs',
    title: 'Kelola WBS',
    href: paths.dashboard.kelolawbs,
    icon: 'shield',  // Updated icon
    userLevel: ['PETUGAS_WBS', 'KEPALA_WBS'],
    category: 'Kelola',
  },

  // Kategori: Tambah
  {
    key: 'add',
    title: 'Tambah Petugas',
    href: paths.dashboard.tambah,
    icon: 'user-plus',  // Updated icon
    userLevel: ['KEPALA_PETUGAS_UNIT', 'PETUGAS_SUPER'],
    category: 'Tambah',
  },

  // Kategori: Akun
  {
    key: 'account',
    title: 'Account',
    href: paths.dashboard.account,
    icon: 'user-circle',  // Updated icon
    userLevel: ['MAHASISWA', 'DOSEN'],
    category: 'Akun',
  },
];