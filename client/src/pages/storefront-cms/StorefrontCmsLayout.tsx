import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Home,
  Info,
  LayoutTemplate,
  MessageCircle,
  Navigation,
  Palette,
  ShoppingBag,
  Star,
  Store,
  Search,
  Users,
  Wrench,
} from 'lucide-react';
import { StorefrontCmsProvider, useStorefrontCms } from '@/context/StorefrontCmsContext';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ColoredIcon } from '@/components/ui/colored-icon';
import type { IconColor } from '@/lib/icon-colors';
import { StorefrontOverview } from './StorefrontOverview';
import { StoreInfoEditor } from './StoreInfoEditor';
import { HomepageEditor } from './HomepageEditor';
import { AboutEditor } from './AboutEditor';
import { FeaturesEditor } from './FeaturesEditor';
import { FaqEditor } from './FaqEditor';
import { TestimonialsEditor } from './TestimonialsEditor';
import { ContactEditor } from './ContactEditor';
import { SocialEditor } from './SocialEditor';
import { NavigationEditor } from './NavigationEditor';
import { BrandingEditor } from './BrandingEditor';
import { SeoEditor } from './SeoEditor';

const NAV: { to: string; label: string; icon: typeof Store; tone: IconColor; end?: boolean }[] = [
  { to: '/dashboard/storefront', label: 'Overview', icon: LayoutTemplate, tone: 'orange', end: true },
  { to: '/dashboard/storefront/info', label: 'Store identity', icon: Info, tone: 'orange' },
  { to: '/dashboard/storefront/homepage', label: 'Homepage', icon: Home, tone: 'orange' },
  { to: '/dashboard/storefront/about', label: 'About', icon: Users, tone: 'teal' },
  { to: '/dashboard/storefront/features', label: 'Why choose us', icon: Star, tone: 'purple' },
  { to: '/dashboard/storefront/testimonials', label: 'Testimonials', icon: Star, tone: 'purple' },
  { to: '/dashboard/storefront/faq', label: 'FAQ', icon: Wrench, tone: 'slate' },
  { to: '/dashboard/storefront/contact', label: 'Contact', icon: MessageCircle, tone: 'blue' },
  { to: '/dashboard/storefront/social', label: 'Social & footer', icon: Navigation, tone: 'teal' },
  { to: '/dashboard/storefront/navigation', label: 'Navigation', icon: ShoppingBag, tone: 'blue' },
  { to: '/dashboard/storefront/branding', label: 'Branding', icon: Palette, tone: 'purple' },
  { to: '/dashboard/storefront/seo', label: 'SEO', icon: Search, tone: 'slate' },
];

function StatusPill() {
  const { config } = useStorefrontCms();
  const s = config?.storefront.status;
  return (
    <Badge tone={s === 'PUBLISHED' ? 'green' : 'amber'}>
      <Store className="h-3 w-3" /> {s === 'PUBLISHED' ? 'Live' : 'Draft'}
    </Badge>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Storefront CMS</h2>
          <StatusPill />
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-[rgba(244,124,0,0.08)] font-semibold text-ink' : 'text-muted hover:bg-line/40 hover:text-ink',
                )
              }
              style={({ isActive }) => (isActive ? { boxShadow: 'inset 3px 0 0 0 #F47C00' } : undefined)}
            >
              {({ isActive }) => (
                <>
                  <ColoredIcon icon={n.icon} color={isActive ? 'orange' : n.tone} size="xs" iconSizeClass="h-4 w-4" active={isActive} />
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function EditorRoutes() {
  return (
    <Shell>
      <Routes>
        <Route index element={<StorefrontOverview />} />
        <Route path="info" element={<StoreInfoEditor />} />
        <Route path="homepage" element={<HomepageEditor />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="features" element={<FeaturesEditor />} />
        <Route path="testimonials" element={<TestimonialsEditor />} />
        <Route path="faq" element={<FaqEditor />} />
        <Route path="contact" element={<ContactEditor />} />
        <Route path="social" element={<SocialEditor />} />
        <Route path="navigation" element={<NavigationEditor />} />
        <Route path="branding" element={<BrandingEditor />} />
        <Route path="seo" element={<SeoEditor />} />
        <Route path="*" element={<Navigate to="/dashboard/storefront" replace />} />
      </Routes>
    </Shell>
  );
}

export function StorefrontCmsLayout() {
  return (
    <StorefrontCmsProvider>
      <EditorRoutes />
    </StorefrontCmsProvider>
  );
}
