import { commitSession, getSession } from "~/libs/cookies";
import type { Route } from "./+types/route";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const token = formData.get("token") as string;
  session.set("token", token);

  return new Response(null, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function SessionCreate() {
  throw new Response("Not Found", {
    status: 404,
    statusText: "Not Found",
  });
}
