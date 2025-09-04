import { Loader2 } from "lucide-react";
import { useMatches, useNavigate } from "react-router";
import { usePermissionsQuery } from "~/hooks/api/auth/use-permissions";
import { Button } from "../ui/button";

interface PermissionGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
}

export default function PermissionGuard({
  children,
  fallbackComponent: FallbackComponent,
}: PermissionGuardProps) {
  const matches = useMatches();
  const navigate = useNavigate();
  const { data: permissionsData, isLoading, isError, error } = usePermissionsQuery();

  const currentMatch = matches[matches.length - 1];
  const requiredPermission = (currentMatch?.handle as { permission?: string })?.permission;

  const permissions = (permissionsData?.data as string[]) || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const isPermissionGranted = !requiredPermission || hasPermission(requiredPermission);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Failed to load permissions: {error?.message || "Unknown error"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!isPermissionGranted) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

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
