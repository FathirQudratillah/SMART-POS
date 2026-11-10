import { LayoutDashboard } from "lucide-react";

export type MenuItem = {
  title: string;
  url?: string;
  icon: typeof LayoutDashboard;
  permissions?: string[];
  children?: {
    title: string;
    url: string;
    permissions?: string[];
  }[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};



export type AppBottomMenuProps = {
  companyName?: string;
  userId?: number;
  isSuperAdmin?: boolean;
  userName?: string;
  userEmail?: string;
  userCompany?: string;
  userBranch?: string;
  permissions?: string[];
  onLogout?: () => void;
  className?: string;
};