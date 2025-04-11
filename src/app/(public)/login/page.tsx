import { data, redirect } from "react-router";
import { validateCredentials } from "~/common/mock-api";
import { commitSession, getSession } from "~/libs/cookies";
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    return redirect("/");
  }

  return data({ error: session.get("error") });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const userId = await validateCredentials(username, password);

  if (userId == null) {
    session.flash("error", "Invalid username/password");

    // Redirect back to the login page with errors.
    return redirect("/login");
  }

  session.set("userId", userId);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <form method="POST">
        <div>
          <p>Please sign in</p>
        </div>
        <label>
          Username: <input name="username" type="text" />
        </label>
        <label>
          Password: <input name="password" type="password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
