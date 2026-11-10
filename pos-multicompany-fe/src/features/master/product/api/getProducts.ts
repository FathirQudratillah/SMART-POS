import type { CompanyResourceParams } from "@/types";
import type { ProductsResponse } from "../types";
import { apiClient } from "@/lib/apiClient";

export const getProducts = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = ""
}: CompanyResourceParams): Promise<ProductsResponse> => {
  const response = await apiClient.get<ProductsResponse>(`/companies/${companyId}/products`, {
    params: {
      page,
      per_page,
      search
    },
  });

  return response.data;
};
