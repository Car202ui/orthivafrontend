"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPanel } from "@/components/orders/media-panel";
import { OrderForm } from "@/components/orders/order-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { ApiError, type Order, type OrderInput, type Payment } from "@/lib/api";
import { useApi, useMe } from "@/lib/query";

export default function OrderPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const call = useApi();
  const me = useMe();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<"submit" | "cancel" | null>(null);

  const order = useQuery({ queryKey: ["orders", "one", id], queryFn: () => call<Order>(`/api/orders/${id}`) });
  const payments = useQuery({
    queryKey: ["payments", id],
    queryFn: () => call<Payment[]>(`/api/payments?orderId=${id}`),
    enabled: !!order.data && order.data.status !== "DRAFT",
  });

  const onError = (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["payments", id] });
  };

  const update = useMutation({
    mutationFn: (input: OrderInput) => call<Order>(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success(t("orders.draftSaved"));
      refresh();
    },
    onError,
  });
  const submit = useMutation({
    mutationFn: () => call<Order>(`/api/orders/${id}/submit`, { method: "POST" }),
    onSuccess: () => {
      toast.success(t("orders.submitted"));
      setConfirm(null);
      refresh();
    },
    onError,
  });
  const cancel = useMutation({
    mutationFn: () => call<Order>(`/api/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => {
      toast.success(t("orders.cancelled"));
      setConfirm(null);
      refresh();
    },
    onError,
  });

  if (order.isError) return <p className="text-destructive">{t("orders.notFound")}</p>;
  const o = order.data;
  if (!o) return null;
  const isDoctor = !!me.data?.roles.includes("DOCTOR") && me.data.person?.id === o.doctorId;
  const editable = isDoctor && o.status === "DRAFT";
  // Drafts have no snapshot yet: show the tenant's current diagnosis price.
  const priceLabel = `${format.number(o.diagnosisPrice ?? me.data?.tenant?.diagnosisPrice ?? 0)} ${o.currency ?? me.data?.tenant?.currency ?? ""}`.trim();

  const summary = (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.details")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">{t("orders.patient")}:</span>{" "}
          <Link href={`/doctor/patients/${o.patientId}`} className="hover:underline">
            {o.patientName}
          </Link>
        </p>
        <p>
          <span className="text-muted-foreground">{t("orders.doctor")}:</span> {o.doctorName}
        </p>
        <p>
          <span className="text-muted-foreground">{t("orders.arch")}:</span> {t(`orders.form.arch${o.arch}`)}
        </p>
        <p>
          {o.firstTime && <Badge variant="secondary" className="mr-1">{t("orders.form.firstTime")}</Badge>}
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

  const timeline = (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 border-l pl-4 text-sm">
          {o.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={h.toStatus} />
                <span className="text-muted-foreground">
                  {format.dateTime(new Date(h.changedAt), { dateStyle: "medium", timeStyle: "short" })}
                </span>
                {h.changedByName && <span className="text-muted-foreground">· {h.changedByName}</span>}
              </div>
              {h.note && <p className="mt-1 text-muted-foreground">{h.note}</p>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );

  const paymentsCard = o.status !== "DRAFT" && (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.payments")}</CardTitle>
        <CardDescription>{t("orders.paySoon")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {payments.data?.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
            <span>
              {t(`orders.paymentPurpose.${p.purpose}`)} · {format.number(p.amount)} {p.currency}
            </span>
            <Badge variant={p.status === "APPROVED" ? "default" : "secondary"}>{t(`orders.paymentStatus.${p.status}`)}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/doctor/orders" className="text-sm text-muted-foreground hover:underline">
            ← {t("orders.title")}
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
            {t("orders.number")} #{o.orderNumber}
            <OrderStatusBadge status={o.status} />
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("orders.created")}: {format.dateTime(new Date(o.createdAt), { dateStyle: "medium" })}
          </p>
        </div>
        {isDoctor && (o.status === "DRAFT" || o.status === "SUBMITTED") && (
          <Button variant="outline" onClick={() => setConfirm("cancel")}>
            {t("orders.cancel")}
          </Button>
        )}
      </div>

      {editable ? (
        <Tabs defaultValue={params.get("tab") ?? "prescription"}>
          <TabsList>
            <TabsTrigger value="prescription">{t("orders.steps.prescription")}</TabsTrigger>
            <TabsTrigger value="files">{t("orders.steps.files")}</TabsTrigger>
            <TabsTrigger value="review">{t("orders.steps.review")}</TabsTrigger>
          </TabsList>
          <TabsContent value="prescription" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <OrderForm initial={o} onSubmit={(input) => update.mutate(input)} pending={update.isPending} submitLabel={t("orders.saveDraft")} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="files" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.media.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPanel orderId={o.id} media={o.media} editable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="review" className="space-y-4 pt-4">
            {summary}
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.media.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPanel orderId={o.id} media={o.media} editable={false} />
              </CardContent>
            </Card>
            <Button size="lg" onClick={() => setConfirm("submit")}>
              {t("orders.submit")}
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {summary}
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.media.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPanel orderId={o.id} media={o.media} editable={false} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {paymentsCard}
            {timeline}
          </div>
        </div>
      )}

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "submit" ? t("orders.confirmSubmitTitle") : t("orders.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "submit" ? t("orders.confirmSubmitBody", { price: priceLabel }) : t("orders.cancelBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => (confirm === "submit" ? submit.mutate() : cancel.mutate())}>
              {confirm === "submit" ? t("orders.submit") : t("orders.cancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
