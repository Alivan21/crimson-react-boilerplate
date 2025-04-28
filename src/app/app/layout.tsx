import { Outlet, redirect } from "react-router";
import { DashboardSidebar } from "~/components/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { getSession } from "~/libs/cookies";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.token === undefined) {
    return redirect("/login", {
      status: 302,
    });
  }
  return session.data;
}

export default function ProtectedLayout() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
