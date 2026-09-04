import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, HelpCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { navGroups } from './nav-items';
import { cn } from '@/lib/cn';
import { ColoredIcon } from '@/components/ui/colored-icon';
import type { IconColor } from '@/lib/icon-colors';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import dukaLogo from '@/assets/logo.png';

const GROUP_TONES: Record<string, { dot: string; bar: string }> = {
  Overview: { dot: 'bg-duka-400', bar: 'border-duka-200' },
  Operations: { dot: 'bg-duka-400', bar: 'border-duka-200' },
  Catalog: { dot: 'bg-purple-400', bar: 'border-purple-200' },
  Inventory: { dot: 'bg-amber-400', bar: 'border-amber-200' },
  Customers: { dot: 'bg-teal-400', bar: 'border-teal-200' },
  Insights: { dot: 'bg-blue-400', bar: 'border-blue-200' },
  Team: { dot: 'bg-purple-400', bar: 'border-purple-200' },
  Configure: { dot: 'bg-slate-400', bar: 'border-slate-300' },
};

const toneDefaults: Record<string, IconColor> = {
  Overview: 'orange',
  Operations: 'orange',
  Catalog: 'purple',
  Inventory: 'amber',
  Customers: 'teal',
  Insights: 'blue',
  Team: 'purple',
  Configure: 'slate',
};

export function Sidebar() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-gradient-to-b from-primary-light/60 via-surface to-surface lg:flex lg:sticky lg:top-0 lg:h-screen">
      {/* Brand header.
          Logo is enlarged and centered within the existing header so the
          navigation dimensions stay unchanged. The shop name + "Active shop"
          element has been removed as a UI-only change. */}
      <div className="relative flex h-16 items-center justify-center overflow-hidden border-b border-line px-4">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-duka-300/25 blur-2xl"
        />
        <img src={dukaLogo} alt="DukaStock" className="relative h-11 w-auto max-w-full object-contain" />
      </div>

      {/* Navigation */}
      <nav className="nice-scroll flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {navGroups
          .map((group) => ({ ...group, items: group.items.filter((item) => !item.perm || can(item.perm)) }))
          .filter((group) => group.items.length > 0)
          .map((group) => {
          const tone = GROUP_TONES[group.label] ?? GROUP_TONES.Configure;
          return (
            <div key={group.label} className="mb-6">
              <p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-muted">
                <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
                <span className="uppercase">{group.label}</span>
                <span className={cn('flex-1 border-t border-dashed border-line', tone.bar)} />
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/dashboard'}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[rgba(244,124,0,0.08)] font-semibold text-ink'
                            : 'text-muted hover:bg-primary-light hover:text-ink',
                        )
                      }
                      style={({ isActive }) => (isActive ? { boxShadow: 'inset 3px 0 0 0 #F47C00' } : undefined)}
                    >
                      {({ isActive }) => (
                        <>
                          <ColoredIcon
                            icon={item.icon}
                            color={isActive ? 'orange' : item.tone ?? toneDefaults[group.label]}
                            size="xs"
                            iconSizeClass="h-[19px] w-[19px]"
                            groupHover
                            active={isActive}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Primary actions */}
      <div className="border-t border-line p-3">
        <Link
          to="/"
          className="d-btn-primary mb-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          <ExternalLink className="h-4 w-4" />
          View storefront
        </Link>
        <Link
          to="/dashboard/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-primary-light hover:text-ink"
        >
          <ColoredIcon icon={HelpCircle} color="slate" size="xs" iconSizeClass="h-[15px] w-[15px]" />
          Documentation
        </Link>
      </div>

      {/* Account tray */}
      <div className="flex items-center justify-between border-t border-line bg-gradient-to-r from-surface to-primary-light/40 px-4 py-3">
        <Dropdown
          trigger={
            <button
              className="flex min-w-0 items-center gap-3 rounded-lg text-left transition-colors hover:bg-primary-light"
              aria-label="Account menu"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-duka-500 to-duka-700 text-sm font-semibold text-white ring-2 ring-duka-100">
                {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
              </span>
                <span className="hidden min-w-0 xl:block">
                  <span className="block truncate text-sm font-semibold text-ink">{user?.fullName}</span>
                  <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-brand-600">
                  {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User'} account
                </span>
              </span>
            </button>
          }
        >
          {(close) => (
            <>
              <MenuItem
                icon={<User className="h-4 w-4" />}
                onClick={() => {
                  close();
                  navigate('/dashboard/settings');
                }}
              >
                Profile & settings
              </MenuItem>
              <MenuItem icon={<LogOut className="h-4 w-4" />} danger onClick={logout}>
                Sign out
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>
    </aside>
  );
}
