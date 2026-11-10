import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createGoodsReceipt } from "../api/goodsReceipts";
import type { CreateGoodsReceiptRequest, GoodsReceiptResponse } from "../types";

export function useCreateGoodsReceipt() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<GoodsReceiptResponse, ApiErrorResponse, CreateGoodsReceiptRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a goods receipt.");
      return createGoodsReceipt(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["GoodsReceipts", companyId] }),
  });
}
