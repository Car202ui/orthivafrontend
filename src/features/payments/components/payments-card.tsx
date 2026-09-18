"use client";

import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiErrorToast } from "@/shared/api/errors";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useMockPay, usePayments } from "../api";

/** Payments of an order. The "pay" button uses the dev mock gateway until 1.6 wires Wompi. */
export function PaymentsCard({ orderId, canPay }: { orderId: string; canPay: boolean }) {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const format = useFormatter();
  const payments = usePayments(orderId);
  const pay = useMockPay(orderId);

  const payNow = (paymentId: string) =>
    pay.mutate(paymentId, {
      onSuccess: () => toast.success(t("orders.paymentStatus.APPROVED")),
      onError,
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.payments")}</CardTitle>
        <CardDescription>{t("orders.paySoon")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {payments.data?.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
            <span>
              {t(`orders.paymentPurpose.${p.purpose}`)} · {format.number(p.amount)} {p.currency}
            </span>
            {p.status === "PENDING" && canPay ? (
              <Button size="sm" onClick={() => payNow(p.id)} disabled={pay.isPending}>
                {t("orders.payNow")} (mock)
              </Button>
            ) : (
              <Badge variant={p.status === "APPROVED" ? "default" : "secondary"}>{t(`orders.paymentStatus.${p.status}`)}</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
