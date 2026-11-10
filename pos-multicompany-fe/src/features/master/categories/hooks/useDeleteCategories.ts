import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CategoryDeleteRequest } from "../types";
import { deleteCategories } from "../api/deleteCategories";

export function useDeleteCategories() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CategoryDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before deleting categories.");
      return deleteCategories(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Categories", companyId] }),
  });
}
