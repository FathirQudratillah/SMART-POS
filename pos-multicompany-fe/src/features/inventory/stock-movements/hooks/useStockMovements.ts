import { useQuery } from "@tanstack/react-query";
import { getStockMovements, type StockMovementParams } from "../api/stockMovements";

export function useStockMovements(params: StockMovementParams | null) {
  return useQuery({
    queryKey: [
      "StockMovements",
      params?.companyId,
      params?.branchId,
      params?.page,
      params?.per_page,
      params?.search,
      params?.movementType,
    ],
    queryFn: () => getStockMovements(params!),
    enabled: params !== null,
  });
}
