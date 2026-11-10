import type { ApiResponse } from "@/types";
import type { User } from "@/features/access-control/types";

export type LoginDataRequest = {
    email: string;
    password: string;
}


export type LoginDataResponse = ApiResponse<{user: User}>;