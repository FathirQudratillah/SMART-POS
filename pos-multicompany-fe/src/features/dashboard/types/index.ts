import type { ApiResponse } from "@/types";

export type DashboardRecentSale = {
  id: number;
  invoice_no: string;
  sale_date: string;
  total_amount: number | string;
  status: string;
  customer?: { id: number; code: string; name: string } | null;
  creator?: { id: number; name: string };
};

export type DashboardSalesTrend = {
  date: string;
  label: string;
  count: number;
  revenue: number;
};

export type DashboardSummary = {
  sales_today: {
    count: number;
    revenue: number;
  };
  sales_month: {
    revenue: number;
  };
  stock: {
    product_count: number;
    total_quantity: number;
    out_of_stock_count: number;
  };
  open_shift_count: number;
  sales_trend: DashboardSalesTrend[];
  recent_sales: DashboardRecentSale[];
};

export type DashboardResponse = ApiResponse<DashboardSummary>;
