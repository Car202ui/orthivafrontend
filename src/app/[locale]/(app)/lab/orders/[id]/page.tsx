"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPanel } from "@/components/orders/media-panel";
import { OrderSummary } from "@/components/orders/order-summary";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { PlanForm } from "@/components/orders/plan-form";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ApiError, PLAN_KINDS, type MediaKind, type Order, type Plan, type PlanInput } from "@/lib/api";
import { useApi } from "@/lib/query";

const CAN_START: Order["status"][] = ["DIAGNOSIS_PAID", "CHANGES_REQUESTED", "IN_PLANNING"];

export default function LabOrderPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { id } = useParams<{ id: string }>();
  const call = useApi();
  const queryClient = useQueryClient();
  const [confirmSend, setConfirmSend] = useState<Plan | null>(null);

  const order = useQuery({ queryKey: ["orders", "one", id], queryFn: () => call<Order>(`/api/orders/${id}`) });
  const plans = useQuery({ queryKey: ["plans", id], queryFn: () => call<Plan[]>(`/api/orders/${id}/plans`) });
  const onError = (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["plans", id] });
  };

  const start = useMutation({
    mutationFn: () => call<Plan>(`/api/orders/${id}/plans`, { method: "POST" }),
    onSuccess: refresh,
    onError,
  });
  const save = useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: PlanInput }) =>
      call<Plan>(`/api/plans/${planId}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success(t("lab.planSaved"));
      refresh();
    },
    onError,
  });
  const send = useMutation({
    mutationFn: (planId: string) => call<Plan>(`/api/plans/${planId}/send`, { method: "POST" }),
    onSuccess: () => {
      toast.success(t("lab.planSentToast"));
      setConfirmSend(null);
      refresh();
    },
    onError,
  });

  if (order.isError) return <p className="text-destructive">{t("orders.notFound")}</p>;
  const o = order.data;
  if (!o) return null;
  const draft = plans.data?.find((p) => !p.sent) ?? null;
  const sentPlans = plans.data?.filter((p) => p.sent) ?? [];
  const kindLabel = (k: MediaKind) => t(`lab.kinds.${k}`);
  const groupLabel = (g: string) => (g === "other" ? t("orders.media.other") : g === "model3d" ? "3D" : t("orders.arch"));

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
          <Button onClick={() => start.mutate()} disabled={start.isPending}>
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
              <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable={false} invalidate={[["orders", "one", id]]} />
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
                <PlanForm plan={draft} onSubmit={(input) => save.mutate({ planId: draft.id, input })} pending={save.isPending} />
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("lab.planMedia")}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{t("lab.planMediaHint")}</p>
                  <MediaPanel
                    basePath={`/api/plans/${draft.id}`}
                    media={draft.media}
                    editable
                    kindGroups={PLAN_KINDS}
                    kindLabel={kindLabel}
                    groupLabel={groupLabel}
                    invalidate={[["plans", id]]}
                  />
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

          {sentPlans.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("lab.planTitle")} · {t("lab.planVersion", { version: p.version })}
                  <Badge>{t("lab.planSent")}</Badge>
                </CardTitle>
                <CardDescription>
                  {p.plannerName} · {p.sentAt && format.dateTime(new Date(p.sentAt), { dateStyle: "medium", timeStyle: "short" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("lab.diagnosis")}:</span> {p.diagnosis || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("lab.upperStages")}:</span> {p.upperStages ?? "—"} ·{" "}
                  <span className="text-muted-foreground">{t("lab.lowerStages")}:</span> {p.lowerStages ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("lab.priceTotal")}:</span>{" "}
                  <strong>
                    {format.number(p.priceTotal ?? 0)} {p.currency}
                  </strong>
                </p>
                <MediaPanel basePath={`/api/plans/${p.id}`} media={p.media} editable={false} kindGroups={PLAN_KINDS} kindLabel={kindLabel} groupLabel={groupLabel} invalidate={[["plans", id]]} />
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
            <AlertDialogAction onClick={() => confirmSend && send.mutate(confirmSend.id)}>{t("lab.sendPlan")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
