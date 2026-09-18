"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/features/identity";
import { useAuth } from "@/shared/auth/provider";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { AppShell } from "@/shared/layout/app-shell";

/**
 * Guard for every authenticated page: requires a session, then routes users that
 * exist in Keycloak but not yet in the domain to onboarding.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("app");
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const me = useMe();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) router.replace("/");
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, router]);

  useEffect(() => {
    if (!me.data) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (me.data.onboardingRequired && !onOnboarding) router.replace("/onboarding");
    if (!me.data.onboardingRequired && onOnboarding) router.replace("/dashboard");
  }, [me.data, pathname, router]);

  if (auth.isLoading || !auth.isAuthenticated || me.isLoading) {
    return <main className="flex flex-1 items-center justify-center text-muted-foreground">{t("loading")}</main>;
  }
  if (me.isError || !me.data) {
    return (
      <main className="flex flex-1 items-center justify-center text-destructive">
        {t("error")}: {me.error?.message}
      </main>
    );
  }

  // Onboarding renders without the shell (no menus until a role exists).
  if (me.data.onboardingRequired) return <>{children}</>;

  const { person } = me.data;
  return (
    <AppShell
      user={{
        roles: me.data.roles,
        displayName: person ? `${person.firstName} ${person.lastName}` : (me.data.name ?? me.data.username),
        email: me.data.email,
        hasProfile: !!person,
      }}
    >
      {children}
    </AppShell>
  );
}
