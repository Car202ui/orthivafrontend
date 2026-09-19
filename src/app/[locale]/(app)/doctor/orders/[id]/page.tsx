"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useClinics } from "@/features/clinics";
import { useMe } from "@/features/identity";
import {
  OrderForm,
  OrderStatusBadge,
  OrderSummary,
  OrderTimeline,
  ShipmentCard,
  orderKey,
  PRESCRIPTION_KINDS,
  useCancelOrder,
  useOrder,
  useSubmitOrder,
  useUpdateOrder,
  type OrderInput,
} from "@/features/orders";
import { usePatients } from "@/features/patients";
import { PaymentsCard } from "@/features/payments";
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
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FollowUps } from "./follow-ups";
import { PlanReview } from "./plan-review";

/** Once shipped (or closed) the check-ups become the main content of the page. */
const IN_TREATMENT = ["SHIPPED", "IN_FOLLOW_UP", "CLOSED"];

export default function OrderPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const me = useMe();
  const [confirm, setConfirm] = useState<"submit" | "cancel" | null>(null);

  const order = useOrder(id);
  const update = useUpdateOrder(id);
  const submit = useSubmitOrder(id);
  const cancel = useCancelOrder(id);
  const onError = useApiErrorToast();
  // Select choices for the draft form; composed here so orders/ does not depend on patients/ or clinics/.
  const patients = usePatients().data?.map((p) => ({ id: p.id, label: `${p.lastName}, ${p.firstName}` })) ?? [];
  const clinics = useClinics().data?.map((c) => ({ id: c.id, label: c.name })) ?? [];

  const saveDraft = (input: OrderInput) => update.mutate(input, { onSuccess: () => toast.success(t("orders.draftSaved")), onError });
  const confirmAction = () => {
    const done = (message: string) => () => {
      toast.success(message);
      setConfirm(null);
    };
    if (confirm === "submit") submit.mutate(undefined, { onSuccess: done(t("orders.submitted")), onError });
    else cancel.mutate(undefined, { onSuccess: done(t("orders.cancelled")), onError });
  };

  if (order.isError) return <p className="text-destructive">{t("orders.notFound")}</p>;
  const o = order.data;
  if (!o) return null;
  const isDoctor = !!me.data?.roles.includes("DOCTOR") && me.data.person?.id === o.doctorId;
  const editable = isDoctor && o.status === "DRAFT";
  // Drafts have no snapshot yet: show the tenant's current diagnosis price.
  const priceLabel = `${format.number(o.diagnosisPrice ?? me.data?.tenant?.diagnosisPrice ?? 0)} ${o.currency ?? me.data?.tenant?.currency ?? ""}`.trim();
  const mediaInvalidate = [orderKey(id)];
  const media = (editableFiles: boolean) => (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.media.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <MediaPanel basePath={`/api/orders/${o.id}`} media={o.media} editable={editableFiles} kindGroups={PRESCRIPTION_KINDS} invalidate={mediaInvalidate} />
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
                <OrderForm initial={o} patients={patients} clinics={clinics} onSubmit={saveDraft} pending={update.isPending} submitLabel={t("orders.saveDraft")} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="files" className="pt-4">
            {media(true)}
          </TabsContent>
          <TabsContent value="review" className="space-y-4 pt-4">
            <OrderSummary order={o} />
            {media(false)}
            <Button size="lg" onClick={() => setConfirm("submit")}>
              {t("orders.submit")}
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {IN_TREATMENT.includes(o.status) && <FollowUps order={o} isDoctor={isDoctor} />}
            <PlanReview order={o} isDoctor={isDoctor} />
            <OrderSummary order={o} />
            {media(false)}
          </div>
          <div className="space-y-6">
            {o.shipment && <ShipmentCard shipment={o.shipment} />}
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
            <AlertDialogAction onClick={confirmAction}>{confirm === "submit" ? t("orders.submit") : t("orders.cancel")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
