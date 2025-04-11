import { createCookieSessionStorage } from "react-router";
import { serverEnv } from "../env";

type SessionData = {
  userId: string;
  token: string;
};

type SessionFlashData = {
  error: string;
};

const isProduction = serverEnv.NODE_ENV === "production";
const cookieSecret = serverEnv.COOKIE_SECRET_PASSWORD || "s3cret1";

if (isProduction && cookieSecret === "s3cret1") {
  console.warn("Warning: Using default cookie secret in production environment");
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__session",
    maxAge: 60 * 60 * 24 * 14, // 2 weeks in seconds
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [cookieSecret],
    secure: isProduction,
  },
});

export { getSession, commitSession, destroySession };
