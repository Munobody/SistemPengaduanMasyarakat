  
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { Graph as GraphIcon } from '@phosphor-icons/react/dist/ssr/Graph';
import { NotePencil as NotePencilIcon } from '@phosphor-icons/react/dist/ssr/NotePencil';
import { BellRinging as BellRingingIcon } from '@phosphor-icons/react/dist/ssr/BellRinging';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Stack as StackIcon } from '@phosphor-icons/react/dist/ssr/Stack';
import { Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { ShieldStar as ShieldStarIcon } from '@phosphor-icons/react/dist/ssr/ShieldStar';
import { UserPlus as UserPlusIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { UserCircle as UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import CategoryIcon from '@mui/icons-material/Category';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';

export const navIcons = {
  // Dashboard icons
  'chart-line': ChartLineIcon,
  'chart-bar': ChartBarIcon,
  'chart-pie': ChartPieIcon,
  'graph': GraphIcon,
  'privacy-tip': PrivacyTipIcon as unknown as Icon,
  
  // Pengaduan icons
  'note-pencil': NotePencilIcon,
  'bell-ringing': BellRingingIcon,
  
  // Kelola icons
  'category': CategoryIcon as unknown as Icon,
  'gear-six': GearSixIcon,
  'stack': StackIcon,
  'buildings': BuildingsIcon,
  'users': UsersIcon,
  'shield-star': ShieldStarIcon,
  
  // User related icons
  'user-plus': UserPlusIcon,
  'user-circle': UserCircleIcon,
  'x-square': XSquare,
} as Record<string, Icon>;