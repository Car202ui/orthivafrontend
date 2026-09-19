"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { PaymentStatusBadge, usePayment } from "@/features/payments";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * Where the gateway sends the doctor back. The webhook may arrive a moment later than the
 * redirect, so the page polls the payment until it leaves PENDING.
 */
export default function PaymentReturnPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const payment = usePayment(id, { poll: true });
  const status = payment.data?.status;

  // The order moved on (DIAGNOSIS_PAID / TREATMENT_PAID): drop cached copies.
  useEffect(() => {
    if (status && status !== "PENDING") {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (payment.data) queryClient.invalidateQueries({ queryKey: ["payments", payment.data.orderId] });
    }
  }, [status, payment.data, queryClient]);

  if (payment.isError) return <p className="text-destructive">{t("payments.notFound")}</p>;
  const p = payment.data;
  if (!p) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {t(`payments.return.${p.status}.title`)}
            <PaymentStatusBadge status={p.status} />
          </CardTitle>
          <CardDescription>{t(`payments.return.${p.status}.body`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            {t(`orders.paymentPurpose.${p.purpose}`)} · <strong>{format.number(p.amount)} {p.currency}</strong>
            {p.gatewayReference && <span className="text-muted-foreground"> · {p.gatewayReference}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/doctor/orders/${p.orderId}`}>
              <Button>{t("payments.backToOrder")}</Button>
            </Link>
            {p.status !== "APPROVED" && p.status !== "PENDING" && (
              <Link href={`/doctor/payments/${p.id}`}>
                <Button variant="outline">{t("payments.retry")}</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
