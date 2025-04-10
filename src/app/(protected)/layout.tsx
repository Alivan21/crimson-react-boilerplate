import { Outlet } from "react-router";

export default function ProtectedLayout() {
  return (
    <div>
      <h1>ProtectedLayout</h1>
      <Outlet />
    </div>
  );
}
