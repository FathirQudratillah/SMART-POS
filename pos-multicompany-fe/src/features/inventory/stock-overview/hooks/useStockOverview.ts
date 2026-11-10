import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getStockOverview } from "../api/getStockOverview";

export function useStockOverview({
  companyId,
  branchId,
  warehouseId,
  page,
  per_page = 25,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["StockOverview", companyId,branchId, warehouseId, page, per_page, search],
    queryFn: () =>
      getStockOverview({
        companyId: companyId!,
        branchId,
        warehouseId,
        page,
        per_page,
        search,
      }),
    enabled: companyId !== null,
  });
}
