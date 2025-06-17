/**
 * Permission system utilities for React Router clientLoader integration
 */

import type { ClientLoaderFunctionArgs } from "react-router";

export type Permission = string;
export type Permissions = Permission[];

interface PermissionError extends Error {
  status: number;
  statusText: string;
}

/**
 * Check if user has required permissions based on localStorage
 */
export function checkPermissions(requiredPermissions: Permissions): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required
  }

  try {
    // Get user permissions from localStorage
    const storedPermissions = localStorage.getItem("user_permission");

    if (!storedPermissions) {
      console.warn("No permissions found in localStorage");
      return false;
    }

    const userPermissions: Permissions = JSON.parse(storedPermissions) as Permissions;

    // Check if user has all required permissions
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Get user permissions from localStorage
 */
export function getUserPermissions(): Permissions {
  try {
    const storedPermissions = localStorage.getItem("user_permission");
    return storedPermissions ? (JSON.parse(storedPermissions) as Permissions) : [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

/**
 * Set user permissions in localStorage
 */
export function setUserPermissions(permissions: Permissions): void {
  try {
    localStorage.setItem("user_permission", JSON.stringify(permissions));
  } catch (error) {
    console.error("Error setting user permissions:", error);
  }
}

/**
 * Clear user permissions from localStorage
 */
export function clearUserPermissions(): void {
  try {
    localStorage.removeItem("user_permission");
  } catch (error) {
    console.error("Error clearing user permissions:", error);
  }
}

/**
 * Creates a 403 Forbidden error response
 */
export function createPermissionError(requiredPermissions: Permissions): never {
  const error = new Error(
    `Access denied. Required permissions: ${requiredPermissions.join(", ")}`,
  ) as PermissionError;
  error.status = 403;
  error.statusText = "Forbidden";
  throw error;
}

/**
 * Higher-order function that wraps clientLoader with permission checking
 */
export function withPermissions<TLoaderData = unknown>(
  permissions: Permissions,
  clientLoader?: (args: ClientLoaderFunctionArgs) => Promise<TLoaderData> | TLoaderData,
) {
  return async function permissionClientLoader(
    args: ClientLoaderFunctionArgs,
  ): Promise<TLoaderData | null> {
    // Check permissions first
    if (!checkPermissions(permissions)) {
      createPermissionError(permissions);
    }

    // If permissions pass, run the original clientLoader if it exists
    if (clientLoader) {
      return await clientLoader(args);
    }

    // Return null if no clientLoader provided (permissions check only)
    return null;
  };
}

/**
 * Standalone permission checker for use in clientLoader
 */
export function requirePermissions(permissions: Permissions): void {
  if (!checkPermissions(permissions)) {
    createPermissionError(permissions);
  }
}
