import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { FaqList } from '@/pages/storefront/components';

export function StoreFaqPage() {
  const { config, isLoading, isError, refetch, primary, href } = useStorefront();

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

  const faqs = config?.faqs ?? [];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold text-[var(--sf-secondary,#17252D)]">Frequently asked questions</h1>
        <p className="max-w-xl text-sm text-[var(--sf-muted,#6B7280)]">
          Common questions about shopping with {config?.storeName ?? 'us'}.
        </p>
      </section>

      {faqs.length > 0 ? (
        <FaqList items={faqs} />
      ) : (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-[var(--sf-muted,#6B7280)]" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          Questions will appear here once added by the store.
        </div>
      )}

      {config?.contact?.whatsappNumber && (
        <section
          className="flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center text-white"
          style={{ backgroundColor: primary }}
        >
          <MessageCircle className="h-8 w-8" />
          <h2 className="text-xl font-bold">Still have a question?</h2>
          <p className="max-w-md text-sm text-white/80">Reach out and we will be happy to help.</p>
          <div className="mt-1">
            <Link to={href('/shop/contact')} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold" style={{ color: primary }}>
              Contact us
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
