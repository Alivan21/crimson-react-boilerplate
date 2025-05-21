import { getUsers } from "~/api/users";
import { type TUserQueryParams } from "~/api/users/type";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useQuery } from "~/hooks/request/use-query";

export const useUsersQuery = (params: TUserQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY.USER.LIST, params],
    queryFn: () => getUsers(params),
  });
};
