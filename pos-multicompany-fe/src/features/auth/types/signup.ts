import type { User } from "@/features/access-control/types";
import type { Branch } from "@/features/company-management/branches/types";
import type { Company } from "@/features/company-management/companies/types";
import type { ApiResponse } from "@/types";
import type { Dispatch, SetStateAction } from "react";


export type SignupFormProps = {
  onOpenChange: (open: boolean) => void;
  setErrorMessage: Dispatch<SetStateAction<string>>;
};

export type SignupFormRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  acceptTerms: boolean;
  acceptEmail: boolean;
  company: {
    name: string;
    code: string;
    legal_name: string;
    tax_number: string;
    email: string;
    phone: string;
    address: string;
  };
  branch: {
    name: string;
    code: string;
    phone: string;
    address: string;
  };
};

export type SignupResponse = ApiResponse<{
  user: User;
  company: Company;
  branch: Branch;
}>
