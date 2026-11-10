import { useQuery } from "@tanstack/react-query";
import { getCashierShifts } from "../api/sales";

export type CashierShiftsParams = {
  companyId: number;
  branchId: number;
  page: number;
  per_page: number;
  search: string;
  status: "all" | "open" | "closed";
};

export function useCashierShifts(params: CashierShiftsParams | null) {
  return useQuery({
    queryKey: [
      "CashierShifts",
      params?.companyId,
      params?.branchId,
      params?.page,
      params?.per_page,
      params?.search,
      params?.status,
    ],
    queryFn: () => getCashierShifts(params!),
    enabled: params !== null,
  });
}
