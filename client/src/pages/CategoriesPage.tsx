import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { categoryService } from '@/services/categories';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import { ImageUploader } from '@/components/storefront/ImageUploader';
import { extractError } from '@/lib/api';
import type { Category } from '@/types';

export function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const onSaved = (message: string) => {
    toast(message);
    invalidate();
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Categories"
        subtitle="Organise your products"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> New category
          </Button>
        }
      />

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      )}

      {isError && (
        <Card className="p-6 text-center text-sm text-danger">
          Couldn't load categories.{' '}
          <button onClick={() => refetch()} className="font-medium text-brand hover:underline">
            Try again
          </button>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card>
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            iconTone="teal"
            title="No categories yet"
            description="Categories keep your products organised and make finding things fast."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" /> Create a category
              </Button>
            }
          />
        </Card>
      )}

      {data && data.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c._count?.products ?? 0} product{(c._count?.products ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${c.name}`}>
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
                          setEditing(c);
                        }}
                      >
                        Rename
                      </MenuItem>
                      <MenuItem
                        icon={<Trash2 className="h-4 w-4" />}
                        danger
                        onClick={() => {
                          close();
                          setDeleting(c);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </>
                  )}
                </Dropdown>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editing && (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await categoryService.remove(deleting.id);
            toast('Category deleted');
            invalidate();
          } catch (err) {
            toast(extractError(err).message, { type: 'error' });
          } finally {
            setDeleting(null);
          }
        }}
        title="Delete category?"
        message={`"${deleting?.name}" will be removed. Categories that still contain products can't be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [image, setImage] = useState(category?.imageUrl ?? '');
  const [imagePublicId, setImagePublicId] = useState(category?.imagePublicId ?? null);
  const [visible, setVisible] = useState(category?.visible ?? true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      imageUrl: image || null,
      imagePublicId: imagePublicId,
      visible,
    };
    setBusy(true);
    try {
      if (category) {
        await categoryService.update(category.id, payload);
        onSaved('Category updated');
      } else {
        await categoryService.create(payload);
        onSaved('Category created');
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
      title={category ? 'Edit category' : 'New category'}
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
        <Input
          label="Category name"
          placeholder="e.g. Snacks"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          error={error}
          autoFocus
        />
        <Textarea
          label="Description (optional)"
          placeholder="Shown on the storefront category cards"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <ImageUploader
          label="Category image"
          value={image}
          folder="dukastock/categories"
          aspect="aspect-[4/3]"
          hint="Used as the visual backdrop on the storefront. Leave empty to use a branded colour tile."
          onChange={(img) => {
            setImage(img.url ?? '');
            setImagePublicId(img.publicId ?? null);
          }}
        />
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line"
          />
          <span>
            <span className="font-medium">Visible on storefront</span>
            <span className="block text-xs text-muted">Hide this category and its products from the public store.</span>
          </span>
        </label>
      </div>
    </Modal>
  );
}
