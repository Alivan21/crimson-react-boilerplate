import type {
  TApiResponse,
  TPaginatedResponse,
  TSuccessResponse,
} from "~/common/types/base-response";

/**
 * User entity type definition
 */
export type TUserItem = {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  status?: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/**
 * Parameters for querying users
 */
export type TUserQueryParams = {
  page?: number;
  limit?: number;
  per_page?: number;
  search?: string;
  sort_by?: "name" | "email" | "created_at" | "updated_at" | "phone_number";
  sort_order?: "asc" | "desc";
};

export type TUserResponse = TSuccessResponse<TUserItem>;
export type TUserListResponse = TPaginatedResponse<TUserItem>;
export type TUserApiResponse = TApiResponse<TUserItem | TUserItem[] | null>;
