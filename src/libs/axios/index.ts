import axios, { AxiosError } from "axios";
import { env } from "../env";

export const httpClient = axios.create({
  baseURL: env.VITE_BASE_API_URL,
  withCredentials: true,
});

let isLoggingOut = false;
let signOutCallback: (() => Promise<void>) | null = null;

export const registerSignOutCallback = (callback: () => Promise<void>) => {
  signOutCallback = callback;
};

export const unregisterSignOutCallback = () => {
  signOutCallback = null;
};

httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !isLoggingOut && signOutCallback) {
      isLoggingOut = true;
      try {
        await signOutCallback();
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      } catch (signOutError) {
        console.error("Failed to sign out:", signOutError);
      } finally {
        isLoggingOut = false;
      }
    }

    return Promise.reject(error);
  },
);
