import { getPermissions } from "~/api/auth";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useQuery } from "~/hooks/request/use-query";

export const usePermissionsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEY.AUTH.PERMISSIONS],
    queryFn: getPermissions,
    // Cache permissions for 24 hours (stale time)
    staleTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    // Keep in cache for 30 days when unused (garbage collection time)
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // Don't refetch on window focus for permissions
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect for permissions
    refetchOnReconnect: false,
    // Don't refetch on mount if data exists and is not stale
    refetchOnMount: false,
    // Retry failed requests up to 3 times
    retry: 3,
    // Use structural sharing to prevent unnecessary re-renders
    structuralSharing: true,
  });
};
