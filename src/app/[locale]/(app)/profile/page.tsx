"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileForm } from "@/components/forms/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, usePathname } from "@/i18n/navigation";
import { ApiError, type Person, type ProfileInput } from "@/lib/api";
import { meQueryKey, useApi, useMe } from "@/lib/query";

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const me = useMe();
  const call = useApi();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const person = me.data?.person;
  if (!person) return null;

  const submit = async (input: ProfileInput) => {
    setPending(true);
    try {
      const updated = await call<Person>("/api/me/profile", { method: "PUT", body: JSON.stringify(input) });
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      toast.success(t("app.saved"));
      if (updated.locale !== locale) router.replace(pathname, { locale: updated.locale as "es" | "en" });
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.code ? t(`errors.${err.code}`) : err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("profile.title")}</h1>
        {person.type === "DOCTOR" && (
          <Badge variant={person.verifiedAt ? "default" : "secondary"}>
            {person.verifiedAt ? t("profile.verified") : t("profile.notVerified")}
          </Badge>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t(`roles.${person.type}`)}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            type={person.type}
            locale={locale}
            initial={person}
            submitLabel={t("app.save")}
            onSubmit={submit}
            pending={pending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
