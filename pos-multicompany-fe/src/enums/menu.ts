import type { MenuGroup } from "@/types";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  Users,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  ShoppingCart,
  Receipt,
  ArrowLeftRight,
  ShieldCheck,
  Building2,
  BanknoteArrowUp,
  BanknoteArrowDown,
  History,
  Clock,
  Activity,
  CreditCard,
  Shield,
} from "lucide-react";


export const navigation: MenuGroup[] = [
  {
    title: "WORKSPACE",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        permissions: ["dashboard.view"],
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        title: "Users",
        url: "/admin/users",
        icon: Shield,
        permissions: ["admin.users.view"],
      },
    ],
  },
  {
    title: "MASTER DATA",
    items: [
      {
        title: "Products",
        icon: Package,
        children: [
          { title: "All Products", url: "/products", permissions: ["catalog.products.view"] },
          { title: "Categories", url: "/categories", permissions: ["catalog.categories.view"] },
        ],
      },
      {
        title: "Warehouses",
        url: "/warehouses",
        icon: Warehouse,
        permissions: ["inventory.warehouses.view"],
      },
      {
        title: "Suppliers",
        url: "/suppliers",
        icon: Truck,
        permissions: ["purchasing.suppliers.view"],
      },
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        permissions: ["sales.customers.view"],
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        title: "Stock Overview",
        url: "/inventory",
        icon: Boxes,
        permissions: ["inventory.stock_overview.view"],
      },
      {
        title: "Stock Transfers",
        url: "/stock-transfers",
        icon: ArrowLeftRight,
        permissions: ["inventory.stock_transfers.view", "inventory.stock_transfers.create"],
      },
      {
        title: "Stock Adjustments",
        url: "/stock-adjustments",
        icon: ClipboardCheck,
        permissions: ["inventory.stock_adjustments.view", "inventory.stock_adjustments.create"],
      },
      {
        title: "Stock Opname",
        url: "/stock-opname",
        icon: ClipboardList,
        permissions: ["inventory.stock_opnames.view", "inventory.stock_opnames.create"],
      },
      {
        title: "Stock Movements",
        url: "/stock-movements",
        icon: Activity,
        permissions: ["inventory.stock_movements.view"],
      },
    ],
  },
  {
    title: "TRANSACTIONS",
    items: [
      {
        title: "Point of Sale",
        url: "/pos",
        icon: ShoppingCart,
        permissions: ["sales.create", "sales.cashier_shifts.open", "sales.cashier_shifts.close"],
      },
      {
        title: "Cash In",
        url: "/cash-in",
        icon: BanknoteArrowUp,
        permissions: ["finance.cash_movements.create"],
      },
      {
        title: "Cash Out",
        url: "/cash-out",
        icon: BanknoteArrowDown,
        permissions: ["finance.cash_movements.create"],
      },
      {
        title: "Sales",
        url: "/sales",
        icon: Receipt,
        permissions: ["sales.sales.view"],
      },
      {
        title: "History",
        url: "/cash-movements",
        icon: History,
        permissions: ["finance.cash_movements.view"],
      },
      {
        title: "Cashier Shifts",
        url: "/cashier-shifts",
        icon: Clock,
        permissions: ["sales.cashier_shifts.view"],
      },
      {
        title: "Purchases",
        icon: ClipboardList,
        children: [
          { title: "Purchase Orders", url: "/purchase-orders", permissions: ["purchasing.orders.view", "purchasing.orders.create"] },
          { title: "Good Receipts", url: "/good-receipts", permissions: ["purchasing.goods_receipts.view", "purchasing.goods_receipts.create"] },
        ],
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        title: "Users & Permissions",
        url: "/users",
        icon: ShieldCheck,
        permissions: ["core.users.manage"],
      },
      {
        title: "Branches",
        url: "/branches",
        icon: Building2,
        permissions: ["core.branches.view", "core.branches.create", "core.branches.update", "core.branches.delete"],
      },
      {
        title: "Payment Methods",
        url: "/payment-methods",
        icon: CreditCard,
        permissions: ["settings.payment_methods.view", "settings.payment_methods.create", "settings.payment_methods.update", "settings.payment_methods.delete"],
      },
    ],
  },
];
