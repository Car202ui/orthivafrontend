"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, type Payment } from "@/lib/api";
import { useApi } from "@/lib/query";

/** Payments of an order. The "pay" button uses the dev mock gateway until 1.6 wires Wompi. */
export function PaymentsCard({ orderId, canPay }: { orderId: string; canPay: boolean }) {
  const t = useTranslations();
  const format = useFormatter();
  const call = useApi();
  const queryClient = useQueryClient();
  const payments = useQuery({ queryKey: ["payments", orderId], queryFn: () => call<Payment[]>(`/api/payments?orderId=${orderId}`) });

  const pay = useMutation({
    mutationFn: (paymentId: string) => call<Payment>(`/api/payments/${paymentId}/mock-approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success(t("orders.paymentStatus.APPROVED"));
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message),
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
              <Button size="sm" onClick={() => pay.mutate(p.id)} disabled={pay.isPending}>
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
