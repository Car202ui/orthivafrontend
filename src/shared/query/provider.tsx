"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";
import { api } from "@/shared/api/client";
import { getAccessToken, useAuth } from "@/shared/auth/provider";

export function OrthivaQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Bearer-aware fetcher: resolves the token at call time, so renewals are picked up immediately. */
export function useApi() {
  const auth = useAuth();
  return useCallback(
    <T,>(path: string, init?: RequestInit) => api<T>(path, getAccessToken() ?? auth.user?.access_token, init),
    [auth.user?.access_token],
  );
}
