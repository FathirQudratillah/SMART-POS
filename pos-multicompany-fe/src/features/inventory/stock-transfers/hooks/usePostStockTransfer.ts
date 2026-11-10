import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { postStockTransfer } from "../api/postStockTransfer";
import type { StockTransferResponse } from "../types";

export function usePostStockTransfer() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<StockTransferResponse, ApiErrorResponse, number>({
    mutationFn: (id) => {
      if (!companyId) throw new Error("Select a company before posting a stock transfer.");
      return postStockTransfer(companyId, id);
    },
    onSuccess: (_response, id) => {
      void queryClient.invalidateQueries({ queryKey: ["StockTransfers", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["StockTransfer", companyId, id] });
      void queryClient.invalidateQueries({ queryKey: ["StockOverview", companyId] });
    },
  });
}
