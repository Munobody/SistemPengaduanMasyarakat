import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import api from '@/lib/api/api';
import type { User, userLevel } from '@/types/user';

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
  'Pengaduan': ['PENGADUAN'],
  'WhistleBlowing System': ['PENGADUAN_WBS'],
  'Kategori_WBS': ['KATEGORI_WBS'],
  'Kelola': ['UNIT', 'KATEGORI', 'KATEGORI_WBS', 'USER','UPDATE_USER'],
  'Tambah': ['USER'],
  'Akun': ['USER'],
  'TambahWbs': ['USER'],
};

const DASHBOARD_BY_LEVEL: { [key: string]: NavItemConfig } = {
  'ADMIN': {
    key: 'dashboardadmin',
    title: 'Dashboard Admin',
    href: paths.dashboard.admin,
    icon: 'chart-pie',
    category: 'Dashboard',
  },
  'KEPALA_PETUGAS_UNIT': {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
  'PETUGAS': {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
  'PETUGAS_WBS': {
    key: 'dashboardpetugaswbs',
    title: 'Dashboard WBS',
    href: paths.dashboard.dashboardwbs,
    icon: 'chart-bar',
    category: 'Dashboard',
  },
  'KEPALA_WBS': {
    key: 'dashboardpetugaswbs',
    title: 'Dashboard WBS',
    href: paths.dashboard.dashboardwbs,
    icon: 'chart-bar',
    category: 'Dashboard',
  },
  'MAHASISWA': {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  'DOSEN': {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  'TENAGA_KEPENDIDIKAN': {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-line',
    category: 'Dashboard',
  },
  'PETUGAS_SUPER': {
    key: 'dashboardpetugas',
    title: 'Dashboard Petugas',
    href: paths.dashboard.petugas,
    icon: 'graph',
    category: 'Dashboard',
  },
};

function hasFullActions(permission: Permission): boolean {
  return REQUIRED_ACTIONS.every(action => permission.actions.includes(action));
}

function hasPermission(permissions: Permission[], category: string, userLevelName?: string): boolean {
  const requiredSubjects = CATEGORY_TO_SUBJECT_MAP[category];
  if (!requiredSubjects) return false;

  if (category === 'Akun') {
    return true;
  }

  if (category === 'Tambah') {
    if (userLevelName === 'KEPALA_PETUGAS_UNIT') {
      return true;
    }
  }

  if (category === 'TambahWbs') {
    if (userLevelName === 'KEPALA_WBS') {
      return true;
    }
  }

  if (category === 'Kelola') {
    return requiredSubjects.some(subject => {
      const permission = permissions.find(p => p.subject === subject);
      return permission && hasFullActions(permission);
    });
  }

  return requiredSubjects.some(subject => {
    const permission = permissions.find(p => p.subject === subject);
    return permission && hasFullActions(permission);
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

    const otherItems = navItems.filter(item =>
      item.category === 'Akun' ||
      (item.category !== 'Dashboard' && hasPermission(permissions, item.category, userLevelName))
    );

    const filteredItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;

    return filteredItems;
  } catch (error) {
    console.error('Error fetching or processing ACL:', error);
    return [];
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
    category: 'WhistleBlowing System',
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
    category: 'Kelola',
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
