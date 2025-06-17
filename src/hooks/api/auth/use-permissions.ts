import { getPermissions } from "~/api/auth";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useQuery } from "~/hooks/request/use-query";

type TUsePermissionsQueryOptions = {
  enabled?: boolean;
};

export const usePermissionsQuery = (options?: TUsePermissionsQueryOptions) => {
  return useQuery({
    queryKey: [QUERY_KEY.AUTH.PERMISSIONS],
    queryFn: getPermissions,
    enabled: options?.enabled,
  });
};
