"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useOrder } from "@/features/orders";
import { PaymentStatusBadge, useCheckout, usePayment } from "@/features/payments";
import { useApiErrorToast } from "@/shared/api/errors";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/** Summary of one charge and the button that sends the doctor to the gateway's checkout. */
export default function PaymentPage() {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const onError = useApiErrorToast();
  const payment = usePayment(id);
  const order = useOrder(payment.data?.orderId ?? "");
  const checkout = useCheckout();

  if (payment.isError) return <p className="text-destructive">{t("payments.notFound")}</p>;
  const p = payment.data;
  if (!p) return null;

  const pay = () =>
    checkout.mutate(
      { paymentId: p.id, returnUrl: `${window.location.origin}/${locale}/doctor/payments/${p.id}/return` },
      { onSuccess: (session) => window.location.assign(session.checkoutUrl), onError },
    );

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[180px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/doctor/orders/${p.orderId}`} className="text-sm text-muted-foreground hover:underline">
          ← {t("orders.number")} #{order.data?.orderNumber ?? ""}
        </Link>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
          {t("payments.title")}
          <PaymentStatusBadge status={p.status} />
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(`orders.paymentPurpose.${p.purpose}`)}</CardTitle>
          <CardDescription>{order.data ? `${order.data.patientName} · ${t(`orders.form.arch${order.data.arch}`)}` : ""}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {row(t("payments.amount"), <strong className="text-lg">{format.number(p.amount)} {p.currency}</strong>)}
          {row(t("payments.created"), format.dateTime(new Date(p.createdAt), { dateStyle: "medium", timeStyle: "short" }))}
          {p.paidAt && row(t("payments.paidAt"), format.dateTime(new Date(p.paidAt), { dateStyle: "medium", timeStyle: "short" }))}
          {p.gateway !== "NONE" && row(t("payments.gateway"), p.gateway)}
          {p.gatewayReference && row(t("payments.reference"), <code className="text-xs">{p.gatewayReference}</code>)}
        </CardContent>
      </Card>

      {p.status !== "APPROVED" && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <p className="text-sm text-muted-foreground">{t("payments.checkoutHint")}</p>
            <Button size="lg" onClick={pay} disabled={checkout.isPending}>
              {checkout.isPending ? t("app.loading") : t("payments.payButton", { amount: `${format.number(p.amount)} ${p.currency}` })}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
