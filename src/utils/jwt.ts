export type TJwtPayload = {
  iss?: string; // issuer
  sub?: string; // subject
  aud?: string | string[]; // audience
  exp?: number; // expiration time
  nbf?: number; // not before
  iat?: number; // issued at
  jti?: string; // JWT ID
  [key: string]: unknown; // allow for additional properties
};

export const decodeJwt = <T extends TJwtPayload = TJwtPayload>(token: string): T => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token: token must be a non-empty string");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token: JWT must have 3 parts separated by dots");
  }

  try {
    const base64Url = parts[1];
    if (!base64Url) {
      throw new Error("Invalid token: empty payload");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const jsonPayload = decodeURIComponent(
      window
        .atob(paddedBase64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload) as T;

    // Basic validation
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid token: payload is not an object");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decode JWT: ${error.message}`);
    }
    throw new Error("Failed to decode JWT: unknown error");
  }
};
