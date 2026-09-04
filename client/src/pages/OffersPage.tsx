import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, BadgePercent } from 'lucide-react';
import { offerService, type OfferInput } from '@/services/offers';
import type { Offer, OfferStatus, DiscountType } from '@/types';
import { kes } from '@/lib/format';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import { ImageUploader } from '@/components/storefront/ImageUploader';

const STATUS_TONE: Record<OfferStatus, 'green' | 'amber' | 'red' | 'gray' | 'blue'> = {
  ACTIVE: 'green',
  SCHEDULED: 'blue',
  DRAFT: 'gray',
  EXPIRED: 'red',
  DISABLED: 'gray',
};

function discountLabel(o: Offer, currency: string): string {
  return o.discountType === 'PERCENTAGE' ? `${o.discountValue}% off` : `${kes(Number(o.discountValue), currency)} off`;
}

export function OffersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OfferStatus | ''>('');
  const [editing, setEditing] = useState<Offer | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Offer | null>(null);

  const offers = useQuery({
    queryKey: ['offers', { statusFilter }],
    queryFn: () => offerService.list(statusFilter ? { status: statusFilter, limit: 100 } : { limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['offers'] });

  const onSaved = (message: string) => {
    toast(message);
    invalidate();
    setEditing(null);
  };

  const list = offers.data?.offers ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Offers & Promotions"
        subtitle="Create discounts that auto-apply on the storefront and expire automatically."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> New offer
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OfferStatus | '')}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'EXPIRED', label: 'Expired' },
            { value: 'DISABLED', label: 'Disabled' },
          ]}
        />
      </div>

      {offers.isLoading ? (
        <Skeleton className="h-40" />
      ) : offers.isError ? (
        <Card className="p-6 text-sm text-danger">Could not load offers.</Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BadgePercent className="h-8 w-8" />}
            title="No offers yet"
            description="Create a percentage or fixed-amount discount that shows on your storefront."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => (
            <Card key={o.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <BadgePercent className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{o.name}</p>
                    <p className="text-xs text-muted">{discountLabel(o, 'KSH')}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[o.effectiveStatus ?? o.status]}>{o.effectiveStatus ?? o.status}</Badge>
              </div>

              {o.description && <p className="mt-3 line-clamp-2 text-sm text-muted">{o.description}</p>}

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                {o.promoCode && (
                  <span>
                    Code: <span className="font-semibold text-brand">{o.promoCode}</span>
                  </span>
                )}
                {o.minimumPurchase && <span>Min. {kes(Number(o.minimumPurchase), 'KSH')}</span>}
                {o.endDate && <span>Ends {new Date(o.endDate).toLocaleDateString()}</span>}
                {o._count && (o._count.products ?? 0) > 0 && <span>{o._count.products} product(s)</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={o.visible ? 'h-1.5 w-1.5 rounded-full bg-green-500' : 'h-1.5 w-1.5 rounded-full bg-slate-400'} />
                  {o.visible ? 'Visible on store' : 'Hidden'}
                </span>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  }
                >
                  <MenuItem onClick={() => setEditing(o)} icon={<Pencil className="h-4 w-4" />}>
                    Edit
                  </MenuItem>
                  <MenuItem onClick={() => setDeleting(o)} icon={<Trash2 className="h-4 w-4" />} danger>
                    Delete
                  </MenuItem>
                </Dropdown>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <OfferForm offer={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await offerService.remove(deleting.id);
            toast('Offer deleted');
            invalidate();
          } catch (err) {
            toast(extractError(err).message, { type: 'error' });
          } finally {
            setDeleting(null);
          }
        }}
        title="Delete offer?"
        message={`"${deleting?.name}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function OfferForm({
  offer,
  onClose,
  onSaved,
}: {
  offer: Offer | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [name, setName] = useState(offer?.name ?? '');
  const [description, setDescription] = useState(offer?.description ?? '');
  const [discountType, setDiscountType] = useState<DiscountType>(offer?.discountType ?? 'PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(offer ? String(offer.discountValue) : '');
  const [startDate, setStartDate] = useState(offer?.startDate ? offer.startDate.slice(0, 16) : '');
  const [endDate, setEndDate] = useState(offer?.endDate ? offer.endDate.slice(0, 16) : '');
  const [minimumPurchase, setMinimumPurchase] = useState(offer?.minimumPurchase ? String(offer.minimumPurchase) : '');
  const [maximumDiscount, setMaximumDiscount] = useState(offer?.maximumDiscount ? String(offer.maximumDiscount) : '');
  const [promoCode, setPromoCode] = useState(offer?.promoCode ?? '');
  const [visible, setVisible] = useState(offer?.visible ?? true);
  const [image, setImage] = useState(offer?.imageUrl ?? '');
  const [imagePublicId, setImagePublicId] = useState(offer?.imagePublicId ?? null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      setError('Offer name is required.');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }
    if (discountType === 'PERCENTAGE' && Number(discountValue) > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date must be after the start date.');
      return;
    }

    const payload: OfferInput = {
      name: name.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: Number(discountValue),
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      minimumPurchase: minimumPurchase ? Number(minimumPurchase) : null,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      promoCode: promoCode.trim() || null,
      visible,
      imageUrl: image || null,
      imagePublicId: imagePublicId,
    };

    setBusy(true);
    try {
      if (offer) {
        await offerService.update(offer.id, payload);
        onSaved('Offer updated');
      } else {
        await offerService.create(payload);
        onSaved('Offer created');
      }
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={offer ? 'Edit offer' : 'New offer'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Offer name" placeholder="e.g. Back to School Sale" value={name} onChange={(e) => setName(e.target.value)} error={error} autoFocus />
        <Textarea label="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Discount type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            options={[
              { value: 'PERCENTAGE', label: 'Percentage (%)' },
              { value: 'FIXED_AMOUNT', label: 'Fixed amount (KSH)' },
            ]}
          />
          <Input
            label={discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount amount (KSH)'}
            type="number"
            placeholder={discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 200'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Starts (optional)" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Ends (optional)" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Minimum purchase (optional)" type="number" placeholder="e.g. 1000" value={minimumPurchase} onChange={(e) => setMinimumPurchase(e.target.value)} />
          <Input label="Max discount (optional)" type="number" placeholder="Cap on total saving" value={maximumDiscount} onChange={(e) => setMaximumDiscount(e.target.value)} />
        </div>
        <Input label="Promo code (optional)" placeholder="e.g. SAVE15" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
        <ImageUploader
          label="Offer image (optional)"
          value={image}
          folder="dukastock/offers"
          aspect="aspect-video"
          onChange={(img) => {
            setImage(img.url ?? '');
            setImagePublicId(img.publicId ?? null);
          }}
        />
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line" />
          <span>
            <span className="font-medium">Show on storefront</span>
            <span className="block text-xs text-muted">Active offers appear in the storefront deals section.</span>
          </span>
        </label>
      </div>
    </Modal>
  );
}
