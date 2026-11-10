import { apiClient } from "@/lib/apiClient";
import type { CompanyResourceParams } from "@/types";
import type { SuppliersResponse } from "../types";

export const getSuppliers = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<SuppliersResponse> => {
  const response = await apiClient.get<SuppliersResponse>(
    `/companies/${companyId}/suppliers`,
    {
      params: {
        page,
        per_page,
        search,
      },
    },
  );

  return response.data;
};
