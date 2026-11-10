import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { StockMovement, StockMovementsResponse } from "../types";

export type StockMovementParams = {
  companyId: number;
  branchId: number;
  page: number;
  per_page: number;
  search: string;
  movementType: "all" | StockMovement["movement_type"];
};

export async function getStockMovements({
  companyId,
  branchId,
  page,
  per_page,
  search,
  movementType,
}: StockMovementParams): Promise<StockMovementsResponse> {
  const response = await apiClient.get<
    ApiResponse<PaginatedResponse<StockMovement>>
  >(`/companies/${companyId}/stock-movements`, {
    params: {
      branch_id: branchId,
      page,
      per_page,
      search,
      movement_type: movementType === "all" ? undefined : movementType,
    },
  });
  return response.data;
}
