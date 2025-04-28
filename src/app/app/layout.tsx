import { Outlet, redirect } from "react-router";
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
  return <Outlet />;
}
