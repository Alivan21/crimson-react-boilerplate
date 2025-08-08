import { usePermissionsQuery } from "../api/auth/use-permissions";

/**
 * Custom hook for checking user permissions
 *
 * @returns {Object} Permission utilities
 * @returns {string[]} permissions - Array of user's permissions
 * @returns {Function} hasPermission - Check if user has a specific permission
 * @returns {Function} hasAnyPermission - Check if user has any of the specified permissions
 * @returns {Function} hasAllPermissions - Check if user has all of the specified permissions
 *
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 *
 * // Check single permission
 * if (hasPermission("user:delete")) {
 *   // User can delete
 * }
 *
 * // Check if user has any of these permissions
 * if (hasAnyPermission(["user:read", "user:write"])) {
 *   // User has read OR write access
 * }
 *
 * // Check if user has all permissions
 * if (hasAllPermissions(["user:read", "user:write"])) {
 *   // User has both read AND write access
 * }
 */
export const usePermissions = (): {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAllPermissions: (permissionList: string[]) => boolean;
} => {
  const { data: permissionsData } = usePermissionsQuery();

  const permissions = (permissionsData?.data as string[]) || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((permission) => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((permission) => permissions.includes(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
