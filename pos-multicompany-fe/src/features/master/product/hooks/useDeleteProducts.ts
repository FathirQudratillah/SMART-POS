import type { ApiErrorResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProducts } from "../api/deleteProducts";
import type { ProductDeleteRequest } from "../types";
import { useAuth } from "@/context/auth/AuthContext";

export function useDeleteProducts() {
  const queryClient = useQueryClient();

  const { company } = useAuth();
  const companyId: number = company?.id as number;

  return useMutation<string, ApiErrorResponse, ProductDeleteRequest>({
    mutationFn: (request) => deleteProducts(companyId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["Products", companyId],
      });
    },
  });
}
