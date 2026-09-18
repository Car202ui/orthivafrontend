"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorSummary } from "@/lib/api";
import { parseLocalDate } from "@/lib/dates";
import { useApi, useMe } from "@/lib/query";

export default function PatientTreatmentPage() {
  const t = useTranslations();
  const format = useFormatter();
  const me = useMe();
  const call = useApi();
  const doctors = useQuery({ queryKey: ["portal", "doctors"], queryFn: () => call<DoctorSummary[]>("/api/portal/doctors") });

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
