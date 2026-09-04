import { Link } from 'react-router-dom';
import { MapPin, Target, Eye, Heart } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeading } from '@/pages/storefront/components';

export function StoreAboutPage() {
  const { config, isLoading, isError, refetch, primary, accent, href } = useStorefront();

  if (isError && !config) {
    return (
      <div className="py-16">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }
  if (isLoading && !config) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const about = config?.about;
  const missionValues: { label: string; value: string | null | undefined }[] = [
    { label: 'Mission', value: about?.mission },
    { label: 'Vision', value: about?.vision },
  ].filter((v) => Boolean(v.value));

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold text-[var(--sf-secondary,#17252D)]">{about?.title || 'About us'}</h1>
        {config?.tagline && <p className="text-sm text-[var(--sf-muted,#6B7280)]">{config.tagline}</p>}
      </section>

      {about?.imageUrl && (
        <img src={about.imageUrl} alt="" className="aspect-[21/9] w-full rounded-2xl object-cover" />
      )}

      {(about?.introduction || about?.story) && (
        <section className="prose max-w-none space-y-3 text-[var(--sf-secondary,#17252D)]">
          <SectionHeading title="Our story" accent={accent} />
          <p className="leading-relaxed">{about.introduction || about.story}</p>
        </section>
      )}

      {missionValues.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          {missionValues.map((v) => (
            <div key={v.label} className="rounded-xl border bg-white p-6" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                {v.label === 'Mission' ? <Target className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--sf-secondary,#17252D)]">{v.label}</p>
              <p className="mt-1 text-sm text-[var(--sf-muted,#6B7280)]">{v.value}</p>
            </div>
          ))}
        </section>
      )}

      {about?.values && (
        <section>
          <SectionHeading title="Our values" accent={accent} />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {about.values
              .split('\n')
              .filter(Boolean)
              .map((v) => (
                <li key={v} className="flex items-center gap-2 text-sm text-[var(--sf-secondary,#17252D)]">
                  <Heart className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  {v}
                </li>
              ))}
          </ul>
        </section>
      )}

      {config?.contact?.location && (
        <section className="flex items-center gap-2 rounded-xl border bg-white p-5 text-sm text-[var(--sf-secondary,#17252D)]" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <MapPin className="h-4 w-4" style={{ color: primary }} />
          Visit us at {config.contact.location}
          {config.contact.address ? `, ${config.contact.address}` : ''}
        </section>
      )}

      <section
        className="flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center text-white"
        style={{ backgroundColor: primary }}
      >
        <h2 className="text-2xl font-bold">Want to shop with us?</h2>
        <p className="max-w-md text-sm text-white/80">Explore our range of products and place your order online.</p>
        <Link
          to={href('/shop')}
          className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold"
          style={{ color: primary }}
        >
          Shop now
        </Link>
      </section>
    </div>
  );
}
