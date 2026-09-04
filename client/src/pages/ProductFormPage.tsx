import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { supplierService } from '@/services/suppliers';
import { cloudinaryService } from '@/services/cloudinary';
import { productSchema } from '@/schemas';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type FormValues = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { shop } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryService.list, enabled: true });
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: supplierService.list });

  const product = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.get(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      supplierId: '',
      sku: '',
      barcode: '',
      buyingPrice: '',
      sellingPrice: '',
      lowStockThreshold: 5,
      unit: 'piece',
      description: '',
    },
  });

  useEffect(() => {
    if (product.data) {
      reset({
        name: product.data.name,
        categoryId: product.data.categoryId ?? '',
        supplierId: product.data.supplierId ?? '',
        sku: product.data.sku ?? '',
        barcode: product.data.barcode ?? '',
        buyingPrice: product.data.buyingPrice,
        sellingPrice: product.data.sellingPrice,
        lowStockThreshold: product.data.lowStockThreshold,
        unit: product.data.unit,
        description: product.data.description ?? '',
      });
      setImageUrl(product.data.imageUrl ?? null);
      setCloudinaryPublicId(product.data.cloudinaryPublicId ?? null);
    }
  }, [product.data, reset]);

  const onFileChange = async (file: File | undefined) => {
    if (!file) return;
    setCloudinaryPublicId(null);
    setImageUrl(URL.createObjectURL(file));
    setUploading(true);
    setServerError(null);
    try {
      const result = await cloudinaryService.upload(file);
      if (result.url) {
        setImageUrl(result.url);
        setCloudinaryPublicId(result.publicId ?? null);
        toast('Image uploaded');
      } else {
        toast(result.message ?? 'Image upload is not available.', { type: 'info' });
      }
    } catch (err) {
      setServerError(extractError(err).message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const payload = {
      ...values,
      categoryId: values.categoryId || null,
      supplierId: values.supplierId || null,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      description: values.description || undefined,
      imageUrl: imageUrl ?? undefined,
      cloudinaryPublicId: cloudinaryPublicId ?? undefined,
    };
    try {
      if (isEdit && id) {
        await productService.update(id, payload);
        toast('Product updated');
        navigate(`/dashboard/products/${id}`);
      } else {
        const created = await productService.create({ ...payload, quantity: 0 });
        toast('Product added');
        navigate(`/dashboard/products/${created.id}`);
      }
    } catch (err) {
      setServerError(extractError(err).message);
    }
  };

  const loading = isEdit && (product.isLoading || !product.data);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={isEdit ? 'Update this product\u2019s details' : 'Add a product to your inventory'}
      />

      {loading ? (
        <Card className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : product.isError ? (
        <Card className="p-6 text-center text-sm text-danger">Couldn\u2019t load this product.</Card>
      ) : (
        <Card className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
              >
                {serverError}
              </div>
            )}

            <div>
              <span className="label">Product image</span>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-line/20 text-muted transition hover:border-brand/50"
                  aria-label="Choose product image"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  ) : imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6" />
                  )}
                </button>
                <div className="flex-1 space-y-2 pt-1 text-sm">
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(null);
                        setCloudinaryPublicId(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                    >
                      <X className="h-3.5 w-3.5" /> Remove image
                    </button>
                  )}
                  <p className="text-xs text-muted">
                    JPG, PNG or WEBP up to 5MB. Images are stored on Cloudinary.
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0])}
                />
              </div>
            </div>

            <Input
              label="Product name"
              placeholder="Milk 500ml"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                placeholder="Select category"
                error={errors.categoryId?.message}
                options={categories.data?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                {...register('categoryId')}
              />
              <Select
                label="Supplier"
                placeholder="Select supplier"
                error={errors.supplierId?.message}
                options={suppliers.data?.map((s) => ({ value: s.id, label: s.name })) ?? []}
                {...register('supplierId')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="SKU (optional)"
                placeholder="MLK-500"
                error={errors.sku?.message}
                {...register('sku')}
              />
              <Input
                label="Barcode (optional)"
                placeholder="EAN-13"
                error={errors.barcode?.message}
                {...register('barcode')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={`Buying price (${shop?.currency ?? 'KES'})`}
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="45"
                error={errors.buyingPrice?.message}
                {...register('buyingPrice')}
              />
              <Input
                label={`Selling price (${shop?.currency ?? 'KES'})`}
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="60"
                error={errors.sellingPrice?.message}
                {...register('sellingPrice')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Low stock alert at"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="5"
                error={errors.lowStockThreshold?.message}
                {...register('lowStockThreshold')}
              />
              <Input
                label="Unit"
                placeholder="piece, kg, litre..."
                error={errors.unit?.message}
                {...register('unit')}
              />
            </div>

            <Textarea
              label="Description (optional)"
              placeholder="Notes about this product"
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? 'Save changes' : 'Add product'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
