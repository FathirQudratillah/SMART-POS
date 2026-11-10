import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { SupplierResponse } from "../types";

export async function showSupplier({ companyId, id }: CompanyResourceParams): Promise<SupplierResponse> {
  const response = await apiClient.get<SupplierResponse>(`/companies/${companyId}/suppliers/${id}`);
  return response.data;
}
