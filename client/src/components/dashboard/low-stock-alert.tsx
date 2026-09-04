import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/ui/product-image';
import type { Product } from '@/types';

interface LowStockAlertProps {
  lowStock: Product[];
  outOfStock: Product[];
}

export function LowStockAlert({ lowStock, outOfStock }: LowStockAlertProps) {
  if (!lowStock.length && !outOfStock.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted">
        All products are sufficiently stocked.
      </p>
    );
  }
  return (
    <div className="divide-y divide-line">
      {outOfStock.map((p) => (
        <AlertRow key={p.id} name={p.name} imageUrl={p.imageUrl} qty={0} tone="out" />
      ))}
      {lowStock.map((p) => (
        <AlertRow key={p.id} name={p.name} imageUrl={p.imageUrl} qty={p.quantity} tone="low" />
      ))}
    </div>
  );
}

function AlertRow({ name, imageUrl, qty, tone }: { name: string; imageUrl?: string | null; qty: number; tone: 'low' | 'out' }) {
  return (
    <Link to={`/dashboard/products`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-line/20">
      <ProductImage
        src={imageUrl}
        alt={name}
        size={64}
        wrapperClassName="h-8 w-8 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-muted">{tone === 'out' ? 'Out of stock' : 'Running low'}</p>
      </div>
      <span className={`text-sm font-semibold ${tone === 'out' ? 'text-danger' : 'text-accent-dark'}`}>
        {tone === 'out' ? '0' : qty} left
      </span>
    </Link>
  );
}
