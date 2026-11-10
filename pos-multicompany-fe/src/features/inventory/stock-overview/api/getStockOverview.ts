import { apiClient } from "@/lib/apiClient";
import type { CompanyResourceParams } from "@/types";
import type { StockOverviewResponse } from "../types";

export const getStockOverview = async ({
  companyId,
  branchId,
  warehouseId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<StockOverviewResponse> => {
  const response = await apiClient.get<StockOverviewResponse>(
    `/companies/${companyId}/inventory-stocks${branchId ? `/${branchId}` : ""}${warehouseId ? `/${warehouseId}` : ""}`,
    {
      params: {
        page,
        per_page,
        search,
      },
    },
  );

  return response.data;
};
