"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) router.replace("/dashboard");
  }, [auth.isAuthenticated, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{t("app.name")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("app.tagline")}</p>
        </div>

        {auth.error && (
          <p className="text-sm text-destructive">{t("auth.authError", { message: auth.error.message })}</p>
        )}

        <Button className="w-full" size="lg" disabled={auth.isLoading} onClick={() => auth.signinRedirect()}>
          {auth.isLoading ? t("app.loading") : t("auth.signIn")}
        </Button>

        <p className="text-xs text-muted-foreground">{t("auth.redirectNotice")}</p>
      </div>
    </main>
  );
}
