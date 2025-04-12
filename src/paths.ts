import { KelolaUnit } from "./components/admin/kelola/kelola-unit";

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    pengaduan: '/dashboard/pengaduan',
    wbs: '/dashboard/wbs',
    settings: '/dashboard/settings',
    petugas: '/petugas/dashboard',
    kelola: '/petugas/kelola',
    admin: '/admin/dashboard',
    kelolakategori: '/admin/kelolakategori',
    kelolaunit: '/admin/kelolaunit',
    kelolakategoriwbs: '/admin/kelolakategoriwbs',
    usermanagement: '/admin/usermanagement',
    tambah: '/petugas/add',
    kelolawbs:'/petugaswbs/kelola',
    dashboardwbs:'/petugaswbs/dashboard',
    petugaswbs: '/petugaswbs/add',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
