"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { usePayments } from "../api";
import { PaymentStatusBadge } from "./payment-status-badge";

/** Payments of an order; pending ones link to the checkout page when the viewer is the payer. */
export function PaymentsCard({ orderId, canPay }: { orderId: string; canPay: boolean }) {
  const t = useTranslations();
  const format = useFormatter();
  const payments = usePayments(orderId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.payments")}</CardTitle>
        <CardDescription>{t("payments.cardHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {payments.data?.length === 0 && <p className="text-muted-foreground">{t("payments.none")}</p>}
        {payments.data?.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
            <span>
              {t(`orders.paymentPurpose.${p.purpose}`)} · {format.number(p.amount)} {p.currency}
            </span>
            {p.status !== "APPROVED" && canPay ? (
              <Link href={`/doctor/payments/${p.id}`}>
                <Button size="sm">{t("orders.payNow")}</Button>
              </Link>
            ) : (
              <PaymentStatusBadge status={p.status} />
            )}
          </div>
        ))}
        {payments.data?.some((p) => p.status === "APPROVED" && p.gateway !== "NONE") && (
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1">
              {payments.data.find((p) => p.status === "APPROVED")?.gateway}
            </Badge>
            {t("payments.viaGateway")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
