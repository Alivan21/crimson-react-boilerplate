# Permission System Usage

## Overview

This permission system provides automatic permission checking using React Router v7 handles. It caches permissions in localStorage to avoid repeated API calls.

## Components

### PermissionGuard

The main component that wraps your app and automatically checks permissions based on route handles.

**Features:**

- Automatically fetches permissions on app load
- Caches permissions in localStorage with expiration (24 hours)
- Checks route permissions using React Router handles
- Shows loading and error states
- Displays access denied page for unauthorized users

### usePermissions Hook

A hook to check permissions in individual components.

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
import { usePermissions } from "~/components/providers/permission-guard";

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

### localStorage Keys

- `user_permissions`: Stores the permissions array
- `user_permissions_expiry`: Stores the expiration timestamp

### Cache Duration

- Default: 24 hours
- Can be modified by changing `PERMISSIONS_CACHE_DURATION` in the component

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
