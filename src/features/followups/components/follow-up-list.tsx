"use client";

import { useFormatter, useTranslations } from "next-intl";
import { parseLocalDate } from "@/shared/lib/dates";
import { MediaPanel } from "@/shared/media/media-panel";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { followUpsKey } from "../api";
import { FOLLOW_UP_KINDS, type FollowUp } from "../types";

/** Evolution of the treatment, one card per check-up. `editable` shows upload + edit/delete for the doctor. */
export function FollowUpList({
  followUps,
  editable,
  onEdit,
  onDelete,
}: {
  followUps: FollowUp[];
  editable: boolean;
  onEdit?: (f: FollowUp) => void;
  onDelete?: (f: FollowUp) => void;
}) {
  const t = useTranslations();
  const format = useFormatter();
  if (followUps.length === 0) return <p className="text-sm text-muted-foreground">{t("followUps.empty")}</p>;

  return (
    <ol className="space-y-4">
      {followUps.map((f) => (
        <li key={f.id} className="rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge>{t("followUps.month", { month: f.treatmentMonth })}</Badge>
              <span className="text-sm text-muted-foreground">
                {format.dateTime(parseLocalDate(f.visitDate), { dateStyle: "long" })}
                {f.recordedByName ? ` · ${f.recordedByName}` : ""}
              </span>
            </div>
            {editable && (
              <span className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onEdit?.(f)}>
                  {t("app.edit")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete?.(f)}>
                  {t("app.delete")}
                </Button>
              </span>
            )}
          </div>
          {f.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{f.notes}</p>}
          <div className="mt-3">
            <MediaPanel
              basePath={`/api/follow-ups/${f.id}`}
              media={f.media}
              editable={editable}
              kindGroups={FOLLOW_UP_KINDS}
              invalidate={[followUpsKey(f.orderId)]}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
