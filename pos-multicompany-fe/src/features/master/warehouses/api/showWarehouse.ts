import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { WarehouseResponse } from "../types";

export async function showWarehouse({ companyId, id }: CompanyResourceParams): Promise<WarehouseResponse> {
  const response = await apiClient.get<WarehouseResponse>(`/companies/${companyId}/warehouses/${id}`);
  return response.data;
}
