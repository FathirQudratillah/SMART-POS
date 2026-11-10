import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { postGoodsReceipt } from "../api/goodsReceipts";
import type { GoodsReceiptResponse } from "../types";

export function usePostGoodsReceipt() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<GoodsReceiptResponse, ApiErrorResponse, number>({
    mutationFn: (id) => {
      if (!companyId) throw new Error("Select a company before posting a goods receipt.");
      return postGoodsReceipt(companyId, id);
    },
    onSuccess: (_response, id) => {
      void queryClient.invalidateQueries({ queryKey: ["GoodsReceipts", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["GoodsReceipt", companyId, id] });
      void queryClient.invalidateQueries({ queryKey: ["PurchaseOrders", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["PurchaseOrder", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["StockOverview", companyId] });
    },
  });
}
