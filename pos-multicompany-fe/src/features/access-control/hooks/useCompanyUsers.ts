import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getCompanyUsers } from "../api/companyUsers";

export function useCompanyUsers(params: CompanyResourceParams) {
  return useQuery({
    queryKey: [
      "CompanyUsers",
      params.companyId,
      params.page,
      params.per_page,
      params.search,
    ],
    queryFn: () => getCompanyUsers(params),
    enabled: params.companyId !== null,
  });
}
