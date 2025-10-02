import { type TJwtPayload as BaseJwtPayload } from "~/utils/jwt";

export type TUserData = BaseJwtPayload & {
  id: string;
  email: string;
  name: string;
  role: string;
};
