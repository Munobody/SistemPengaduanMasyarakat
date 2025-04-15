import { userLevel } from "./user";

export interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: string;
  href?: string;
  items?: NavItemConfig[];
  userLevel?: userLevel[];
  matcher?: { type: 'startsWith' | 'equals'; href: string };
  category: string;
}

