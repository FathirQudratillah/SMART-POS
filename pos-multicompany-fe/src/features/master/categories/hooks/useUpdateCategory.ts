import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CategoryUpdateRequest } from "../types";
import { updateCategory } from "../api/updateCategory";

export function useUpdateCategory(id: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CategoryUpdateRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before updating a category.");
      return updateCategory(companyId, id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["Categories", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["Category", companyId, id] }),
      ]);
    },
  });
}
