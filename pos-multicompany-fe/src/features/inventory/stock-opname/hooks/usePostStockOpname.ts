import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { postStockOpname } from "../api/stockOpnames";
import type { StockOpnameResponse } from "../types";

export function usePostStockOpname() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<StockOpnameResponse, ApiErrorResponse, number>({
    mutationFn: (id) => {
      if (!companyId) throw new Error("Select a company before posting an opname.");
      return postStockOpname(companyId, id);
    },
    onSuccess: (_response, id) => {
      void queryClient.invalidateQueries({ queryKey: ["StockOpnames", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["StockOpname", companyId, id] });
      void queryClient.invalidateQueries({ queryKey: ["StockOverview", companyId] });
    },
  });
}
