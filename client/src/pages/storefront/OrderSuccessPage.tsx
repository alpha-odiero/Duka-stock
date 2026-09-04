import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const { href } = useStorefront();

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-ink">Order placed!</h1>
      <p className="mt-2 text-sm text-muted">
        Thank you for your order. Your reference number is
      </p>
      <p className="mt-1 text-lg font-bold text-brand">{orderNumber}</p>
      <p className="mt-3 text-sm text-muted">
        We&apos;ve received your order and will contact you shortly to confirm delivery and payment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to={href('/shop')}>
          <Button variant="outline">Continue shopping</Button>
        </Link>
        <Link to={href('/shop/cart')}>
          <Button variant="outline">View cart</Button>
        </Link>
      </div>
    </Card>
  );
}
