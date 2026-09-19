"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useClinics } from "@/features/clinics";
import { useMe } from "@/features/identity";
import type { Order } from "@/features/orders";
import {
  ApprovePlanDialog,
  PlanComments,
  PlanDetails,
  PlanMedia,
  RejectPlanDialog,
  useApprovePlan,
  useCommentPlan,
  usePlans,
  useRejectPlan,
  type Plan,
} from "@/features/planning";
import { useApiErrorToast } from "@/shared/api/errors";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * Doctor's view of the lab's plan versions. Composes planning + clinics + identity, which
 * is why it lives in app/ and not inside a feature.
 */
export function PlanReview({ order, isDoctor }: { order: Order; isDoctor: boolean }) {
  const t = useTranslations();
  const format = useFormatter();
  const onError = useApiErrorToast();
  const me = useMe();
  const plans = usePlans(order.id);
  const clinics = useClinics();
  const comment = useCommentPlan(order.id);
  const approve = useApprovePlan(order.id);
  const reject = useRejectPlan(order.id);
  const [dialog, setDialog] = useState<{ kind: "approve" | "reject"; plan: Plan } | null>(null);

  const sent = (plans.data ?? []).filter((p) => p.sent).sort((a, b) => b.version - a.version);
  if (sent.length === 0) return null;
  const latest = sent[0];
  const underReview = isDoctor && order.status === "PLAN_SENT";
  const presets = (clinics.data ?? []).map((c) => ({ id: c.id, name: c.name, address: c.address }));

  const post = (plan: Plan) => (body: string) =>
    comment.mutate(
      { planId: plan.id, body },
      { onSuccess: () => toast.success(plan.id === latest.id && underReview ? t("review.changesRequested") : t("review.commentPosted")), onError },
    );

  return (
    <>
      {sent.map((p) => {
        const isLatest = p.id === latest.id;
        return (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {t("lab.planTitle")} · {t("lab.planVersion", { version: p.version })}
                </span>
                {p.approval ? (
                  <Badge>{t("review.approved")}</Badge>
                ) : isLatest && order.status === "CHANGES_REQUESTED" ? (
                  <Badge variant="secondary">{t("orders.statuses.CHANGES_REQUESTED")}</Badge>
                ) : isLatest && order.status === "REJECTED" ? (
                  <Badge variant="destructive">{t("orders.statuses.REJECTED")}</Badge>
                ) : (
                  <Badge variant="outline">{isLatest ? t("review.awaitingDecision") : t("review.superseded")}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {p.plannerName} · {p.sentAt && format.dateTime(new Date(p.sentAt), { dateStyle: "medium", timeStyle: "short" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PlanDetails plan={p} />
              <PlanMedia plan={p} editable={false} />
              <PlanComments
                plan={p}
                onPost={isDoctor ? post(p) : undefined}
                postLabel={isLatest && underReview ? t("review.requestChanges") : undefined}
                pending={comment.isPending}
              />
              {isLatest && underReview && (
                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  <Button variant="outline" className="text-destructive" onClick={() => setDialog({ kind: "reject", plan: p })}>
                    {t("review.reject")}
                  </Button>
                  <Button size="lg" onClick={() => setDialog({ kind: "approve", plan: p })}>
                    {t("review.approve")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {dialog?.kind === "approve" && (
        <ApprovePlanDialog
          plan={dialog.plan}
          open
          onOpenChange={(open) => !open && setDialog(null)}
          presets={presets}
          agreementText={me.data?.tenant?.agreementText ?? ""}
          pending={approve.isPending}
          onSubmit={(input) =>
            approve.mutate(
              { planId: dialog.plan.id, input },
              {
                onSuccess: () => {
                  toast.success(t("review.approvedToast"));
                  setDialog(null);
                },
                onError,
              },
            )
          }
        />
      )}
      {dialog?.kind === "reject" && (
        <RejectPlanDialog
          plan={dialog.plan}
          open
          onOpenChange={(open) => !open && setDialog(null)}
          pending={reject.isPending}
          onSubmit={(reason) =>
            reject.mutate(
              { planId: dialog.plan.id, reason },
              {
                onSuccess: () => {
                  toast.success(t("review.rejectedToast"));
                  setDialog(null);
                },
                onError,
              },
            )
          }
        />
      )}
    </>
  );
}
