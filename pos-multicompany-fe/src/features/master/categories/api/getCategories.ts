import type { CompanyResourceParams } from "@/types";
import { apiClient } from "@/lib/apiClient";
import type { CategoriesResponse } from "../types";

export const getCategories = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = ""
}: CompanyResourceParams): Promise<CategoriesResponse> => {
  const response = await apiClient.get<CategoriesResponse>(`/companies/${companyId}/categories`, {
    params: {
      page,
      per_page,
      search
    },
  });

  return response.data;
};
