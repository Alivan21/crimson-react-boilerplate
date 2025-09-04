import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Toaster } from "react-hot-toast";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import PermissionGuard from "./components/providers/permission-guard";
import { SessionProvider } from "./components/providers/sessions";
import { Button } from "./components/ui/button";
import TanstackProvider from "./libs/tanstack-query/providers";
import "./app.css";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <TanstackProvider>
        <PermissionGuard>
          <Outlet />
        </PermissionGuard>
        <Toaster position="top-center" />
      </TanstackProvider>
    </SessionProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops! Something went wrong";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Page Not Found" : `${error.status} - Error`;
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist or has been moved."
        : error.statusText || details;
    is404 = error.status === 404;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="dark:via-background flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4 dark:from-red-950/20 dark:to-red-950/20">
      <div className="mx-auto w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              {is404 ? (
                <Home className="h-12 w-12 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              )}
            </div>
            {/* Animated pulse ring */}
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-red-200 opacity-20 dark:border-red-800" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">{message}</h1>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{details}</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={handleRefresh} size="lg" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Development Stack Trace */}
        {import.meta.env.DEV && stack && (
          <details className="mt-8 text-left">
            <summary className="mb-4 cursor-pointer text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              🔧 Development Details
            </summary>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <pre className="overflow-x-auto text-xs break-all whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                <code>{stack}</code>
              </pre>
            </div>
          </details>
        )}

        {/* Footer Message */}
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
