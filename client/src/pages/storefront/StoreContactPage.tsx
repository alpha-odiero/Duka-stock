import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { WhatsAppButton, SectionHeading } from '@/pages/storefront/components';

export function StoreContactPage() {
  const { config, isLoading, isError, refetch, primary, accent, buttonRadius, currency } = useStorefront();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

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

  const contact = config?.contact;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = contact?.whatsappNumber || contact?.phone;
    if (!number) return;
    const wa = number.replace(/[^0-9]/g, '');
    const text = `Hello ${config?.storeName ?? ''}!%0A%0AName: ${encodeURIComponent(form.name)}%0APhone: ${encodeURIComponent(form.phone)}%0A%0A${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/${wa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold text-[var(--sf-secondary,#17252D)]">{contact?.title || 'Contact us'}</h1>
        {contact?.description && <p className="max-w-xl text-sm text-[var(--sf-muted,#6B7280)]">{contact.description}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionHeading title="Reach us" accent={accent} />
          <ul className="space-y-3 text-sm text-[var(--sf-secondary,#17252D)]">
            {contact?.phone && (
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                  <Phone className="h-4 w-4" />
                </span>
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </li>
            )}
            {contact?.email && (
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                  <Mail className="h-4 w-4" />
                </span>
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              </li>
            )}
            {(contact?.location || contact?.address) && (
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                  <MapPin className="h-4 w-4" />
                </span>
                <span>{contact.address || contact.location}</span>
              </li>
            )}
          </ul>

          {contact?.openingHours && contact.openingHours.length > 0 && (
            <div>
              <SectionHeading title="Opening hours" accent={accent} />
              <ul className="mt-3 space-y-1 rounded-xl border bg-white p-4 text-sm text-[var(--sf-secondary,#17252D)]" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
                {contact.openingHours.map((h) => (
                  <li key={h.day} className="flex items-center justify-between gap-2">
                    <span className="text-[var(--sf-muted,#6B7280)]">{h.day}</span>
                    <span>{h.open} – {h.close}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(contact?.whatsappNumber || contact?.phone) && (
            <div>
              <SectionHeading title="Chat" accent={accent} />
              <div className="mt-3">
                <WhatsAppButton number={contact.whatsappNumber || contact.phone!} message={contact.whatsappMessage} primary="#25D366" />
              </div>
            </div>
          )}
        </div>

        {contact?.showContactForm && (contact?.whatsappNumber || contact?.phone) && (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
            <h2 className="text-lg font-bold text-[var(--sf-secondary,#17252D)]">Send us a message</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--sf-secondary,#17252D)]">Your name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--sf-line,#e5e7eb)', borderRadius: buttonRadius }}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--sf-secondary,#17252D)]">Phone number</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--sf-line,#e5e7eb)', borderRadius: buttonRadius }}
                placeholder="07XX XXX XXX"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--sf-secondary,#17252D)]">Message</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--sf-line,#e5e7eb)', borderRadius: buttonRadius }}
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: primary, borderRadius: buttonRadius }}
            >
              <Send className="h-4 w-4" /> Send via WhatsApp
            </button>
            <p className="text-center text-[11px] text-[var(--sf-muted,#6B7280)]">
              Price conversions shown in {currency || 'KES'}.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
