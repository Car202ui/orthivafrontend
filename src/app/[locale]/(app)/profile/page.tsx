"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProfileForm, useMe, useUpdateProfile, type ProfileInput } from "@/features/identity";
import { useApiErrorToast } from "@/shared/api/errors";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function ProfilePage() {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const me = useMe();
  const update = useUpdateProfile();
  const person = me.data?.person;
  if (!person) return null;

  const submit = (input: ProfileInput) =>
    update.mutate(input, {
      onSuccess: (updated) => {
        toast.success(t("app.saved"));
        if (updated.locale !== locale) router.replace(pathname, { locale: updated.locale as "es" | "en" });
      },
      onError,
    });

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
          <ProfileForm type={person.type} locale={locale} initial={person} submitLabel={t("app.save")} onSubmit={submit} pending={update.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
