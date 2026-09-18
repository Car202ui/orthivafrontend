"use client";

import { AuthProvider, useAuth } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import type { ReactNode } from "react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Keycloak public client with PKCE. Tokens are kept in sessionStorage so a page
 * reload does not force a new login; no client secret ever reaches the browser.
 */
const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY ?? "http://localhost:8180/realms/orthiva",
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? "orthiva-web",
  redirect_uri: `${appUrl}/dashboard`,
  post_logout_redirect_uri: `${appUrl}/`,
  scope: "openid profile email",
  automaticSilentRenew: true,
  userStore:
    typeof window !== "undefined"
      ? new WebStorageStateStore({ store: window.sessionStorage })
      : undefined,
  onSigninCallback: () => {
    // Remove ?code=&state= from the URL after Keycloak redirects back.
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export function OrthivaAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
}

export { useAuth };

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
