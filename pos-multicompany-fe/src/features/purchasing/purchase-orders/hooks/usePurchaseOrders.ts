import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getPurchaseOrders } from "../api/purchaseOrders";

export function usePurchaseOrders({
  companyId,
  branchId,
  page,
  per_page,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["PurchaseOrders", companyId, branchId, page, per_page, search],
    queryFn: () =>
      getPurchaseOrders({ companyId: companyId!, branchId, page, per_page, search }),
    enabled: companyId !== null,
  });
}
