import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
// import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/context/auth/AuthContext";
import { AppBottomMenu } from "./AppBottomMenu";
import { Building2 } from "lucide-react";
import ClockElement from "../ui/clock";

export default function AppLayout() {
  const { user, company, branch, permissions, logout } = useAuth();
  
  return (
    <SidebarProvider defaultOpen>
      {/* <AppSidebar
        companyName="Main Company"
        userName={user?.name ?? "Administrator"}
        userEmail={user?.email ?? ""}
        onLogout={() => void logout()}
        onSwitchCompany={() => {
          // Hubungkan ke fitur pergantian perusahaan.
        }}
      /> */}
      <AppBottomMenu
        className="block"
        userId={user?.id}
        isSuperAdmin={user?.is_superadmin}
        userName={user?.name}
        userEmail={user?.email}
        userCompany={company?.legal_name ?? (user?.is_superadmin ? "SMART POS" : undefined)}
        userBranch={branch?.name ?? (user?.is_superadmin ? "Super Admin" : undefined)}
        permissions={permissions}
        onLogout={() => void logout()}
      />

      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <Building2 className="size-4.5" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {company?.name ?? "SMART POS"}
            </p>
            <h1 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {branch?.name ?? (user?.is_superadmin ? "Super Admin Console" : "No branch assigned")}
            </h1>
          </div>

          <ClockElement />
        </header>

        <main className="min-w-0 flex-1 bg-slate-100 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
