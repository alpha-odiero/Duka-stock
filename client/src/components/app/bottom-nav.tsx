import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, ShoppingCart, ShoppingBag, Boxes, MoreHorizontal } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/hooks/useAuth';
import { allNav } from './nav-items';
import { cn } from '@/lib/cn';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useIsInstalledPwa } from '@/hooks/useInstalledPwa';

// Persistent mobile navigation. Per the product spec this is shown ONLY when
// DukaStock is running as an installed mobile PWA (standalone window). Mobile
// web (normal browser tab) uses the responsive layout + drawer instead.
export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { logout, user, can } = useAuth();
  const installed = useIsInstalledPwa();
  if (!installed) return null;
  const visibleNav = allNav.filter((item) => !item.perm || can(item.perm));

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <MobileLink to="/dashboard" label="Home" icon={Home} end />
        <MobileLink to="/dashboard/sales" label="POS" icon={ShoppingCart} />
        <MobileLink to="/dashboard/orders" label="Orders" icon={ShoppingBag} />
        <MobileLink to="/dashboard/stock" label="Inventory" icon={Boxes} />

        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium',
            moreOpen ? 'text-brand-600' : 'text-muted',
          )}
          aria-label="More options"
        >
          <ColoredIcon icon={MoreHorizontal} color="slate" size="xs" iconSizeClass="h-5 w-5" />
          More
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu">
        <ul className="divide-y divide-line">
          {visibleNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <item.icon className="h-5 w-5 text-muted" />
                <span className="text-sm font-medium text-ink">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            setMoreOpen(false);
            logout();
          }}
          className="mt-2 w-full rounded-lg border border-danger/30 py-2.5 text-sm font-medium text-danger"
        >
          Sign out
        </button>
        {user && <p className="mt-3 text-center text-xs text-muted">Signed in as {user.fullName}</p>}
      </Modal>
    </>
  );
}

function MobileLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium',
          isActive ? 'text-brand-600' : 'text-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <ColoredIcon icon={Icon} color="orange" size="xs" iconSizeClass="h-5 w-5" active={isActive} />
          {label}
        </>
      )}
    </NavLink>
  );
}
