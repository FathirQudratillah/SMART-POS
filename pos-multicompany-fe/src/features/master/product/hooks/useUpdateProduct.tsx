import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductUpdateRequest } from "../types";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types/responses";
import { updateProduct } from "../api/updateProduct";

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();
    const { company } = useAuth();
    const companyId: number = company?.id as number;
    

  return useMutation<string, ApiErrorResponse, ProductUpdateRequest>({
    mutationFn: (payload: ProductUpdateRequest) =>
      updateProduct(companyId, id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Product", companyId, id],
      });
      queryClient.invalidateQueries({
        queryKey: ["POSBranchStock", companyId],
      });
    },
  });
};
