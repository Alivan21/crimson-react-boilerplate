import type { TSuccessResponse } from "~/common/types/base-response";

export type TLoginItem = {
  expires_at: string;
  token: string;
  type: string;
};

export type TLoginResponse = TSuccessResponse<TLoginItem>;

export type TPermissionItem = string[];

export type TPermissionResponse = TSuccessResponse<TPermissionItem>;
