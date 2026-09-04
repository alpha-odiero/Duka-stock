import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Settings as SettingsIcon, Store, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useIsInstalledPwa } from '@/hooks/useInstalledPwa';
import { useTheme } from '@/context/ThemeContext';
import { notificationService } from '@/services/notifications';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import { cn } from '@/lib/cn';
import dukaLogo from '@/assets/logo.png';

interface TopBarProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export function TopBar({ onMenuToggle, menuOpen }: TopBarProps) {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();
  const installed = useIsInstalledPwa();
  const { resolvedTheme, toggle } = useTheme();
  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => (await notificationService.list()).unread,
  });
  const unread = data ?? 0;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-duka-600 via-duka-500 to-duka-400"
      />
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        {/* Hamburger toggle lives inside the top bar (not a floating button)
            so it's always visible on mobile web and never overlaps the logo.
            It's hidden in the installed PWA where the bottom nav takes over. */}
        {!installed && (
          <button
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light hover:text-brand"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <img src={dukaLogo} alt="DukaStock" className="h-9 w-auto object-contain" />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-duka-500 to-duka-700 text-white shadow-sm">
          <Store className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-ink">{shop?.name ?? 'DukaStock'}</p>
          {shop?.location && <p className="truncate text-[11px] text-muted">{shop.location}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light hover:text-brand"
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Link
          to="/dashboard/notifications"
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-brand"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <Dropdown
          trigger={
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-duka-500 to-duka-700 text-sm font-semibold text-white shadow-sm ring-2 ring-brand-100 transition-shadow hover:ring-brand-200',
              )}
              aria-label="Account menu"
            >
              {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
            </button>
          }
        >
          {(close) => (
            <>
              <div className="border-b border-line px-3 py-2">
                <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <MenuItem
                icon={<SettingsIcon className="h-4 w-4" />}
                onClick={() => {
                  close();
                  navigate('/dashboard/settings');
                }}
              >
                Settings
              </MenuItem>
              <MenuItem icon={<LogOut className="h-4 w-4" />} danger onClick={logout}>
                Sign out
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

