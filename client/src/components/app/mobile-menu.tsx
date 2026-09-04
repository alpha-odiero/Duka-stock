import { NavLink, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { allNav } from '@/components/app/nav-items';
import { cn } from '@/lib/cn';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useIsInstalledPwa } from '@/hooks/useInstalledPwa';
import dukaLogo from '@/assets/logo.png';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

// Mobile drawer for the responsive mobile WEB experience (non-installed). Its
// toggle button lives in the TopBar. It is hidden in the installed PWA where the
// persistent bottom nav takes over.
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { logout, user, can } = useAuth();
  const installed = useIsInstalledPwa();
  if (installed) return null;
  const visibleNav = allNav.filter((item) => !item.perm || can(item.perm));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-center border-b border-line px-4 py-4">
          <img src={dukaLogo} alt="DukaStock" className="h-11 w-auto object-contain" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-primary-light"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile menu">
          <ul className="space-y-0.5">
            {visibleNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
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
                        color={isActive ? 'orange' : item.tone ?? 'orange'}
                        size="xs"
                        iconSizeClass="h-[18px] w-[18px]"
                        active={isActive}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-3">
          <Link
            to="/"
            onClick={onClose}
            className="d-btn-primary mb-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm"
          >
            View storefront
          </Link>
          {user && <p className="mb-2 text-center text-[11px] text-muted">Signed in as {user.fullName}</p>}
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full rounded-lg border border-danger/30 py-2 text-sm font-medium text-danger"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
