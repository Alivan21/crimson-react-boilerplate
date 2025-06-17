import { useEffect } from "react";
import { PERMISSIONS } from "~/common/constants/permissions";
import { useSession } from "~/components/providers/sessions";
import {
  clearUserPermissions,
  getUserPermissions,
  setUserPermissions,
} from "~/libs/routing/permissions";

/**
 * Hook for managing user permissions in sync with session state
 */
function usePermissions() {
  const { user, isAuthenticated } = useSession();

  // Update permissions when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // You can customize this logic based on your user data structure
      const allPermissions = Object.values(PERMISSIONS).flatMap((module) => Object.values(module));
      setUserPermissions(allPermissions);
    } else {
      clearUserPermissions();
    }
  }, [isAuthenticated, user]);

  return {
    permissions: getUserPermissions(),
    isAuthenticated,
  };
}

export function PermissionsSync() {
  usePermissions();
  return null;
}
