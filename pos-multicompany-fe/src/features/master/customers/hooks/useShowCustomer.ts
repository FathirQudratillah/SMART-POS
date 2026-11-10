import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { showCustomer } from "../api/showCustomer";

export function useShowCustomer({ companyId, id }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Customer", companyId, id],
    queryFn: () => showCustomer({ companyId: companyId!, id: id! }),
    enabled: companyId !== null && id !== undefined,
  });
}
