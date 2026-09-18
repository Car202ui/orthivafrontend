"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { meKey, ProfileForm, useOnboard, type PersonType, type ProfileInput } from "@/features/identity";
import { ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/provider";
import { LanguageSwitcher } from "@/shared/layout/language-switcher";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/** Self-registered user: pick DOCTOR or PATIENT, fill the profile, refresh the token. */
export default function OnboardingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const onboard = useOnboard();
  const [type, setType] = useState<PersonType | null>(null);

  const submit = async (profile: ProfileInput) => {
    if (!type) return;
    try {
      await onboard.mutateAsync({ type, profile });
      toast.success(t("onboarding.success"));
      // The new realm role is only in a fresh token: renew silently, else re-login.
      try {
        await auth.signinSilent();
      } catch {
        await auth.signinRedirect();
        return;
      }
      await queryClient.invalidateQueries({ queryKey: meKey });
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.code ? t(`errors.${err.code}`) : err.message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("onboarding.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("onboarding.subtitle")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {!type ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(["DOCTOR", "PATIENT"] as const).map((option) => (
            <Card key={option} className="cursor-pointer transition hover:border-primary" onClick={() => setType(option)}>
              <CardHeader>
                <CardTitle>{option === "DOCTOR" ? t("onboarding.iAmDoctor") : t("onboarding.iAmPatient")}</CardTitle>
                <CardDescription>
                  {option === "DOCTOR" ? t("onboarding.iAmDoctorHint") : t("onboarding.iAmPatientHint")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t("app.continue")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t(`roles.${type}`)}</CardTitle>
            <CardDescription>
              <button type="button" className="underline" onClick={() => setType(null)}>
                {t("app.back")}
              </button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              type={type}
              locale={locale}
              initial={{ firstName: auth.user?.profile.given_name, lastName: auth.user?.profile.family_name }}
              submitLabel={t("onboarding.submit")}
              onSubmit={submit}
              pending={onboard.isPending}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
