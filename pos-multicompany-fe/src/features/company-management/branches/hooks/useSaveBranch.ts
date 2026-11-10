import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { saveBranch } from "../api/getBranches";
import type { BranchFormValues } from "../types";

export function useSaveBranch() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<
    string,
    ApiErrorResponse,
    { payload: BranchFormValues; id?: number }
  >({
    mutationFn: ({ payload, id }) => {
      if (!companyId) throw new Error("Select a company before saving a branch.");
      return saveBranch(companyId, payload, id);
    },
    onSuccess: (_message, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["Branches", companyId] });
      if (variables.id !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: ["Branch", companyId, variables.id],
        });
      }
    },
  });
}
