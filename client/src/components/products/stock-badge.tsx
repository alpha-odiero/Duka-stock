import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

export type StockLevel = 'in_stock' | 'low' | 'out';

export function getStockLevel(product: Pick<Product, 'quantity' | 'lowStockThreshold'>): StockLevel {
  if (product.quantity === 0) return 'out';
  if (product.quantity <= product.lowStockThreshold) return 'low';
  return 'in_stock';
}

export function StockBadge({ product }: { product: Pick<Product, 'quantity' | 'lowStockThreshold'> }) {
  const level = getStockLevel(product);
  if (level === 'out') return <Badge tone="red">Out of stock</Badge>;
  if (level === 'low') return <Badge tone="amber">Low · {product.quantity} left</Badge>;
  return <Badge tone="green">{product.quantity} in stock</Badge>;
}
