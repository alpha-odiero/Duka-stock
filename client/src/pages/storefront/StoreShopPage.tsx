import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch, Search, ShoppingBag } from 'lucide-react';
import { storeService } from '@/services/store';
import { useStorefront } from '@/context/StorefrontContext';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryPills, ProductGrid } from './components';

export function StoreShopPage() {
  const [params] = useSearchParams();
  const { primary, secondary, currency, shopName, href, config } = useStorefront();

  const initialCategory = params.get('category') || undefined;
  const initialSearch = params.get('search') || undefined;

  const [search, setSearch] = useState(initialSearch ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);

  const categories = useQuery({
    queryKey: ['store', 'categories', shopName] as const,
    queryFn: () => storeService.listCategories(shopName),
  });

  const products = useQuery({
    queryKey: ['store', 'products', { shop: shopName, category: selectedCategory, search }] as const,
    queryFn: () => storeService.listProducts({ shop: shopName, category: selectedCategory, search }),
  });

  const all = products.data ?? [];
  const cats = categories.data ?? [];

  return (
    <div className="space-y-6">
      {/* Page banner — marks this as the dedicated shop page */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
        style={{ backgroundColor: secondary, color: '#fff' }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 select-none text-[8rem] font-black leading-none opacity-10"
        >
          <ShoppingBag className="h-24 w-24" />
        </span>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Our catalogue</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
            Shop all products
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            {selectedCategory
              ? `Browsing ${selectedCategory}`
              : search
                ? `Results for "${search}"`
                : `Browse everything ${config?.storeName ? `from ${config.storeName}` : 'we offer'}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white px-3 py-2" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
            <Search className="h-4 w-4 shrink-0 text-[var(--sf-muted,#6B7280)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-[var(--sf-secondary,#17252D)] outline-none placeholder:text-[var(--sf-muted,#6B7280)]"
              aria-label="Search products"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs font-medium text-[var(--sf-muted,#6B7280)] hover:text-[var(--sf-secondary,#17252D)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {cats.length > 0 && (
          <CategoryPills
            categories={cats}
            active={selectedCategory}
            onSelect={(name) => setSelectedCategory(name)}
          />
        )}
      </div>

      {/* Results */}
      {products.isLoading && (
        <Card className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </Card>
      )}
      {products.isError && <ErrorState onRetry={() => products.refetch()} />}
      {!products.isLoading && all.length === 0 && (
        <Card>
          <EmptyState
            icon={<PackageSearch className="h-6 w-6" />}
            title="No products found"
            description={selectedCategory || search ? 'Try a different category or search term.' : 'No products are available yet. Check back soon.'}
          />
        </Card>
      )}
      {!products.isLoading && all.length > 0 && (
        <ProductGrid products={all} currency={currency} />
      )}

      {!selectedCategory && !search && all.length > 0 && (
        <p className="pt-2 text-center text-sm text-[var(--sf-muted,#6B7280)]">
          Can't find what you're looking for?{' '}
          <Link to={href('/shop/contact')} className="font-semibold hover:underline" style={{ color: primary }}>
            Contact us
          </Link>
        </p>
      )}
    </div>
  );
}
