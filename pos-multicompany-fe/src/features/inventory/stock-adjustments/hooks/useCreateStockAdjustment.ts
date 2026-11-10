import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createStockAdjustment } from "../api/stockAdjustments";
import type { CreateStockAdjustmentRequest, StockAdjustmentResponse } from "../types";

export function useCreateStockAdjustment() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<StockAdjustmentResponse, ApiErrorResponse, CreateStockAdjustmentRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating an adjustment.");
      return createStockAdjustment(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["StockAdjustments", companyId] }),
  });
}
