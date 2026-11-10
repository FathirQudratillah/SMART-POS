import type { User } from "@/features/access-control/types"
import type { Branch } from "@/features/company-management/branches/types";
import type { Company } from "@/features/company-management/companies/types";
import type { ApiResponse } from "@/types";

export type UserData = {
    user: User;
    company: Company | null;
    branch: Branch | null;
    permissions: string[];
}

export type UserDataResponse = ApiResponse<UserData>;