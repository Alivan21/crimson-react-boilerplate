import { useCallback, useMemo } from "react";
import { useFetcher } from "react-router";
import type { loader as sessionLoader } from "~/app/api/session/get/route";

/**
 * Custom hook for managing session cookies
 *
 * @returns Methods and state for session cookie management
 */
export function useSessionCookies() {
  const sessionFetcher = useFetcher<typeof sessionLoader>();
  const actionFetcher = useFetcher();

  /**
   * Loads session data from cookies
   */
  const getSessionData = useCallback(async () => {
    if (sessionFetcher.state === "loading") {
      return sessionFetcher.data;
    }
    await sessionFetcher.load("/api/session/get");
    return sessionFetcher.data;
  }, [sessionFetcher]);

  /**
   * Creates a new session with the provided token
   *
   * @param token JWT token to store in the session
   * @returns Promise that resolves when the session is created
   */
  const createSession = useCallback(
    async (token: string) => {
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token provided for session creation");
      }

      return actionFetcher.submit(
        { token },
        {
          method: "post",
          action: "/api/session/create",
        },
      );
    },
    [actionFetcher],
  );

  /**
   * Destroys the current session
   *
   * @returns Promise that resolves when the session is destroyed
   */
  const destroySession = useCallback(async () => {
    return actionFetcher.submit(null, {
      method: "post",
      action: "/api/session/destroy",
    });
  }, [actionFetcher]);

  const isLoading = useMemo(() => {
    return sessionFetcher.state === "loading" || actionFetcher.state === "submitting";
  }, [sessionFetcher.state, actionFetcher.state]);

  return useMemo(
    () => ({
      sessionData: sessionFetcher.data,
      isLoading,
      getSessionData,
      createSession,
      destroySession,
    }),
    [sessionFetcher.data, isLoading, getSessionData, createSession, destroySession],
  );
}
