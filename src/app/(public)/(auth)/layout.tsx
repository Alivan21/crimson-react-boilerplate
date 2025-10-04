import { Outlet, redirect } from "react-router";
import { getSession } from "~/libs/cookies";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.token) {
    return redirect("/dashboard", {
      status: 302,
    });
  }
  return null;
}

export default function AuthLayout() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="grid h-full w-full lg:grid-cols-2">
        <div className="bg-muted hidden lg:block" />
        <Outlet />
      </div>
    </div>
  );
}
