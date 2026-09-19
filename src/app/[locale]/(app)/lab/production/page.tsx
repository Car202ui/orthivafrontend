"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge, useOrders, useShipOrder, useStartProduction, type Order, type ShipmentInput } from "@/features/orders";
import { useApiErrorToast } from "@/shared/api/errors";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

/** Laboratory queue: paid orders to manufacture, orders in production to ship, recent shipments. */
export default function ProductionPage() {
  const t = useTranslations();
  const toProduce = useOrders({ status: "TREATMENT_PAID" });
  const inProduction = useOrders({ status: "IN_PRODUCTION" });
  const shipped = useOrders({ status: "SHIPPED" });
  const [shipping, setShipping] = useState<Order | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("production.title")}</h1>
        <p className="text-muted-foreground">{t("production.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Queue title={t("production.toProduce")} orders={toProduce.data} action={(o) => <StartButton order={o} />} />
        <Queue
          title={t("production.inProduction")}
          orders={inProduction.data}
          action={(o) => (
            <Button size="sm" onClick={() => setShipping(o)}>
              {t("production.ship")}
            </Button>
          )}
        />
        <Queue title={t("production.shipped")} orders={shipped.data} />
      </div>

      {shipping && <ShipDialog order={shipping} onClose={() => setShipping(null)} />}
    </div>
  );
}

function Queue({ title, orders, action }: { title: string; orders?: Order[]; action?: (o: Order) => React.ReactNode }) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{orders ? orders.length : "…"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {orders?.length === 0 && <p className="text-sm text-muted-foreground">{t("production.empty")}</p>}
        {orders?.map((o) => (
          <div key={o.id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/lab/orders/${o.id}`} className="font-medium hover:underline">
                #{o.orderNumber} · {o.patientName}
              </Link>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              {o.doctorName} · {t(`orders.form.arch${o.arch}`)} · {format.dateTime(new Date(o.updatedAt), { dateStyle: "medium" })}
            </p>
            {action && <div className="mt-2 flex justify-end">{action(o)}</div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StartButton({ order }: { order: Order }) {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const start = useStartProduction(order.id);
  return (
    <Button size="sm" disabled={start.isPending} onClick={() => start.mutate(undefined, { onSuccess: () => toast.success(t("production.started")), onError })}>
      {t("production.start")}
    </Button>
  );
}

function ShipDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const ship = useShipOrder(order.id);
  const [form, setForm] = useState<ShipmentInput>({ carrier: "", trackingNumber: "", notes: "" });
  const submit = () =>
    ship.mutate(
      { carrier: form.carrier || undefined, trackingNumber: form.trackingNumber || undefined, notes: form.notes || undefined },
      {
        onSuccess: () => {
          toast.success(t("production.shipped_toast"));
          onClose();
        },
        onError,
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("production.shipTitle", { number: order.orderNumber })}</DialogTitle>
          <DialogDescription>{t("production.shipBody")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{t("shipping.carrier")}</span>
            <Input value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} placeholder="Servientrega, Coordinadora…" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{t("shipping.tracking")}</span>
            <Input value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{t("shipping.notes")}</span>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("app.cancel")}
          </Button>
          <Button onClick={submit} disabled={ship.isPending}>
            {ship.isPending ? t("app.loading") : t("production.ship")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
