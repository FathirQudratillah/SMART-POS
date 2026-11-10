export type Company = {
  id: number;
  name: string;
  code: string;
  legal_name: string;
  tax_number: string;
  email: string;
  address: string;
  status: "active" | "suspended" | "inactive";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};
