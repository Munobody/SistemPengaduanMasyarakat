import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import api from '@/lib/api/api';
import type { User, userLevel } from '@/types/user';

// Define interface for permissions
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

// Define required actions for full access
const REQUIRED_ACTIONS = ['read', 'create', 'update', 'delete'];

// Define mapping between navigation categories and ACL subjects
const CATEGORY_TO_SUBJECT_MAP: { [key: string]: string[] } = {
  'Pengaduan': ['PENGADUAN', 'PENGADUAN_WBS'],
  'Unit': ['UNIT'],
  'Kategori': ['KATEGORI'],
  'Kategori_WBS': ['KATEGORI_WBS'],
  'Kelola': ['UNIT', 'KATEGORI', 'KATEGORI_WBS', 'USER'],
  'Tambah': ['USER'],
  'Akun': ['USER']
};

// Dashboard configuration based on user level
const DASHBOARD_BY_LEVEL: { [key: string]: NavItemConfig } = {
  'ADMIN': {
    key: 'dashboardadmin',
    title: 'Dashboard Admin',
    href: paths.dashboard.admin,
    icon: 'chart-pie',
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
  }
};

// Check if permission has full actions
function hasFullActions(permission: Permission): boolean {
  return REQUIRED_ACTIONS.every(action => permission.actions.includes(action));
}

// Check if user has required permissions for a category
function hasPermission(permissions: Permission[], category: string): boolean {
  const requiredSubjects = CATEGORY_TO_SUBJECT_MAP[category];
  if (!requiredSubjects) return false;

  // For categories requiring multiple subjects
  if (category === 'Kelola') {
    return requiredSubjects.some(subject => {
      const permission = permissions.find(p => p.subject === subject);
      return permission && hasFullActions(permission);
    });
  }

  // For other categories, check for full actions
  return requiredSubjects.some(subject => {
    const permission = permissions.find(p => p.subject === subject);
    return permission && hasFullActions(permission);
  });
}


// Filter navItems based on ACL and userLevel
export async function getFilteredNavItems(userLevelId: string): Promise<NavItemConfig[]> {
  try {
    const response = await api.get<AclResponse>(`/acl/${userLevelId}`);
    const data = response.data;

    if (!data?.content?.permissions) {
      console.error('Invalid ACL response structure:', data);
      throw new Error('Invalid ACL response');
    }

    const { permissions } = data.content;

    // Get user data from localStorage
    const storedUser: User = JSON.parse(localStorage.getItem('user') || '{}');
    const userLevelName = storedUser.userLevel?.name || '';

    // Get dashboard based on user level
    const dashboardItem = userLevelName ? DASHBOARD_BY_LEVEL[userLevelName] : null;

    // Filter other items based on full permissions
    const otherItems = navItems.filter(item => 
      item.category === 'Akun' || 
      (item.category !== 'Dashboard' && hasPermission(permissions, item.category))
    );

    // Combine dashboard and other items
    const filteredItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;

    return filteredItems;
  } catch (error) {
    console.error('Error fetching or processing ACL:', error);
    return [];
  }
}

// Navigation items (excluding dashboard items)
export const navItems: NavItemConfig[] = [
  // Kategori: Pengaduan
  {
    key: 'pengaduan',
    title: 'Pengaduan',
    href: paths.dashboard.pengaduan,
    icon: 'note-pencil',
    category: 'Pengaduan',
  },
  {
    key: 'whistleblowing',
    title: 'Whistle Blowing System',
    href: paths.dashboard.wbs,
    icon: 'bell-ringing',
    category: 'Pengaduan',
  },
  {
    key: 'kelolakategori',
    title: 'Kategori',
    href: paths.dashboard.kelolakategori,
    icon: 'category',
    category: 'Kategori',
  },
  {
    key: 'kelolakategoriwbs',
    title: 'Kategori WBS',
    href: paths.dashboard.kelolakategoriwbs,
    icon: 'privacy-tip',
    category: 'Kategori_WBS',
  },
  {
    key: 'kelolaunit',
    title: 'Unit',
    href: paths.dashboard.kelolaunit,
    icon: 'buildings',
    category: 'Unit',
  },
  {
    key: 'kelolauser',
    title: 'User Management',
    href: paths.dashboard.usermanagement,
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
    key: 'add',
    title: 'Tambah Petugas',
    href: paths.dashboard.tambah,
    icon: 'user-plus',
    category: 'Tambah',
  },
  {
    key: 'account',
    title: 'Account',
    href: paths.dashboard.account,
    icon: 'user-circle',
    category: 'Akun',
  },
];