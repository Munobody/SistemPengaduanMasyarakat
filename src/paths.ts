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
    adminkelola: '/admin/kelola',
    tambah: '/petugas/add',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
