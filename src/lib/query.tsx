"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";
import { api, type Me } from "./api";
import { getAccessToken, useAuth } from "./auth";

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

export const meQueryKey = ["me"] as const;

/** Who the backend says I am; drives onboarding and role-based navigation. */
export function useMe() {
  const auth = useAuth();
  const call = useApi();
  return useQuery({
    queryKey: [...meQueryKey, auth.user?.profile.sub],
    queryFn: () => call<Me>("/api/me"),
    enabled: auth.isAuthenticated,
  });
}
