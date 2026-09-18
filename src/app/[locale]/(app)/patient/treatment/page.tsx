"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMe } from "@/features/identity";
import { useMyDoctors } from "@/features/patients";
import { parseLocalDate } from "@/shared/lib/dates";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function PatientTreatmentPage() {
  const t = useTranslations();
  const format = useFormatter();
  const me = useMe();
  const doctors = useMyDoctors();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("portal.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("portal.doctors")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {doctors.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("portal.noDoctors", { email: me.data?.email ?? "" })}</p>
          )}
          {doctors.data?.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">
                  Dr. {d.firstName} {d.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{d.specialty ?? ""}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("portal.since", { date: format.dateTime(parseLocalDate(d.since), { dateStyle: "medium" }) })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="opacity-70">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("nav.myTreatment")}
            <Badge variant="outline">{t("app.comingSoon")}</Badge>
          </CardTitle>
          <CardDescription>{t("portal.treatmentSoon")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
