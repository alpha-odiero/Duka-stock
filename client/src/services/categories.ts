import { api } from '@/lib/api';
import type { Category } from '@/types';

export interface CategoryInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  displayOrder?: number;
  visible?: boolean;
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const res = await api.get('/categories');
    return res.data.data.categories;
  },
  async create(input: CategoryInput): Promise<Category> {
    const res = await api.post('/categories', input);
    return res.data.data.category;
  },
  async update(id: string, input: CategoryInput): Promise<Category> {
    const res = await api.patch(`/categories/${id}`, input);
    return res.data.data.category;
  },
  async reorder(ids: string[]): Promise<void> {
    await api.put('/categories/reorder', { ids });
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
