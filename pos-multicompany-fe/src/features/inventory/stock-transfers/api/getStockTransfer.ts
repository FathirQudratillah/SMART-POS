import { apiClient } from "@/lib/apiClient";
import type { StockTransferResponse } from "../types";

export async function getStockTransfer(
  companyId: number,
  id: number,
): Promise<StockTransferResponse> {
  const response = await apiClient.get<StockTransferResponse>(
    `/companies/${companyId}/stock-transfer/${id}`,
  );
  return response.data;
}
