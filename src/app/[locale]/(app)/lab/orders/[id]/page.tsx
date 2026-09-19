"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge, OrderSummary, OrderTimeline, orderKey, PRESCRIPTION_KINDS, useOrder, type OrderStatus } from "@/features/orders";
import {
  PlanComments,
  PlanDetails,
  PlanForm,
  PlanMedia,
  useCommentPlan,
  usePlans,
  useSavePlan,
  useSendPlan,
  useStartPlanning,
  type Plan,
  type PlanInput,
} from "@/features/planning";
import { useApiErrorToast } from "@/shared/api/errors";
import { Link } from "@/shared/i18n/navigation";
import { MediaPanel } from "@/shared/media/media-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const CAN_START: OrderStatus[] = ["DIAGNOSIS_PAID", "CHANGES_REQUESTED", "IN_PLANNING"];

export default function LabOrderPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { id } = useParams<{ id: string }>();
  const [confirmSend, setConfirmSend] = useState<Plan | null>(null);

  const order = useOrder(id);
  const plans = usePlans(id);
  const start = useStartPlanning(id);
  const save = useSavePlan(id);
  const send = useSendPlan(id);
  const comment = useCommentPlan(id);
  const onError = useApiErrorToast();

  const savePlan = (planId: string) => (input: PlanInput) =>
    save.mutate({ planId, input }, { onSuccess: () => toast.success(t("lab.planSaved")), onError });
  const sendPlan = () =>
    confirmSend &&
    send.mutate(confirmSend.id, {
      onSuccess: () => {
        toast.success(t("lab.planSentToast"));
        setConfirmSend(null);
      },
      onError,
    });
  const reply = (planId: string) => (body: string) =>
    comment.mutate({ planId, body }, { onSuccess: () => toast.success(t("review.commentPosted")), onError });

  if (order.isError) return <p className="text-destructive">{t("orders.notFound")}</p>;
  const o = order.data;
  if (!o) return null;
  const draft = plans.data?.find((p) => !p.sent) ?? null;
  const sentPlans = (plans.data?.filter((p) => p.sent) ?? []).sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/lab/orders" className="text-sm text-muted-foreground hover:underline">
            ← {t("lab.inboxTitle")}
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
            {t("orders.number")} #{o.orderNumber}
            <OrderStatusBadge status={o.status} />
          </h1>
          <p className="text-sm text-muted-foreground">
            {o.doctorName} · {o.patientName} · {format.dateTime(new Date(o.createdAt), { dateStyle: "medium" })}
          </p>
        </div>
        {!draft && CAN_START.includes(o.status) && (
          <Button onClick={() => start.mutate(undefined, { onError })} disabled={start.isPending}>
            {sentPlans.length > 0 ? t("lab.newVersion") : t("lab.startPlanning")}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <OrderSummary order={o} />
          <Card>
            <CardHeader>
              <CardTitle>{t("lab.prescription")}</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable={false} kindGroups={PRESCRIPTION_KINDS} invalidate={[orderKey(id)]} />
            </CardContent>
          </Card>
          <OrderTimeline order={o} />
        </div>

        <div className="space-y-6">
          {o.status === "SUBMITTED" && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">{t("lab.waitingPayment")}</CardContent>
            </Card>
          )}

          {draft && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("lab.planTitle")} · {t("lab.planVersion", { version: draft.version })}
                  <Badge variant="secondary">{t("lab.planDraft")}</Badge>
                </CardTitle>
                <CardDescription>{draft.plannerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PlanForm plan={draft} onSubmit={savePlan(draft.id)} pending={save.isPending} />
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("lab.planMedia")}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{t("lab.planMediaHint")}</p>
                  <PlanMedia plan={draft} editable />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">
                    {t("lab.priceTotal")}: <strong>{format.number(draft.priceTotal ?? 0)} {draft.currency}</strong>
                  </span>
                  <Button onClick={() => setConfirmSend(draft)} disabled={draft.priceTotal === null}>
                    {t("lab.sendPlan")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {sentPlans.map((p, i) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("lab.planTitle")} · {t("lab.planVersion", { version: p.version })}
                  {p.approval ? (
                    <Badge>{t("review.approved")}</Badge>
                  ) : i === 0 && o.status === "CHANGES_REQUESTED" ? (
                    <Badge variant="secondary">{t("orders.statuses.CHANGES_REQUESTED")}</Badge>
                  ) : i === 0 && o.status === "REJECTED" ? (
                    <Badge variant="destructive">{t("orders.statuses.REJECTED")}</Badge>
                  ) : (
                    <Badge variant="outline">{i === 0 ? t("lab.planSent") : t("review.superseded")}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {p.plannerName} · {p.sentAt && format.dateTime(new Date(p.sentAt), { dateStyle: "medium", timeStyle: "short" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <PlanDetails plan={p} />
                <PlanMedia plan={p} editable={false} />
                <PlanComments plan={p} onPost={reply(p.id)} postLabel={t("review.reply")} pending={comment.isPending} />
              </CardContent>
            </Card>
          ))}

          {!draft && sentPlans.length === 0 && o.status !== "SUBMITTED" && (
            <p className="text-sm text-muted-foreground">{t("lab.noPlans")}</p>
          )}
        </div>
      </div>

      <AlertDialog open={confirmSend !== null} onOpenChange={(open) => !open && setConfirmSend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("lab.confirmSendTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("lab.confirmSendBody", { version: confirmSend?.version ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={sendPlan}>{t("lab.sendPlan")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
