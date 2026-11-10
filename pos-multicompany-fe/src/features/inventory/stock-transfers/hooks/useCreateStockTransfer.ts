import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createStockTransfer } from "../api/createStockTransfer";
import type { CreateStockTransferRequest, StockTransferResponse } from "../types";

export function useCreateStockTransfer() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<StockTransferResponse, ApiErrorResponse, CreateStockTransferRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a stock transfer.");
      return createStockTransfer(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["StockTransfers", companyId] }),
  });
}
