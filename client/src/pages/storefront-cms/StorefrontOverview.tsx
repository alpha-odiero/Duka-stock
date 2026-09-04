import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Eye, Rocket, Zap } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WORKFLOW: { step: number; title: string; desc: string; href: string; queryKey: string; required: boolean }[] = [
  { step: 1, title: 'Store identity', desc: 'Name, tagline, logo & hero image', href: 'info', queryKey: 'identity', required: true },
  { step: 2, title: 'Homepage', desc: 'Hero, sections & featured products', href: 'homepage', queryKey: 'hero', required: true },
  { step: 3, title: 'About', desc: 'Your story and mission', href: 'about', queryKey: 'about', required: false },
  { step: 4, title: 'Contact & WhatsApp', desc: 'How customers reach you', href: 'contact', queryKey: 'contact', required: true },
  { step: 5, title: 'Features & testimonials', desc: 'Build trust with social proof', href: 'features', queryKey: 'social', required: false },
  { step: 6, title: 'Branding & SEO', desc: 'Colors, fonts and search settings', href: 'branding', queryKey: 'branding', required: false },
];

export function StorefrontOverview() {
  const { config, isLoading, invalidate, refetch, isError } = useStorefrontCms();
  const { shop } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'publish' | 'unpublish' | null>(null);

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted">Loading storefront…</div>;
  }
  if (isError || !config) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted">Couldn't load storefront settings.</p>
        <Button className="mt-4" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const sf = config.storefront;
  const comp = config.completeness;
  const published = sf.status === 'PUBLISHED';

  const setStatus = async (status: 'PUBLISHED' | 'DRAFT') => {
    setBusy(status === 'PUBLISHED' ? 'publish' : 'unpublish');
    try {
      await storefrontService.setStatus(status);
      invalidate();
      toast(status === 'PUBLISHED' ? 'Store published' : 'Store unpublished');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const doneKeys = new Set(comp.items.filter((i) => i.done).map((i) => i.key));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-primary-light text-xl font-bold text-brand">
              {sf.logoUrl ? <img src={sf.logoUrl} alt="" className="h-full w-full object-cover" /> : sf.storeName?.charAt(0)?.toUpperCase() ?? 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-ink">{sf.storeName || 'Untitled store'}</h1>
                <Badge tone={published ? 'green' : 'amber'}>{published ? 'Live' : 'Draft'}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted">{sf.tagline || 'No tagline yet'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {published ? (
              <Button variant="secondary" loading={busy === 'unpublish'} onClick={() => setStatus('DRAFT')}>
                <Eye className="h-4 w-4" /> Unpublish
              </Button>
            ) : (
              <Button loading={busy === 'publish'} onClick={() => setStatus('PUBLISHED')}>
                <Rocket className="h-4 w-4" /> Publish store
              </Button>
            )}
            {shop?.name && (
              <a
                href={`/shop?shop=${encodeURIComponent(shop.name)}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:border-brand hover:text-brand"
              >
                Preview <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Setup progress</span>
            <span className="font-semibold text-brand">{comp.percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${comp.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{comp.done} of {comp.total} setup steps complete</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">Build your store</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW.map((w) => {
            const done = doneKeys.has(w.queryKey) || (w.queryKey === 'hero' && !!config.hero.title);
            return (
              <Link key={w.step} to={`/dashboard/storefront/${w.href === 'info' ? '' : w.href}`} className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-brand">{w.step}</span>
                  {done ? <CheckCircle2 className="h-5 w-5 text-duka-600" /> : <Circle className="h-5 w-5 text-line" />}
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{w.title}</p>
                <p className="mt-1 text-xs text-muted">{w.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary-light bg-primary-light/40 p-4">
        <Zap className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="text-sm">
          <p className="font-medium text-ink">About your online store</p>
          <p className="mt-1 text-muted">
            Your store is live at <code className="rounded bg-line/50 px-1 py-0.5 text-brand">/shop</code> whenever you publish it. Customers see only what you
            configure here — products, sections, and contact info — never internal prices or data.
          </p>
        </div>
      </div>
    </div>
  );
}
