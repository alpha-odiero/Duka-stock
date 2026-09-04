import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/app/sidebar';
import { MobileMenu } from '@/components/app/mobile-menu';
import { TopBar } from '@/components/app/topbar';
import { BottomNav } from '@/components/app/bottom-nav';
import { useIsInstalledPwa } from '@/hooks/useInstalledPwa';
import { cn } from '@/lib/cn';

export function AppLayout() {
  const installed = useIsInstalledPwa();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dashboard flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar
          onMenuToggle={() => setMenuOpen((o) => !o)}
          menuOpen={menuOpen}
        />
        <main
          className={cn(
            'relative mx-auto w-full max-w-6xl flex-1 px-4 pt-5 sm:px-6 lg:pb-8 lg:pt-7',
            // The persistent bottom nav only renders in the installed PWA, so
            // only reserve bottom padding for it in that case.
            installed ? 'pb-24 lg:pb-8' : 'pb-8',
          )}
        >
          <Outlet />
        </main>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BottomNav />
    </div>
  );
}

