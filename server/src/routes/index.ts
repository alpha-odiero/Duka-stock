import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import shopRoutes from '../modules/shops/shops.routes';
import productRoutes from '../modules/products/products.routes';
import variantRoutes from '../modules/variants/variants.routes';
import categoryRoutes from '../modules/categories/categories.routes';
import supplierRoutes from '../modules/suppliers/suppliers.routes';
import stockRoutes from '../modules/stock/stock.routes';
import purchaseRoutes from '../modules/purchases/purchases.routes';
import batchRoutes from '../modules/batches/batches.routes';
import taxRoutes from '../modules/taxes/taxes.routes';
import saleRoutes from '../modules/sales/sales.routes';
import returnRoutes from '../modules/returns/returns.routes';
import expenseRoutes from '../modules/expenses/expenses.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import reportRoutes from '../modules/reports/reports.routes';
import notificationRoutes from '../modules/notifications/notifications.routes';
import customerRoutes from '../modules/customers/customer.routes';
import storefrontRoutes from '../modules/storefront/storefront.routes';
import orderRoutes from '../modules/orders/order.routes';
import cloudinaryRoutes from '../modules/cloudinary/cloudinary.routes';
import storeRoutes from '../modules/store/store.routes';
import staffRoutes from '../modules/staff/staff.routes';
import registerRoutes from '../modules/registers/registers.routes';
import roleRoutes from '../modules/roles/roles.routes';
import invitationRoutes from '../modules/invitations/invitations.routes';
import shiftRoutes from '../modules/shifts/shifts.routes';
import syncRoutes from '../modules/sync/sync.routes';
import offerRoutes from '../modules/offers/offer.routes';
import integrationRoutes from '../modules/integrations/integration.routes';

const router = Router();

// Auth endpoints are public (rate-limited at the app level).
router.use('/auth', authRoutes);

// Public storefront (customer-facing) - no authentication required.
router.use('/store', storeRoutes);

// All business routes below require authentication and a shop.
router.use('/shop', shopRoutes);
router.use('/products', productRoutes);
router.use('/products', stockRoutes); // shares /products/:id/stock/* paths
router.use('/variants', variantRoutes);
router.use('/batches', batchRoutes);
router.use('/taxes', taxRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/sales', saleRoutes);
router.use('/returns', returnRoutes);
router.use('/orders', orderRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);
router.use('/invitations', invitationRoutes);
router.use('/shifts', shiftRoutes);
router.use('/registers', registerRoutes);
router.use('/customers', customerRoutes);
router.use('/offers', offerRoutes);
router.use('/integrations', integrationRoutes);
router.use('/storefront', storefrontRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/cloudinary', cloudinaryRoutes);
router.use('/sync', syncRoutes);

export default router;
