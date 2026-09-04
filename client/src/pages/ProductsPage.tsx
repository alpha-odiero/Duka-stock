import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { supplierService } from '@/services/suppliers';
import { kes } from '@/lib/format';
import type { Product } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import { StockBadge } from '@/components/products/stock-badge';
import { ProductImage } from '@/components/ui/product-image';

export function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [deleteId, setDeleteId] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryService.list });
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: supplierService.list });

  const products = useQuery({
    queryKey: ['products', { page, limit, search: debounced, categoryId, supplierId, status }],
    queryFn: () =>
      productService.list({
        page,
        limit,
        search: debounced || undefined,
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        status: (status || undefined) as 'low' | 'out' | 'in_stock',
      }),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(value), 350);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productService.remove(deleteId.id);
      products.refetch();
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        subtitle="Manage what you sell"
        actions={
          <Button onClick={() => navigate('/dashboard/products/new')}>
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput
          placeholder="Search by name, SKU or barcode..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search products"
        />
        <Select
          name="categoryFilter"
          aria-label="Filter by category"
          placeholder="All categories"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          options={categories.data?.map((c) => ({ value: c.id, label: c.name })) ?? []}
        />
        <Select
          name="supplierFilter"
          aria-label="Filter by supplier"
          placeholder="All suppliers"
          value={supplierId}
          onChange={(e) => {
            setSupplierId(e.target.value);
            setPage(1);
          }}
          options={suppliers.data?.map((s) => ({ value: s.id, label: s.name })) ?? []}
        />
        <Select
          name="statusFilter"
          aria-label="Filter by stock status"
          placeholder="Any stock level"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'in_stock', label: 'In stock' },
            { value: 'low', label: 'Low stock' },
            { value: 'out', label: 'Out of stock' },
          ]}
        />
      </div>

      {products.isLoading && (
        <Card className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </Card>
      )}

      {products.isError && (
        <ErrorState onRetry={() => products.refetch()} message="We couldn't load your products." />
      )}

      {products.data && products.data.products.length === 0 && (
        <Card>
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            iconTone="purple"
            title="No products found"
            description={
              debounced || categoryId || supplierId || status
                ? 'Try adjusting your search or filters.'
                : 'Add your first product to start managing inventory.'
            }
            action={
              !(debounced || categoryId || supplierId || status) && (
                <Button onClick={() => navigate('/dashboard/products/new')}>
                  <Plus className="h-4 w-4" /> Add product
                </Button>
              )
            }
          />
        </Card>
      )}

      {products.data && products.data.products.length > 0 && (
        <Card>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.data.products.map((p) => (
                  <tr key={p.id} className="hover:bg-line/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={p.imageUrl}
                          alt={p.name}
                          size={80}
                          wrapperClassName="h-10 w-10 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                          <Link to={`/dashboard/products/${p.id}`} className="font-medium text-ink hover:text-brand">
                            {p.name}
                          </Link>
                          {p.sku && <span className="block text-xs text-muted">SKU: {p.sku}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{kes(p.sellingPrice)}</div>
                      <div className="text-xs text-muted">{kes(p.buyingPrice)} cost</div>
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge product={p} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                            <span className="text-lg leading-none">•••</span>
                          </Button>
                        }
                      >
                        {(close) => (
                          <>
                            <MenuItem
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => {
                                close();
                                navigate(`/dashboard/products/${p.id}/edit`);
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<Trash2 className="h-4 w-4" />}
                              danger
                              onClick={() => {
                                close();
                                setDeleteId(p);
                              }}
                            >
                              Delete
                            </MenuItem>
                          </>
                        )}
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-line md:hidden">
            {products.data.products.map((p) => (
              <li key={p.id}>
                <Link to={`/dashboard/products/${p.id}`} className="flex items-center gap-3 px-4 py-3">
                  <ProductImage
                    src={p.imageUrl}
                    alt={p.name}
                    size={80}
                    wrapperClassName="h-11 w-11 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.category?.name ?? 'Uncategorised'} · {kes(p.sellingPrice)}
                    </p>
                  </div>
                  <StockBadge product={p} />
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={products.data.pagination.totalPages}
            total={products.data.pagination.total}
            onPageChange={setPage}
          />
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete product?"
        message="This product will be permanently removed. Products with sales or purchase history cannot be deleted."
        confirmLabel="Delete"
      />
    </div>
  );
}
