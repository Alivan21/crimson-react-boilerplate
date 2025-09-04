import React from "react";
import toast from "react-hot-toast";
import { login, logout } from "~/api/auth";
import type { TLoginRequest } from "~/api/auth/schema";
import { QUERY_KEY } from "~/common/constants/query-keys";
import type { UserData } from "~/common/types/user-data";
import { useSessionCookies } from "~/hooks/shared/use-session-cookies";
import { httpClient, registerSignOutCallback, unregisterSignOutCallback } from "~/libs/axios";
import { queryClient } from "~/libs/tanstack-query/query-client";
import { decodeJwt } from "~/utils/jwt";

type SessionContextType = {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  signIn: (credential: TLoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = React.createContext<SessionContextType | null>(null);

type SessionProviderProps = {
  children: React.ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const {
    sessionData,
    isLoading: cookieLoading,
    getSessionData,
    createSession,
    destroySession,
  } = useSessionCookies();

  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<UserData | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const clearAuthState = React.useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    httpClient.defaults.headers.common.Authorization = undefined;
  }, []);

  const setAuthState = React.useCallback(
    (tokenValue: string) => {
      try {
        const userData = decodeJwt<UserData>(tokenValue);

        if (userData.exp && userData.exp < Math.floor(Date.now() / 1000)) {
          clearAuthState();
          return false;
        }

        httpClient.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
        setIsAuthenticated(true);
        setToken(tokenValue);
        setUser(userData);
        return true;
      } catch (error) {
        console.error("Failed to decode JWT:", error);
        clearAuthState();
        return false;
      }
    },
    [clearAuthState],
  );

  // Initialize auth state
  React.useEffect(() => {
    if (isInitialized) return;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get session data if not already loaded
        if (!sessionData) {
          await getSessionData();
          return; // Let the next effect handle the sessionData
        }

        const storedToken = sessionData.token;
        if (storedToken) {
          const isValidToken = setAuthState(storedToken);
          if (!isValidToken) {
            // Token is invalid or expired, clean up
            await destroySession();
          }
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuthState();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    void initializeAuth();
  }, [sessionData, isInitialized, getSessionData, setAuthState, clearAuthState, destroySession]);

  React.useEffect(() => {
    if (!isInitialized) return;

    const handleSessionChange = async () => {
      try {
        const storedToken = sessionData?.token;
        if (storedToken) {
          const isValidToken = setAuthState(storedToken);
          if (!isValidToken) {
            await destroySession();
          }
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error("Failed to handle session change:", error);
        clearAuthState();
      }
    };

    void handleSessionChange();
  }, [sessionData?.token, isInitialized, setAuthState, clearAuthState, destroySession]);

  const handleLogin = React.useCallback(
    async (credential: TLoginRequest) => {
      try {
        setIsLoading(true);
        const { data } = await login(credential);

        if (!data.token) {
          throw new Error("No token received from login");
        }

        // Validate token before creating session
        const userData = decodeJwt<UserData>(data.token);
        if (userData.exp && userData.exp < Math.floor(Date.now() / 1000)) {
          throw new Error("Received expired token");
        }

        await createSession(data.token);
        setAuthState(data.token);

        void queryClient.invalidateQueries({ queryKey: [QUERY_KEY.AUTH.PERMISSIONS] });
      } catch (error) {
        clearAuthState();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [createSession, setAuthState, clearAuthState],
  );

  const handleLogout = React.useCallback(async () => {
    try {
      setIsLoading(true);

      queryClient.removeQueries({ queryKey: [QUERY_KEY.AUTH.PERMISSIONS] });

      // Perform cleanup operations
      await Promise.allSettled([destroySession(), logout()]);

      toast.success("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
      // Don't re-throw the error to prevent blocking the UI
    } finally {
      setIsLoading(false);
    }
  }, [destroySession]);

  // Register/unregister signOut callback with axios interceptor
  React.useEffect(() => {
    registerSignOutCallback(handleLogout);
    return () => unregisterSignOutCallback();
  }, [handleLogout]);

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      isLoading: isLoading || cookieLoading,
      signIn: handleLogin,
      signOut: handleLogout,
    }),
    [isAuthenticated, user, token, isLoading, cookieLoading, handleLogin, handleLogout],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextType {
  const context = React.use(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
