import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { CategoryResponse } from "../types";

export async function showCategory({ companyId, id }: CompanyResourceParams): Promise<CategoryResponse> {
  const response = await apiClient.get<CategoryResponse>(`/companies/${companyId}/categories/${id}`);
  return response.data;
}
