'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUsers } from '@/hooks/use-user';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUsers();
  const [isDayTime, setIsDayTime] = React.useState(true);

  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsDayTime(hour >= 6 && hour < 18);
  }, []);

  const filteredNavItems = navItems.filter(
    (item) => user?.userLevel?.name && item.userLevel.includes(user.userLevel.name)
  );

  const [open, setOpen] = React.useState(false);

  return (
    <Box
      sx={{
        // Day/Night theme variables
        '--SideNav-background': isDayTime ? '#E3FEF7' : '#003C43',
        '--SideNav-color': isDayTime ? '#003C43' : '#E3FEF7',
        '--NavItem-color': isDayTime ? '#003C43' : '#E3FEF7',
        '--NavItem-hover-background': isDayTime ? 'rgba(119, 176, 170, 0.2)' : 'rgba(19, 93, 102, 0.5)',
        '--NavItem-active-background': isDayTime ? '#77B0AA' : '#135D66',
        '--NavItem-active-color': isDayTime ? '#003C43' : '#E3FEF7',
        '--NavItem-disabled-color': isDayTime ? 'rgba(0, 60, 67, 0.5)' : 'rgba(227, 254, 247, 0.5)',
        '--NavItem-icon-color': isDayTime ? '#135D66' : '#77B0AA',
        '--NavItem-icon-active-color': isDayTime ? '#003C43' : '#E3FEF7',
        '--NavItem-icon-disabled-color': isDayTime ? 'rgba(19, 93, 102, 0.5)' : 'rgba(119, 176, 170, 0.5)',
        
        // Layout styles
        bgcolor: { xs: '#E3FEF7', lg: 'var(--SideNav-background)' },
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
        boxShadow: isDayTime
          ? '4px 0px 10px rgba(0, 0, 0, 0.1)' // Light shadow for day
          : '4px 0px 15px rgba(0, 0, 0, 0.3)', // Darker shadow for night
      }}
    >
      <Stack spacing={2} sx={{ p: 3, alignItems: 'left' }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
          <Logo src={isDayTime ? '/assets/logo-usk.png' : '/assets/logo-usk-putih.png'} height={70} width={150} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: isDayTime ? '#77B0AA' : '#135D66' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredNavItems, isDayTime })}
      </Box>
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
  isDayTime,
}: {
  items?: NavItemConfig[];
  pathname: string;
  isDayTime: boolean;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} isDayTime={isDayTime} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  isDayTime: boolean;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  isDayTime,
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
            bgcolor: '#E3FEF7',
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