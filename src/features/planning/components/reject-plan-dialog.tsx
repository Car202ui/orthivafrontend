"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import type { Plan } from "../types";

/** Terminal decision: the order ends as REJECTED. A reason is mandatory and goes to the lab. */
export function RejectPlanDialog({
  plan,
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("review.rejectTitle", { version: plan.version })}</DialogTitle>
          <DialogDescription>{t("review.rejectBody")}</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={4000} placeholder={t("review.rejectReason")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.cancel")}
          </Button>
          <Button type="button" variant="destructive" disabled={pending || !reason.trim()} onClick={() => onSubmit(reason.trim())}>
            {t("review.reject")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
