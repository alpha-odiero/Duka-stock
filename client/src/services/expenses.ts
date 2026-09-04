import { api } from '@/lib/api';
import type { Expense, ExpenseCategory, Pagination } from '@/types';

export interface ExpenseInput {
  category: ExpenseCategory;
  description: string;
  amount: number | string;
  expenseDate?: string;
}

export const expenseService = {
  async list(params: {
    page?: number;
    limit?: number;
    category?: ExpenseCategory;
    from?: string;
    to?: string;
  } = {}): Promise<{ expenses: Expense[]; pagination: Pagination }> {
    const res = await api.get('/expenses', { params });
    return res.data.data;
  },
  async create(input: ExpenseInput): Promise<Expense> {
    const res = await api.post('/expenses', input);
    return res.data.data.expense;
  },
  async update(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
    const res = await api.patch(`/expenses/${id}`, input);
    return res.data.data.expense;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
