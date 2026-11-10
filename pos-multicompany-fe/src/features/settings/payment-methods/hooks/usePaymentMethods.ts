import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getPaymentMethods } from "../api/paymentMethods";

export function usePaymentMethods(params: CompanyResourceParams) {
  return useQuery({
    queryKey: [
      "ManagePaymentMethods",
      params.companyId,
      params.page,
      params.per_page,
      params.search,
    ],
    queryFn: () => getPaymentMethods(params),
    enabled: params.companyId !== null,
  });
}
