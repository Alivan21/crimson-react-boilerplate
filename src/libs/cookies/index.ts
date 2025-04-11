import { createCookieSessionStorage } from "react-router";

type SessionData = {
  token: string;
};

type SessionFlashData = {
  error: string;
};

const isProduction = process.env.NODE_ENV === "production";
const cookieSecret = process.env.COOKIE_SECRET_PASSWORD || "s3cret1";

if (isProduction && cookieSecret === "s3cret1") {
  console.warn("Warning: Using default cookie secret in production environment");
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__session",
    maxAge: 60 * 60 * 24 * 7, // 1 weeks in seconds
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [cookieSecret],
    secure: isProduction,
  },
});

export { getSession, commitSession, destroySession };
