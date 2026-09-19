"use client";

import { useTranslations } from "next-intl";
import { MediaPanel } from "@/shared/media/media-panel";
import type { MediaKind } from "@/shared/media/types";
import { plansKey } from "../api";
import { PLAN_KINDS, type Plan } from "../types";

/** Gallery/uploader of a plan version with the plan-specific labels. */
export function PlanMedia({ plan, editable }: { plan: Plan; editable: boolean }) {
  const t = useTranslations();
  const kindLabel = (k: MediaKind) => t(`lab.kinds.${k}`);
  const groupLabel = (g: string) => (g === "other" ? t("orders.media.other") : g === "model3d" ? "3D" : t("orders.arch"));
  return (
    <MediaPanel
      basePath={`/api/plans/${plan.id}`}
      media={plan.media}
      editable={editable}
      kindGroups={PLAN_KINDS}
      kindLabel={kindLabel}
      groupLabel={groupLabel}
      invalidate={[plansKey(plan.orderId)]}
    />
  );
}
