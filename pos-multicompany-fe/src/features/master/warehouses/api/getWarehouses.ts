import { apiClient } from "@/lib/apiClient";
import type { CompanyResourceParams } from "@/types";
import type { WarehousesResponse } from "../types";

export const getWarehouses = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<WarehousesResponse> => {
  const response = await apiClient.get<WarehousesResponse>(
    `/companies/${companyId}/warehouses`,
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
