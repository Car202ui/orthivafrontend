"use client";

import { AuthProvider, useAuth } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { useLocale } from "next-intl";
import { useMemo, type ReactNode } from "react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Keycloak public client with PKCE. Tokens are kept in sessionStorage so a page
 * reload does not force a new login; no client secret ever reaches the browser.
 * The redirect goes back to the current locale's dashboard.
 */
export function OrthivaAuthProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const config = useMemo(
    () => ({
      authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY ?? "http://localhost:8180/realms/orthiva",
      client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? "orthiva-web",
      redirect_uri: `${appUrl}/${locale}/dashboard`,
      post_logout_redirect_uri: `${appUrl}/${locale}`,
      silent_redirect_uri: `${appUrl}/silent-renew.html`,
      scope: "openid profile email",
      automaticSilentRenew: true,
      userStore:
        typeof window !== "undefined" ? new WebStorageStateStore({ store: window.sessionStorage }) : undefined,
      onSigninCallback: () => {
        // Remove ?code=&state= from the URL after Keycloak redirects back.
        window.history.replaceState({}, document.title, window.location.pathname);
      },
    }),
    [locale],
  );
  return <AuthProvider {...config}>{children}</AuthProvider>;
}

export { useAuth };

const AUTHORITY = process.env.NEXT_PUBLIC_OIDC_AUTHORITY ?? "http://localhost:8180/realms/orthiva";
const CLIENT_ID = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? "orthiva-web";

/**
 * Freshest access token, read straight from oidc-client-ts' session store. Unlike
 * `auth.user`, it is already updated when `signinSilent()` resolves, so a request fired
 * right after a renew never carries a stale token.
 */
export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(`oidc.user:${AUTHORITY}:${CLIENT_ID}`);
    return raw ? (JSON.parse(raw).access_token as string | undefined) : undefined;
  } catch {
    return undefined;
  }
}

/** Realm roles as Keycloak puts them in the access token. */
export function rolesFromToken(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return payload?.realm_access?.roles ?? [];
  } catch {
    return [];
  }
}
