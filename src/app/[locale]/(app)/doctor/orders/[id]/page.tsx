"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPanel } from "@/components/orders/media-panel";
import { OrderForm } from "@/components/orders/order-form";
import { OrderSummary } from "@/components/orders/order-summary";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { PaymentsCard } from "@/components/orders/payments-card";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { ApiError, type Order, type OrderInput } from "@/lib/api";
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
  const mediaInvalidate: unknown[][] = [["orders", "one", id]];

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
                <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable invalidate={mediaInvalidate} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="review" className="space-y-4 pt-4">
            <OrderSummary order={o} />
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.media.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable={false} invalidate={mediaInvalidate} />
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
            <OrderSummary order={o} />
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.media.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable={false} invalidate={mediaInvalidate} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <PaymentsCard orderId={o.id} canPay={isDoctor} />
            <OrderTimeline order={o} />
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
