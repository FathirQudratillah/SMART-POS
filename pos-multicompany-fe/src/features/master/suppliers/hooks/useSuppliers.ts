import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getSuppliers } from "../api/getSuppliers";

export function useSuppliers({
  companyId,
  page,
  per_page = 25,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Suppliers", companyId, page, per_page, search],
    queryFn: () =>
      getSuppliers({
        companyId: companyId!,
        page,
        per_page,
        search,
      }),
    enabled: companyId !== null,
  });
}
