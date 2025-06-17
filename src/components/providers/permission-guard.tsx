import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMatches, useNavigate } from "react-router";
import { usePermissionsQuery } from "~/hooks/api/auth/use-permissions";
import { Button } from "../ui/button";

interface PermissionGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
}

const PERMISSIONS_STORAGE_KEY = "user_permissions";
const PERMISSIONS_EXPIRY_KEY = "user_permissions_expiry";
const PERMISSIONS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function PermissionGuard({
  children,
  fallbackComponent: FallbackComponent,
}: PermissionGuardProps) {
  const matches = useMatches();
  const navigate = useNavigate();
  const [cachedPermissions, setCachedPermissions] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get cached permissions from localStorage
  const getCachedPermissions = (): string[] | null => {
    try {
      const permissions = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      const expiry = localStorage.getItem(PERMISSIONS_EXPIRY_KEY);

      if (!permissions || !expiry) {
        return null;
      }

      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
        localStorage.removeItem(PERMISSIONS_EXPIRY_KEY);
        return null;
      }

      return JSON.parse(permissions) as string[];
    } catch (error) {
      console.error("Error reading cached permissions:", error);
      return null;
    }
  };

  const setCachedPermissionsInStorage = (permissions: string[]) => {
    try {
      const expiryTime = Date.now() + PERMISSIONS_CACHE_DURATION;
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
      localStorage.setItem(PERMISSIONS_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error("Error storing permissions in cache:", error);
    }
  };

  // Initialize cached permissions from localStorage
  useEffect(() => {
    const cached = getCachedPermissions();
    if (cached) {
      setCachedPermissions(cached);
      setIsInitialized(true);
    }
  }, []);

  // Fetch permissions from API if not cached
  const shouldFetchPermissions = !isInitialized && cachedPermissions.length === 0;
  const {
    data: permissionsData,
    isLoading,
    isError,
  } = usePermissionsQuery({
    enabled: shouldFetchPermissions,
  });

  // Update cached permissions when API data is received
  useEffect(() => {
    if (permissionsData?.data) {
      const permissions = permissionsData.data as string[];
      setCachedPermissions(permissions);
      setCachedPermissionsInStorage(permissions);
      setIsInitialized(true);
    }
  }, [permissionsData]);

  // Get the current route's required permission
  const currentMatch = matches[matches.length - 1];
  const requiredPermission = (currentMatch?.handle as { permission?: string })?.permission;

  // Check if user has the required permission
  const hasPermission = (permission: string): boolean => {
    return cachedPermissions.includes(permission);
  };

  // Handle permission check
  const isPermissionGranted = !requiredPermission || hasPermission(requiredPermission);

  // Show loading state while fetching permissions
  if (shouldFetchPermissions && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (shouldFetchPermissions && isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load permissions</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!isPermissionGranted) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    // Default unauthorized component
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-red-600">403</h1>
          <p className="mb-4 text-xl text-gray-600">Access Denied</p>
          <p className="mb-6 text-gray-500">
            You don&apos;t have permission to access this page.
            {requiredPermission && (
              <span className="mt-2 block text-sm">
                Required permission:{" "}
                <code className="rounded bg-gray-100 px-2 py-1">{requiredPermission}</code>
              </span>
            )}
          </p>
          <Button onClick={() => void navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check permissions in components
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (cached) {
      try {
        setPermissions(JSON.parse(cached) as string[]);
      } catch (error) {
        console.error("Error parsing cached permissions:", error);
      }
    }
  }, []);

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
