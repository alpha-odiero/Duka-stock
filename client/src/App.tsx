import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { StorefrontLayout } from '@/layouts/StorefrontLayout';
import { CartProvider } from '@/context/CartContext';
import { StorefrontProvider } from '@/context/StorefrontContext';
import { Spinner } from '@/components/ui/spinner';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { StockPage } from '@/pages/StockPage';
import SalesPage from '@/pages/SalesPage';
import { SalesHistoryPage } from '@/pages/SalesHistoryPage';
import { ReceiptPage } from '@/pages/ReceiptPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { SupplierDetailsPage } from '@/pages/SupplierDetailsPage';
import { PurchasesPage } from '@/pages/PurchasesPage';
import { ReturnsPage } from '@/pages/ReturnsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { OffersPage } from '@/pages/OffersPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { HelpPage } from '@/pages/HelpPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailsPage } from '@/pages/OrderDetailsPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { StaffPage } from '@/pages/StaffPage';
import { StaffProfilePage } from '@/pages/StaffProfilePage';
import { RegistersPage } from '@/pages/RegistersPage';
import { StorefrontCmsLayout } from '@/pages/storefront-cms/StorefrontCmsLayout';

import { StoreHome } from '@/pages/storefront/StoreHome';
import { StoreShopPage } from '@/pages/storefront/StoreShopPage';
import { StoreProductPage } from '@/pages/storefront/StoreProductPage';
import { StoreAboutPage } from '@/pages/storefront/StoreAboutPage';
import { StoreContactPage } from '@/pages/storefront/StoreContactPage';
import { StoreFaqPage } from '@/pages/storefront/StoreFaqPage';
import { StoreCategoryPage } from '@/pages/storefront/StoreCategoryPage';
import { CartPage } from '@/pages/storefront/CartPage';
import { CheckoutPage } from '@/pages/storefront/CheckoutPage';
import { OrderSuccessPage } from '@/pages/storefront/OrderSuccessPage';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <RequireGuest>
            <AuthLayout />
          </RequireGuest>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/products" element={<ProductsPage />} />
        <Route path="/dashboard/products/new" element={<ProductFormPage />} />
        <Route path="/dashboard/products/:id" element={<ProductDetailsPage />} />
        <Route path="/dashboard/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/dashboard/categories" element={<CategoriesPage />} />
        <Route path="/dashboard/stock" element={<StockPage />} />
        <Route path="/dashboard/sales" element={<SalesPage />} />
        <Route path="/dashboard/history" element={<SalesHistoryPage />} />
        <Route path="/dashboard/history/:id" element={<ReceiptPage />} />
        <Route path="/dashboard/orders" element={<OrdersPage />} />
        <Route path="/dashboard/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/dashboard/customers" element={<CustomersPage />} />
        <Route path="/dashboard/staff" element={<StaffPage />} />
        <Route path="/dashboard/staff/:id" element={<StaffProfilePage />} />
        <Route path="/dashboard/registers" element={<RegistersPage />} />
        <Route path="/dashboard/suppliers" element={<SuppliersPage />} />
        <Route path="/dashboard/suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="/dashboard/purchases" element={<PurchasesPage />} />
        <Route path="/dashboard/returns" element={<ReturnsPage />} />
        <Route path="/dashboard/expenses" element={<ExpensesPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/storefront/*" element={<StorefrontCmsLayout />} />
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard/offers" element={<OffersPage />} />
        <Route path="/dashboard/integrations" element={<IntegrationsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/help" element={<HelpPage />} />
      </Route>

      <Route
        element={
          <CartProvider>
            <StorefrontProvider>
              <StorefrontLayout />
            </StorefrontProvider>
          </CartProvider>
        }
      >
        <Route path="/" element={<StoreHome />} />
        <Route path="/shop" element={<StoreShopPage />} />
        <Route path="/shop/products/:slug" element={<StoreProductPage />} />
        <Route path="/products/:slug" element={<StoreProductPage />} />
        <Route path="/categories/:slug" element={<StoreCategoryPage />} />
        <Route path="/shop/cart" element={<CartPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/shop/checkout" element={<CheckoutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/shop/success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/about" element={<StoreAboutPage />} />
        <Route path="/contact" element={<StoreContactPage />} />
        <Route path="/faq" element={<StoreFaqPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
