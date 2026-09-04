import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { storeService } from '@/services/store';
import { useStorefront } from '@/context/StorefrontContext';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryPills, ProductGrid } from './components';

export function StoreCategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { primary, currency, shopName, href } = useStorefront();

  const categoryName = slug ? decodeURIComponent(slug) : undefined;

  const categories = useQuery({
    queryKey: ['store', 'categories', shopName] as const,
    queryFn: () => storeService.listCategories(shopName),
  });

  const products = useQuery({
    queryKey: ['store', 'products', 'category', { shop: shopName, category: categoryName }] as const,
    queryFn: () => storeService.listProducts({ shop: shopName, category: categoryName }),
    enabled: Boolean(categoryName),
  });

  if (!categoryName) {
    return (
      <Card className="p-8">
        <EmptyState title="Category not found" description="We could not find that category." />
      </Card>
    );
  }

  const cats = categories.data ?? [];
  const all = products.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to={href('/shop')}
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: primary }}
          >
            <ArrowLeft className="h-4 w-4" /> View all
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[var(--sf-secondary,#17252D)]">{categoryName}</h1>
          <p className="text-sm text-[var(--sf-muted,#6B7280)]">
            Browse the {categoryName} collection
          </p>
        </div>
      </div>

      {cats.length > 0 && (
        <CategoryPills
          categories={cats}
          active={categoryName}
          onSelect={(name) => {
            if (name) navigate(href(`/categories/${encodeURIComponent(name)}`));
            else navigate(href('/shop'));
          }}
        />
      )}

      {products.isLoading && (
        <Card className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </Card>
      )}
      {products.isError && <ErrorState onRetry={() => products.refetch()} />}
      {!products.isLoading && all.length === 0 && (
        <Card>
          <EmptyState title="No products here" description="This category is empty right now. Check back soon." />
        </Card>
      )}
      {!products.isLoading && all.length > 0 && (
        <>
          <ProductGrid products={all} currency={currency} />
          <Link
            to={href('/shop')}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: primary }}
          >
            Back to the full shop <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}
