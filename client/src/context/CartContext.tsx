import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { PublicProduct } from '@/types';

export interface CartLine {
  product: PublicProduct;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: string;
  add: (product: PublicProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = (product: PublicProduct, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: Math.min(l.quantity + quantity, product.quantity) } : l,
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.quantity) }];
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) =>
        l.product.id === productId ? { ...l, quantity: Math.min(quantity, l.product.quantity) } : l,
      );
    });
  };

  const remove = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  };

  const clear = () => setLines([]);

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines
    .reduce((acc, l) => acc + Number(l.product.price) * l.quantity, 0)
    .toFixed(2);

  const value = useMemo(
    () => ({ lines, count, subtotal, add, setQuantity, remove, clear }),
    // The stable function references are intentionally omitted: consumers rely
    // on the memoized value updating when the cart state changes.
    [lines, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
