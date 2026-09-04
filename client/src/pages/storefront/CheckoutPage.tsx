import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag } from 'lucide-react';
import { storeService } from '@/services/store';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { PAYMENT_METHODS } from '@/lib/constants';
import { kes } from '@/lib/format';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import type { PaymentMethod } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotal, clear } = useCart();
  const { currency, primary, buttonRadius, shopName, href } = useStorefront();
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentMethod>('MPESA');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const submit = async (values: FormValues) => {
    if (lines.length === 0) return;
    setServerError(null);
    try {
      const order = await storeService.checkout(
        {
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          paymentMethod: payment,
          customer: {
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            address: values.address || undefined,
          },
          deliveryAddress: values.deliveryAddress || undefined,
          notes: values.notes || undefined,
        },
        shopName,
      );
      clear();
      toast(`Order ${order.orderNumber} placed`);
      navigate(href(`/shop/success/${order.orderNumber}`));
    } catch (err) {
      setServerError(extractError(err).message);
    }
  };

  const onPlaceOrder = () => {
    handleSubmit(submit)();
  };

  if (lines.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Add products before checking out."
          action={
            <Button onClick={() => navigate(href('/shop'))}>Browse shop</Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Checkout"
        subtitle="Enter your details to place the order"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Contact & delivery</h2>
          <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            {serverError && (
              <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                {serverError}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
              <Input label="Phone" placeholder="+2547..." error={errors.phone?.message} {...register('phone')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Delivery address" placeholder="Estate, street, building" error={errors.deliveryAddress?.message} {...register('deliveryAddress')} />
            </div>
            <Input label="Home address (optional)" placeholder="Your area / village" error={errors.address?.message} {...register('address')} />
            <Textarea label="Order notes (optional)" placeholder="Any special instructions" error={errors.notes?.message} {...register('notes')} />

            <div>
              <span className="label">Payment method</span>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPayment(m.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      payment === m.value ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:bg-line/30'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </Card>

        <Card className="h-fit p-4">
          <h2 className="text-sm font-semibold text-ink">Order summary</h2>
          <ul className="mt-3 max-h-52 divide-y divide-line overflow-y-auto text-sm">
            {lines.map((l) => (
              <li key={l.product.id} className="flex items-center justify-between gap-2 py-2">
                <span className="truncate text-muted">
                  {l.quantity} × {l.product.name}
                </span>
                <span className="shrink-0 font-medium text-ink">
                  {kes(Number(l.product.price) * l.quantity, currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>Total</span>
            <span>{kes(subtotal, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Pay {PAYMENT_METHODS.find((m) => m.value === payment)?.label} on delivery.
          </p>
          <Button size="lg" className="mt-4 w-full text-white" style={{ backgroundColor: primary, borderRadius: buttonRadius }} onClick={onPlaceOrder}>
            Place order
          </Button>
        </Card>
      </div>
    </div>
  );
}
