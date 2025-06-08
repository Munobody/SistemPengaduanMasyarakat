import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import api from '@/lib/api/api';
import type { User } from '@/types/user';

interface Permission {
  subject: string;
  actions: string[];
}

interface AclResponse {
  content: {
    userLevelId: string;
    permissions: Permission[];
  };
  message: string;
  errors: string[];
}

const REQUIRED_ACTIONS = ['read', 'create', 'update', 'delete'];

const CATEGORY_TO_SUBJECT_MAP: { [key: string]: string[] } = {
  Pengaduan: ['PENGADUAN'],
  WhistleBlowingSystem: ['PENGADUAN_WBS'],
  Kelola: ['UNIT', 'KATEGORI', 'USER', 'UPDATE_USER'],
  KelolaWBS: ['KATEGORI_WBS'],
  Tambah: ['USER'],
  TambahWbs: ['USER'],
  Akun: ['USER'],
};

const DASHBOARD_BY_LEVEL: { [key: string]: NavItemConfig } = {
  ADMIN: {
    key: 'dashboardadmin',
    title: 'Dashboard Admin',
    href: paths.dashboard.admin,
    icon: 'chart-pie',
    category: 'Dashboard',
  },
  KEPALA_PETUGAS_UNIT: {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
  PETUGAS: {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
  PETUGAS_WBS: {
    key: 'dashboardpetugaswbs',
    title: 'Dashboard WBS',
    href: paths.dashboard.dashboardwbs,
    icon: 'chart-bar',
    category: 'Dashboard',
  },
  KEPALA_WBS: {
    key: 'dashboardpetugaswbs',
    title: 'Dashboard WBS',
    href: paths.dashboard.dashboardwbs,
    icon: 'chart-bar',
    category: 'Dashboard',
  },
  MAHASISWA: {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  DOSEN: {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  TENAGA_KEPENDIDIKAN: {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  PETUGAS_SUPER: {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
  PIMPINAN_UNIVERSITAS: {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.petugas,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  PIMPINAN_UNIT: {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.petugas,
    icon: 'chart-line',
    category: 'Dashboard',
  },
};

function hasFullActions(permission: Permission): boolean {
  return REQUIRED_ACTIONS.every((action) => permission.actions.includes(action));
}

function hasPermission(permissions: Permission[], category: string, userLevelName?: string): boolean {
  const requiredSubjects = CATEGORY_TO_SUBJECT_MAP[category];
  if (!requiredSubjects) {
    console.warn(`No subjects defined for category: ${category}`);
    return false;
  }

  if (category === 'Akun') {
    return true;
  }

  if (category === 'Tambah') {
    return userLevelName === 'KEPALA_PETUGAS_UNIT';
  }

  if (category === 'TambahWbs') {
    return userLevelName === 'KEPALA_WBS';
  }

  if (category === 'KelolaWBS') {
    if (!['PETUGAS_WBS', 'KEPALA_WBS'].includes(userLevelName || '')) {
      return false;
    }
    return requiredSubjects.some((subject) => {
      const permission = permissions.find((p) => p.subject === subject);
      const hasAccess = permission && hasFullActions(permission);
      return hasAccess;
    });
  }

  return requiredSubjects.some((subject) => {
    const permission = permissions.find((p) => p.subject === subject);
    const hasAccess = permission && hasFullActions(permission);
    return hasAccess;
  });
}

export async function getFilteredNavItems(userLevelId: string): Promise<NavItemConfig[]> {
  try {
    const response = await api.get<AclResponse>(`/acl/${userLevelId}`);
    const data = response.data;

    if (!data?.content?.permissions) {
      console.error('Invalid ACL response structure:', data);
      throw new Error('Invalid ACL response');
    }

    const { permissions } = data.content;

    const storedUser: User = JSON.parse(localStorage.getItem('user') || '{}');
    const userLevelName = storedUser.userLevel?.name || '';

    const dashboardItem = userLevelName ? DASHBOARD_BY_LEVEL[userLevelName] : null;

    const otherItems = navItems.filter((item) => {
      const hasAccess = item.category === 'Akun' || hasPermission(permissions, item.category, userLevelName);
      return hasAccess;
    });

    const filteredItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;

    if (filteredItems.length === 0) {
      console.warn('No navigation items available, returning default Account item');
      return [
        {
          key: 'account',
          title: 'Account',
          href: paths.dashboard.account,
          icon: 'user-circle',
          category: 'Akun',
        },
      ];
    }

    return filteredItems;
  } catch (error) {
    console.error('Error fetching or processing ACL:', error);
    return [
      {
        key: 'account',
        title: 'Account',
        href: paths.dashboard.account,
        icon: 'user-circle',
        category: 'Akun',
      },
    ];
  }
}

export const navItems: NavItemConfig[] = [
  {
    key: 'pengaduan',
    title: 'Pengaduan',
    href: paths.dashboard.pengaduan,
    icon: 'note-pencil',
    category: 'Pengaduan',
  },
  {
    key: 'whistleblowing',
    title: 'Pengaduan WBS',
    href: paths.dashboard.wbs,
    icon: 'bell-ringing',
    category: 'WhistleBlowingSystem',
  },
  {
    key: 'kelolakategori',
    title: 'Kategori',
    href: paths.dashboard.kelolakategori,
    icon: 'category',
    category: 'Kelola',
  },
  {
    key: 'kelolakategoriwbs',
    title: 'Kategori WBS',
    href: paths.dashboard.kelolakategoriwbs,
    icon: 'privacy-tip',
    category: 'Kelola',
  },
  {
    key: 'kelolaunit',
    title: 'Unit',
    href: paths.dashboard.kelolaunit,
    icon: 'buildings',
    category: 'Kelola',
  },
  {
    key: 'kelolauser',
    title: 'ACL Management',
    href: paths.dashboard.usermanagement,
    icon: 'user-circle',
    category: 'Kelola',
  },
  {
    key: 'kelolauser',
    title: 'Update User',
    href: paths.dashboard.updateduser,
    icon: 'user-circle',
    category: 'Kelola',
  },
  {
    key: 'kelolawbs',
    title: 'Kelola WBS',
    href: paths.dashboard.kelolawbs,
    icon: 'shield-star',
    category: 'KelolaWBS',
  },
  {
    key: 'add_petugas',
    title: 'Tambah Petugas',
    href: paths.dashboard.tambah,
    icon: 'user-plus',
    category: 'Tambah',
  },
  {
    key: 'add_petugas_wbs',
    title: 'Tambah Petugas WBS',
    href: paths.dashboard.petugaswbs,
    icon: 'user-plus',
    category: 'TambahWbs',
  },
  {
    key: 'account',
    title: 'Account',
    href: paths.dashboard.account,
    icon: 'user-circle',
    category: 'Akun',
  },
];