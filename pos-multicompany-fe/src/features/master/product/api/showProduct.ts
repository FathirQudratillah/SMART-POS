import type { CompanyResourceParams } from "@/types";
import type { ProductResponse } from "../types";
import { apiClient } from "@/lib/apiClient";

export const showProduct = async ({
  companyId,
  id
}: CompanyResourceParams): Promise<ProductResponse> => {
  const response = await apiClient.get<ProductResponse>(`/companies/${companyId}/products/${id}`);

  return response.data;
};
