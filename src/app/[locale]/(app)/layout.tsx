"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { useMe } from "@/lib/query";

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

  return <AppShell me={me.data}>{children}</AppShell>;
}
