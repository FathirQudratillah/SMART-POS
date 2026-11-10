import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { deleteBranches } from "../api/getBranches";
import type { BranchDeleteRequest } from "../types";

export function useDeleteBranches() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, BranchDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before deleting branches.");
      return deleteBranches(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Branches", companyId] }),
  });
}
