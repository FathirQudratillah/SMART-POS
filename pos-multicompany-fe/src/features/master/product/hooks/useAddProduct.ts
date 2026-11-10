import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductFormRequest } from "../types";
import { addProduct } from "../api/addProduct";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types/responses";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
    const { company } = useAuth();
    const companyId: number = company?.id as number;
    

  return useMutation<string, ApiErrorResponse, ProductFormRequest>({
    mutationFn: (payload: ProductFormRequest) =>
      addProduct(companyId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Products", companyId],
      });
    },
  });
};
