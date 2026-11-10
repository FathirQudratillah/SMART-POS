import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { showCategory } from "../api/showCategory";

export function useShowCategory({ companyId, id }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Category", companyId, id],
    queryFn: () => showCategory({ companyId: companyId!, id: id! }),
    enabled: companyId !== null && id !== undefined,
  });
}
