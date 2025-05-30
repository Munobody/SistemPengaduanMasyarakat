'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { useUsers } from '@/hooks/use-user';

import { getFilteredNavItems } from './config';
import { navIcons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUsers();
  const [isDayTime, setIsDayTime] = React.useState(true);
  const [filteredNavItems, setFilteredNavItems] = React.useState<NavItemConfig[]>([]);

  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsDayTime(hour >= 6 && hour < 18);
  }, []);

  React.useEffect(() => {
    if (user?.userLevelId) {
      // Panggil fungsi untuk mendapatkan navItems yang difilter berdasarkan ACL
      getFilteredNavItems(user.userLevelId).then((items) => {
        setFilteredNavItems(items);
      });
    }
  }, [user?.userLevelId]);

  return (
    <Drawer
      PaperProps={{
        sx: {
          // Match SideNav colors
          '--MobileNav-background': isDayTime ? '#E3FEF7' : '#003C43',
          '--MobileNav-color': isDayTime ? '#003C43' : '#E3FEF7',
          '--NavItem-color': isDayTime ? '#003C43' : '#E3FEF7',
          '--NavItem-hover-background': isDayTime ? 'rgba(119, 176, 170, 0.2)' : 'rgba(19, 93, 102, 0.5)',
          '--NavItem-active-background': isDayTime ? '#77B0AA' : '#135D66',
          '--NavItem-active-color': isDayTime ? '#003C43' : '#E3FEF7',
          '--NavItem-disabled-color': isDayTime ? 'rgba(0, 60, 67, 0.5)' : 'rgba(227, 254, 247, 0.5)',
          '--NavItem-icon-color': isDayTime ? '#135D66' : '#77B0AA',
          '--NavItem-icon-active-color': isDayTime ? '#003C43' : '#E3FEF7',
          '--NavItem-icon-disabled-color': isDayTime ? 'rgba(19, 93, 102, 0.5)' : 'rgba(119, 176, 170, 0.5)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: isDayTime ? '#003C43' : '#E3FEF7',
            '&:hover': {
              backgroundColor: isDayTime ? 'rgba(119, 176, 170, 0.2)' : 'rgba(19, 93, 102, 0.5)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Stack spacing={2} sx={{ p: 3, alignItems: 'left' }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
            <Logo 
              src={isDayTime ? "/assets/logo-usk.png" : "/assets/logo-usk-putih.png"}
              height={70} 
              width={140} 
            />
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ 
        borderColor: isDayTime ? '#77B0AA' : '#135D66',
        borderBottomWidth: 2 
      }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredNavItems, isDayTime })}
      </Box>
    </Drawer>
  );
}

function renderNavItems({ 
  items = [], 
  pathname, 
  isDayTime 
}: { 
  items?: NavItemConfig[]; 
  pathname: string; 
  isDayTime?: boolean 
}): React.JSX.Element {
  const groupedItems = items.reduce((acc: Record<string, NavItemConfig[]>, item) => {
    const category = item.category || 'Menu';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <React.Fragment key={category}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'var(--NavItem-color)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              px: 2,
              opacity: 0.8,
            }}
          >
            {category}
          </Typography>
          <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {categoryItems.map((item) => {
              const { key, ...otherProps } = item;
              return (
                <NavItem
                  key={''}
                  // key={key || item.href || item.title} // Use key if provided, else fallback to href or title
                  pathname={pathname}
                  isDayTime={isDayTime}
                  {...otherProps}                />
              );
            })}
          </Stack>
        </React.Fragment>
      ))}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  isDayTime?: boolean;
}

function NavItem({ 
  disabled, 
  external, 
  href, 
  icon, 
  matcher, 
  pathname, 
  title, 
  isDayTime 
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: 'var(--NavItem-hover-background)',
          },
          ...(disabled && {
            bgcolor: 'transparent',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={
                active
                  ? 'var(--NavItem-icon-active-color)'
                  : disabled
                  ? 'var(--NavItem-icon-disabled-color)'
                  : 'var(--NavItem-icon-color)'
              }
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '28px',
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}