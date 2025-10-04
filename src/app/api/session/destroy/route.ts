import { destroySession, getSession } from "~/libs/cookies";
import type { Route } from "./+types/route";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return new Response(null, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function SessionDestroy() {
  throw new Response("Not Found", {
    status: 404,
    statusText: "Not Found",
  });
}
