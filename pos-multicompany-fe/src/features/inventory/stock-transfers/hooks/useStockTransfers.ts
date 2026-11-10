import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getStockTransfers } from "../api/getStockTransfers";

export function useStockTransfers({
  companyId,
  branchId,
  page,
  per_page = 25,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["StockTransfers", companyId, branchId, page, per_page, search],
    queryFn: () =>
      getStockTransfers({ companyId: companyId!, branchId, page, per_page, search }),
    enabled: companyId !== null,
  });
}
