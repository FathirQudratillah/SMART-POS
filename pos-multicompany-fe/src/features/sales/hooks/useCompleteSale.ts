import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { completeSale } from "../api/sales";
import type { CompleteSaleRequest, SaleResponse } from "../types";

export function useCompleteSale() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<SaleResponse, ApiErrorResponse, { id: number; payload: CompleteSaleRequest }>({
    mutationFn: ({ id, payload }) => {
      if (!companyId) throw new Error("Select a company before completing a sale.");
      return completeSale(companyId, id, payload);
    },
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["Sales", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["Sale", companyId, variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["StockOverview", companyId] });
    },
  });
}
