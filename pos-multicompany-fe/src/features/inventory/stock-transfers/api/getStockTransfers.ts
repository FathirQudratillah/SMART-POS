import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { StockTransfersResponse } from "../types";

export async function getStockTransfers({
  companyId,
  branchId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<StockTransfersResponse> {
  const response = await apiClient.get<StockTransfersResponse>(
    `/companies/${companyId}/stock-transfers${branchId ? `/${branchId}` : ""}`,
    { params: { page, per_page, search } },
  );
  return response.data;
}
