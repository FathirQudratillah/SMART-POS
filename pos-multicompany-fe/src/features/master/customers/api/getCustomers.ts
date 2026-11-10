import { apiClient } from "@/lib/apiClient";
import type { CompanyResourceParams } from "@/types";
import type { CustomersResponse } from "../types";

export const getCustomers = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<CustomersResponse> => {
  const response = await apiClient.get<CustomersResponse>(
    `/companies/${companyId}/customers`,
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
