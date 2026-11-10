import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../api/getBranches";
import type { CompanyResourceParams } from "@/types";

export function useBranches({
  companyId,
  page,
  per_page = 25,
  search
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Branches", companyId, page, per_page, search],
    queryFn: () =>
      getBranches({
        companyId: companyId!,
        page,
        per_page,
        search
      }),
    enabled: companyId !== null,
  });
}
