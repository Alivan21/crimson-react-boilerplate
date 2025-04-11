import axios, { AxiosError } from "axios";
import { redirect } from "react-router";
import { useSession } from "~/components/providers/sessions";
import { env } from "../env";

export const httpClient = axios.create({
  baseURL: env.VITE_BASE_API_URL,
  withCredentials: true,
});

let isLoggingOut = false;

httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const { signOut } = useSession();
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      await signOut();
      isLoggingOut = false;
      redirect(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }

    return Promise.reject(error);
  },
);
