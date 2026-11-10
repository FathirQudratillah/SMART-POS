import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CategoryFormRequest } from "../types";
import { addCategory } from "../api/addCategory";

export function useAddCategory() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CategoryFormRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a category.");
      return addCategory(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Categories", companyId] }),
  });
}
