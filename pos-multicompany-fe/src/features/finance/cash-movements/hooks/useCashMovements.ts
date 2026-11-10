import { useQuery } from "@tanstack/react-query";
import { getCashMovements, type CashMovementParams } from "../api/cashMovements";

export function useCashMovements(params: CashMovementParams | null) {
  return useQuery({
    queryKey: [
      "CashMovements",
      params?.companyId,
      params?.branchId,
      params?.page,
      params?.per_page,
      params?.search,
      params?.movementType,
    ],
    queryFn: () => getCashMovements(params!),
    enabled: params !== null,
  });
}
