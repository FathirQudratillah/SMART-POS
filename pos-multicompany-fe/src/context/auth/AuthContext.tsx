import { createContext, useCallback, useContext, type ReactNode } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { logoutApi } from "@/features/auth/api/logout";
import { authKeys, useCurrentUser } from "@/features/auth/hooks/useAuthQueries";
import type { User } from "@/features/access-control/types";
import type { Company } from "@/features/company-management/companies/types";
import type { Branch } from "@/features/company-management/branches/types";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  branch: Branch | null;
  permissions: string[];
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Gunakan hook yang sudah dibuat
  const userQuery = useCurrentUser();

  const setUser = useCallback(
    (user: User | null) => {
      queryClient.setQueryData(authKeys.user(), user);
    },
    [queryClient],
  );

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: authKeys.user(),
      exact: true,
    });
  }, [queryClient]);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Hapus user dari cache setelah logout berhasil
      queryClient.setQueryData(authKeys.user(), null);

      // Bersihkan cache data selain autentikasi
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data?.user ?? null,
        company: userQuery.data?.company ?? null,
        branch: userQuery.data?.branch ?? null,
        permissions: userQuery.data?.permissions ?? [],
        loading: userQuery.isPending || logoutMutation.isPending,
        setUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
