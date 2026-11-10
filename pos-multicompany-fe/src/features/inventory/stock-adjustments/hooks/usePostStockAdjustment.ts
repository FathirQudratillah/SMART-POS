import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { postStockAdjustment } from "../api/stockAdjustments";
import type { StockAdjustmentResponse } from "../types";

export function usePostStockAdjustment() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<StockAdjustmentResponse, ApiErrorResponse, number>({
    mutationFn: (id) => {
      if (!companyId) throw new Error("Select a company before posting an adjustment.");
      return postStockAdjustment(companyId, id);
    },
    onSuccess: (_response, id) => {
      void queryClient.invalidateQueries({ queryKey: ["StockAdjustments", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["StockAdjustment", companyId, id] });
      void queryClient.invalidateQueries({ queryKey: ["StockOverview", companyId] });
    },
  });
}
