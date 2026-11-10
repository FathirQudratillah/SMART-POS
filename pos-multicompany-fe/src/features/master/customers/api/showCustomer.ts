import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { CustomerResponse } from "../types";

export async function showCustomer({ companyId, id }: CompanyResourceParams): Promise<CustomerResponse> {
  const response = await apiClient.get<CustomerResponse>(`/companies/${companyId}/customers/${id}`);
  return response.data;
}
