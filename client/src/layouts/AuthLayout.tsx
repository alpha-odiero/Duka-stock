import { Outlet, Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="dashboard flex min-h-screen flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-6 flex items-center gap-2.5 justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <Store className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-ink">DukaStock</span>
        </Link>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Know what you have. Know what you sold. Grow your shop.
        </p>
      </div>
    </div>
  );
}
