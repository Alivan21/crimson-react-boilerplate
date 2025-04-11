import { type JwtPayload as BaseJwtPayload } from "~/utils/jwt";

export interface UserData extends BaseJwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}
