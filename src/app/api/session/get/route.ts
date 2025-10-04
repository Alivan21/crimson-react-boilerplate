import { getSession } from "~/libs/cookies";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.data;
}

export default function SessionGet() {
  throw new Response("Not Found", {
    status: 404,
    statusText: "Not Found",
  });
}
