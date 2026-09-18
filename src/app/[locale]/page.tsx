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
    <main className="flex flex-1 flex-col p-4">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center space-y-6 py-10 text-center">
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
