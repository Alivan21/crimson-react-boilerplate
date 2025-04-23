/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import toast from "react-hot-toast";
import { login, logout } from "~/api/auth";
import type { TLoginRequest } from "~/api/auth/schema";
import type { UserData } from "~/common/types/user-data";
import { useSessionCookies } from "~/hooks/shared/use-session-cookies";
import { httpClient } from "~/libs/axios";
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

  React.useEffect(() => {
    const initializeAuth = async () => {
      if (!sessionData) {
        setIsLoading(true);
        await getSessionData();
      } else {
        const storedToken = sessionData.token;
        if (storedToken) {
          const userData = decodeJwt<UserData>(storedToken);
          httpClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await destroySession();
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          httpClient.defaults.headers.common.Authorization = undefined;
        }
        setIsLoading(false);
      }
    };
    void initializeAuth();
  }, [sessionData?.token]);

  const handleLogin = async (credential: TLoginRequest) => {
    try {
      setIsLoading(true);
      const { data } = await login(credential);
      if (data.token) {
        await createSession(data.token);
        httpClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(decodeJwt<UserData>(data.token));
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await Promise.all([destroySession(), logout()]);
      httpClient.defaults.headers.common.Authorization = undefined;
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      toast.success("Logout successful");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      signIn: handleLogin,
      signOut: handleLogout,
      isLoading: isLoading || cookieLoading,
    }),
    [isAuthenticated, user, token, isLoading, cookieLoading],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextType {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
