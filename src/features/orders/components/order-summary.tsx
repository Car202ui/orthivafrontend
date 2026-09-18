"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Order } from "../types";

/** Read-only prescription summary shared by doctor and lab views. */
export function OrderSummary({ order: o, patientHref }: { order: Order; patientHref?: string }) {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.details")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">{t("orders.patient")}:</span>{" "}
          {patientHref ? (
            <a href={patientHref} className="hover:underline">
              {o.patientName}
            </a>
          ) : (
            o.patientName
          )}
        </p>
        <p>
          <span className="text-muted-foreground">{t("orders.doctor")}:</span> {o.doctorName}
        </p>
        <p>
          <span className="text-muted-foreground">{t("orders.arch")}:</span> {t(`orders.form.arch${o.arch}`)}
        </p>
        <p>
          {o.firstTime && (
            <Badge variant="secondary" className="mr-1">
              {t("orders.form.firstTime")}
            </Badge>
          )}
          {o.reevaluation && <Badge variant="secondary">{t("orders.form.reevaluation")}</Badge>}
        </p>
        <p className="sm:col-span-2">
          <span className="text-muted-foreground">{t("orders.form.goal")}:</span> {o.treatmentGoal || "—"}
        </p>
        <div className="sm:col-span-2">
          <span className="text-muted-foreground">{t("orders.form.movements")}:</span>
          {o.movements.length === 0 ? (
            <span> {t("orders.noMovements")}</span>
          ) : (
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {o.movements.map((m) => (
                <li key={m.id}>
                  <strong>{m.toothFdi ?? "—"}</strong>{" "}
                  {[m.torque, m.rotation, m.buccolingual, m.mesiodistal, m.intrusionExtrusion].filter(Boolean).join(" · ")}
                  {m.notes ? ` — ${m.notes}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
