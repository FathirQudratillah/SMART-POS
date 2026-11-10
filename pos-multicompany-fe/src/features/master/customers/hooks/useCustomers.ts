import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getCustomers } from "../api/getCustomers";

export function useCustomers({
  companyId,
  page,
  per_page = 25,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Customers", companyId, page, per_page, search],
    queryFn: () =>
      getCustomers({
        companyId: companyId!,
        page,
        per_page,
        search,
      }),
    enabled: companyId !== null,
  });
}
