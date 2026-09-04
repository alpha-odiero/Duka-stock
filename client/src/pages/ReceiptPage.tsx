import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, FileDown, Share2, Mail } from 'lucide-react';
import { saleService } from '@/services/sales';
import { kes } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import type { PaymentMethod, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  MPESA: 'M-Pesa',
  CARD: 'Card',
  OTHER: 'Other',
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  PARTIALLY_PAID: 'Partially paid',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially refunded',
  VOID: 'Void',
  CANCELLED: 'Cancelled',
};

// Formats a timestamp in the shop's configured timezone (defaults to
// Africa/Nairobi). Falls back to local time if the timezone is unknown.
function formatInTz(iso: string, timezone?: string | null): string {
  const d = new Date(iso);
  try {
    return d.toLocaleString('en-KE', {
      timeZone: timezone || undefined,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return d.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

export function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shop } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.get(id!),
    enabled: Boolean(id),
  });

  const receiptText = useMemo(() => buildReceiptText(data), [data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[560px] rounded-xl" />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} message="We couldn't load this receipt." />;
  }

  const sale = data;
  const biz = sale.shop ?? shop;
  const timezone = sale.shop?.timezone ?? shop?.timezone ?? 'Africa/Nairobi';
  const registerName = sale.registerName || sale.shop?.registerName || shop?.registerName || 'POS';
  const currency = sale.shop?.currency ?? shop?.currency ?? 'KES';
  const cashier = sale.cashier || sale.createdBy || '-';

  async function handleShare() {
    const subject = `Receipt ${sale.receiptNumber} from ${biz?.name ?? 'DukaStock'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: subject, text: receiptText });
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(receiptText);
      // Accessibility: fallback copy path for browsers without Share API.
    } catch {
      /* clipboard unavailable; ignore */
    }
  }

  function handleEmail() {
    const subject = `Receipt ${sale.receiptNumber} from ${biz?.name ?? 'DukaStock'}`;
    const body = encodeURIComponent(receiptText);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleEmail}>
            <Mail className="h-4 w-4" /> Email
          </Button>
          <Button variant="secondary" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div id="receipt" className="card receipt-sheet p-5 receipt-thermal">
        <div className="receipt-business">
          <h1 className="receipt-name">{biz?.name ?? 'My Shop'}</h1>
          {(biz?.city || biz?.country) && (
            <p className="receipt-line">
              {[biz.city, biz.country].filter(Boolean).join(', ')}
            </p>
          )}
          {biz?.phone && <p className="receipt-line">Tel: {biz.phone}</p>}
          {biz?.businessPin && (
            <p className="receipt-line">PIN: {biz.businessPin}</p>
          )}
          {biz?.email && <p className="receipt-line">{biz.email}</p>}
          {biz?.address && <p className="receipt-line">{biz.address}</p>}
          {biz?.website && <p className="receipt-line">{biz.website}</p>}
        </div>

        <div className="receipt-rule" />

        <div className="receipt-info">
          <div className="receipt-kv">
            <span className="receipt-k">Receipt</span>
            <span className="receipt-v">{sale.receiptNumber}</span>
          </div>
          {sale.source === 'ONLINE' ? (
            <div className="receipt-kv">
              <span className="receipt-k">Type</span>
              <span className="receipt-v">Online order</span>
            </div>
          ) : (
            <div className="receipt-kv">
              <span className="receipt-k">Register</span>
              <span className="receipt-v">{registerName}</span>
            </div>
          )}
          <div className="receipt-kv">
            <span className="receipt-k">Cashier</span>
            <span className="receipt-v">{cashier}</span>
          </div>
          <div className="receipt-kv">
            <span className="receipt-k">Date</span>
            <span className="receipt-v">{formatInTz(sale.createdAt, timezone)}</span>
          </div>
          {sale.customerName && (
            <div className="receipt-kv">
              <span className="receipt-k">Customer</span>
              <span className="receipt-v">{sale.customerName}</span>
            </div>
          )}
        </div>

        <div className="receipt-rule" />

        <div className="receipt-items">
          <div className="receipt-items-head">
            <span className="rih-name">Item</span>
            <span className="rih-qty">Qty</span>
            <span className="rih-amount">Amount</span>
          </div>
          {sale.items.map((item) => (
            <div className="receipt-item" key={item.id}>
              <div className="ri-name-row">
                <span className="ri-name">{item.product?.name ?? 'Item'}</span>
                <span className="ri-price">
                  {item.quantity} × {kes(item.unitPrice, currency)}
                </span>
              </div>
              <span className="ri-amount">{kes(item.subtotal, currency)}</span>
            </div>
          ))}
        </div>

        <div className="receipt-rule" />

        <div className="receipt-grand">
          <div className="receipt-kv">
            <span className="receipt-k">Subtotal</span>
            <span className="receipt-v">{kes(sale.subtotal, currency)}</span>
          </div>
          {Number(sale.discount) > 0 && (
            <div className="receipt-kv">
              <span className="receipt-k">Discount</span>
              <span className="receipt-v">-{kes(Number(sale.discount), currency)}</span>
            </div>
          )}
          <div className="receipt-total">
            <span className="receipt-total-label">Total</span>
            <span className="receipt-total-value">{kes(sale.totalAmount, currency)}</span>
          </div>
        </div>

        <div className="receipt-rule" />

        <div className="receipt-payment">
          <div className="receipt-kv">
            <span className="receipt-k">Payment</span>
            <span className="receipt-v">
              {METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
            </span>
          </div>
          <div className="receipt-kv">
            <span className="receipt-k">Status</span>
            <span className="receipt-v">{STATUS_LABELS[sale.paymentStatus] ?? sale.paymentStatus}</span>
          </div>
          {sale.paymentReference && (
            <div className="receipt-kv">
              <span className="receipt-k">Reference</span>
              <span className="receipt-v">{sale.paymentReference}</span>
            </div>
          )}
          {sale.amountPaid != null && Number(sale.amountPaid) > 0 && (
            <div className="receipt-kv">
              <span className="receipt-k">Paid</span>
              <span className="receipt-v">{kes(sale.amountPaid, currency)}</span>
            </div>
          )}
          {sale.changeDue != null && Number(sale.changeDue) > 0 && (
            <div className="receipt-kv">
              <span className="receipt-k">Change</span>
              <span className="receipt-v">{kes(sale.changeDue, currency)}</span>
            </div>
          )}
        </div>

        <div className="receipt-rule" />

        <div className="receipt-footer">
          {biz?.receiptFooter && <p className="receipt-footer-note">{biz.receiptFooter}</p>}
          <p className="receipt-footer-note">Thank you for shopping with us!</p>
          <p className="receipt-footer-brand">Powered by DukaStock</p>
        </div>
      </div>
    </div>
  );
}

function buildReceiptText(sale: SaleLike | undefined): string {
  if (!sale) return '';
  const biz = sale.shop;
  const currency = sale.shop?.currency ?? 'KES';
  const lines: string[] = [
    (biz?.name ?? 'My Shop').toUpperCase(),
    biz?.city || biz?.country ? [biz.city, biz.country].filter(Boolean).join(', ') : '',
    biz?.phone ? `Tel: ${biz.phone}` : '',
    biz?.businessPin ? `PIN: ${biz.businessPin}` : '',
    biz?.email ? String(biz.email) : '',
    biz?.address ? String(biz.address) : '',
    biz?.website ? String(biz.website) : '',
    '--------------------------------',
    `Receipt:  ${sale.receiptNumber}`,
    `Date:     ${formatInTz(sale.createdAt, sale.shop?.timezone)}`,
    `Cashier:  ${sale.cashier || sale.createdBy || '-'}`,
    `Payment:  ${METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod} (${STATUS_LABELS[sale.paymentStatus] ?? sale.paymentStatus})`,
  ].filter(Boolean);
  lines.push('--------------------------------');
  for (const item of sale.items) {
    lines.push(`${item.product?.name ?? 'Item'}`);
    lines.push(`   ${item.quantity} x ${kes(item.unitPrice, currency)}  ${kes(item.subtotal, currency)}`);
  }
  lines.push('--------------------------------');
  if (Number(sale.discount) > 0) lines.push(`Discount: -${kes(Number(sale.discount), currency)}`);
  lines.push(`TOTAL:    ${kes(sale.totalAmount, currency)}`);
  if (sale.amountPaid != null && Number(sale.amountPaid) > 0) {
    lines.push(`Paid:     ${kes(sale.amountPaid, currency)}`);
  }
  if (sale.changeDue != null && Number(sale.changeDue) > 0) {
    lines.push(`Change:   ${kes(sale.changeDue, currency)}`);
  }
  lines.push('', biz?.receiptFooter || 'Thank you for shopping with us!', 'Powered by DukaStock');
  return lines.join('\n');
}

// Lightweight local shape so the share/email text builder doesn't need to
// depend on react-query types. Mirrors the Sale payload returned by the API.
interface SaleLike {
  id: string;
  receiptNumber: string;
  source: 'POS' | 'ONLINE' | string;
  subtotal: string | number;
  discount: string | number;
  totalAmount: string | number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  amountPaid?: string | number | null;
  changeDue?: string | number | null;
  cashier?: string | null;
  createdBy?: string | null;
  createdAt: string;
  items: { id: string; product?: { name?: string }; quantity: number; unitPrice: string | number; subtotal: string | number }[];
  shop?: {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    businessPin?: string | null;
    currency?: string;
    timezone?: string | null;
    receiptFooter?: string | null;
  } | null;
}
