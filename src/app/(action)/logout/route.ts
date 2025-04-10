import { redirect } from "react-router";
import { destroySession, getSession } from "~/libs/cookies";
import type { Route } from "./+types/route";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
