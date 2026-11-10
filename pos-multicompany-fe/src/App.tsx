import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./features/auth/page/LoginPage";
import Dashboard from "./features/dashboard/page/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/auth/AuthContext";
import GuestRoute from "./components/GuestRoute";
import EmailVerified from "./features/auth/page/EmailVerified";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AppLayout from "./components/layout/AppLayout";
import ProductPage from "./features/master/product/page/ProductPage";
import BranchPage from "./features/company-management/branches/page/BranchesPage";
import BranchDetailPage from "./features/company-management/branches/page/BranchDetailPage";
import CategoriesPage from "./features/master/categories/page/CategoriesPage";
import CustomersPage from "./features/master/customers/page/CustomersPage";
import SuppliersPage from "./features/master/suppliers/page/SuppliersPage";
import WarehousesPage from "./features/master/warehouses/page/WarehousesPage";
import StockOverviewPage from "./features/inventory/stock-overview/page/StockOverviewPage";
import StockMovementsPage from "./features/inventory/stock-movements/page/StockMovementsPage";
import StockTransfersPage from "./features/inventory/stock-transfers/page/StockTransfersPage";
import StockTransferDetailPage from "./features/inventory/stock-transfers/page/StockTransferDetailPage";
import StockAdjustmentsPage from "./features/inventory/stock-adjustments/page/StockAdjustmentsPage";
import StockAdjustmentDetailPage from "./features/inventory/stock-adjustments/page/StockAdjustmentDetailPage";
import StockOpnamesPage from "./features/inventory/stock-opname/page/StockOpnamesPage";
import StockOpnameDetailPage from "./features/inventory/stock-opname/page/StockOpnameDetailPage";
import { AlertProvider } from "./context/AlertContext";
import ProductDetailPage from "./features/master/product/page/ProductDetailPage";
import CategoryDetailPage from "./features/master/categories/page/CategoryDetailPage";
import WarehouseDetailPage from "./features/master/warehouses/page/WarehouseDetailPage";
import SupplierDetailPage from "./features/master/suppliers/page/SupplierDetailPage";
import CustomerDetailPage from "./features/master/customers/page/CustomerDetailPage";
import PurchaseOrdersPage from "./features/purchasing/purchase-orders/page/PurchaseOrdersPage";
import PurchaseOrderDetailPage from "./features/purchasing/purchase-orders/page/PurchaseOrderDetailPage";
import GoodsReceiptsPage from "./features/purchasing/goods-receipts/page/GoodsReceiptsPage";
import GoodsReceiptDetailPage from "./features/purchasing/goods-receipts/page/GoodsReceiptDetailPage";
import SalesPage from "./features/sales/page/SalesPage";
import SaleDetailPage from "./features/sales/page/SaleDetailPage";
import POSPage from "./features/sales/page/POSPage";
import CashMovementHistoryPage from "./features/finance/cash-movements/page/CashMovementHistoryPage";
import CashInPage from "./features/finance/cash-movements/page/CashInPage";
import CashOutPage from "./features/finance/cash-movements/page/CashOutPage";
import CashierShiftsPage from "./features/sales/page/CashierShiftsPage";
import PaymentMethodsPage from "./features/settings/payment-methods/page/PaymentMethodsPage";
import UsersPage from "./features/access-control/page/UsersPage";
import UserDetailPage from "./features/access-control/page/UserDetailPage";
import ResetPasswordPage from "./features/auth/page/ResetPasswordPage";
import AdminUsersPage from "./features/admin/page/AdminUsersPage";
import AdminUserDetailPage from "./features/admin/page/AdminUserDetailPage";

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AlertProvider>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/branches" element={<BranchPage />} />
                  <Route path="/branches/:id" element={<BranchDetailPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:id" element={<CategoryDetailPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
                  <Route path="/warehouses" element={<WarehousesPage />} />
                  <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
                  <Route path="/inventory" element={<StockOverviewPage />} />
                  <Route path="/stock-movements" element={<StockMovementsPage />} />
                  <Route path="/stock-transfers" element={<StockTransfersPage />} />
                  <Route path="/stock-transfers/:id" element={<StockTransferDetailPage />} />
                  <Route path="/stock-adjustments" element={<StockAdjustmentsPage />} />
                  <Route path="/stock-adjustments/:id" element={<StockAdjustmentDetailPage />} />
                  <Route path="/stock-opname" element={<StockOpnamesPage />} />
                  <Route path="/stock-opname/:id" element={<StockOpnameDetailPage />} />
                  <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                  <Route path="/good-receipts" element={<GoodsReceiptsPage />} />
                  <Route path="/good-receipts/:id" element={<GoodsReceiptDetailPage />} />
                  <Route path="/pos" element={<POSPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/sales/:id" element={<SaleDetailPage />} />
                  <Route path="/cash-movements" element={<CashMovementHistoryPage />} />
                  <Route path="/cash-in" element={<CashInPage />} />
                  <Route path="/cash-out" element={<CashOutPage />} />
                  <Route path="/cashier-shifts" element={<CashierShiftsPage />} />
                  <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                </Route>
              </Route>
            </Routes>
          </AlertProvider>
        </AuthProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
