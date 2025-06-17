# Permission System Usage

## Overview

This permission system provides automatic permission checking using React Router v7 handles. It uses TanStack Query for efficient caching and avoids localStorage to prevent potential security vulnerabilities.

## Components

### PermissionGuard

The main component that wraps your app and automatically checks permissions based on route handles.

**Features:**

- Automatically fetches permissions on app load
- Uses TanStack Query for secure, efficient caching (24-hour stale time, 30-day garbage collection)
- Optimized for performance with disabled refetching on window focus/reconnect
- Checks route permissions using React Router handles
- Shows loading and error states
- Displays access denied page for unauthorized users

### usePermissions Hook

A hook to check permissions in individual components using TanStack Query's cached data.

## Usage

### 1. Route-level Permission Protection

Add a `handle` export to any page component that requires permissions:

```tsx
// In your page component
export const handle = {
  permission: "user:read", // Required permission
};

export default function UsersPage() {
  // Your component code
}
```

### 2. Component-level Permission Checking

Use the `usePermissions` hook in components:

```tsx
import { usePermissions } from "~/hooks/shared/use-permission";

export default function SomeComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check single permission
  if (!hasPermission("user:delete")) {
    return null; // Hide component
  }

  // Check multiple permissions (any)
  if (!hasAnyPermission(["user:read", "user:write"])) {
    return <div>You need read or write access</div>;
  }

  // Check multiple permissions (all)
  if (!hasAllPermissions(["user:read", "user:write"])) {
    return <div>You need both read and write access</div>;
  }

  return <div>Component with permission checking</div>;
}
```

### 3. Conditional UI Elements

```tsx
export default function UserActions({ userId }: { userId: string }) {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <Button>View User</Button>
      {hasPermission("user:write") && <Button>Edit User</Button>}
      {hasPermission("user:delete") && <Button variant="destructive">Delete User</Button>}
    </div>
  );
}
```

## Configuration

### TanStack Query Caching

The permission system uses TanStack Query with the following optimized settings:

- **Stale Time**: 24 hours - permissions remain fresh for a full day
- **Garbage Collection Time**: 30 days - cached data persists for 30 days when unused
- **Refetch Behavior**: Disabled on window focus, reconnect, and mount (when data is fresh)
- **Retry Policy**: Up to 3 retries for failed requests
- **Structural Sharing**: Enabled to prevent unnecessary re-renders

### Security Benefits

- **No localStorage**: Permissions are not stored in localStorage, reducing XSS attack vectors
- **Memory-only cache**: Permissions exist only in TanStack Query's in-memory cache
- **Automatic cleanup**: Cache is automatically managed and cleaned up by TanStack Query
- **Query deduplication**: Multiple components requesting permissions share the same query

### Custom Fallback Component

You can provide a custom unauthorized component:

```tsx
const CustomUnauthorized = () => <div>Custom unauthorized message</div>;

<PermissionGuard fallbackComponent={CustomUnauthorized}>
  <YourApp />
</PermissionGuard>;
```

## Permission Patterns

Common permission naming patterns:

- `user:read` - Can view users
- `user:write` - Can create/edit users
- `user:delete` - Can delete users
- `admin:*` - Admin permissions
- `report:generate` - Can generate reports

## API Requirements

Your permissions API should return an array of permission strings:

```json
{
  "data": ["user:read", "user:write", "report:generate"]
}
```

## Performance Optimization

The system is optimized for performance through:

1. **Efficient Caching**: 24-hour stale time prevents unnecessary API calls
2. **Query Deduplication**: Multiple components share the same permission query
3. **Structural Sharing**: Prevents re-renders when data hasn't changed
4. **Background Refetch Disabled**: Reduces unnecessary network requests
5. **Memory Management**: Automatic garbage collection after 30 days

## Migration from localStorage

If you're migrating from a localStorage-based permission system:

1. **Automatic cleanup**: Old localStorage keys will naturally expire and be unused
2. **Immediate benefits**: Enhanced security and performance
3. **Seamless transition**: All existing `usePermissions` hook calls work identically
4. **No API changes**: The same permission API format is supported
