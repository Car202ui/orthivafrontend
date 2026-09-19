"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Plan } from "../types";

/** Read-only summary of a sent plan: diagnosis, stages, prices and (if any) the approval snapshot. */
export function PlanDetails({ plan, showApproval = true }: { plan: Plan; showApproval?: boolean }) {
  const t = useTranslations();
  const format = useFormatter();
  const a = plan.approval;

  return (
    <div className="space-y-3 text-sm">
      <p>
        <span className="text-muted-foreground">{t("lab.diagnosis")}:</span> {plan.diagnosis || "—"}
      </p>
      {plan.additionalInfo && (
        <p>
          <span className="text-muted-foreground">{t("lab.additionalInfo")}:</span> {plan.additionalInfo}
        </p>
      )}
      <p>
        <span className="text-muted-foreground">{t("lab.upperStages")}:</span> {plan.upperStages ?? "—"} ·{" "}
        <span className="text-muted-foreground">{t("lab.lowerStages")}:</span> {plan.lowerStages ?? "—"}
      </p>
      {plan.stages.length > 0 && (
        <ul className="grid gap-1 sm:grid-cols-2">
          {plan.stages.map((s) => (
            <li key={s.id ?? `${s.arch}-${s.stageNumber}`} className="rounded-md border px-2 py-1">
              <span className="font-medium">
                {t(`orders.form.arch${s.arch}`)} · {t("lab.stageNumber")} {s.stageNumber}
              </span>
              {s.description && <span className="text-muted-foreground"> — {s.description}</span>}
            </li>
          ))}
        </ul>
      )}
      <p>
        <span className="text-muted-foreground">{t("lab.priceTotal")}:</span>{" "}
        <strong>
          {format.number(plan.priceTotal ?? 0)} {plan.currency}
        </strong>
      </p>

      {showApproval && a && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="font-medium">
            {t("review.approvedBy", { name: a.approvedByName ?? "", date: format.dateTime(new Date(a.approvedAt), { dateStyle: "medium", timeStyle: "short" }) })}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">{t("review.shipTo")}:</span> {a.shipToClinicName} · {a.shipAddress.line1}
            {a.shipAddress.line2 ? `, ${a.shipAddress.line2}` : ""}, {a.shipAddress.city}
            {a.shipAddress.stateProvince ? ` (${a.shipAddress.stateProvince})` : ""} · {a.shipAddress.country}
          </p>
          {a.shippingInstructions && (
            <p>
              <span className="text-muted-foreground">{t("review.shippingInstructions")}:</span> {a.shippingInstructions}
            </p>
          )}
          <details className="mt-1 text-xs text-muted-foreground">
            <summary className="cursor-pointer">{t("review.agreementAccepted")}</summary>
            <p className="mt-1 whitespace-pre-wrap">{a.agreementText}</p>
          </details>
        </div>
      )}
    </div>
  );
}
