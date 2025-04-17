import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { loader as sessionLoader } from "~/app/api/session/route";

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
    await sessionFetcher.load("/api/session");
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
      return actionFetcher.submit(
        { token },
        {
          method: "post",
          action: "/api/login",
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
      action: "/api/session",
    });
  }, [actionFetcher]);

  return {
    sessionData: sessionFetcher.data,
    isLoading: sessionFetcher.state === "loading" || actionFetcher.state === "submitting",
    getSessionData,
    createSession,
    destroySession,
  };
}
