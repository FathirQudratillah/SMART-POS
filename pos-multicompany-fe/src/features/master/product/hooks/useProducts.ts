import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/getProducts";
import type { CompanyResourceParams } from "@/types";

export function useProducts({
  companyId,
  page,
  per_page = 25,
  search
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Products", companyId, page, per_page, search],
    queryFn: () =>
      getProducts({
        companyId: companyId!,
        page,
        per_page,
        search
      }),
    enabled: companyId !== null,
  });
}
