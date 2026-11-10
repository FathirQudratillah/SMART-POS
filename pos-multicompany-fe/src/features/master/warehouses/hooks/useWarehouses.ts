import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getWarehouses } from "../api/getWarehouses";

export function useWarehouses({
  companyId,
  page,
  per_page = 25,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Warehouses", companyId, page, per_page, search],
    queryFn: () =>
      getWarehouses({
        companyId: companyId!,
        page,
        per_page,
        search,
      }),
    enabled: companyId !== null,
  });
}
