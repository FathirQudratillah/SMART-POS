import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getCategories } from "../api/getCategories";

export function useCategories({
  companyId,
  page,
  per_page = 25,
  search
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Categories", companyId, page, per_page, search],
    queryFn: () =>
      getCategories({
        companyId: companyId!,
        page,
        per_page,
        search
      }),
    enabled: companyId !== null,
  });
}
