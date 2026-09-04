import { api } from '@/lib/api';
import type { InventoryReport, ProfitReport, PurchaseReport, SalesReport } from '@/types';

export interface DateRange {
  from?: string;
  to?: string;
  period?: string;
}

export const reportService = {
  async sales(range: DateRange = {}): Promise<SalesReport> {
    const res = await api.get('/reports/sales', { params: range });
    return res.data.data;
  },
  async inventory(): Promise<InventoryReport> {
    const res = await api.get('/reports/inventory');
    return res.data.data;
  },
  async profit(range: DateRange = {}): Promise<ProfitReport> {
    const res = await api.get('/reports/profit', { params: range });
    return res.data.data;
  },
  async purchases(range: DateRange = {}): Promise<PurchaseReport> {
    const res = await api.get('/reports/purchases', { params: range });
    return res.data.data;
  },
};
