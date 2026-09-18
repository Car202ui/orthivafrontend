"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { OrderForm } from "@/components/orders/order-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { ApiError, type Order, type OrderInput } from "@/lib/api";
import { useApi } from "@/lib/query";

/** Step 1 of a prescription: creates the draft, then continues on the order page (files, send). */
export default function NewOrderPage() {
  const t = useTranslations();
  const call = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();

  const create = useMutation({
    mutationFn: (input: OrderInput) => call<Order>("/api/orders", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (o) => {
      toast.success(t("orders.draftSaved"));
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push(`/doctor/orders/${o.id}?tab=files`);
    },
    onError: (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("orders.new")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("orders.steps.prescription")}</CardTitle>
          <CardDescription>
            {t("orders.steps.files")} · {t("orders.steps.review")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            presetPatientId={params.get("patientId")}
            onSubmit={(input) => create.mutate(input)}
            pending={create.isPending}
            submitLabel={t("app.continue")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
